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
					<p className='text-sm font-medium text-yellow-800'>
						⏳ Transaction Pending...
					</p>
					<p className='text-xs text-yellow-600'>
						Waiting for confirmation on Base Sepolia
					</p>
				</>
			)}

			{state.status === 'success' && (
				<>
					<p className='text-sm font-medium text-green-800'>✅ Payout Sent!</p>
					<p className='text-xs text-green-600 break-all'>
						Tx hash:{' '}
						<a
							href={`https://sepolia.basescan.org/tx/${state.hash}`}
							target='_blank'
							rel='noopener noreferrer'
							className='underline'
						>
							{state.hash.slice(0, 20)}...
						</a>
					</p>
					<p className='text-xs text-green-600 bg-green-100 px-2 py-1 rounded inline-block'>
						⛽ Gas sponsored by Paymaster (mocked)
					</p>
					<button
						onClick={onReset}
						className='block text-xs text-green-700 underline mt-1'
					>
						Send another payout
					</button>
				</>
			)}

			{state.status === 'error' && (
				<>
					<p className='text-sm font-medium text-red-800'>
						❌ Transaction Failed
					</p>
					<p className='text-xs text-red-600'>{state.message}</p>
					<button
						onClick={onReset}
						className='block text-xs text-red-700 underline mt-1'
					>
						Try again
					</button>
				</>
			)}
		</div>
	)
}
