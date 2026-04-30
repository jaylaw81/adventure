'use client'

import { useEffect, useState } from 'react'
import { Users, BookOpen, Globe, Mail } from 'lucide-react'

interface OrgOverview {
  org: { id: string; name: string; description: string | null; createdAt: string }
  memberCount: number
  pendingInvites: number
}

export default function OrgOverviewPage() {
  const [data, setData] = useState<OrgOverview | null>(null)
  const [stories, setStories] = useState<{ isPublic: boolean }[]>([])

  useEffect(() => {
    Promise.all([
      fetch('/api/org').then(r => r.json()),
      fetch('/api/org/stories').then(r => r.json()),
    ]).then(([overview, storyList]) => {
      setData(overview)
      setStories(Array.isArray(storyList) ? storyList : [])
    })
  }, [])

  const stats = [
    { label: 'Members', value: data?.memberCount ?? '—', icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Stories', value: stories.length || '—', icon: BookOpen, color: 'bg-amber-50 text-amber-600' },
    { label: 'Public Stories', value: stories.filter(s => s.isPublic).length || '—', icon: Globe, color: 'bg-green-50 text-green-600' },
    { label: 'Pending Invites', value: data?.pendingInvites ?? '—', icon: Mail, color: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{data?.org.name ?? 'Organization'}</h1>
        {data?.org.description && (
          <p className="text-slate-500 text-sm mt-1">{data.org.description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
            <div className={`p-2.5 rounded-lg ${color}`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Quick links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { href: '/org/members', label: 'Manage members', desc: 'View members and send invites' },
            { href: '/org/stories', label: 'Review stories', desc: 'Control visibility of member stories' },
            { href: '/org/settings', label: 'Organization settings', desc: 'Update name and description' },
          ].map(({ href, label, desc }) => (
            <a
              key={href}
              href={href}
              className="block p-4 rounded-lg border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 transition-colors group"
            >
              <p className="text-sm font-semibold text-slate-900 group-hover:text-amber-700">{label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
