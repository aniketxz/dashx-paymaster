'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'

export function Navbar() {
	return (
		<nav className='border-b border-gray-200 px-6 py-4 flex items-center justify-between'>
			<div className='flex items-center gap-6'>
				<span className='font-bold text-lg'>DashX</span>
				<Link
					href='/dashboard'
					className='text-sm text-gray-600 hover:text-gray-900'
				>
					Dashboard
				</Link>
				<Link
					href='/payout'
					className='text-sm text-gray-600 hover:text-gray-900'
				>
					Send Payout
				</Link>
			</div>
			<ConnectButton />
		</nav>
	)
}
