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

	const rows: { label: string; value: React.ReactNode }[] = [
		{ label: 'To', value: <span className='font-mono text-xs'>{shortRecipient}</span> },
		{ label: 'Amount', value: <span className='font-semibold'>{amount} ETH</span> },
		{
			label: 'Gas fee',
			value: (
				<span className='text-secondary font-semibold'>
					Free ✓
				</span>
			),
		},
		{ label: 'Network', value: 'Base Sepolia' },
	]

	return (
		<div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4'>
			<div className='bg-card border border-border rounded-2xl p-6 w-full max-w-sm space-y-5 shadow-xl'>
				<div className='space-y-1'>
					<h3 className='font-bold text-lg text-card-foreground'>Confirm Payout</h3>
					<p className='text-xs text-muted-foreground'>
						Review the details before sending.
					</p>
				</div>

				<div className='divide-y divide-border rounded-lg border border-border overflow-hidden'>
					{rows.map(({ label, value }) => (
						<div
							key={label}
							className='flex items-center justify-between px-4 py-3 bg-card text-sm'
						>
							<span className='text-muted-foreground'>{label}</span>
							<span className='text-card-foreground'>{value}</span>
						</div>
					))}
				</div>

				<div className='bg-muted border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground flex items-center gap-2'>
					<span>⛽</span>
					<span>
						Gas sponsored by Paymaster —{' '}
						<span className='italic'>mocked for this demo</span>
					</span>
				</div>

				<div className='flex gap-3'>
					<button
						onClick={onCancel}
						disabled={isLoading}
						className='flex-1 px-4 py-2.5 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors disabled:opacity-50'
					>
						Cancel
					</button>
					<button
						onClick={onConfirm}
						disabled={isLoading}
						className='flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50'
					>
						{isLoading ? 'Sending…' : 'Confirm & Send'}
					</button>
				</div>
			</div>
		</div>
	)
}
