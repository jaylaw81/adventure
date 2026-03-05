import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import GoogleAnalytics from '@/components/GoogleAnalytics'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'StoryQuestor',
  description: 'Create and play choose-your-own-adventure stories',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ colorScheme: 'light' }}>
      <body className={`${geist.className} antialiased bg-gray-50 min-h-screen`}>
        <GoogleAnalytics />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
