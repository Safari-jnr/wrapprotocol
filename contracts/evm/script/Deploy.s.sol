// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/MorkToken.sol";
import "../src/MorkAirdrop.sol";

/**
 * @title  Deploy
 * @notice Foundry deploy script for MorkToken (and optionally MorkAirdrop).
 *
 * Usage
 * ─────
 * Deploy MorkToken only (Sepolia):
 *
 *   forge script script/Deploy.s.sol:DeployToken \
 *     --rpc-url sepolia \
 *     --broadcast \
 *     --verify \
 *     -vvvv
 *
 * Deploy MorkAirdrop (after you have the token address):
 *
 *   MORK_TOKEN=0x... TREASURY=0xYourWallet \
 *   forge script script/Deploy.s.sol:DeployAirdrop \
 *     --rpc-url sepolia \
 *     --broadcast \
 *     --verify \
 *     -vvvv
 *
 * Env vars required (set in .env or shell):
 *   PRIVATE_KEY         — deployer private key (without 0x prefix)
 *   SEPOLIA_RPC_URL     — e.g. https://sepolia.infura.io/v3/YOUR_KEY
 *   ETHERSCAN_API_KEY   — for --verify
 *   MORK_TOKEN          — (DeployAirdrop only) address of deployed MorkToken
 *   TREASURY            — (DeployAirdrop only) address to receive payments
 */

// ─── Deploy token only ────────────────────────────────────────────────────────

contract DeployToken is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer    = vm.addr(deployerKey);

        vm.startBroadcast(deployerKey);

        MorkToken token = new MorkToken(deployer);

        vm.stopBroadcast();

        console.log("=== MorkToken deployed ===");
        console.log("Address    :", address(token));
        console.log("Deployer   :", deployer);
        console.log("Name       :", token.name());
        console.log("Symbol     :", token.symbol());
        console.log("Total Supply (raw):", token.totalSupply());
        console.log("Deployer balance  :", token.balanceOf(deployer));
    }
}

// ─── Deploy airdrop contract ──────────────────────────────────────────────────

contract DeployAirdrop is Script {
    // Pricing defaults — override via env vars if needed
    uint256 constant MIN_PRICE     = 0.001 ether;   // 0.001 ETH floor
    uint256 constant MAX_PRICE     = 1 ether;        // 1 ETH cap
    uint256 constant TOKENS_PER_CLAIM = 1_000 * 1e18; // 1000 MORK

    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address tokenAddr   = vm.envAddress("MORK_TOKEN");
        address treasury    = vm.envAddress("TREASURY");

        vm.startBroadcast(deployerKey);

        MorkAirdrop airdrop = new MorkAirdrop(
            tokenAddr,
            treasury,
            MIN_PRICE,
            MAX_PRICE,
            TOKENS_PER_CLAIM
        );

        vm.stopBroadcast();

        console.log("=== MorkAirdrop deployed ===");
        console.log("Address    :", address(airdrop));
        console.log("Token      :", tokenAddr);
        console.log("Treasury   :", treasury);
        console.log("Min price  :", MIN_PRICE);
        console.log("Max price  :", MAX_PRICE);
        console.log("Tokens/claim:", TOKENS_PER_CLAIM);
        console.log("");
        console.log("Next steps:");
        console.log("1. Transfer MORK tokens to the airdrop contract");
        console.log("2. Call setSaleActive(true) to open claims");
    }
}
