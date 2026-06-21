# AGENTS.md — DashX Gas-Free Payout Dashboard

> Agentic build guide. Follow steps in order. Each step is self-contained with clear validation.
> Stack: Next.js 16 + TypeScript + Tailwind v4 + RainbowKit + Wagmi + Viem + Base Sepolia testnet

---

## Mental Model Before You Start

```
User opens app
  → connects MetaMask wallet (RainbowKit handles this)
  → sees dashboard: address, balance, network
  → fills payout form: recipient address + amount
  → sees confirm modal
  → clicks Send → transaction goes to Base Sepolia testnet
  → sees pending → success/fail with tx hash
  → "Gas sponsored by Paymaster" label shown (mocked)
```

Everything is on **testnet** (fake money). No real funds, ever.

---

## Pre-Build Setup (Do this first, ~15 min)

### A. Get a MetaMask wallet + testnet ETH

1. Install MetaMask browser extension → create a wallet → save your seed phrase
2. In MetaMask → Settings → Networks → Add **Base Sepolia**:
   - Network name: `Base Sepolia Testnet`
   - RPC URL: `https://sepolia.base.org`
   - Chain ID: `84532`
   - Currency symbol: `ETH`
   - Explorer: `https://sepolia.basescan.org`
3. Get free test ETH: go to `https://www.coinbase.com/faucets/base-ethereum-goerli-faucet` or `https://faucet.quicknode.com/base/sepolia` → paste your MetaMask address → request funds
4. Verify: MetaMask should show some ETH on Base Sepolia network

### B. Get a WalletConnect Project ID

1. Go to `https://cloud.walletconnect.com` → sign up → create a project
2. Copy the **Project ID** — you'll need it for `.env.local`

projectID - `d74168a4babbbf6e69361d61a0b2b85d`

### C. Create `.env.local` in project root

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_CHAIN_ID=84532
```

Also create `.env.example` (same keys, empty values — this goes in git):
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
NEXT_PUBLIC_CHAIN_ID=84532
```

---

## Step 1 — Install Dependencies

**What:** Install all Web3 libraries in one go.

```bash
npm install @rainbow-me/rainbowkit wagmi viem@2.x @tanstack/react-query
```

**Validate:**
- `package.json` should now list all four packages under `dependencies`
- Run `npm run dev` → should still boot without errors on `localhost:3000`
- No TypeScript errors in terminal

---

## Step 2 — Project Structure

**What:** Create the folder structure before writing any logic.

Create these files (empty for now):

```
src/
  app/
    layout.tsx          ← already exists, will modify
    page.tsx            ← already exists, will modify
    dashboard/
      page.tsx          ← wallet dashboard
    payout/
      page.tsx          ← payout form
  components/
    Providers.tsx       ← Wagmi + RainbowKit + ReactQuery setup
    WalletCard.tsx      ← shows address, network, balance
    PayoutForm.tsx      ← recipient + amount inputs
    ConfirmModal.tsx    ← confirm before sending
    TxStatus.tsx        ← pending/success/fail display
    Navbar.tsx          ← top nav with connect button
  lib/
    wagmi.ts            ← chain + connector config
    validation.ts       ← address and amount validators
```

```bash
mkdir -p src/app/dashboard src/app/payout src/components src/lib
touch src/components/Providers.tsx src/components/WalletCard.tsx
touch src/components/PayoutForm.tsx src/components/ConfirmModal.tsx
touch src/components/TxStatus.tsx src/components/Navbar.tsx
touch src/lib/wagmi.ts src/lib/validation.ts
touch src/app/dashboard/page.tsx src/app/payout/page.tsx
```

**Validate:**
- Folder tree matches structure above
- `npm run dev` still works

---

## Step 3 — Wagmi + RainbowKit Config

**What:** Set up the Web3 provider configuration.

### `src/lib/wagmi.ts`

```typescript
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { baseSepolia } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'DashX Payouts',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [baseSepolia],
  ssr: true,
})
```

### `src/components/Providers.tsx`

```typescript
'use client'

import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/lib/wagmi'
import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

### `src/app/layout.tsx` — wrap with Providers

```typescript
import type { Metadata } from 'next'
import { Providers } from '@/components/Providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'DashX Payouts',
  description: 'Gas-free crypto payout dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

**Validate:**
- `npm run dev` → no errors in terminal
- Browser opens `localhost:3000` without crash
- No "missing projectId" errors in console (means `.env.local` is loaded correctly)

---

## Step 4 — Navbar with Connect Wallet Button

