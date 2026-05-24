'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { ShieldCheck, BookOpen, Flag, LogOut, School, MessageSquareHeart, Users, Settings2, Menu, X, Mail } from 'lucide-react'

export default function AdminNav() {
  const pathname = usePathname()
  const [pendingReports, setPendingReports] = useState(0)
  const [waitlistCount, setWaitlistCount] = useState(0)
  const [surveyCount, setSurveyCount] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/reports').then(r => r.json()).catch(() => []),
      fetch('/api/admin/review-reports').then(r => r.json()).catch(() => []),
      fetch('/api/admin/waitlist').then(r => r.json()).catch(() => []),
      fetch('/api/admin/survey').then(r => r.json()).catch(() => []),
    ]).then(([stories, reviews, waitlist, survey]: [{ status: string }[], { status: string }[], unknown[], unknown[]]) => {
      const pending =
        stories.filter(r => r.status === 'pending').length +
        reviews.filter(r => r.status === 'pending').length
      setPendingReports(pending)
      setWaitlistCount(Array.isArray(waitlist) ? waitlist.length : 0)
      setSurveyCount(Array.isArray(survey) ? survey.length : 0)
    })
  }, [pathname])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const NAV_ITEMS = [
    { href: '/admin', label: 'Stories', icon: BookOpen, badge: 0, badgeStyle: 'alert' },
    { href: '/admin/users', label: 'Users', icon: Users, badge: 0, badgeStyle: 'alert' },
    { href: '/admin/reports', label: 'Reports', icon: Flag, badge: pendingReports, badgeStyle: 'alert' },
    { href: '/admin/survey', label: 'Survey', icon: MessageSquareHeart, badge: surveyCount, badgeStyle: 'count' },
    { href: '/admin/surveys', label: 'Survey Editor', icon: Settings2, badge: 0, badgeStyle: 'count' },
    { href: '/admin/waitlist', label: 'Org Waitlist', icon: School, badge: waitlistCount, badgeStyle: 'count' },
    { href: '/admin/messages', label: 'Email Blast', icon: Mail, badge: 0, badgeStyle: 'count' },
  ] as const

  const navLinks = NAV_ITEMS.map(({ href, label, icon: Icon, badge, badgeStyle }) => {
    const active = href === '/admin' ? pathname === href : pathname === href || pathname.startsWith(href + '/')
    return (
      <Link
        key={href}
        href={href}
        onClick={() => setMobileOpen(false)}
        className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          active
            ? 'bg-slate-700 text-white'
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <span className="flex items-center gap-3">
          <Icon size={16} />
          {label}
        </span>
        {badge > 0 && (
          <span className={`px-1.5 py-0.5 text-xs font-bold rounded-full min-w-[20px] text-center ${
            badgeStyle === 'alert'
              ? 'bg-red-500 text-white'
              : 'bg-amber-500 text-slate-900'
          }`}>
            {badge}
          </span>
        )}
      </Link>
    )
  })

  const signOutButton = (
    <div className="px-3 py-4 border-t border-slate-700">
      <button
        onClick={() => signOut({ callbackUrl: '/admin/sign-in' })}
        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
      >
        <LogOut size={16} />
        Sign out
      </button>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 bg-slate-900 text-white flex-col min-h-screen">
        <div className="px-5 py-5 border-b border-slate-700 flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
            <ShieldCheck size={16} className="text-slate-200" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">Admin Portal</p>
            <p className="text-xs text-slate-400">StoryQuestor</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">{navLinks}</nav>
        {signOutButton}
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 h-14 bg-slate-900 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-slate-700 rounded-lg flex items-center justify-center">
            <ShieldCheck size={14} className="text-slate-200" />
          </div>
          <p className="text-sm font-bold text-white">Admin Portal</p>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 max-w-[85vw] bg-slate-900 text-white flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-slate-700 rounded-lg flex items-center justify-center">
                  <ShieldCheck size={14} className="text-slate-200" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">Admin Portal</p>
                  <p className="text-xs text-slate-400">StoryQuestor</p>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-700 transition-colors"
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 flex flex-col gap-1">{navLinks}</nav>
            {signOutButton}
          </aside>
        </div>
      )}
    </>
  )
}
