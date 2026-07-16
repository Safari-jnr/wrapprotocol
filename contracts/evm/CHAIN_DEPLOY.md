# Multi-Chain Deployment — MorkAirdrop

## Architecture

```
                    ┌─────────────────────┐
                    │    MorkToken.sol     │
                    │   (on Base chain)    │
                    └─────────┬───────────┘
                              │ bridge MORK
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
    ┌─────────────────┐ ┌──────────┐ ┌──────────┐
    │ MorkAirdrop      │ │MorkAirdrop│ │MorkAirdrop│
    │ on Base (done)   │ │ on ETH   │ │ on BNB   │
    │                  │ │ Mainnet  │ │ Chain    │
    └─────────────────┘ └──────────┘ └──────────┘
```

- **MorkToken** stays deployed on **Base** (already done)
- **Bridge** MorkToken from Base → each new chain
- Deploy a **separate MorkAirdrop** on each chain, each holding its own MORK supply

---

## Step 0: Prerequisites

Install Foundry (if not already):
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

Install dependencies:
```bash
cd contracts/evm
forge install
```

---

## Step 1: Deploy MorkAirdrop on Ethereum Mainnet

### 1a. Set up env vars

Create `contracts/evm/.env` (or use shell env vars):
```bash
# Your deployer wallet - needs ETH on Ethereum Mainnet for gas
PRIVATE_KEY=your_private_key_here

# Ethereum Mainnet RPC
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY

# Etherscan API key (for contract verification)
ETHERSCAN_API_KEY=your_etherscan_key

# Address of MorkToken ON BASE (already deployed - same token, different chain)
MORK_TOKEN=<SAFARI_GIVES_YOU_THIS>

# Treasury wallet - receives all ETH/BNB payments
TREASURY=0x15b07714d81d97CF1dcbD9678D07DFC545b97E38

# RPC name in foundry.toml
ETH_RPC_URL=$MAINNET_RPC_URL
```

### 1b. Deploy MorkAirdrop on Ethereum Mainnet

First, open `script/Deploy.s.sol` and **update the SWAP_ROUTER and WETH constants** for Ethereum Mainnet:

```solidity
// Inside DeployAirdrop contract, replace the Base constants:
address constant SWAP_ROUTER = 0xE592427A0AEce92De3Edee1F18E0157C05861564; // Uniswap V3 on Mainnet
address constant WETH        = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2; // WETH on Mainnet
```

Then deploy:
```bash
MORK_TOKEN=<token_address> TREASURY=0x15b077... \
forge script script/Deploy.s.sol:DeployAirdrop \
  --rpc-url mainnet \
  --broadcast \
  --verify \
  -vvvv
```

### 1c. Set supported payment tokens on Mainnet

After deploy, call these via `cast send`:
```bash
# USDC on Mainnet
cast send <AIRDROP_ADDRESS> "setSupportedToken(address,uint24,bool)" \
  0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 500 true \
  --private-key $PRIVATE_KEY --rpc-url mainnet

# USDT on Mainnet
cast send <AIRDROP_ADDRESS> "setSupportedToken(address,uint24,bool)" \
  0xdAC17F958D2ee523a2206206994597C13D831ec7 500 true \
  --private-key $PRIVATE_KEY --rpc-url mainnet

# DAI on Mainnet
cast send <AIRDROP_ADDRESS> "setSupportedToken(address,uint24,bool)" \
  0x6B175474E89094C44Da98b954EedeAC495271d0F 3000 true \
  --private-key $PRIVATE_KEY --rpc-url mainnet
```

### 1d. Bridge MORK tokens to Mainnet & deposit

Use a bridge (LayerZero, CCIP, or any bridge) to move MorkToken from Base to Ethereum Mainnet. After bridging:

```bash
# Transfer MORK to the airdrop contract
cast send <MORK_TOKEN_ON_MAINNET> "transfer(address,uint256)" \
  <AIRDROP_ADDRESS> <AMOUNT_IN_WEI> \
  --private-key $PRIVATE_KEY --rpc-url mainnet

# Activate sale
cast send <AIRDROP_ADDRESS> "setSaleActive(bool)" true \
  --private-key $PRIVATE_KEY --rpc-url mainnet
```

---

## Step 2: Deploy MorkAirdrop on BNB Chain

### 2a. Update constants in Deploy.s.sol

```solidity
// BNB Chain uses WBNB (wrapped BNB) - NOT WETH
address constant SWAP_ROUTER = 0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2; // Uniswap V3 on BNB
address constant WETH        = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c; // WBNB on BNB Chain
```

### 2b. Deploy
```bash
MORK_TOKEN=<token_address> TREASURY=0x15b077... \
forge script script/Deploy.s.sol:DeployAirdrop \
  --rpc-url bnb \
  --broadcast \
  --verify \
  -vvvv
```

### 2c. Set payment tokens + deposit + activate (same as Step 1c/1d)

---

## Step 3: Chain Config Reference

| Network | Native Coin | Uniswap Router | Wrapped Native | Explorer |
|---------|-------------|----------------|----------------|----------|
| **Base** | ETH | `0x2626664c2603336E57B271c5C0b26F421741e481` | `0x420000...0006` (WETH) | basescan.org |
| **ETH Mainnet** | ETH | `0xE592427A0AEce92De3Edee1F18E0157C05861564` | `0xC02aaA...Cc2` (WETH) | etherscan.io |
| **BNB Chain** | BNB | `0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2` | `0xbb4CdB...95c` (WBNB) | bscscan.com |

### Token Addresses per chain (payment tokens accepted by Airdrop)

| Token | Base | ETH Mainnet | BNB Chain |
|-------|------|-------------|-----------|
| **USDC** | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` | `0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d` |
| **USDT** | `0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2` | `0xdAC17F958D2ee523a2206206994597C13D831ec7` | `0x55d398326f99059fF775485246999027B3197955` |
| **DAI** | `0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb` | `0x6B175474E89094C44Da98b954EedeAC495271d0F` | `0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3` |
| **cbBTC** | `0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf` | ❌ not native | ❌ not native |

---

## What Safari needs back from mide

After completing deployment on each chain, mide give safari:

```json
{
  "base": {
    "airdropContract": "0x...",              // already deployed
    "morkToken": "0x...",                     // already deployed
    "explorer": "https://basescan.org"
  },
  "ethereumMainnet": {
    "airdropContract": "0x...",              // ← NEW - from deploy
    "morkToken": "0x...",                    // ← NEW - bridged version address
    "explorer": "https://etherscan.io"
  },
  "bnbChain": {
    "airdropContract": "0x...",              // ← NEW - from deploy
    "morkToken": "0x...",                    // ← NEW - bridged version address
    "explorer": "https://bscscan.com"
  }
}
```

Then you update `src/lib/constants.ts` with these addresses (I'll create the config structure).
