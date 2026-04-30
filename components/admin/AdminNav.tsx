'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { ShieldCheck, BookOpen, Flag, LogOut, School } from 'lucide-react'

export default function AdminNav() {
  const pathname = usePathname()
  const [pendingReports, setPendingReports] = useState(0)
  const [waitlistCount, setWaitlistCount] = useState(0)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/reports').then(r => r.json()).catch(() => []),
      fetch('/api/admin/review-reports').then(r => r.json()).catch(() => []),
      fetch('/api/admin/waitlist').then(r => r.json()).catch(() => []),
    ]).then(([stories, reviews, waitlist]: [{ status: string }[], { status: string }[], unknown[]]) => {
      const pending =
        stories.filter(r => r.status === 'pending').length +
        reviews.filter(r => r.status === 'pending').length
      setPendingReports(pending)
      setWaitlistCount(Array.isArray(waitlist) ? waitlist.length : 0)
    })
  }, [pathname])

  const NAV_ITEMS = [
    { href: '/admin', label: 'Stories', icon: BookOpen, badge: 0, badgeStyle: 'alert' },
    { href: '/admin/reports', label: 'Reports', icon: Flag, badge: pendingReports, badgeStyle: 'alert' },
    { href: '/admin/waitlist', label: 'Org Waitlist', icon: School, badge: waitlistCount, badgeStyle: 'count' },
  ] as const

  return (
    <aside className="w-56 shrink-0 bg-slate-900 text-white flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-700 flex items-center gap-3">
        <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
          <ShieldCheck size={16} className="text-slate-200" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight">Admin Portal</p>
          <p className="text-xs text-slate-400">StoryQuestor</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon, badge, badgeStyle }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
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
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-slate-700">
        <button
          onClick={() => signOut({ callbackUrl: '/admin/sign-in' })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
