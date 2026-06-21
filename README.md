# DashX Paymaster — Gas-Free Payout Dashboard

A take-home assignment dashboard for DashX. Users can connect their crypto wallet, view their balance, and send payouts to other addresses on **Base Sepolia testnet** with gas fees visually sponsored by a Paymaster (mocked).

> **Testnet only. No real funds. No production features.**

---

## Table of Contents

- [Project Purpose](#project-purpose)
- [Folder Structure](#folder-structure)
- [Setup](#setup)
- [How to Use](#how-to-use)
- [Notes](#notes)

---

## Project Purpose

This dashboard demonstrates a Web3 payout UX with the following features:

- **Wallet connection** via RainbowKit (MetaMask and other injected wallets)
- **Dashboard view** — connected address, network badge, native ETH balance, and recent payout history
- **Payout flow** — form with validation → confirmation modal → transaction execution → live status (pending / success / error)
- **Gas-free UX** — gas fees are shown as "Free (sponsored by Paymaster)" in the confirm step *(mocked — see Notes)*
- **Transaction history** — recent outgoing transactions fetched from Basescan API, merged with in-memory pending transactions

---

## Folder Structure

```
dashx-paymaster/
├── .env.example                  # Template — copy to .env.local and fill in values
├── .env.local                    # Your local env vars (gitignored)
├── AGENTS.md                     # AI agent instructions and project constraints
├── next.config.ts
├── package.json
├── tsconfig.json
│
└── src/
    ├── app/
    │   ├── globals.css           # Global styles and Tailwind CSS v4 theme tokens
    │   ├── layout.tsx            # Root layout — wraps the app with <Providers>
    │   ├── page.tsx              # Landing page — Connect Wallet CTA, redirects to dashboard if connected
    │   ├── dashboard/
    │   │   └── page.tsx          # Dashboard — WalletCard + recent payout history table
    │   └── payout/
    │       └── page.tsx          # Payout page — WalletCard + PayoutForm
    │
    ├── components/
    │   ├── Providers.tsx         # Wagmi + RainbowKit + React Query context providers
    │   ├── Navbar.tsx            # Top navigation bar with page links and ConnectButton
    │   ├── WalletCard.tsx        # Displays connected address, network badge, and ETH balance
    │   ├── PayoutForm.tsx        # Recipient + amount inputs, inline validation, send transaction logic
    │   ├── ConfirmModal.tsx      # Pre-send summary modal (recipient, amount, gas fee, network)
    │   └── TxStatus.tsx          # Transaction status display — pending / success / error states
    │
    └── lib/
        ├── wagmi.ts              # RainbowKit getDefaultConfig — chain and connector setup
        └── validation.ts         # Pure validation functions for recipient address and ETH amount
```

---

## Setup

### Prerequisites

- **Node.js** ≥ 18
- **MetaMask** browser extension configured for **Base Sepolia** (Chain ID `84532`)
- Testnet ETH on Base Sepolia — get some from [Coinbase Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet) or [Superchain Faucet](https://app.optimism.io/faucet)
- A free **WalletConnect Project ID** from [cloud.walletconnect.com](https://cloud.walletconnect.com)
- A free **Basescan API key** from [basescan.org/apis](https://basescan.org/apis) *(for transaction history)*

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/aniketxz/dashx-paymaster.git
cd dashx-paymaster

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
```

Open `.env.local` and fill in your values:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_BASESCAN_API_KEY=your_basescan_api_key_here
```

```bash
# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How to Use

### 1. Connect Your Wallet

On the landing page, click **"Connect Wallet"**. RainbowKit will open a modal — select MetaMask (or any injected wallet). Approve the connection in your wallet extension.

> If prompted to switch networks, approve the switch to **Base Sepolia**.

### 2. View Your Dashboard

After connecting, you're redirected to `/dashboard`. Here you can see:
- Your shortened wallet address (`0x1234...abcd`)
- Current network (Base Sepolia)
- Your native ETH balance
- Recent outgoing transactions fetched from Basescan

### 3. Send a Payout

Navigate to **"New Payout"** in the navbar or click the button on the dashboard. Fill in:

| Field | Rules |
|---|---|
| Recipient Address | Valid Ethereum address (`0x...`), not your own address |
| Amount (ETH) | Positive number, minimum `0.0001 ETH`, less than your current balance |

Click **"Review Payout"** — a confirmation modal will appear showing the recipient, amount, gas fee (**Free — Paymaster sponsored**), and network.

### 4. Confirm and Track

Click **"Confirm & Send"** in the modal. MetaMask will prompt you to sign the transaction.

- **Approve** → transaction enters **pending** state; you'll see a spinner with the tx hash
- **Reject** → an error state is displayed
- Once mined → **success** state with a link to the transaction on [Basescan](https://sepolia.basescan.org)

---

## Notes

### ✅ What's Complete

| Feature | Status |
|---|---|
| Wallet connection (RainbowKit) | ✅ Done |
| Dashboard — address, balance, network | ✅ Done |
| Payout form with inline validation | ✅ Done |
| Confirm modal | ✅ Done |
| Transaction execution via Wagmi | ✅ Done |
| Pending / success / error status display | ✅ Done |
| Transaction history (Basescan API) | ✅ Done |
| Mobile-responsive Navbar | ✅ Done |
| Global design system (CSS tokens + Tailwind v4) | ✅ Done |

---

### 🎭 What's Mocked

**Paymaster / Gas Sponsorship**
The UI shows "Gas fee: Free (sponsored by Paymaster)" but the transaction is a **standard ETH transfer** on testnet. The user still pays gas from their own testnet ETH. A real implementation would use a Paymaster service (e.g., Pimlico, Alchemy Account Kit, Biconomy) to sign a `UserOperation` and submit it via an ERC-4337 bundler. This is intentionally mocked and labeled clearly in the UI.

**Transaction History** *(partially)*
History is fetched live from the Basescan API. In-memory pending transactions (submitted in the current session) are merged with confirmed transactions from the API. No local persistence — refreshing clears pending entries.

---

### ⚖️ Tradeoffs

- **No backend** — Everything is client-side. This means the WalletConnect Project ID and Basescan API key are exposed as `NEXT_PUBLIC_*` variables. For a production app, Basescan calls should be proxied through a server-side route to keep the API key private.
- **Native ETH only** — Supporting ERC-20 tokens would require `useReadContract` for balance, `useWriteContract` for `transfer()`, and ABI management. Excluded to stay within scope.
- **No persistent tx history** — Pending transactions live in React state (in-memory). A real app would use localStorage or a backend to persist them across sessions.
- **Testnet only** — The chain is hardcoded to Base Sepolia. Switching to mainnet would require a different RPC, chain config, and real funds — explicitly out of scope.

---

### 🚀 What I Would Improve With More Time

- **Real Paymaster integration** — Integrate [Pimlico](https://pimlico.io) or Alchemy's Account Kit to submit `UserOperations` via an ERC-4337 bundler, giving users genuinely gasless transactions.
- **Multi-chain support** — Allow users to switch between Base Mainnet, Base Sepolia, Optimism, and Arbitrum. The Wagmi config already supports multiple chains via `getDefaultConfig`; the UI just needs a chain selector and dynamic RPC routing.
- **Mainnet support** — With multi-chain in place, toggling to mainnet is a config change. A safety warning ("real funds") would be shown.
- **ERC-20 token support** — Add a token selector to the payout form with balance fetching via `useReadContract`.
- **Persistent transaction history** — Store sent transactions in localStorage or a lightweight backend (e.g., PlanetScale or Supabase) so history survives page refreshes.
- **Server-side API proxy** — Route Basescan API calls through a Next.js API route (`/api/transactions`) to keep the API key out of the browser.
- **Better error messages** — Parse viem's `ContractFunctionRevertedError`, insufficient funds errors, and nonce issues into user-friendly copy.
- **ENS / Basename resolution** — Resolve `.eth` and `.base.eth` names to addresses in the recipient field.

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| Next.js | 16 | Framework (App Router) |
| TypeScript | 5 | Type safety |
| Tailwind CSS | v4 | Styling |
| RainbowKit | latest | Wallet connection UI |
| Wagmi | v2 | React hooks for blockchain |
| Viem | v2 | Low-level blockchain utilities |
| @tanstack/react-query | v5 | Async state management (Wagmi peer dep) |

**Network:** Base Sepolia (Chain ID `84532`) | RPC: `https://sepolia.base.org` | Explorer: [sepolia.basescan.org](https://sepolia.basescan.org)
