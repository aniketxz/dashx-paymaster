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
		<div className='border border-gray-200 rounded-xl p-6 space-y-4'>
			<div className='flex items-center justify-between'>
				<h2 className='font-semibold text-gray-700'>Connected Wallet</h2>
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

			<div className='space-y-1'>
				<p className='text-xs text-gray-400'>Address</p>
				<p className='font-mono text-sm' title={address}>
					{shortAddress}
				</p>
			</div>

			<div className='space-y-1'>
				<p className='text-xs text-gray-400'>Balance</p>
				<p className='text-2xl font-bold'>
					{isLoading
						? '...'
						: `${parseFloat(balance?.formatted ?? '0').toFixed(4)} ${balance?.symbol ?? 'ETH'}`}
				</p>
			</div>

			{!isCorrectNetwork && (
				<p className='text-xs text-red-500'>
					⚠️ Please switch to Base Sepolia in MetaMask
				</p>
			)}
		</div>
	)
}
