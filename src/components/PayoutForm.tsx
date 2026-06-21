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

	const inputBase =
		'w-full border rounded-lg px-3 py-2.5 text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow'

	return (
		<div className='space-y-5'>
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
					<div className='space-y-1.5'>
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
							className={`${inputBase} font-mono ${
								recipientError ? 'border-destructive/40' : 'border-border/40'
							}`}
						/>
						{recipientError && (
							<p className='text-xs text-destructive-foreground'>
								{recipientError}
							</p>
						)}
					</div>

					{/* Amount input with max button */}
					<div className='space-y-1.5'>
						<div className='flex justify-between items-center'>
							<label className='text-sm font-medium text-foreground'>
								Amount (ETH)
							</label>
							{balance && (
								<button
									type='button'
									onClick={() =>
										setAmount((parseFloat(balance.formatted) * 0.9).toFixed(4))
									}
									className='text-xs text-primary hover:text-primary/80 font-medium transition-colors bg-muted px-2 py-1 rounded-md cursor-pointer'
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
							className={`${inputBase} ${
								amountError ? 'border-destructive/40' : 'border-border/40'
							}`}
						/>
						{amountError && (
							<p className='text-xs text-destructive-foreground'>
								{amountError}
							</p>
						)}
					</div>

					{/* Paymaster mocked notice */}
					<div className='bg-muted border border-border/10 rounded-lg px-3 py-2.5 text-xs text-muted-foreground/80 flex items-center gap-2'>
						<span>⛽</span>
						<span>
							Gas fee:{' '}
							<span className='text-secondary font-semibold'>Free</span> —
							sponsored by Paymaster <span className='italic'>(mocked)</span>
						</span>
					</div>

					<button
						onClick={handleReview}
						disabled={isLoading}
						className='w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold cursor-pointer hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed'
					>
						Review Payout →
					</button>
				</div>
			) : null}
		</div>
	)
}
