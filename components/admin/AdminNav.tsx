'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { ShieldCheck, BookOpen, LogOut } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin', label: 'Stories', icon: BookOpen },
]

export default function AdminNav() {
  const pathname = usePathname()

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
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {label}
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
