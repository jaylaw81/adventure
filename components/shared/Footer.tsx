import Link from 'next/link'
import { Scroll } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-violet-100 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all group-hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #f59e0b)' }}
            >
              <Scroll size={14} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-base tracking-tight" style={{ color: '#1e0a3c' }}>
              Story<span style={{ color: '#7c3aed' }}>Questor</span>
            </span>
          </Link>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link href="/explore" className="text-sm transition-colors"
              style={{ color: '#6d28d9' }}>
              Explore
            </Link>
            <Link href="/how-to" className="text-sm transition-colors"
              style={{ color: '#6d28d9' }}>
              How it works
            </Link>
            <Link href="/privacy" className="text-sm transition-colors"
              style={{ color: '#6d28d9' }}>
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm transition-colors"
              style={{ color: '#6d28d9' }}>
              Terms of Service
            </Link>
          </nav>

          {/* Social + Copyright */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://www.facebook.com/StoryQuestor"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="StoryQuestor on Facebook"
              className="transition-opacity hover:opacity-70"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#a78bfa" opacity="0.45" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.514c-1.491 0-1.956.932-1.956 1.887v2.266h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
            </a>
            <p className="text-xs" style={{ color: '#a78bfa' }}>
              © {new Date().getFullYear()} StoryQuestor
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
