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
		<div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4'>
			<div className='bg-white rounded-2xl p-6 w-full max-w-sm space-y-4'>
				<h3 className='font-bold text-lg'>Confirm Payout</h3>

				<div className='space-y-2 text-sm'>
					<div className='flex justify-between py-2 border-b border-gray-100'>
						<span className='text-gray-500'>To</span>
						<span className='font-mono'>{shortRecipient}</span>
					</div>
					<div className='flex justify-between py-2 border-b border-gray-100'>
						<span className='text-gray-500'>Amount</span>
						<span className='font-semibold'>{amount} ETH</span>
					</div>
					<div className='flex justify-between py-2 border-b border-gray-100'>
						<span className='text-gray-500'>Gas fee</span>
						<span className='text-green-600 font-medium'>Free ✓</span>
					</div>
					<div className='flex justify-between py-2'>
						<span className='text-gray-500'>Network</span>
						<span>Base Sepolia</span>
					</div>
				</div>

				<div className='bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500'>
					⛽ Gas sponsored by Paymaster —{' '}
					<span className='italic'>mocked for this demo</span>
				</div>

				<div className='flex gap-3'>
					<button
						onClick={onCancel}
						disabled={isLoading}
						className='flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50'
					>
						Cancel
					</button>
					<button
						onClick={onConfirm}
						disabled={isLoading}
						className='flex-1 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50'
					>
						{isLoading ? 'Sending...' : 'Confirm & Send'}
					</button>
				</div>
			</div>
		</div>
	)
}
