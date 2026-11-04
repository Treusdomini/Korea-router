import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Korea Link Router',
  description: 'Geo-based link router',
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