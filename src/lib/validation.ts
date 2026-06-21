import { isAddress } from "viem"

export type ValidationResult = { valid: true } | { valid: false; error: string }

export function validateRecipientAddress(
	address: string,
	senderAddress?: string,
): ValidationResult {
	if (!address.trim()) {
		return { valid: false, error: "Recipient address is required" }
	}
	if (!isAddress(address)) {
		return { valid: false, error: "Invalid Ethereum address" }
	}
	if (senderAddress && address.toLowerCase() === senderAddress.toLowerCase()) {
		return { valid: false, error: "Cannot send to your own address" }
	}
	return { valid: true }
}

export function validateAmount(
	amount: string,
	balanceEth?: string,
): ValidationResult {
	if (!amount.trim()) {
		return { valid: false, error: "Amount is required" }
	}
	const parsed = parseFloat(amount)
	if (isNaN(parsed) || parsed <= 0) {
		return { valid: false, error: "Amount must be a positive number" }
	}
	if (parsed < 0.0001) {
		return { valid: false, error: "Minimum amount is 0.0001 ETH" }
	}
	if (balanceEth !== undefined) {
		const balance = parseFloat(balanceEth)
		if (parsed >= balance) {
			return {
				valid: false,
				error: "Insufficient balance (keep some ETH for safety)",
			}
		}
	}
	return { valid: true }
}
