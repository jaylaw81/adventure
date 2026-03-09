'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Scroll, Mail, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Something went wrong')
      } else {
        setSent(true)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
            <p className="text-sm text-gray-500 mt-0.5">Reset your password</p>
          </div>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Mail size={22} className="text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Check your inbox</p>
              <p className="text-sm text-gray-500">
                If an account exists for <strong>{email}</strong>, we&apos;ve sent a reset link.
                It expires in 1 hour.
              </p>
            </div>
            <Link href="/sign-in" className="text-sm text-amber-600 hover:underline font-medium">
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 text-center -mt-2">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
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
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>

            <Link
              href="/sign-in"
              className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft size={14} />
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
