import type { Metadata } from 'next'
import { Noto_Sans_Bengali } from 'next/font/google'
import './globals.css'

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ['bengali', 'latin'],
  variable: '--font-bangla',
})

export const metadata: Metadata = {
  title: 'Interactive Narrative Engine',
  description: 'A choice-based interactive story platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="bn" className={notoSansBengali.variable}>
      <body className="antialiased font-sans">{children}</body>
    </html>
  )
}
