import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import Nav from '@/components/nav'
import Footer from '@/components/footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'Summer Ball Portal',
  description: 'Find the right summer ball fit — fast.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col font-body">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}