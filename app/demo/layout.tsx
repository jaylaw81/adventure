import Header from '@/components/shared/Header'
import Footer from '@/components/shared/Footer'
import DemoConversionBar from '@/components/demo/DemoConversionBar'

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
      <DemoConversionBar />
    </div>
  )
}
