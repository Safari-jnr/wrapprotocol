// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title  MorkToken
 * @notice Official MORK ERC-20 token.
 *
 * Properties
 * ──────────
 * Name:     Mork
 * Symbol:   MORK
 * Decimals: 18  (default from ERC20)
 * Supply:   10,000,000 MORK — minted once to the deployer at construction.
 *
 * Design notes
 * ────────────
 * - Fixed supply: no public mint function. All 10M tokens exist from deploy.
 * - Ownable: owner can transfer ownership, useful if multisig takes over later.
 * - No burn function added by default (OpenZeppelin ERC20Burnable can be added
 *   later if tokenomics require it — keep it out until needed).
 * - Fully compatible with MorkAirdrop.sol — that contract calls
 *   safeTransfer() from IERC20, which this satisfies.
 *
 * Compatibility
 * ─────────────
 * Tested with OpenZeppelin Contracts v5.x and Foundry.
 * Deploy to Sepolia first; switch RPC to mainnet/base when ready.
 */
contract MorkToken is ERC20, Ownable {
    /// @param initialOwner Address that receives all tokens and owns the contract.
    ///                     Pass msg.sender (your deployer wallet) at deploy time.
    constructor(address initialOwner)
        ERC20("Mork", "MORK")
        Ownable(initialOwner)
    {
        // Mint the entire fixed supply to the deployer.
        // 10_000_000 * 10^18 — using the helper to avoid magic numbers.
        _mint(initialOwner, 10_000_000 * 10 ** decimals());
    }
}
