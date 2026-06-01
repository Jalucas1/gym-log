import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GymLog',
  description: 'Premium facility cleaning and tanning log tracker',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
