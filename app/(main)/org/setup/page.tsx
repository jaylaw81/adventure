'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import { School, CheckCircle2, AlertTriangle, Loader2, LogIn } from 'lucide-react'
import Link from 'next/link'

interface TokenInfo {
  email: string
  name: string | null
  school: string | null
}

function OrgSetupContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const token = searchParams.get('token') ?? ''

  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)
  const [tokenError, setTokenError] = useState('')
  const [validating, setValidating] = useState(true)

  const [orgName, setOrgName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [done, setDone] = useState(false)

  // Validate the token on load (public — no auth needed)
  useEffect(() => {
    if (!token) { setTokenError('No invite token found in this link.'); setValidating(false); return }
    fetch(`/api/org/beta?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setTokenError(data.error); return }
        setTokenInfo(data)
        setOrgName(data.school ?? '')
      })
      .catch(() => setTokenError('Could not verify your invite. Please try again.'))
      .finally(() => setValidating(false))
  }, [token])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgName.trim()) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/org/beta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, orgName }),
      })
      const data = await res.json()
      if (!res.ok) { setSubmitError(data.error ?? 'Something went wrong'); return }
      await update({ tier: 'organization' })
      setDone(true)
      setTimeout(() => router.push('/org'), 2000)
    } catch {
      setSubmitError('Failed to create organization. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (validating) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-violet-400" />
      </div>
    )
  }

  if (tokenError) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <AlertTriangle size={40} className="mx-auto text-amber-400 mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Invite unavailable</h1>
        <p className="text-gray-500 text-sm mb-6">{tokenError}</p>
        <Link href="/" className="text-sm text-violet-600 hover:underline">Go to home</Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <CheckCircle2 size={48} className="mx-auto text-green-500 mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Organization created!</h1>
        <p className="text-gray-500 text-sm">Taking you to your dashboard…</p>
      </div>
    )
  }

  // Not signed in — prompt sign-in with correct email
  if (status !== 'loading' && !session) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-5">
          <LogIn size={24} className="text-violet-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Sign in to continue</h1>
        <p className="text-gray-500 text-sm mb-1">
          This invite is for <strong className="text-gray-800">{tokenInfo?.email}</strong>.
        </p>
        <p className="text-gray-400 text-sm mb-6">
          Sign in or create an account with that email address to complete your organization setup.
        </p>
        <button
          onClick={() => signIn(undefined, { callbackUrl: `/org/setup?token=${encodeURIComponent(token)}` })}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
        >
          <LogIn size={15} />
          Sign In
        </button>
      </div>
    )
  }

  // Signed in with wrong email
  if (session && tokenInfo && session.user.email?.toLowerCase() !== tokenInfo.email.toLowerCase()) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <AlertTriangle size={40} className="mx-auto text-amber-400 mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Wrong account</h1>
        <p className="text-gray-500 text-sm mb-1">
          You&apos;re signed in as <strong className="text-gray-800">{session.user.email}</strong>, but this invite
          is for <strong className="text-gray-800">{tokenInfo.email}</strong>.
        </p>
        <p className="text-gray-400 text-sm mb-6">Sign in with the correct account to continue.</p>
        <button
          onClick={() => signIn(undefined, { callbackUrl: `/org/setup?token=${encodeURIComponent(token)}` })}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
        >
          <LogIn size={15} />
          Switch Account
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
          <School size={24} className="text-violet-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Set up your organization</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome to the StoryQuestor Organization beta{tokenInfo?.name ? `, ${tokenInfo.name}` : ''}!
        </p>
      </div>

      <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-sm border border-violet-100 p-7 flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Organization name</label>
          <input
            type="text"
            value={orgName}
            onChange={e => setOrgName(e.target.value)}
            placeholder="Westview Elementary School"
            maxLength={120}
            required
            className="w-full border border-violet-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <p className="text-xs text-gray-400 mt-1">This will be visible to your members.</p>
        </div>

        <div className="bg-violet-50 border border-violet-100 rounded-xl p-3.5 text-xs text-violet-700">
          <p className="font-semibold mb-0.5">Invite locked to your email</p>
          <p>This invite is tied to <strong>{tokenInfo?.email}</strong> and can only be used once. If you need help, reply to your invite email.</p>
        </div>

        {submitError && (
          <p className="text-sm text-red-500">{submitError}</p>
        )}

        <button
          type="submit"
          disabled={submitting || !orgName.trim()}
          className="w-full py-3 text-white rounded-xl font-semibold transition-all disabled:opacity-50 hover:brightness-110"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
        >
          {submitting ? <Loader2 size={16} className="animate-spin inline" /> : 'Create Organization'}
        </button>
      </form>
    </div>
  )
}

export default function OrgSetupPage() {
  return (
    <>
      <div className="-mt-16 h-16 w-full"
        style={{ background: 'linear-gradient(135deg, #3d0d7e 0%, #1e1040 60%, #0f172a 100%)' }}
      />
      <Suspense fallback={<div className="flex items-center justify-center py-24"><Loader2 size={28} className="animate-spin text-violet-400" /></div>}>
        <OrgSetupContent />
      </Suspense>
    </>
  )
}
