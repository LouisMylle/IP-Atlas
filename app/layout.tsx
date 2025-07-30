import type { Metadata } from 'next'
import './globals.css'
import { ReactQueryProvider } from './providers'

export const metadata: Metadata = {
  title: 'IP Atlas - IP Range Manager',
  description: 'Manage your network IP ranges and allocations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  )
}