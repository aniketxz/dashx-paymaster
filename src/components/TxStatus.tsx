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

	const variants = {
		pending: {
			wrapper: 'bg-accent border-accent',
			title: 'text-accent-foreground',
			body: 'text-accent-foreground/80',
		},
		success: {
			wrapper: 'bg-secondary border-secondary',
			title: 'text-secondary-foreground',
			body: 'text-secondary-foreground/80',
		},
		error: {
			wrapper: 'bg-destructive border-destructive',
			title: 'text-destructive-foreground',
			body: 'text-destructive-foreground/80',
		},
	} as const

	const v = variants[state.status]

	return (
		<div className={`rounded-xl p-4 border space-y-2 ${v.wrapper}`}>
			{state.status === 'pending' && (
				<>
					<p className={`text-sm font-semibold flex items-center gap-2 ${v.title}`}>
						<span className='animate-spin inline-block'>⏳</span>
						Transaction Pending…
					</p>
					<p className={`text-xs ${v.body}`}>
						Waiting for confirmation on Base Sepolia
					</p>
				</>
			)}

			{state.status === 'success' && (
				<>
					<p className={`text-sm font-semibold ${v.title}`}>✅ Payout Sent!</p>
					<p className={`text-xs break-all ${v.body}`}>
						Tx:{' '}
						<a
							href={`https://sepolia.basescan.org/tx/${state.hash}`}
							target='_blank'
							rel='noopener noreferrer'
							className='underline underline-offset-2'
						>
							{state.hash.slice(0, 20)}…
						</a>
					</p>
					<p className={`text-xs inline-flex items-center gap-1 bg-secondary/20 px-2 py-1 rounded-md ${v.body}`}>
						⛽ Gas sponsored by Paymaster{' '}
						<span className='italic'>(mocked)</span>
					</p>
					<button
						onClick={onReset}
						className={`block text-xs underline underline-offset-2 mt-1 ${v.title}`}
					>
						Send another payout →
					</button>
				</>
			)}

			{state.status === 'error' && (
				<>
					<p className={`text-sm font-semibold ${v.title}`}>❌ Transaction Failed</p>
					<p className={`text-xs ${v.body}`}>{state.message}</p>
					<button
						onClick={onReset}
						className={`block text-xs underline underline-offset-2 mt-1 ${v.title}`}
					>
						Try again →
					</button>
				</>
			)}
		</div>
	)
}
