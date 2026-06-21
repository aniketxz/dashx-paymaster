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
		<div className='bg-card border border-border rounded-xl p-6 space-y-5 shadow-sm'>
			<div className='flex items-center justify-between'>
				<h2 className='font-semibold text-card-foreground text-sm uppercase tracking-wider'>
					Connected Wallet
				</h2>
				<span
					className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
						isCorrectNetwork
							? 'bg-secondary text-secondary-foreground'
							: 'bg-destructive text-destructive-foreground'
					}`}
				>
					{isCorrectNetwork ? '● ' : '○ '}
					{chain?.name ?? 'Unknown Network'}
				</span>
			</div>

			<div className='grid grid-cols-2 gap-4'>
				<div className='space-y-1'>
					<p className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
						Address
					</p>
					<p className='font-mono text-sm text-foreground bg-muted px-2 py-1 rounded-md' title={address}>
						{shortAddress}
					</p>
				</div>

				<div className='space-y-1'>
					<p className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
						Balance
					</p>
					<p className='text-xl font-bold text-foreground'>
						{isLoading
							? '—'
							: `${parseFloat(balance?.formatted ?? '0').toFixed(4)} ${balance?.symbol ?? 'ETH'}`}
					</p>
				</div>
			</div>

			{!isCorrectNetwork && (
				<p className='text-xs text-destructive-foreground bg-destructive/15 px-3 py-2 rounded-lg'>
					⚠️ Please switch to Base Sepolia in MetaMask
				</p>
			)}
		</div>
	)
}
