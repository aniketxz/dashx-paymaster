'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { WalletCard } from '@/components/WalletCard'
import Link from 'next/link'

type InternalTx = {
	transaction_hash: string
	from: { hash: string }
	to: { hash: string }
	value: string
	success: boolean
	timestamp: string
	type: string
}

type DisplayTransaction = {
	hash: string
	to: string
	amount: string
	status: 'success' | 'error'
	time: string
}

const STATUS_STYLES: Record<DisplayTransaction['status'], string> = {
	success: 'bg-secondary text-secondary-foreground',
	error: 'bg-destructive text-destructive-foreground',
}

function weiToEth(wei: string): string {
	const eth = parseInt(wei) / 1e18
	return `${eth.toFixed(4)} ETH`
}

async function fetchOutgoingTxns(
	address: string,
): Promise<DisplayTransaction[]> {
	const url = `https://base-sepolia.blockscout.com/api/v2/addresses/${address}/internal-transactions`

	const res = await fetch(url)
	const data = await res.json()

	if (!data.items || !Array.isArray(data.items)) return []

	return data.items
		.filter(
			(tx: InternalTx) =>
				tx.from?.hash?.toLowerCase() === address.toLowerCase() &&
				tx.type === 'call' &&
				tx.value !== '0',
		)
		.slice(0, 20)
		.map((tx: InternalTx) => ({
			hash: tx.transaction_hash,
			to: tx.to?.hash ?? '',
			amount: weiToEth(tx.value),
			status: tx.success ? 'success' : 'error',
			time: tx.timestamp,
		}))
}

export default function DashboardPage() {
	const { isConnected, address } = useAccount()
	const router = useRouter()

	const [txns, setTxns] = useState<DisplayTransaction[]>([])
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		if (!isConnected) router.push('/')
	}, [isConnected, router])

	useEffect(() => {
		if (!address) return
		setIsLoading(true)
		fetchOutgoingTxns(address)
			.then(setTxns)
			.finally(() => setIsLoading(false))
	}, [address])

	if (!isConnected) return null

	return (
		<main className='min-h-screen bg-background'>
			<Navbar />
			<div className='max-w-2xl mx-auto px-4 py-8 space-y-6'>
				<div className='flex items-center justify-between'>
					<h1 className='text-2xl font-bold text-foreground'>Dashboard</h1>
					<Link
						href='/payout'
						className='bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 active:scale-[0.99] transition-all'
					>
						Send Payout →
					</Link>
				</div>

				<WalletCard />

				{/* Recent Payouts Table */}
				<div className='bg-card border border-border rounded-xl overflow-hidden shadow-sm'>
					<div className='px-5 py-3.5 border-b border-border flex items-center justify-between'>
						<h3 className='font-semibold text-sm text-card-foreground'>Recent Payouts</h3>
						<span className='text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full'>
							Live
						</span>
					</div>

					{isLoading ? (
						<div className='px-4 py-10 text-center text-sm text-muted-foreground'>
							<span className='animate-pulse'>Loading history…</span>
						</div>
					) : txns.length === 0 ? (
						<div className='px-4 py-10 text-center space-y-2'>
							<p className='text-sm text-muted-foreground'>No payouts yet.</p>
							<Link
								href='/payout'
								className='text-xs text-primary underline underline-offset-2'
							>
								Send your first one →
							</Link>
						</div>
					) : (
						<table className='w-full text-sm'>
							<thead>
								<tr className='text-xs text-muted-foreground bg-muted/70 border-b border-border'>
									<th className='px-5 py-2.5 text-left font-medium'>To</th>
									<th className='px-5 py-2.5 text-left font-medium'>Amount</th>
									<th className='px-5 py-2.5 text-left font-medium'>Status</th>
									<th className='px-5 py-2.5 text-left font-medium'>Time</th>
									<th className='px-5 py-2.5 text-left font-medium'>Tx</th>
								</tr>
							</thead>
							<tbody>
								{txns.map((tx) => (
									<tr
										key={tx.hash}
										className='border-b border-border/50 hover:bg-muted/30 transition-colors'
									>
										<td className='px-5 py-3 font-mono text-xs text-foreground'>
											{tx.to
												? `${tx.to.slice(0, 6)}...${tx.to.slice(-4)}`
												: '—'}
										</td>
										<td className='px-5 py-3 text-foreground font-medium'>
											{tx.amount}
										</td>
										<td className='px-5 py-3'>
											<span
												className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_STYLES[tx.status]}`}
											>
												{tx.status}
											</span>
										</td>
										<td className='px-5 py-3 text-muted-foreground text-xs'>
											{new Date(tx.time).toLocaleTimeString()}
										</td>
										<td className='px-5 py-3'>
											<a
												href={`https://sepolia.basescan.org/tx/${tx.hash}`}
												target='_blank'
												rel='noopener noreferrer'
												className='text-xs text-primary underline underline-offset-2 hover:opacity-80 transition-opacity'
											>
												{tx.hash.slice(0, 6)}…{tx.hash.slice(-4)}
											</a>
										</td>
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
