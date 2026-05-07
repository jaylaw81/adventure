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

          {/* Copyright */}
          <p className="text-xs shrink-0" style={{ color: '#a78bfa' }}>
            © {new Date().getFullYear()} StoryQuestor
          </p>
        </div>
      </div>
    </footer>
  )
}
