'use client'

import { useEffect, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Scroll, Gift, CheckCircle, Users } from 'lucide-react'

interface InviteInfo {
  inviterName: string
  inviteeEmail: string
  status: string
}

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [token, setToken] = useState('')
  const [invite, setInvite] = useState<InviteInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [linking, setLinking] = useState(false)
  const [linked, setLinked] = useState(false)

  useEffect(() => {
    params.then(p => setToken(p.token))
  }, [params])

  useEffect(() => {
    if (!token) return
    fetch(`/api/invites/${token}`)
      .then(r => r.json())
      .then(data => {
        if (!data.error) setInvite(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [token])

  // After authentication, link this invite to the user's account
  useEffect(() => {
    if (status !== 'authenticated' || !token || linked || linking) return
    setLinking(true)
    fetch(`/api/invites/${token}/link`, { method: 'POST' })
      .then(() => setLinked(true))
      .catch(console.error)
      .finally(() => setLinking(false))
  }, [status, token, linked, linking])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-violet-400 text-sm">Loading invite…</div>
      </div>
    )
  }

  if (!invite) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-gray-600 mb-4">This invite link is invalid or has already been used.</p>
          <Link href="/" className="text-violet-600 hover:underline text-sm">Go to StoryQuestor →</Link>
        </div>
      </div>
    )
  }

  const isAuthenticated = status === 'authenticated'
  const signUpUrl = `/sign-up?inviteToken=${encodeURIComponent(token)}&email=${encodeURIComponent(invite.inviteeEmail)}&callbackUrl=${encodeURIComponent('/subscribe')}`
  const signInUrl = `/sign-in?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`

  return (
    <div
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(135deg, #1a1025 0%, #0f172a 60%, #1a1025 100%)' }}
    >
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #f59e0b)' }}
          >
            <Scroll size={26} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-1">
            Story<span style={{ color: '#f59e0b' }}>Questor</span>
          </h1>
          <p className="text-violet-300 text-sm">Create branching adventure stories</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-7 flex flex-col gap-6">

          {/* Invite header */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Gift size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-base">
                {invite.inviterName} invited you!
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                Create interactive branching stories where readers choose their own path.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Features */}
          <div className="flex flex-col gap-2.5">
            {[
              'Visual node canvas or linear block editor',
              'Branching choices, images, and ambient sound',
              'Share with anyone — readers play for free',
              'Publish to the public explore page',
            ].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-gray-700">
                <Users size={13} className="text-violet-500 shrink-0" />
                {f}
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100" />

          {isAuthenticated ? (
            <div className="flex flex-col gap-3">
              {linked ? (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm">
                  <CheckCircle size={16} className="shrink-0" />
                  <span>Invite linked to your account. Subscribe to unlock story creation!</span>
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center">Linking invite to your account…</div>
              )}
              <Link
                href="/subscribe"
                className="w-full py-3 rounded-xl text-white font-bold text-sm text-center transition-all hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
              >
                Subscribe to get started — from $2/week
              </Link>
              <Link href="/" className="text-center text-sm text-gray-400 hover:text-gray-600 transition-colors">
                Go to dashboard
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-gray-500 text-center">
                Subscriptions start at <strong>$2/week</strong>. Cancel anytime.
              </p>
              <Link
                href={signUpUrl}
                className="w-full py-3 rounded-xl text-white font-bold text-sm text-center transition-all hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
              >
                Create account &amp; get started
              </Link>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <button
                onClick={() => signIn('google', { callbackUrl: `/invite/${token}` })}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
              >
                <svg width="16" height="16" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
                </svg>
                Continue with Google
              </button>
              <Link
                href={signInUrl}
                className="text-center text-sm text-violet-600 hover:underline"
              >
                Already have an account? Sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
