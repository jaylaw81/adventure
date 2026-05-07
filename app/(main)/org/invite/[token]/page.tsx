'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { CheckCircle2, XCircle, Loader2, School, LogIn, UserPlus } from 'lucide-react'

type PageState = 'loading' | 'ready' | 'accepting' | 'accepted' | 'error'

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>()
  const { data: session, status } = useSession()
  const router = useRouter()

  const [state, setState] = useState<PageState>('loading')
  const [inviteEmail, setInviteEmail] = useState('')
  const [orgName, setOrgName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const callbackUrl = `/org/invite/${token}`

  useEffect(() => {
    if (status === 'loading') return
    fetch(`/api/org/invites/${token}/accept`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setErrorMsg(data.error); setState('error'); return }
        setInviteEmail(data.email ?? '')
        setOrgName(data.orgName ?? '')
        setState('ready')
      })
      .catch(() => { setErrorMsg('Could not load this invitation.'); setState('error') })
  }, [token, status])

  async function handleAccept() {
    setState('accepting')
    const res = await fetch(`/api/org/invites/${token}/accept`, { method: 'POST' })
    const data = await res.json()
    if (!res.ok) { setErrorMsg(data.error ?? 'Failed to accept invitation'); setState('error'); return }
    setState('accepted')
  }

  return (
    <>
    <div className="-mt-16 h-16 w-full"
      style={{ background: 'linear-gradient(135deg, #3d0d7e 0%, #1e1040 60%, #0f172a 100%)' }}
    />
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md p-8 text-center">

        {state === 'loading' && (
          <Loader2 size={32} className="animate-spin text-amber-500 mx-auto" />
        )}

        {state === 'error' && (
          <>
            <XCircle size={40} className="text-red-400 mx-auto mb-4" />
            <h1 className="text-lg font-bold text-slate-900 mb-2">Invitation unavailable</h1>
            <p className="text-slate-500 text-sm">{errorMsg}</p>
            <Link href="/" className="mt-6 inline-block text-sm text-amber-600 hover:underline">Go to home</Link>
          </>
        )}

        {state === 'accepted' && (
          <>
            <CheckCircle2 size={40} className="text-green-500 mx-auto mb-4" />
            <h1 className="text-lg font-bold text-slate-900 mb-2">You&apos;re in!</h1>
            <p className="text-slate-500 text-sm mb-6">
              You&apos;ve successfully joined {orgName || 'the organization'}.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-900 transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
            >
              Go to my stories
            </Link>
          </>
        )}

        {(state === 'ready' || state === 'accepting') && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-5">
              <School size={24} className="text-amber-500" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 mb-1">You&apos;ve been invited</h1>
            {orgName && (
              <p className="text-amber-600 font-medium text-sm mb-1">{orgName}</p>
            )}
            <p className="text-slate-500 text-sm mb-6">
              {inviteEmail
                ? <>This invite is for <strong className="text-slate-700">{inviteEmail}</strong>.</>
                : 'You have been invited to join an organization on StoryQuestor.'}
            </p>

            {session ? (
              /* Signed in — show accept button */
              <button
                onClick={handleAccept}
                disabled={state === 'accepting'}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-gray-900 disabled:opacity-50 transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
              >
                {state === 'accepting' ? <Loader2 size={14} className="animate-spin" /> : null}
                {state === 'accepting' ? 'Joining…' : 'Accept invitation'}
              </button>
            ) : (
              /* Not signed in — offer create account or sign in */
              <div className="flex flex-col gap-3">
                <Link
                  href={`/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}${inviteEmail ? `&email=${encodeURIComponent(inviteEmail)}` : ''}`}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-gray-900 transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
                >
                  <UserPlus size={15} />
                  Create account &amp; join
                </Link>
                <Link
                  href={`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}${inviteEmail ? `&email=${encodeURIComponent(inviteEmail)}` : ''}`}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <LogIn size={15} />
                  Sign in to accept
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </>
  )
}
