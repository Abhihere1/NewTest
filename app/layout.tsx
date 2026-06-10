import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Patch — Discount Tire IT Support',
  description: 'Self-service IT support for Discount Tire associates',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.className} h-full`}>
      <body className="h-full flex flex-col bg-gray-50">
        {children}
      </body>
    </html>
  )
}
