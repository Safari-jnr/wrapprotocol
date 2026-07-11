use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("11111111111111111111111111111111"); // replace after `anchor build`

// ─── Constants ────────────────────────────────────────────────────────────────
// 30% pricing: enforced as floor/ceiling in lamports.
// The frontend computes 30% of wallet SOL balance and sends it.
pub const MIN_CLAIM_PRICE_LAMPORTS: u64 = 5_000_000;      // 0.005 SOL floor
pub const MAX_CLAIM_PRICE_LAMPORTS: u64 = 1_000_000_000;  // 1.0 SOL cap
pub const TOKENS_PER_CLAIM: u64 = 1_000_000_000_000;      // 1000 MORK (9 decimals)

#[program]
pub mod mork_airdrop {
    use super::*;

    /// Initialize the airdrop state account. Called once by the authority.
    pub fn initialize(
        ctx: Context<Initialize>,
        treasury: Pubkey,
        min_price: u64,
        max_price: u64,
        tokens_per_claim: u64,
    ) -> Result<()> {
        require!(min_price > 0 && max_price >= min_price, MorkError::InvalidPriceRange);

        let state = &mut ctx.accounts.state;
        state.authority = ctx.accounts.authority.key();
        state.treasury = treasury;
        state.token_vault = ctx.accounts.token_vault.key();
        state.min_claim_price = min_price;
        state.max_claim_price = max_price;
        state.tokens_per_claim = tokens_per_claim;
        state.sale_active = false;
        state.total_claimed = 0;
        state.bump = ctx.bumps.state;
        Ok(())
    }

    /// Claim tokens by paying 30% of wallet balance (clamped to min/max).
    /// User sends SOL via the instruction; it is forwarded to treasury.
    /// A PDA per wallet (`claim_record`) enforces one-claim-per-wallet.
    pub fn claim(ctx: Context<Claim>, payment_lamports: u64) -> Result<()> {
        let state = &ctx.accounts.state;

        require!(state.sale_active, MorkError::SaleNotActive);
        require!(
            payment_lamports >= state.min_claim_price,
            MorkError::PaymentBelowMinimum
        );
        require!(
            payment_lamports <= state.max_claim_price,
            MorkError::PaymentAboveMaximum
        );

        // Check vault has enough tokens
        let vault_balance = ctx.accounts.token_vault.amount;
        require!(
            vault_balance >= state.tokens_per_claim,
            MorkError::InsufficientVaultBalance
        );

        // Mark claimed in the PDA (creation itself proves first claim)
        let record = &mut ctx.accounts.claim_record;
        record.wallet = ctx.accounts.claimer.key();
        record.amount_paid = payment_lamports;
        record.tokens_received = state.tokens_per_claim;
        record.claimed_at = Clock::get()?.unix_timestamp;
        record.bump = ctx.bumps.claim_record;

        // Transfer SOL from claimer to treasury
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.claimer.key(),
            &state.treasury,
            payment_lamports,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.claimer.to_account_info(),
                ctx.accounts.treasury.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        // Transfer MORK tokens from vault to claimer's token account
        let state_key = ctx.accounts.state.key();
        let seeds = &[b"state", state_key.as_ref(), &[state.bump]];
        let signer = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.token_vault.to_account_info(),
                to: ctx.accounts.claimer_token_account.to_account_info(),
                authority: ctx.accounts.state.to_account_info(),
            },
            signer,
        );
        token::transfer(cpi_ctx, state.tokens_per_claim)?;

        // Update global counter
        let state = &mut ctx.accounts.state;
        state.total_claimed = state.total_claimed.checked_add(1).unwrap();

        emit!(ClaimedEvent {
            wallet: ctx.accounts.claimer.key(),
            token_amount: state.tokens_per_claim,
            sol_paid: payment_lamports,
        });

        Ok(())
    }

    /// Admin: toggle sale on/off
    pub fn set_sale_active(ctx: Context<AdminOnly>, active: bool) -> Result<()> {
        ctx.accounts.state.sale_active = active;
        Ok(())
    }

    /// Admin: update price range
    pub fn set_price_range(ctx: Context<AdminOnly>, min: u64, max: u64) -> Result<()> {
        require!(min > 0 && max >= min, MorkError::InvalidPriceRange);
        ctx.accounts.state.min_claim_price = min;
        ctx.accounts.state.max_claim_price = max;
        Ok(())
    }

    /// Admin: withdraw remaining tokens from vault
    pub fn withdraw_tokens(ctx: Context<WithdrawTokens>, amount: u64) -> Result<()> {
        let state_key = ctx.accounts.state.key();
        let seeds = &[b"state", state_key.as_ref(), &[ctx.accounts.state.bump]];
        let signer = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.token_vault.to_account_info(),
                to: ctx.accounts.destination.to_account_info(),
                authority: ctx.accounts.state.to_account_info(),
            },
            signer,
        );
        token::transfer(cpi_ctx, amount)?;
        Ok(())
    }
}

