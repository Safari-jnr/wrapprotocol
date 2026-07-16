// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/MorkToken.sol";
import "../src/MorkAirdrop.sol";

// ─── Deploy ────────────────────────────────────────────────────────────────
// Foundry deploy script for MorkToken (and optionally MorkAirdrop).
//
// ─── Chain-specific constants ─────────────────────────────────────────────────
// Update these when deploying to a new chain.
//
// | Chain          | SWAP_ROUTER (Uniswap V3)                             | WNATIVE (WETH/WBNB)                            |
// |----------------|------------------------------------------------------|-------------------------------------------------|
// | Base           | 0x2626664c2603336E57B271c5C0b26F421741e481           | 0x4200000000000000000000000000000000000006      |
// | ETH Mainnet    | 0xE592427A0AEce92De3Edee1F18E0157C05861564           | 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2      |
// | BNB Chain      | 0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2           | 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c      |

// ─── Chain config ─────────────────────────────────────────────────────────────
// CONFIG: Set these before deploying to a new chain.

address constant SWAP_ROUTER_BASE        = 0x2626664c2603336E57B271c5C0b26F421741e481;
address constant WNATIVE_BASE            = 0x4200000000000000000000000000000000000006;

address constant SWAP_ROUTER_MAINNET     = 0xE592427A0AEce92De3Edee1F18E0157C05861564;
address constant WNATIVE_MAINNET         = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

address constant SWAP_ROUTER_BNB         = 0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2;
address constant WNATIVE_BNB             = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;

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

        // Router / WNATIVE — env var override, or compile-time default
        address swapRouter;
        address wnative;

        try vm.envAddress("SWAP_ROUTER") returns (address r) {
            swapRouter = r;
        } catch {
            // Fallback: you must set these before deploy!
            revert("DeployAirdrop: set SWAP_ROUTER env var");
        }

        try vm.envAddress("WNATIVE") returns (address w) {
            wnative = w;
        } catch {
            revert("DeployAirdrop: set WNATIVE env var");
        }

        vm.startBroadcast(deployerKey);

        MorkAirdrop airdrop = new MorkAirdrop(
            tokenAddr,
            treasury,
            MIN_PRICE,
            MAX_PRICE,
            TOKENS_PER_CLAIM,
            swapRouter,
            wnative
        );

        vm.stopBroadcast();

        console.log("=== MorkAirdrop deployed ===");
        console.log("Address    :", address(airdrop));
        console.log("Token      :", tokenAddr);
        console.log("Treasury   :", treasury);
        console.log("Min price  :", MIN_PRICE);
        console.log("Max price  :", MAX_PRICE);
        console.log("Tokens/claim:", TOKENS_PER_CLAIM);
        console.log("SwapRouter :", swapRouter);
        console.log("WNATIVE    :", wnative);
        console.log("");
        console.log("Next steps:");
        console.log("1. Set supported tokens via setSupportedToken()");
        console.log("2. Transfer MORK tokens to the airdrop contract");
        console.log("3. Call setSaleActive(true) to open claims");
    }
}
