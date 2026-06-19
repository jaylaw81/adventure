'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { CheckCircle2, XCircle, Loader2, School, LogIn, UserPlus, ShieldAlert } from 'lucide-react'

type PageState = 'loading' | 'ready' | 'consent' | 'accepting' | 'accepted' | 'declined' | 'error'

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>()
  const { data: session, status } = useSession()

  const [state, setState] = useState<PageState>('loading')
  const [inviteEmail, setInviteEmail] = useState('')
  const [orgName, setOrgName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [consentFormEnabled, setConsentFormEnabled] = useState(false)
  const [consentFormTitle, setConsentFormTitle] = useState('')
  const [consentFormBody, setConsentFormBody] = useState('')
  const [consentChecked, setConsentChecked] = useState(false)

  const callbackUrl = `/org/invite/${token}`

  useEffect(() => {
    if (status === 'loading') return
    fetch(`/api/org/invites/${token}/accept`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setErrorMsg(data.error); setState('error'); return }
        setInviteEmail(data.email ?? '')
        setOrgName(data.orgName ?? '')
        setConsentFormEnabled(data.consentFormEnabled ?? false)
        setConsentFormTitle(data.consentFormTitle ?? '')
        setConsentFormBody(data.consentFormBody ?? '')
        setState('ready')
      })
      .catch(() => { setErrorMsg('Could not load this invitation.'); setState('error') })
  }, [token, status])

  async function handleAccept(consent?: boolean) {
    setState('accepting')
    const body: Record<string, unknown> = {}
    if (consentFormEnabled) body.consent = consent ?? true
    const res = await fetch(`/api/org/invites/${token}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) { setErrorMsg(data.error ?? 'Failed to accept invitation'); setState('error'); return }
    if (data.declined) { setState('declined'); return }
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

        {state === 'declined' && (
          <>
            <XCircle size={40} className="text-slate-400 mx-auto mb-4" />
            <h1 className="text-lg font-bold text-slate-900 mb-2">Invitation declined</h1>
            <p className="text-slate-500 text-sm">
              You have declined the consent form. You will not have access to {orgName || 'this organization'} on StoryQuestor.
              Contact your organization admin if you change your mind.
            </p>
            <Link href="/" className="mt-6 inline-block text-sm text-amber-600 hover:underline">Go to home</Link>
          </>
        )}

        {state === 'consent' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-5">
              <ShieldAlert size={24} className="text-amber-500" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 mb-1">{consentFormTitle || 'Consent Required'}</h1>
            {orgName && (
              <p className="text-amber-600 font-medium text-sm mb-3">{orgName}</p>
            )}
            {consentFormBody && (
              <div className="text-left max-h-64 overflow-y-auto border border-slate-200 rounded-xl p-4 mb-4 text-sm font-mono text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50">
                {consentFormBody}
              </div>
            )}
            <label className="flex items-start gap-3 text-left mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={e => setConsentChecked(e.target.checked)}
                className="mt-0.5 accent-amber-500 w-4 h-4 shrink-0"
              />
              <span className="text-sm text-slate-700">I have read and agree to the above terms</span>
            </label>
            <button
              onClick={() => handleAccept(true)}
              disabled={!consentChecked}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-gray-900 disabled:opacity-50 transition-all hover:scale-105 mb-3"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
            >
              Accept and join
            </button>
            <button
              onClick={() => handleAccept(false)}
              className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              Decline
            </button>
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
              /* Signed in */
              consentFormEnabled ? (
                <button
                  onClick={() => setState('consent')}
                  disabled={state === 'accepting'}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-gray-900 disabled:opacity-50 transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
                >
                  <ShieldAlert size={14} />
                  Review consent form
                </button>
              ) : (
                <button
                  onClick={() => handleAccept()}
                  disabled={state === 'accepting'}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-gray-900 disabled:opacity-50 transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
                >
                  {state === 'accepting' ? <Loader2 size={14} className="animate-spin" /> : null}
                  {state === 'accepting' ? 'Joining…' : 'Accept invitation'}
                </button>
              )
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
