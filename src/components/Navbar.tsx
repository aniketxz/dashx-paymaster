'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

export function Navbar() {
	const pathname = usePathname()
	const [menuOpen, setMenuOpen] = useState(false)

	// Close menu on route change
	useEffect(() => {
		setMenuOpen(false)
	}, [pathname])

	const linkClass = (href: string) =>
		`text-sm font-medium transition-colors duration-150 px-3 py-1.5 rounded-md ${
			pathname === href
				? 'bg-primary/10 text-primary'
				: 'text-muted-foreground hover:text-foreground hover:bg-muted'
		}`

	const mobileLinkClass = (href: string) =>
		`block w-full text-sm font-medium transition-colors duration-150 px-4 py-3 rounded-lg ${
			pathname === href
				? 'bg-primary/10 text-primary'
				: 'text-muted-foreground hover:text-foreground hover:bg-muted'
		}`

	return (
		<nav className='sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm'>
			{/* Main bar */}
			<div className='px-4 sm:px-6 py-3 flex items-center justify-between'>
				{/* Logo */}
				<span className='font-bold text-lg tracking-tight text-foreground'>
					<span className='text-primary'>Dash</span>X
				</span>

				{/* Desktop nav links */}
				<div className='hidden md:flex items-center gap-1'>
					<Link href='/dashboard' className={linkClass('/dashboard')}>
						Dashboard
					</Link>
					<Link href='/payout' className={linkClass('/payout')}>
						Send Payout
					</Link>
				</div>

				{/* Right side: ConnectButton + hamburger */}
				<div className='flex items-center gap-3'>
					{/* Show compact ConnectButton always, full one on desktop */}
					<div className='hidden md:block'>
						<ConnectButton />
					</div>
					<div className='block md:hidden'>
						<ConnectButton showBalance={false} accountStatus='avatar' chainStatus='none' />
					</div>

					{/* Hamburger — mobile only */}
					<button
						className='md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-md hover:bg-muted transition-colors'
						onClick={() => setMenuOpen((prev) => !prev)}
						aria-label={menuOpen ? 'Close menu' : 'Open menu'}
						aria-expanded={menuOpen}
					>
						<span
							className={`block w-5 h-0.5 bg-foreground transition-transform duration-200 ${
								menuOpen ? 'translate-y-1.5 rotate-45' : ''
							}`}
						/>
						<span
							className={`block w-5 h-0.5 bg-foreground my-1 transition-opacity duration-200 ${
								menuOpen ? 'opacity-0' : ''
							}`}
						/>
						<span
							className={`block w-5 h-0.5 bg-foreground transition-transform duration-200 ${
								menuOpen ? '-translate-y-1.5 -rotate-45' : ''
							}`}
						/>
					</button>
				</div>
			</div>

			{/* Mobile drawer */}
			{menuOpen && (
				<div className='md:hidden absolute top-full left-0 right-0 border-t border-border bg-background/95 backdrop-blur-sm px-4 py-3 flex flex-col gap-1 shadow-lg'>
					<Link href='/dashboard' className={mobileLinkClass('/dashboard')}>
						Dashboard
					</Link>
					<Link href='/payout' className={mobileLinkClass('/payout')}>
						Send Payout
					</Link>
				</div>
			)}
		</nav>
	)
}

