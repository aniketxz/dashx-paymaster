import type { Metadata } from 'next'
import { DM_Sans, Space_Mono } from 'next/font/google'
import { Providers } from '@/components/Providers'
import './globals.css'

const fontSans = DM_Sans({
	subsets: ['latin'],
	variable: '--font-sans',
})

const fontSerif = DM_Sans({
	subsets: ['latin'],
	variable: '--font-serif',
})

const fontMono = Space_Mono({
	subsets: ['latin'],
	weight: '400',
	variable: '--font-mono',
})

export const metadata: Metadata = {
	title: 'DashX Payouts',
	description: 'Gas-free crypto payout dashboard',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html
			lang='en'
			className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} h-full antialiased`}
		>
			<body className='min-h-full flex flex-col'>
				<Providers>{children}</Providers>
			</body>
		</html>
	)
}
