'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, BookOpen, Settings, ArrowLeft, FolderOpen } from 'lucide-react'

const NAV = [
  { href: '/org', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/org/members', label: 'Members', icon: Users, exact: false },
  { href: '/org/groups', label: 'Groups', icon: FolderOpen, exact: false },
  { href: '/org/stories', label: 'Stories', icon: BookOpen, exact: false },
  { href: '/org/settings', label: 'Settings', icon: Settings, exact: false },
]

export default function OrgSidebar({ orgName }: { orgName: string }) {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-slate-200 flex flex-col min-h-full">
      <div className="px-5 py-5 border-b border-slate-100">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Organization</p>
        <p className="text-sm font-bold text-slate-900 leading-tight truncate">{orgName}</p>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-amber-50 text-amber-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-100">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to stories
        </Link>
      </div>
    </aside>
  )
}
