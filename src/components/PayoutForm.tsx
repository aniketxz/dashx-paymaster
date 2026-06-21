'use client'

import { useState } from 'react'
import { useAccount, useBalance, useSendTransaction } from 'wagmi'
import { parseEther } from 'viem'
import { validateRecipientAddress, validateAmount } from '@/lib/validation'
import { ConfirmModal } from './ConfirmModal'
import { TxStatus } from './TxStatus'

type TxState =
	| { status: 'idle' }
	| { status: 'pending' }
	| { status: 'success'; hash: string }
	| { status: 'error'; message: string }

export function PayoutForm() {
	const { address } = useAccount()
	const { data: balance } = useBalance({ address })

	const [recipient, setRecipient] = useState('')
	const [amount, setAmount] = useState('')
	const [showConfirm, setShowConfirm] = useState(false)
	const [txState, setTxState] = useState<TxState>({ status: 'idle' })
	const [recipientError, setRecipientError] = useState('')
	const [amountError, setAmountError] = useState('')

	const { sendTransactionAsync } = useSendTransaction()

	function validate(): boolean {
		const rResult = validateRecipientAddress(recipient, address)
		const aResult = validateAmount(amount, balance?.formatted)
		setRecipientError(rResult.valid ? '' : rResult.error)
		setAmountError(aResult.valid ? '' : aResult.error)
		return rResult.valid && aResult.valid
	}

	function handleReview() {
		if (validate()) setShowConfirm(true)
	}

	async function handleConfirm() {
		setShowConfirm(false)
		setTxState({ status: 'pending' })

		try {
			const hash = await sendTransactionAsync({
				to: recipient as `0x${string}`,
				value: parseEther(amount),
			})
			setTxState({ status: 'success', hash })
		} catch (err: unknown) {
			const message =
				err instanceof Error
					? err.message.includes('User rejected')
						? 'Transaction rejected in wallet'
						: err.message.slice(0, 120)
					: 'Transaction failed'
			setTxState({ status: 'error', message })
		}
	}

	function handleReset() {
		setRecipient('')
		setAmount('')
		setTxState({ status: 'idle' })
		setRecipientError('')
		setAmountError('')
	}

	const isLoading = txState.status === 'pending'

	return (
		<div className='space-y-4'>
			{showConfirm && (
				<ConfirmModal
					recipient={recipient}
					amount={amount}
					onConfirm={handleConfirm}
					onCancel={() => setShowConfirm(false)}
					isLoading={isLoading}
				/>
			)}

			<TxStatus state={txState} onReset={handleReset} />

			{txState.status === 'idle' || txState.status === 'error' ? (
				<div className='space-y-4'>
					{/* Recipient address input */}
					<div className='space-y-1'>
						<label className='text-sm font-medium text-foreground'>
							Recipient Address
						</label>
						<input
							type='text'
							value={recipient}
							onChange={(e) => {
								setRecipient(e.target.value)
								setRecipientError('')
							}}
							placeholder='0x...'
							className={`w-full border rounded-lg px-3 py-2 text-sm font-mono bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
								recipientError ? 'border-destructive' : 'border-border'
							}`}
						/>
						{recipientError && (
							<p className='text-xs text-destructive'>{recipientError}</p>
						)}
					</div>

					{/* Amount input with max button */}
					<div className='space-y-1'>
						<div className='flex justify-between'>
							<label className='text-sm font-medium text-foreground'>
								Amount (ETH)
							</label>
							{balance && (
								<button
									type='button'
									onClick={() =>
										setAmount(
											(parseFloat(balance.formatted) * 0.9).toFixed(4),
										)
									}
									className='text-xs text-muted-foreground hover:text-foreground'
								>
									Max: {parseFloat(balance.formatted).toFixed(4)} ETH
								</button>
							)}
						</div>
						<input
							type='number'
							value={amount}
							onChange={(e) => {
								setAmount(e.target.value)
								setAmountError('')
							}}
							placeholder='0.01'
							min='0'
							step='0.001'
							className={`w-full border rounded-lg px-3 py-2 text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
								amountError ? 'border-destructive' : 'border-border'
							}`}
						/>
						{amountError && (
							<p className='text-xs text-destructive'>{amountError}</p>
						)}
					</div>

					{/* Paymaster mocked notice */}
					<div className='bg-muted rounded-lg px-3 py-2 text-xs text-muted-foreground'>
						⛽ Gas fee:{' '}
						<span className='text-secondary font-medium'>Free</span> — sponsored
						by Paymaster
						<span className='ml-1 italic'>(mocked)</span>
					</div>

					<button
						onClick={handleReview}
						disabled={isLoading}
						className='w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50'
					>
						Review Payout
					</button>
				</div>
			) : null}
		</div>
	)
}