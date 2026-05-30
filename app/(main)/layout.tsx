import Header from '@/components/shared/Header'
import Footer from '@/components/shared/Footer'
import SubscriptionNoticeBanner from '@/components/shared/SubscriptionNoticeBanner'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <SubscriptionNoticeBanner />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
