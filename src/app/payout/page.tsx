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
		<main className='min-h-screen bg-background'>
			<Navbar />
			<div className='max-w-lg mx-auto px-4 py-8 space-y-6'>
				<h1 className='text-2xl font-bold text-foreground'>Send Payout</h1>
				<WalletCard />
				<div className='bg-card border border-border rounded-xl p-6 shadow-sm'>
					<PayoutForm />
				</div>
			</div>
		</main>
	)
}
