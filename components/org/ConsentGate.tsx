'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { ShieldAlert, Check, X } from 'lucide-react'

type GateStatus = 'idle' | 'checking' | 'clear' | 'pending' | 'declined' | 'submitting'

interface ConsentData {
  required: boolean
  status?: 'pending' | 'declined'
  title?: string | null
  body?: string | null
}

export default function ConsentGate() {
  const { data: session, status: authStatus } = useSession()
  const [gate, setGate] = useState<GateStatus>('idle')
  const [consentData, setConsentData] = useState<ConsentData>({ required: false })
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (authStatus === 'loading') return
    if (!session?.user) return
    // Only check for org users
    if (session.user.tier !== 'organization') return
    setGate('checking')
    fetch('/api/org/consent')
      .then(r => r.json())
      .then((data: ConsentData) => {
        setConsentData(data)
        if (!data.required) { setGate('clear'); return }
        setGate(data.status === 'declined' ? 'declined' : 'pending')
      })
      .catch(() => setGate('clear'))
  }, [authStatus, session])

  async function handleConsent(consent: boolean) {
    setGate('submitting')
    await fetch('/api/org/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consent }),
    })
    if (consent) {
      setGate('clear')
    } else {
      setConsentData(prev => ({ ...prev, status: 'declined' }))
      setGate('declined')
    }
  }

  if (gate === 'idle' || gate === 'checking' || gate === 'clear') return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
              <ShieldAlert size={18} className="text-amber-600" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {gate === 'declined'
                ? 'Access restricted'
                : consentData.title || 'Consent required'}
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4 flex-1 overflow-y-auto">
          {gate === 'declined' ? (
            <div className="text-sm text-slate-600 leading-relaxed">
              <p className="font-medium text-red-600 mb-2">You have declined the consent form.</p>
              <p>You do not have access to this platform until you accept the consent form. Please contact your organization administrator to restore access.</p>
            </div>
          ) : (
            <>
              {consentData.body ? (
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-mono bg-slate-50 border border-slate-200 rounded-xl p-4 max-h-56 overflow-y-auto">
                  {consentData.body}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Your organization requires you to accept a consent form before continuing.</p>
              )}
              <label className="flex items-start gap-3 mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={e => setChecked(e.target.checked)}
                  className="mt-0.5 accent-amber-500 w-4 h-4 shrink-0"
                />
                <span className="text-sm text-slate-700">I have read and agree to the above terms.</span>
              </label>
            </>
          )}
        </div>

        {/* Footer */}
        {gate !== 'declined' && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-3 justify-end shrink-0">
            <button
              onClick={() => handleConsent(false)}
              disabled={gate === 'submitting'}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-40"
            >
              <X size={14} /> Decline
            </button>
            <button
              onClick={() => handleConsent(true)}
              disabled={!checked || gate === 'submitting'}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-40 transition-colors"
            >
              <Check size={14} /> Accept and continue
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
