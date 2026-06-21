'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Navbar() {
	const pathname = usePathname()

	const linkClass = (href: string) =>
		`text-sm font-medium transition-colors duration-150 px-3 py-1.5 rounded-md ${
			pathname === href
				? 'bg-primary/10 text-primary'
				: 'text-muted-foreground hover:text-foreground hover:bg-muted'
		}`

	return (
		<nav className='sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm px-6 py-3 flex items-center justify-between'>
			<div className='flex items-center gap-6'>
				<span className='font-bold text-lg tracking-tight text-foreground'>
					<span className='text-primary'>Dash</span>X
				</span>
				<div className='flex items-center gap-1'>
					<Link href='/dashboard' className={linkClass('/dashboard')}>
						Dashboard
					</Link>
					<Link href='/payout' className={linkClass('/payout')}>
						Send Payout
					</Link>
				</div>
			</div>
			<ConnectButton />
		</nav>
	)
}
