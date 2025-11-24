import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tiger Trails - Princeton Campus Exploration',
  description: 'Discover the legendary secrets of Princeton University',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
