import Link from 'next/link'
import { Scroll } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-auto"
      style={{ background: 'linear-gradient(135deg, #1a1025 0%, #0f172a 60%, #1a1025 100%)' }}
    >
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all group-hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
            >
              <Scroll size={14} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-white font-extrabold text-base tracking-tight">
              Story<span className="text-amber-400">Questor</span>
            </span>
          </Link>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link href="/explore" className="text-gray-400 hover:text-white text-sm transition-colors">
              Explore
            </Link>
            <Link href="/how-to" className="text-gray-400 hover:text-white text-sm transition-colors">
              How it works
            </Link>
            <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-gray-500 text-xs shrink-0">
            © {new Date().getFullYear()} StoryQuestor
          </p>
        </div>
      </div>
    </footer>
  )
}
