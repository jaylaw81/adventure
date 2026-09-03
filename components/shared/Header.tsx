'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, Scroll, ChevronDown, Menu, X, School, Volume2, VolumeX } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { getGlobalMuted, setGlobalMuted, onGlobalMuteChange } from '@/lib/globalMute'
import { analytics } from '@/lib/analytics'
import NotificationBell from './NotificationBell'
import { fetchOrgMe } from '@/lib/orgMeClient'

interface OrgMembership {
  orgName: string
  groupName: string | null
  role: string
  status: string
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const active = pathname === href
  return (
    <Link
      href={href}
      className={`relative px-1 py-0.5 text-sm font-medium transition-colors ${
        active ? 'text-violet-300' : 'text-white/70 hover:text-white'
      }`}
    >
      {children}
      {active && (
        <span className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-violet-400 rounded-full" />
      )}
    </Link>
  )
}

export default function Header() {
  const { data: session, status } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [orgMembership, setOrgMembership] = useState<OrgMembership | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [globalMuted, setGlobalMutedState] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    const check = () => setScrolled(window.scrollY > 12)
    check()
    window.addEventListener('scroll', check, { passive: true })
    return () => window.removeEventListener('scroll', check)
  }, [])

  useEffect(() => {
    if (!session?.user?.email || session.user.tier === 'organization') return
    fetchOrgMe()
      .then(data => { if (data?.orgName) setOrgMembership(data as OrgMembership) })
      .catch(() => {})
  }, [session?.user?.email, session?.user?.tier])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  useEffect(() => {
    setGlobalMutedState(getGlobalMuted())
    return onGlobalMuteChange(setGlobalMutedState)
  }, [])

  const handleGlobalMuteToggle = () => {
    const next = !globalMuted
    setGlobalMuted(next)
    analytics.globalSoundToggle(next)
  }

  const forceSolid = !!session || pathname.startsWith('/demo') || pathname.startsWith('/profile') || pathname.startsWith('/subscribe') || pathname.startsWith('/privacy') || pathname.startsWith('/terms') || pathname.startsWith('/blog')
  const solidBg = scrolled || forceSolid

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-200 ${
        solidBg
          ? 'border-b border-white/10 shadow-sm'
          : 'border-b border-transparent'
      }`}
      style={solidBg
        ? { background: 'rgba(29,7,80,0.92)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }
        : { background: 'transparent' }
      }
    >
      {/* Top shimmer line — only visible when not scrolled */}
      {!solidBg && (
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, #a78bfa88, #f59e0b55, #a78bfa88, transparent)' }}
        />
      )}

      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #f59e0b)' }}
          >
            <Scroll size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-white font-extrabold text-lg tracking-tight group-hover:text-violet-300 transition-colors">
            Story<span className="text-violet-300">Questor</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-5 ml-2">
          {session?.user.profileComplete && <NavLink href="/">My Stories</NavLink>}
          {session?.user.tier === 'organization' && <NavLink href="/org">My Org</NavLink>}
          {(!session || session.user.profileComplete) && (
            <>
              <NavLink href="/explore">Explore</NavLink>
              <NavLink href="/how-to">Guide</NavLink>
              <NavLink href="/guide">Learn</NavLink>
              <NavLink href="/blog">Blog</NavLink>
            </>
          )}
          {(!session || (session.user.tier !== 'organization' && session.user.subscriptionStatus !== 'active' && session.user.subscriptionStatus !== 'trialing')) && (
            <NavLink href="/demo">Try Demo</NavLink>
          )}
          {!session && <NavLink href="/pricing">Pricing</NavLink>}
          {!session && <NavLink href="/organizations">For Schools</NavLink>}
          {(!session || session.user.profileComplete) && (
            <NavLink href="/resources">Resources</NavLink>
          )}
        </nav>

        {/* Notification bell */}
        {session && <NotificationBell />}

        {/* Global mute — mobile */}
        <button
          onClick={handleGlobalMuteToggle}
          className={`sm:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors ${session ? '' : 'ml-auto'}`}
          aria-label={globalMuted ? 'Unmute sounds' : 'Mute sounds'}
        >
          {globalMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </button>

        {/* Hamburger — mobile only */}
        <button
          onClick={() => setMobileOpen(v => !v)}
          className="sm:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Global mute toggle — desktop */}
        <div className={`hidden sm:block relative group ${session ? '' : 'ml-auto'}`}>
          <button
            onClick={handleGlobalMuteToggle}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={globalMuted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {globalMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
          <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-lg text-xs font-medium text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(13,12,26,0.88)' }}>
            {globalMuted ? 'Unmute sounds' : 'Mute sounds'}
          </span>
        </div>

        {/* Right side */}
        <div className="hidden sm:flex items-center gap-3">
          {status === 'loading' ? (
            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
          ) : session ? (
            <>
              {session.user.profileComplete && pathname !== '/' && (
                <Link
                  href="/create"
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:scale-105 hover:brightness-110"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
                >
                  + New Story
                </Link>
              )}
              {!session.user.profileComplete && (
                <Link
                  href="/profile?required=1"
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/40 hover:bg-violet-500/30 transition-colors"
                >
                  Complete your profile →
                </Link>
              )}

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
                      className="rounded-full ring-2 ring-violet-400/50"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #f59e0b)' }}
                    >
                      {(session.user?.name ?? session.user?.email ?? '?')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm text-white/80 hidden sm:block max-w-[120px] truncate">
                    {session.user?.name ?? session.user?.email}
                  </span>
                  <ChevronDown size={13} className={`text-white/50 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 shadow-2xl overflow-hidden"
                    style={{ background: 'linear-gradient(160deg, #2d0b69, #1a1040)' }}
                  >
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-xs text-white/50 truncate">{session.user?.email}</p>
                      {orgMembership && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <School size={11} className="text-violet-300 shrink-0" />
                          <p className="text-xs text-violet-200 truncate">
                            {orgMembership.orgName}
                            {orgMembership.groupName && ` · ${orgMembership.groupName}`}
                          </p>
                        </div>
                      )}
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <span className="w-4 h-4 text-center text-xs">👤</span>
                      Profile Settings
                    </Link>
                    <Link
                      href="/"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <span className="w-4 h-4 text-center text-xs">📚</span>
                      My Stories
                    </Link>
                    <a
                      href="https://discord.gg/SkP85wW3"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="opacity-70 shrink-0">
                        <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
                      </svg>
                      Get Help on Discord
                    </a>
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
            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                className="text-sm font-medium text-white/70 hover:text-white transition-colors px-3 py-2"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:scale-105 hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
              >
                Sign up free
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Org sub-header */}
      {orgMembership && (
        <div className="border-t border-violet-500/20" style={{ background: 'rgba(124,58,237,0.1)' }}>
          <div className="max-w-6xl mx-auto px-5 h-8 flex items-center gap-2">
            <School size={12} className="text-violet-300 shrink-0" />
            <span className="text-xs font-semibold text-violet-200">{orgMembership.orgName}</span>
            {orgMembership.groupName && (
              <>
                <span className="text-violet-500/40 text-xs">·</span>
                <span className="text-xs text-violet-300/70">{orgMembership.groupName}</span>
              </>
            )}
            <span className="ml-auto text-xs text-violet-500/50 capitalize">{orgMembership.role}</span>
          </div>
        </div>
      )}

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div
          className="sm:hidden border-t border-white/10 px-5 py-4 flex flex-col gap-1"
          style={{ background: 'linear-gradient(160deg, #2d0b69, #1a1040)' }}
        >
          {session?.user.profileComplete && (
            <Link href="/" onClick={() => setMobileOpen(false)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === '/' ? 'bg-white/10 text-violet-300' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
              My Stories
            </Link>
          )}
          {session?.user.tier === 'organization' && (
            <Link href="/org" onClick={() => setMobileOpen(false)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname.startsWith('/org') ? 'bg-white/10 text-violet-300' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
              My Org
            </Link>
          )}
          {(!session || session.user.profileComplete) && (
            <>
              <Link href="/explore" onClick={() => setMobileOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === '/explore' ? 'bg-white/10 text-violet-300' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
                Explore
              </Link>
              <Link href="/how-to" onClick={() => setMobileOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === '/how-to' ? 'bg-white/10 text-violet-300' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
                Guide
              </Link>
              <Link href="/guide" onClick={() => setMobileOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname.startsWith('/guide') ? 'bg-white/10 text-violet-300' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
                Learn
              </Link>
              <Link href="/blog" onClick={() => setMobileOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname.startsWith('/blog') ? 'bg-white/10 text-violet-300' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
                Blog
              </Link>
            </>
          )}
          {(!session || (session.user.tier !== 'organization' && session.user.subscriptionStatus !== 'active' && session.user.subscriptionStatus !== 'trialing')) && (
            <Link href="/demo" onClick={() => setMobileOpen(false)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === '/demo' ? 'bg-white/10 text-violet-300' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
              Try Demo
            </Link>
          )}
          {!session && (
            <Link href="/pricing" onClick={() => setMobileOpen(false)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === '/pricing' ? 'bg-white/10 text-violet-300' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
              Pricing
            </Link>
          )}
          {!session && (
            <Link href="/organizations" onClick={() => setMobileOpen(false)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === '/organizations' ? 'bg-white/10 text-violet-300' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
              For Schools
            </Link>
          )}
          {(!session || session.user.profileComplete) && (
            <Link href="/resources" onClick={() => setMobileOpen(false)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname.startsWith('/resources') ? 'bg-white/10 text-violet-300' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
              Resources
            </Link>
          )}

          <div className="border-t border-white/10 mt-2 pt-3 flex flex-col gap-2">
            {session ? (
              <>
                <div className="px-3 py-1">
                  <p className="text-xs text-white/40">{session.user?.email}</p>
                  {orgMembership && (
                    <div className="flex items-center gap-1 mt-1">
                      <School size={11} className="text-violet-300 shrink-0" />
                      <p className="text-xs text-violet-200 truncate">
                        {orgMembership.orgName}
                        {orgMembership.groupName && ` · ${orgMembership.groupName}`}
                      </p>
                    </div>
                  )}
                </div>
                {session.user.profileComplete ? (
                  <Link href="/create" onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                    + New Story
                  </Link>
                ) : (
                  <Link href="/profile?required=1" onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/40">
                    Complete your profile →
                  </Link>
                )}
                <Link href="/profile" onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors">
                  Profile Settings
                </Link>
                <a
                  href="https://discord.gg/SkP85wW3"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="opacity-70 shrink-0">
                    <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
                  </svg>
                  Get Help on Discord
                </a>
                <button onClick={() => { setMobileOpen(false); signOut() }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left">
                  <LogOut size={14} />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/sign-in" onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium text-white/70 border border-white/15 hover:bg-white/5 hover:text-white transition-colors">
                  Sign in
                </Link>
                <Link href="/sign-up" onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                  Sign up free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
