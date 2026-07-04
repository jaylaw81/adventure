'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Gift, X, Users } from 'lucide-react'

export default function InviteFeatureModal() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.email) return
    const tier = session.user.tier
    // Don't show to org users or admins
    if (tier === 'organization' || session.user.isAdmin) return

    const key = `sq_invite_intro_v1_${session.user.email}`
    if (localStorage.getItem(key)) return

    // Delay so the page settles first
    const timer = setTimeout(() => setShow(true), 1500)
    return () => clearTimeout(timer)
  }, [status, session?.user?.email, session?.user?.tier, session?.user?.isAdmin])

  const dismiss = () => {
    if (session?.user?.email) {
      localStorage.setItem(`sq_invite_intro_v1_${session.user.email}`, '1')
    }
    setShow(false)
  }

  const goToInvites = () => {
    dismiss()
    router.push('/profile#invites')
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Gradient header */}
        <div
          className="px-6 py-5 flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Gift size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-base leading-tight">Invite friends, get a free week</h2>
            <p className="text-violet-200 text-xs mt-0.5">New: earn rewards for every friend who subscribes</p>
          </div>
          <button
            onClick={dismiss}
            className="ml-auto text-white/60 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            Know someone who&apos;d love creating interactive stories? Send them an invite.
            When they sign up and subscribe, we&apos;ll give you <strong>one week free</strong> — applied as a credit to your next billing cycle.
          </p>

          <div className="flex flex-col gap-2 bg-violet-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-sm text-violet-800">
              <Users size={13} className="text-violet-500 shrink-0" />
              Up to <strong>5 invites</strong> available to send
            </div>
            <div className="flex items-center gap-2 text-sm text-violet-800">
              <Gift size={13} className="text-violet-500 shrink-0" />
              Earn <strong>1 free week</strong> per friend who subscribes
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={goToInvites}
              className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
            >
              Send invites
            </button>
            <button
              onClick={dismiss}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
