'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Scroll, Eye, EyeOff, CheckCircle } from 'lucide-react'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong')
      } else {
        setDone(true)
        setTimeout(() => router.push('/sign-in'), 3000)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-sm text-gray-500">
          This reset link is invalid. Please{' '}
          <Link href="/forgot-password" className="text-amber-600 hover:underline font-medium">
            request a new one
          </Link>.
        </p>
      </div>
    )
  }

  return done ? (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle size={22} className="text-green-600" />
      </div>
      <div>
        <p className="font-semibold text-gray-900 mb-1">Password updated!</p>
        <p className="text-sm text-gray-500">Redirecting you to sign in…</p>
      </div>
      <Link href="/sign-in" className="text-sm text-amber-600 hover:underline font-medium">
        Sign in now
      </Link>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">New password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
            minLength={8}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Confirm new password</label>
        <input
          type={showPassword ? 'text' : 'password'}
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="Repeat your password"
          required
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50"
      >
        {loading ? 'Saving…' : 'Set new password'}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #1a1025 0%, #0f172a 60%, #1a1025 100%)' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col gap-6 w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
          >
            <Scroll size={22} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-gray-900">
              Story<span className="text-amber-500">Questor</span>
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Choose a new password</p>
          </div>
        </div>

        <Suspense fallback={<div className="text-center text-sm text-gray-400">Loading…</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
