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
		<main className='min-h-screen'>
			<Navbar />
			<div className='max-w-lg mx-auto px-4 py-8 space-y-6'>
				<h1 className='text-2xl font-bold'>Send Payout</h1>
				<WalletCard />
				<div className='border border-gray-200 rounded-xl p-6'>
					<PayoutForm />
				</div>
			</div>
		</main>
	)
}
