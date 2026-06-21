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
		<main className='min-h-screen'>
			<Navbar />
			<div className='flex flex-col items-center justify-center min-h-[80vh] gap-6 text-center px-4'>
				<h1 className='text-4xl font-bold'>Gas-Free Payouts</h1>
				<p className='text-gray-500 max-w-md'>
					Connect your wallet to send crypto without worrying about gas fees.
					Powered by Base Sepolia testnet.
				</p>
				<ConnectButton />
				<p className='text-xs text-gray-400'>
					Testnet only — no real funds used
				</p>
			</div>
		</main>
	)
}
