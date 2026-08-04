'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface Props {
  initialVisible: boolean
  onChange?: (visible: boolean) => void
}

export default function ProfileVisibilityToggle({ initialVisible, onChange }: Props) {
  const [visible, setVisible] = useState(initialVisible)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    if (loading) return
    const next = !visible
    setLoading(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileVisible: next }),
      })
      if (res.ok) {
        setVisible(next)
        onChange?.(next)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h3 className="text-base font-bold text-gray-900 mb-1">Profile Visibility</h3>
      <p className="text-sm text-gray-500 mb-4">
        Your public profile lists the stories you&apos;ve made public. Turn this off to hide it from everyone but you.
      </p>
      <div className="flex items-center justify-between gap-4 bg-violet-50/60 border border-violet-100 rounded-xl px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          {visible
            ? <Eye size={16} className="text-violet-500 shrink-0" />
            : <EyeOff size={16} className="text-gray-400 shrink-0" />
          }
          <span className="text-sm font-medium text-gray-700">
            {visible ? 'Your profile is public' : 'Your profile is private'}
          </span>
        </div>
        <button
          role="switch"
          aria-checked={visible}
          aria-label="Toggle profile visibility"
          onClick={handleToggle}
          disabled={loading}
          className={`shrink-0 relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-150 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 ${
            visible ? 'bg-violet-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              visible ? 'translate-x-[18px]' : 'translate-x-[3px]'
            }`}
          />
        </button>
      </div>
    </div>
  )
}