**What:** Top navigation bar with RainbowKit's ConnectButton.

### `src/components/Navbar.tsx`

```typescript
'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'

export function Navbar() {
  return (
    <nav className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="font-bold text-lg">DashX</span>
        <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
          Dashboard
        </Link>
        <Link href="/payout" className="text-sm text-gray-600 hover:text-gray-900">
          Send Payout
        </Link>
      </div>
      <ConnectButton />
    </nav>
  )
}
```

### `src/app/page.tsx` — landing/home page

```typescript
'use client'

import { Navbar } from '@/components/Navbar'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { isConnected } = useAccount()
  const router = useRouter()

  useEffect(() => {
    if (isConnected) router.push('/dashboard')
  }, [isConnected, router])

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 text-center px-4">
        <h1 className="text-4xl font-bold">Gas-Free Payouts</h1>
        <p className="text-gray-500 max-w-md">
          Connect your wallet to send crypto without worrying about gas fees.
          Powered by Base Sepolia testnet.
        </p>
        <ConnectButton />
        <p className="text-xs text-gray-400">Testnet only — no real funds used</p>
      </div>
    </main>
  )
}
```

**Validate:**
- `localhost:3000` shows the landing page with "Connect Wallet" button
- Clicking it opens RainbowKit modal with MetaMask option
- After connecting MetaMask → redirects to `/dashboard` (page will be blank, that's fine for now)
- MetaMask shows Base Sepolia in the network selector inside RainbowKit modal

---

## Step 5 — Validation Helpers

**What:** Pure functions for validating address and amount. Write these before the form so they're testable in isolation.

### `src/lib/validation.ts`

```typescript
import { isAddress } from 'viem'

export type ValidationResult = { valid: true } | { valid: false; error: string }

export function validateRecipientAddress(
  address: string,
  senderAddress?: string
): ValidationResult {
  if (!address.trim()) {
    return { valid: false, error: 'Recipient address is required' }
  }
  if (!isAddress(address)) {
    return { valid: false, error: 'Invalid Ethereum address' }
  }
  if (senderAddress && address.toLowerCase() === senderAddress.toLowerCase()) {
    return { valid: false, error: 'Cannot send to your own address' }
  }
  return { valid: true }
}

export function validateAmount(amount: string, balanceEth?: string): ValidationResult {
  if (!amount.trim()) {
    return { valid: false, error: 'Amount is required' }
  }
  const parsed = parseFloat(amount)
  if (isNaN(parsed) || parsed <= 0) {
    return { valid: false, error: 'Amount must be a positive number' }
  }
  if (parsed < 0.0001) {
    return { valid: false, error: 'Minimum amount is 0.0001 ETH' }
  }
  if (balanceEth !== undefined) {
    const balance = parseFloat(balanceEth)
    if (parsed >= balance) {
      return { valid: false, error: 'Insufficient balance (keep some ETH for safety)' }
    }
  }
  return { valid: true }
}
```

**Validate:**
- Open browser console on any page, or add a quick test in a component:
```typescript
// Quick sanity check — remove after testing
import { validateRecipientAddress, validateAmount } from '@/lib/validation'
console.log(validateRecipientAddress(''))           // { valid: false, error: 'required' }
console.log(validateRecipientAddress('0xinvalid'))  // { valid: false, error: 'Invalid...' }
console.log(validateRecipientAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44e')) // { valid: true }
console.log(validateAmount('0'))      // { valid: false }
console.log(validateAmount('0.01'))   // { valid: true }
```
- No TypeScript errors on `npm run dev`

---

## Step 6 — Wallet Dashboard Page

**What:** Show connected wallet info — address, network, balance.

### `src/components/WalletCard.tsx`

```typescript
'use client'

import { useAccount, useBalance } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'

export function WalletCard() {
  const { address, chain } = useAccount()
  const { data: balance, isLoading } = useBalance({ address })

  if (!address) return null

  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`
  const isCorrectNetwork = chain?.id === baseSepolia.id

  return (
    <div className="border border-gray-200 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-700">Connected Wallet</h2>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            isCorrectNetwork
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {chain?.name ?? 'Unknown Network'}
        </span>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-gray-400">Address</p>
        <p className="font-mono text-sm" title={address}>{shortAddress}</p>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-gray-400">Balance</p>
        <p className="text-2xl font-bold">
          {isLoading
            ? '...'
            : `${parseFloat(balance?.formatted ?? '0').toFixed(4)} ${balance?.symbol ?? 'ETH'}`}
        </p>
      </div>

      {!isCorrectNetwork && (
        <p className="text-xs text-red-500">
          ⚠️ Please switch to Base Sepolia in MetaMask
        </p>
      )}
    </div>
  )
}
```

### `src/app/dashboard/page.tsx`

```typescript
'use client'

