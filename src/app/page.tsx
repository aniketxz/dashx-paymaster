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
		<main className='min-h-screen bg-background'>
			<Navbar />
			<div className='flex flex-col items-center justify-center min-h-[88vh] gap-8 text-center px-4'>
				{/* Badge */}
				<span className='text-xs font-semibold px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20'>
					Testnet only — no real funds
				</span>

				{/* Headline */}
				<div className='space-y-3'>
					<h1 className='text-5xl font-bold tracking-tight text-foreground'>
						Gas-Free{' '}
						<span className='text-primary'>Payouts</span>
					</h1>
					<p className='text-muted-foreground max-w-sm text-base leading-relaxed'>
						Connect your wallet to send crypto without worrying about gas fees.
						Powered by Base Sepolia testnet.
					</p>
				</div>

				{/* CTA */}
				<div className='flex flex-col items-center gap-3'>
					<ConnectButton />
					<p className='text-xs text-muted-foreground'>
						⛽ Gas sponsored by Paymaster{' '}
						<span className='italic'>(mocked)</span>
					</p>
				</div>

				{/* Feature pills */}
				<div className='flex flex-wrap justify-center gap-2 mt-2'>
					{[
						'🔗 Wallet Connect',
						'⚡ Instant Payouts',
						'🆓 Gas Sponsored',
						'🔒 Base Sepolia',
					].map((f) => (
						<span
							key={f}
							className='text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground border border-border'
						>
							{f}
						</span>
					))}
				</div>
			</div>
		</main>
	)
}
