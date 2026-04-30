'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [school, setSchool] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/organization-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, school, role }),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CheckCircle2 size={36} className="text-amber-400" />
        <p className="text-white font-semibold text-lg">You're on the list!</p>
        <p className="text-gray-400 text-sm max-w-xs">
          We'll reach out as soon as the Organization tier launches. Thank you for your interest.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={200}
          className="px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-transparent transition"
        />
        <input
          type="email"
          placeholder="Work or school email *"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          maxLength={254}
          className="px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-transparent transition"
        />
        <input
          type="text"
          placeholder="School or organization name"
          value={school}
          onChange={e => setSchool(e.target.value)}
          maxLength={200}
          className="px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-transparent transition"
        />
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-transparent transition appearance-none"
          style={{ color: role ? 'white' : '#6b7280' }}
        >
          <option value="" disabled>Your role</option>
          <option value="teacher">Teacher</option>
          <option value="administrator">Administrator</option>
          <option value="librarian">Librarian</option>
          <option value="other">Other</option>
        </select>
      </div>

      {status === 'error' && (
        <p className="text-red-400 text-xs text-center">Something went wrong — please try again.</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="flex items-center justify-center gap-2 w-full sm:w-auto sm:self-center px-8 py-3.5 rounded-xl text-sm font-semibold text-gray-900 disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:scale-105 hover:shadow-lg hover:shadow-amber-500/25"
        style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
      >
        {status === 'loading' ? (
          <><Loader2 size={15} className="animate-spin" /> Sending…</>
        ) : (
          'Notify me when it launches'
        )}
      </button>
    </form>
  )
}