import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import { WalletCard } from '@/components/WalletCard'
import Link from 'next/link'

// Mock recent transactions for display
const MOCK_TRANSACTIONS = [
  { hash: '0xabc...123', to: '0x742d...f44e', amount: '0.01 ETH', status: 'success', time: '2 min ago' },
  { hash: '0xdef...456', to: '0x891c...a21b', amount: '0.05 ETH', status: 'success', time: '1 hr ago' },
]

export default function DashboardPage() {
  const { isConnected } = useAccount()
  const router = useRouter()

  useEffect(() => {
    if (!isConnected) router.push('/')
  }, [isConnected, router])

  if (!isConnected) return null

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <WalletCard />

        <div className="flex justify-end">
          <Link
            href="/payout"
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
          >
            Send Payout →
          </Link>
        </div>

        {/* Transaction History */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-sm">Recent Payouts</h3>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
              Mocked data
            </span>
          </div>
          {MOCK_TRANSACTIONS.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              No payouts yet. Send your first one →
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="px-4 py-2 text-left">To</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Time</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_TRANSACTIONS.map((tx) => (
                  <tr key={tx.hash} className="border-b border-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{tx.to}</td>
                    <td className="px-4 py-3">{tx.amount}</td>
                    <td className="px-4 py-3">
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{tx.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  )
}
```

**Validate:**
- Connect wallet → dashboard shows your address (shortened), balance, and network badge
- If on wrong network → red badge + warning shown
- "Recent Payouts" table shows with "Mocked data" label
- "Send Payout →" link navigates to `/payout`

---

## Step 7 — Transaction Status Component

**What:** Reusable component to show pending/success/fail state.

### `src/components/TxStatus.tsx`

```typescript
'use client'

type TxState =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'success'; hash: string }
  | { status: 'error'; message: string }

interface TxStatusProps {
  state: TxState
  onReset: () => void
}

export function TxStatus({ state, onReset }: TxStatusProps) {
  if (state.status === 'idle') return null

  return (
    <div
      className={`rounded-xl p-4 space-y-2 ${
        state.status === 'pending'
          ? 'bg-yellow-50 border border-yellow-200'
          : state.status === 'success'
          ? 'bg-green-50 border border-green-200'
          : 'bg-red-50 border border-red-200'
      }`}
    >
      {state.status === 'pending' && (
        <>
          <p className="text-sm font-medium text-yellow-800">⏳ Transaction Pending...</p>
          <p className="text-xs text-yellow-600">
            Waiting for confirmation on Base Sepolia
          </p>
        </>
      )}

      {state.status === 'success' && (
        <>
          <p className="text-sm font-medium text-green-800">✅ Payout Sent!</p>
          <p className="text-xs text-green-600 break-all">
            Tx hash:{' '}
            <a
              href={`https://sepolia.basescan.org/tx/${state.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {state.hash.slice(0, 20)}...
            </a>
          </p>
          <p className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded inline-block">
            ⛽ Gas sponsored by Paymaster (mocked)
          </p>
          <button
            onClick={onReset}
            className="block text-xs text-green-700 underline mt-1"
          >
            Send another payout
          </button>
        </>
      )}

      {state.status === 'error' && (
        <>
          <p className="text-sm font-medium text-red-800">❌ Transaction Failed</p>
          <p className="text-xs text-red-600">{state.message}</p>
          <button
            onClick={onReset}
            className="block text-xs text-red-700 underline mt-1"
          >
            Try again
          </button>
        </>
      )}
    </div>
  )
}
```

**Validate:**
- No TypeScript errors
- (Visual check happens in Step 9)

---

## Step 8 — Confirm Modal

**What:** A modal that shows transaction summary before the user confirms.

### `src/components/ConfirmModal.tsx`

```typescript
'use client'

interface ConfirmModalProps {
  recipient: string
  amount: string
  onConfirm: () => void
  onCancel: () => void
  isLoading: boolean
}

export function ConfirmModal({
  recipient,
  amount,
  onConfirm,
  onCancel,
  isLoading,
}: ConfirmModalProps) {
  const shortRecipient = `${recipient.slice(0, 8)}...${recipient.slice(-6)}`

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
        <h3 className="font-bold text-lg">Confirm Payout</h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">To</span>
            <span className="font-mono">{shortRecipient}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Amount</span>
            <span className="font-semibold">{amount} ETH</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Gas fee</span>
            <span className="text-green-600 font-medium">Free ✓</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500">Network</span>
            <span>Base Sepolia</span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500">
          ⛽ Gas sponsored by Paymaster —{' '}
          <span className="italic">mocked for this demo</span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Confirm & Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

**Validate:**
- No TypeScript errors
- (Visual check happens in Step 9)

---

## Step 9 — Payout Form + Send Transaction

**What:** The main payout flow — form → confirm modal → send tx → show status.

### `src/components/PayoutForm.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, isAddress } from 'viem'
import { validateRecipientAddress, validateAmount } from '@/lib/validation'
import { ConfirmModal } from './ConfirmModal'
import { TxStatus } from './TxStatus'

type TxState =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'success'; hash: string }
  | { status: 'error'; message: string }

export function PayoutForm() {
  const { address } = useAccount()
  const { data: balance } = useBalance({ address })

  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [txState, setTxState] = useState<TxState>({ status: 'idle' })

  // Field-level errors
  const [recipientError, setRecipientError] = useState('')
  const [amountError, setAmountError] = useState('')

  const { sendTransactionAsync } = useSendTransaction()

  function validate(): boolean {
    const rResult = validateRecipientAddress(recipient, address)
    const aResult = validateAmount(amount, balance?.formatted)

    setRecipientError(rResult.valid ? '' : rResult.error)
    setAmountError(aResult.valid ? '' : aResult.error)

    return rResult.valid && aResult.valid
  }

  function handleReview() {
    if (validate()) setShowConfirm(true)
  }

  async function handleConfirm() {
    setShowConfirm(false)
    setTxState({ status: 'pending' })

    try {
      const hash = await sendTransactionAsync({
        to: recipient as `0x${string}`,
        value: parseEther(amount),
      })
      setTxState({ status: 'success', hash })
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message.includes('User rejected')
            ? 'Transaction rejected in wallet'
            : err.message.slice(0, 120)
          : 'Transaction failed'
      setTxState({ status: 'error', message })
    }
  }

  function handleReset() {
    setRecipient('')
    setAmount('')
    setTxState({ status: 'idle' })
    setRecipientError('')
    setAmountError('')
  }

  const isLoading = txState.status === 'pending'

  return (
    <div className="space-y-4">
      {showConfirm && (
        <ConfirmModal
          recipient={recipient}
          amount={amount}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
          isLoading={isLoading}
        />
      )}

      <TxStatus state={txState} onReset={handleReset} />

      {txState.status === 'idle' || txState.status === 'error' ? (
        <div className="space-y-4">
          {/* Recipient */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Recipient Address</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => {
                setRecipient(e.target.value)
                setRecipientError('')
              }}
              placeholder="0x..."
              className={`w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black ${
                recipientError ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {recipientError && (
              <p className="text-xs text-red-500">{recipientError}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-700">Amount (ETH)</label>
              {balance && (
                <button
                  type="button"
                  onClick={() => setAmount((parseFloat(balance.formatted) * 0.9).toFixed(4))}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Max: {parseFloat(balance.formatted).toFixed(4)} ETH
                </button>
              )}
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                setAmountError('')
              }}
              placeholder="0.01"
              min="0"
              step="0.001"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black ${
                amountError ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {amountError && (
              <p className="text-xs text-red-500">{amountError}</p>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500">
            ⛽ Gas fee: <span className="text-green-600 font-medium">Free</span> — sponsored by Paymaster
            <span className="ml-1 italic">(mocked)</span>
          </div>

          <button
            onClick={handleReview}
            disabled={isLoading}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            Review Payout
          </button>
        </div>
      ) : null}
    </div>
  )
}
```

### `src/app/payout/page.tsx`

```typescript
'use client'

import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import { PayoutForm } from '@/components/PayoutForm'
import { WalletCard } from '@/components/WalletCard'

export default function PayoutPage() {
  const { isConnected } = useAccount()
  const router = useRouter()

  useEffect(() => {
    if (!isConnected) router.push('/')
  }, [isConnected, router])

  if (!isConnected) return null

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold">Send Payout</h1>
        <WalletCard />
        <div className="border border-gray-200 rounded-xl p-6">
          <PayoutForm />
        </div>
      </div>
    </main>
  )
}
```

**Validate (this is the big one):**

1. Navigate to `/payout`
2. **Empty submit** → both error messages appear below inputs
3. **Invalid address** (type `0xinvalid`) → "Invalid Ethereum address" error
4. **Self-transfer** (paste your own address) → "Cannot send to your own address"
5. **Zero amount** → "Amount must be a positive number"
6. **Amount > balance** → "Insufficient balance" error
7. **Valid inputs** → "Review Payout" button opens confirm modal
8. Modal shows: recipient (shortened), amount, "Gas fee: Free", "Base Sepolia"
9. Click **Cancel** → modal closes, form stays
10. Click **Confirm & Send** → MetaMask pops up
11. **Reject in MetaMask** → error state shown: "Transaction rejected in wallet"
12. **Approve in MetaMask** → pending state shown → then success with tx hash link
13. Tx hash link opens `sepolia.basescan.org` with actual transaction

---

## Step 10 — README

**What:** Write the README so the assignment is complete.

Create `README.md` in project root:

```markdown
# DashX — Gas-Free Payout Dashboard

A wallet payout dashboard built on Base Sepolia testnet with a mocked Paymaster gas sponsorship flow.

## Setup

1. Clone repo and install:
   ```bash
   npm install
   ```

2. Copy env example:
   ```bash
   cp .env.example .env.local
   ```

3. Fill in `.env.local`:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_id_from_cloud.walletconnect.com
   NEXT_PUBLIC_CHAIN_ID=84532
   ```

4. Run:
   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000`

## Requirements
- MetaMask browser extension
- Test ETH on Base Sepolia (get from https://faucet.quicknode.com/base/sepolia)

## What's Complete
- Wallet connection via RainbowKit (MetaMask, Coinbase Wallet, WalletConnect)
- Dashboard showing address, network, balance
- Payout form with full validation (address format, self-transfer, amount, balance check)
- Confirm modal with transaction summary
- Real ETH send on Base Sepolia testnet via Wagmi
- Transaction status: pending → success (with Basescan link) / failed
- "Max" button to auto-fill 90% of balance
- Network warning if not on Base Sepolia
- Mocked recent transaction history on dashboard

## What's Mocked
- **Paymaster / Gas sponsorship**: The UI shows "Gas sponsored by Paymaster" but the actual
  transaction is a standard ETH transfer. The user still pays gas from their testnet ETH.
  A real implementation would use Pimlico's `permissionless.js` SDK to wrap the transaction
  as an ERC-4337 UserOperation and call `pm_sponsorUserOperation` on their API.
- **Transaction history**: Dashboard shows hardcoded past transactions. A real implementation
  would query Basescan API or index events from an on-chain contract.

## What I'd Improve With More Time
- Real Pimlico Paymaster integration via `permissionless.js`
- ERC-20 token support (USDC on Base Sepolia)
- Persistent transaction history via localStorage or a backend
- Address book for saved recipients
- Unit tests for `validation.ts` with Vitest
- Better mobile layout
```

**Validate:**
- `npm install && npm run dev` works from a clean clone (test in a new terminal or ask someone to clone)
- All env vars are documented

---

## Final Checklist Before Demo Video

- [ ] Landing page shows with Connect Wallet button
- [ ] MetaMask connects and redirects to dashboard
- [ ] Dashboard shows real balance from Base Sepolia
- [ ] Wrong network shows red badge
- [ ] Payout form validates all error cases
- [ ] Confirm modal opens with correct summary
- [ ] Cancel closes modal
- [ ] Real transaction sends on Base Sepolia (MetaMask prompt appears)
- [ ] Success state shows tx hash with Basescan link
- [ ] Reject in MetaMask shows error state
- [ ] "Mocked" labels are visible in UI where applicable
- [ ] README has setup instructions + notes on what's mocked

---

## Demo Video Script (2-3 min)

```
0:00 - Show the landing page, explain what the app does in one sentence
0:20 - Click Connect Wallet → connect MetaMask on Base Sepolia
0:35 - Dashboard: point out address, balance, network badge, mocked history
1:00 - Click Send Payout → show the form
1:10 - Demo validation: empty submit, invalid address, self-transfer
1:40 - Enter a valid recipient address (a second wallet or any valid address)
       and a small amount like 0.001 ETH
2:00 - Click Review → walk through confirm modal, point out "Gas: Free (mocked)"
2:15 - Confirm → approve in MetaMask → show pending state
2:30 - Success state → click tx hash → show on Basescan
2:50 - Briefly mention what's mocked and what you'd do with more time
```