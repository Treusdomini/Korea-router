import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KOREA_ROUTER // GEO-LINK',
  description: 'Geo-based link router — neon console',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
