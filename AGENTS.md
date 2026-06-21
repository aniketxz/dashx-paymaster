# AGENTS.md — DashX Gas-Free Payout Dashboard

Project context for AI agents. Read this before making any changes.
Do not deviate from the scope, stack, or decisions described here.

---

## What This Project Is

A take-home assignment for DashX. A small web dashboard where a user can:
- Connect their crypto wallet
- View their wallet address, network, and token balance
- Send a payout to another address
- Experience gas-free transactions via a Paymaster (sponsored gas fees)
- See transaction status: pending → success / failed

**This is a testnet-only MVP. No real funds. No production features.**

---

## Scope Boundaries

### In scope
- Wallet connection
- Wallet dashboard (address, balance, network)
- Payout form with validation
- Confirm step before sending
- Transaction status display
- Mocked Paymaster gas sponsorship (clearly labeled in UI)
- Mocked transaction history on dashboard
- README with setup instructions and honest notes on what's mocked

### Explicitly out of scope (do not build)
- Authentication / login
- KYC or compliance flows
- Admin panels
- Mainnet support
- Real Paymaster integration (Pimlico etc.) — mock it and label clearly
- Backend server
- Database or persistent storage
- ERC-20 token support — use native testnet ETH only
- Mobile app

---

## Tech Stack

| Tool | Purpose |
|---|---|
| **Next.js 16 + TypeScript** | Framework. App Router. Already installed. |
| **Tailwind CSS v4** | Styling. Already installed. |
| **RainbowKit** | Wallet connection UI — provides the "Connect Wallet" button and modal |
| **Wagmi** | React hooks for blockchain interactions — `useAccount`, `useBalance`, `useSendTransaction` etc. |
| **Viem** | Low-level blockchain utilities — used for `isAddress()` validation and `parseEther()` |
| **@tanstack/react-query** | Required peer dependency for Wagmi |
| **Base Sepolia testnet** | The blockchain network being used. Chain ID: `84532`. Fake ETH, no real funds. |

### Not used
- No Pimlico / Alchemy / Biconomy SDK (Paymaster is mocked)
- No backend framework
- No database
- No auth library

---

## Project Structure

```
src/
  app/
    layout.tsx              ← Root layout, wraps with Providers
    page.tsx                ← Landing page with connect wallet CTA
    dashboard/
      page.tsx              ← Wallet dashboard (address, balance, history)
    payout/
      page.tsx              ← Payout form page
  components/
    Providers.tsx           ← Wagmi + RainbowKit + ReactQuery setup (client)
    Navbar.tsx              ← Top nav with ConnectButton and page links
    WalletCard.tsx          ← Displays address, network badge, balance
    PayoutForm.tsx          ← Recipient + amount inputs, validation, send logic
    ConfirmModal.tsx        ← Pre-send confirmation modal
    TxStatus.tsx            ← Pending / success / error states
  lib/
    wagmi.ts                ← Chain config and RainbowKit getDefaultConfig
    validation.ts           ← Pure validation functions for address and amount
```

---

## Environment Variables

```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=   ← from cloud.walletconnect.com
NEXT_PUBLIC_CHAIN_ID=84532              ← Base Sepolia, do not change
```

Both go in `.env.local` (gitignored). `.env.example` with empty values goes in git.

---

## Key Product Decisions

**Paymaster is mocked.** The UI shows "Gas sponsored by Paymaster" but the transaction is a standard ETH transfer on testnet. The user still pays gas from their testnet ETH. Label this clearly in the UI with "(mocked)" and document in README.

**Native ETH only.** No ERC-20 tokens. Keeps the scope achievable in one day.

**Testnet only.** Base Sepolia. Chain ID 84532. RPC: `https://sepolia.base.org`. Explorer: `https://sepolia.basescan.org`.

**Transaction history is mocked.** Dashboard shows a hardcoded list of past transactions with a visible "Mocked data" label.

**No backend.** Everything runs client-side.

---

## Validation Rules (important — enforce all of these)

Recipient address:
- Required, non-empty
- Must be a valid Ethereum address (use viem's `isAddress()`)
- Cannot be the same as the connected wallet address (no self-transfer)

Amount:
- Required, non-empty
- Must be a positive number
- Minimum 0.0001 ETH
- Must be less than current balance (leave room for gas)

---

## Transaction Flow

```
User fills form → clicks "Review Payout"
  → validation runs → errors shown inline if invalid
  → if valid → ConfirmModal opens
    → shows: recipient (shortened), amount, gas fee (Free), network
    → Cancel → close modal
    → Confirm → call wagmi's sendTransactionAsync
      → MetaMask popup appears
        → User rejects → error state
        → User approves → pending state → wait for receipt → success state
          → show tx hash with link to sepolia.basescan.org
```

---

## What Is Complete

- [ ] Nothing yet. Project is freshly scaffolded with Next.js + Tailwind only.

---

## What Needs To Be Built (in order)

1. Install dependencies — RainbowKit, Wagmi, Viem, React Query
2. `lib/wagmi.ts` — chain and connector config
3. `components/Providers.tsx` — wrap app with Web3 providers
4. `app/layout.tsx` — add Providers wrapper
5. `components/Navbar.tsx` — nav links + ConnectButton
6. `app/page.tsx` — landing page, redirect to dashboard if connected
7. `lib/validation.ts` — address and amount validation functions
8. `components/WalletCard.tsx` — address, balance, network display
9. `app/dashboard/page.tsx` — dashboard with WalletCard + mocked history table
10. `components/TxStatus.tsx` — pending / success / error display
11. `components/ConfirmModal.tsx` — pre-send summary modal
12. `components/PayoutForm.tsx` — form inputs, validation, send transaction logic
13. `app/payout/page.tsx` — payout page combining WalletCard + PayoutForm
14. `README.md` — setup instructions, what's mocked, what's complete, tradeoffs
15. `.env.example` — empty env var template for the repo

---

## Coding Conventions

- All components are `'use client'` since they use hooks
- TypeScript strict mode is on — no `any`, proper types everywhere
- Tailwind only for styling — no CSS modules, no inline styles
- Shorten wallet addresses in display: `0x1234...abcd` format
- Error messages must be user-friendly — no raw blockchain errors shown to user
- Mocked pieces must have a visible label in the UI: e.g. "Mocked data" chip or "(mocked)" text

---

## How to Run

```bash
npm install
cp .env.example .env.local
# fill in NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
npm run dev
```

Requires MetaMask with Base Sepolia configured and some testnet ETH from a faucet.