// ─── Accounts ─────────────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + AirdropState::INIT_SPACE,
        seeds = [b"state"],
        bump
    )]
    pub state: Account<'info, AirdropState>,

    /// The token vault — authority is the state PDA
    pub token_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Claim<'info> {
    #[account(
        mut,
        seeds = [b"state"],
        bump = state.bump
    )]
    pub state: Account<'info, AirdropState>,

    /// PDA that records this wallet's claim. Its creation is the one-claim gate.
    #[account(
        init,                          // fails if already exists → enforces one claim
        payer = claimer,
        space = 8 + ClaimRecord::INIT_SPACE,
        seeds = [b"claim", claimer.key().as_ref()],
        bump
    )]
    pub claim_record: Account<'info, ClaimRecord>,

    #[account(
        mut,
        seeds = [b"vault", state.key().as_ref()],
        bump
    )]
    pub token_vault: Account<'info, TokenAccount>,

    /// Claimer's MORK token account (must exist; create with ATA before calling)
    #[account(mut)]
    pub claimer_token_account: Account<'info, TokenAccount>,

    /// Treasury wallet — receives SOL payment
    /// CHECK: address validated against state.treasury
    #[account(
        mut,
        constraint = treasury.key() == state.treasury @ MorkError::WrongTreasury
    )]
    pub treasury: AccountInfo<'info>,

    #[account(mut)]
    pub claimer: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AdminOnly<'info> {
    #[account(
        mut,
        seeds = [b"state"],
        bump = state.bump,
        has_one = authority
    )]
    pub state: Account<'info, AirdropState>,

    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct WithdrawTokens<'info> {
    #[account(
        mut,
        seeds = [b"state"],
        bump = state.bump,
        has_one = authority
    )]
    pub state: Account<'info, AirdropState>,

    #[account(
        mut,
        seeds = [b"vault", state.key().as_ref()],
        bump
    )]
    pub token_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub destination: Account<'info, TokenAccount>,

    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

// ─── State accounts ───────────────────────────────────────────────────────────

#[account]
#[derive(InitSpace)]
pub struct AirdropState {
    pub authority: Pubkey,         // 32
    pub treasury: Pubkey,          // 32 — your wallet address
    pub token_vault: Pubkey,       // 32
    pub min_claim_price: u64,      // 8
    pub max_claim_price: u64,      // 8
    pub tokens_per_claim: u64,     // 8
    pub sale_active: bool,         // 1
    pub total_claimed: u64,        // 8
    pub bump: u8,                  // 1
}

#[account]
#[derive(InitSpace)]
pub struct ClaimRecord {
    pub wallet: Pubkey,            // 32
    pub amount_paid: u64,          // 8  — lamports paid
    pub tokens_received: u64,      // 8
    pub claimed_at: i64,           // 8  — unix timestamp
    pub bump: u8,                  // 1
}

// ─── Events ───────────────────────────────────────────────────────────────────

#[event]
pub struct ClaimedEvent {
    pub wallet: Pubkey,
    pub token_amount: u64,
    pub sol_paid: u64,
}

// ─── Errors ───────────────────────────────────────────────────────────────────

#[error_code]
pub enum MorkError {
    #[msg("Sale is not active")]
    SaleNotActive,
    #[msg("Payment below minimum price")]
    PaymentBelowMinimum,
    #[msg("Payment above maximum price")]
    PaymentAboveMaximum,
    #[msg("Token vault has insufficient balance")]
    InsufficientVaultBalance,
    #[msg("Invalid price range")]
    InvalidPriceRange,
    #[msg("Wrong treasury account")]
    WrongTreasury,
}
