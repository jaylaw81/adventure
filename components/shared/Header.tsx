'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, Scroll, ChevronDown } from 'lucide-react'
import { useSession, signIn, signOut } from 'next-auth/react'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const active = pathname === href
  return (
    <Link
      href={href}
      className={`relative px-1 py-0.5 text-sm font-medium transition-colors ${
        active ? 'text-amber-400' : 'text-gray-300 hover:text-white'
      }`}
    >
      {children}
      {active && (
        <span className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
      )}
    </Link>
  )
}

export default function Header() {
  const { data: session, status } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="relative z-30 border-b border-white/10"
      style={{ background: 'linear-gradient(135deg, #1a1025 0%, #0f172a 60%, #1a1025 100%)' }}
    >
      {/* Subtle top shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, #f59e0b66, #a78bfa66, transparent)' }}
      />

      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
          >
            <Scroll size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-white font-extrabold text-lg tracking-tight group-hover:text-amber-300 transition-colors">
            Story<span className="text-amber-400">Questor</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-5 ml-2">
          <NavLink href="/explore">Explore</NavLink>
          <NavLink href="/how-to">Guide</NavLink>
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          {status === 'loading' ? (
            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
          ) : session ? (
            <>
              {/* Create button */}
              <Link
                href="/create"
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-gray-900 transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
              >
                + New Story
              </Link>

              {/* User menu */}
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setMenuOpen(v => !v)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl border border-white/10 hover:border-white/25 hover:bg-white/5 transition-all"
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name ?? 'User'}
                      width={30}
                      height={30}
                      className="rounded-full ring-2 ring-amber-400/50"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
                    >
                      {(session.user?.name ?? session.user?.email ?? '?')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm text-gray-200 hidden sm:block max-w-[120px] truncate">
                    {session.user?.name ?? session.user?.email}
                  </span>
                  <ChevronDown size={13} className={`text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-white/10 shadow-2xl overflow-hidden"
                    style={{ background: 'linear-gradient(160deg, #1e1b3a, #0f172a)' }}
                  >
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <span className="w-4 h-4 text-center text-xs">👤</span>
                      Profile Settings
                    </Link>
                    <Link
                      href="/"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <span className="w-4 h-4 text-center text-xs">📚</span>
                      My Adventures
                    </Link>
                    <div className="border-t border-white/10 mt-1">
                      <button
                        onClick={() => { setMenuOpen(false); signOut() }}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full text-left"
                      >
                        <LogOut size={14} />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => signIn('google')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-gray-900 transition-all hover:scale-105 hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
            >
              Sign in with Google
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
