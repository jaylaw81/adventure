import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import GoogleAnalytics from '@/components/GoogleAnalytics'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'StoryQuestor',
  description: 'Create branching stories where every choice matters. Build with a visual canvas, generate AI scene images, and share with the world.',
  openGraph: {
    title: 'StoryQuestor',
    description: 'Create branching stories where every choice matters.',
    url: 'https://www.storyquestor.com',
    siteName: 'StoryQuestor',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StoryQuestor',
    description: 'Create branching stories where every choice matters.',
  },
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
