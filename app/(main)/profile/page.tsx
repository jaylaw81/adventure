'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Save, Trash2, AlertTriangle, CalendarDays, ShieldCheck, ArrowLeft, Bell, BellOff, CreditCard, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import PageBanner from '@/components/shared/PageBanner'
import { calcAge } from '@/lib/age'

interface ProfileData {
  email: string
  displayName: string
  birthDate: string | null
  createdAt: string
  image: string | null
}

// Returns today's date minus 13 years as YYYY-MM-DD (minimum age to have an account)
function maxBirthDate() {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 13)
  return d.toISOString().split('T')[0]
}

// Returns today's date minus 100 years as YYYY-MM-DD
function minBirthDate() {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 100)
  return d.toISOString().split('T')[0]
}

function ProfileContent() {
  const { data: session, update } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const isRequired = searchParams.get('required') === '1'

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [emailSubscribed, setEmailSubscribed] = useState(true)
  const [subSaving, setSubSaving] = useState(false)

  // Billing state
  interface BillingStatus {
    subscriptionStatus: string | null
    subscriptionAmountCents: number | null
    hasStripeAccount: boolean
    trialEndsAt: string | null
    gracePeriodEndsAt: string | null
    canCreate: boolean
    isOrgUser: boolean
  }
  const [billing, setBilling] = useState<BillingStatus | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then((data: ProfileData) => {
        setProfile(data)
        setDisplayName(data.displayName || '')
        setBirthDate(data.birthDate || '')
      })
    fetch('/api/profile/email-subscription')
      .then(r => r.json())
      .then(data => { if (typeof data.emailSubscribed === 'boolean') setEmailSubscribed(data.emailSubscribed) })
    fetch('/api/billing/status')
      .then(r => r.json())
      .then(data => { if (!data.error) setBilling(data) })
  }, [])

  const handleSubscriptionToggle = async () => {
    setSubSaving(true)
    try {
      const res = await fetch('/api/profile/email-subscription', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailSubscribed: !emailSubscribed }),
      })
      if (res.ok) setEmailSubscribed(v => !v)
    } finally {
      setSubSaving(false)
    }
  }

  const openPortal = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setPortalLoading(false)
    }
  }

  const age = birthDate ? calcAge(birthDate) : null
  const birthdateValid = birthDate.match(/^\d{4}-\d{2}-\d{2}$/) && age !== null && age >= 13

  const handleSave = async () => {
    if (!displayName.trim()) return
    if (!birthdateValid) return
    setSaving(true)
    setSaveMsg('')
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: displayName.trim(), birthDate }),
      })
      if (!res.ok) throw new Error()
      await update({ displayName: displayName.trim(), birthDate })
      setSaveMsg('Saved!')
      setTimeout(() => setSaveMsg(''), 3000)
      // If this was the required setup flow, hard-navigate home so the
      // freshly-set JWT cookie is sent in the next request and the middleware
      // sees the updated birthDate (SPA push can race with cookie propagation).
      if (isRequired) window.location.replace('/')
    } catch {
      setSaveMsg('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      const res = await fetch('/api/profile', { method: 'DELETE' })
      if (!res.ok) throw new Error()
      await signOut({ callbackUrl: '/' })
    } catch {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  if (!profile) {
    return (
      <>
        <PageBanner title="Profile Settings" subtitle="Manage your account details" />
        <div className="text-center py-20 text-violet-400">Loading…</div>
      </>
    )
  }

  return (
    <>
      <PageBanner
        title={isRequired ? 'Complete Your Profile' : 'Profile Settings'}
        subtitle={isRequired ? 'Finish setup to start creating stories' : 'Manage your account details'}
        action={
          !isRequired && (
            <Link href="/" className="inline-flex items-center gap-1 text-violet-300 hover:text-white text-sm transition-colors">
              <ArrowLeft size={15} />
              Back
            </Link>
          )
        }
      />

    <div className="max-w-lg mx-auto px-6 py-10">

      {/* Required setup notice */}
      {isRequired && (
        <div className="mb-6 p-4 bg-violet-50 border border-violet-200 rounded-xl flex items-start gap-3">
          <AlertTriangle size={18} className="text-violet-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-violet-800">Complete your profile to continue</p>
            <p className="text-xs text-violet-700 mt-0.5">
              Your date of birth is required so we can ensure age-appropriate content. You must be at least 13 years old to use StoryQuestor.
            </p>
          </div>
        </div>
      )}

      {/* Profile card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">

        {/* Avatar + email */}
        <div className="flex items-center gap-4">
          {profile.image ? (
            <Image
              src={profile.image}
              alt={profile.displayName || profile.email}
              width={56}
              height={56}
              className="rounded-full"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xl">
              {(profile.displayName || profile.email)[0].toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900">{profile.displayName || profile.email}</p>
            <p className="text-sm text-gray-500">{profile.email}</p>
          </div>
        </div>

        {/* Display name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            maxLength={60}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="Your display name…"
          />
        </div>

        {/* Birth date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <CalendarDays size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={birthDate}
              onChange={e => setBirthDate(e.target.value)}
              min={minBirthDate()}
              max={maxBirthDate()}
              className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          {birthDate && age !== null && (
            <div className={`flex items-center gap-1.5 mt-1.5 text-xs ${age >= 18 ? 'text-green-600' : 'text-amber-600'}`}>
              <ShieldCheck size={12} />
              {age >= 18
                ? `Age ${age} — full access including Adults Only content`
                : `Age ${age} — Adults Only stories will be hidden`}
            </div>
          )}
          {birthDate && age !== null && age < 13 && (
            <p className="text-xs text-red-500 mt-1">You must be at least 13 years old to use StoryQuestor.</p>
          )}
          <p className="text-xs text-gray-400 mt-1">Required. Used only to verify your age for content filtering.</p>
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input
            type="text"
            value={profile.email}
            readOnly
            className="w-full border border-gray-100 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">Your sign-in email — cannot be changed here.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !displayName.trim() || !birthdateValid}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Save size={15} />
            {saving ? 'Saving…' : isRequired ? 'Save & Continue' : 'Save Changes'}
          </button>
          {saveMsg && (
            <span className={`text-sm ${saveMsg === 'Saved!' ? 'text-green-600' : 'text-red-500'}`}>
              {saveMsg}
            </span>
          )}
        </div>
      </div>

      {/* Email preferences — hide during required setup */}
      {!isRequired && (
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Email Preferences</h2>
          <p className="text-sm text-gray-500 mb-4">
            Receive occasional product updates and new feature announcements.
          </p>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              {emailSubscribed
                ? <Bell size={16} className="text-amber-500 shrink-0" />
                : <BellOff size={16} className="text-gray-400 shrink-0" />
              }
              <span className="text-sm text-gray-700">
                {emailSubscribed ? 'Subscribed to update emails' : 'Unsubscribed from update emails'}
              </span>
            </div>
            <button
              onClick={handleSubscriptionToggle}
              disabled={subSaving}
              className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                emailSubscribed
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
              }`}
            >
              {subSaving ? 'Saving…' : emailSubscribed ? 'Unsubscribe' : 'Re-subscribe'}
            </button>
          </div>
        </div>
      )}

      {/* Billing — hide during required setup */}
      {!isRequired && billing && (
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard size={16} className="text-violet-500" />
            <h2 className="text-base font-semibold text-gray-900">Subscription</h2>
          </div>

          {billing.isOrgUser ? (
            <p className="text-sm text-gray-500">
              Your access is provided through your organization — no personal subscription required.
            </p>
          ) : (billing.subscriptionStatus === 'active' || billing.subscriptionStatus === 'trialing') ? (
            <>
              <p className="text-sm text-gray-500 mb-4">
                {billing.subscriptionStatus === 'trialing' ? 'Free trial active' : 'Active subscriber'}
                {billing.subscriptionAmountCents
                  ? ` · $${(billing.subscriptionAmountCents / 100).toFixed(2)}/month`
                  : ''}
              </p>
              <button
                onClick={openPortal}
                disabled={portalLoading}
                className="flex items-center gap-2 px-4 py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <ExternalLink size={14} />
                {portalLoading ? 'Opening…' : 'Manage subscription'}
              </button>
              <p className="text-xs text-gray-400 mt-2">Pause or cancel anytime from the billing portal.</p>
            </>
          ) : billing.subscriptionStatus === 'paused' ? (
            <>
              <p className="text-sm text-gray-500 mb-4">Your subscription is paused — story creation is currently disabled.</p>
              <button
                onClick={openPortal}
                disabled={portalLoading}
                className="flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <ExternalLink size={14} />
                {portalLoading ? 'Opening…' : 'Resume subscription'}
              </button>
            </>
          ) : billing.subscriptionStatus === 'past_due' ? (
            <>
              <p className="text-sm text-red-600 mb-4">Your last payment failed. Update your payment method to restore access.</p>
              <button
                onClick={openPortal}
                disabled={portalLoading}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <ExternalLink size={14} />
                {portalLoading ? 'Opening…' : 'Update payment method'}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">
                {billing.canCreate
                  ? (() => {
                      const deadline = billing.trialEndsAt ?? billing.gracePeriodEndsAt
                      if (!deadline) return 'Subscribe to unlock story creation and editing.'
                      const date = new Date(deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
                      return `Your free access ends on ${date}. Subscribe to keep creating.`
                    })()
                  : 'Subscribe to unlock story creation and editing.'}
              </p>
              <Link
                href="/subscribe"
                className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-semibold transition-all hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
              >
                Subscribe from $2/month
              </Link>
            </>
          )}
        </div>
      )}

      {/* Danger zone — hide during required setup */}
      {!isRequired && (
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-red-100 p-6">
          <h2 className="text-base font-semibold text-red-700 mb-1">Danger Zone</h2>
          <p className="text-sm text-gray-500 mb-4">
            Deleting your account is permanent. All your stories, scenes, and images will be removed and cannot be recovered.
            {billing && (billing.subscriptionStatus === 'active' || billing.subscriptionStatus === 'trialing') && (
              <span className="block mt-1 text-red-500 font-medium">Your active subscription will also be cancelled immediately.</span>
            )}
          </p>

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-sm font-medium transition-colors"
            >
              <Trash2 size={15} />
              Delete My Account
            </button>
          ) : (
            <div className="flex flex-col gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm font-semibold text-red-700">Are you absolutely sure?</p>
              <p className="text-xs text-red-600">
                This will delete all your stories and cannot be undone.
                {billing && (billing.subscriptionStatus === 'active' || billing.subscriptionStatus === 'trialing') && (
                  <span className="block mt-0.5">Your active subscription will be cancelled at the same time.</span>
                )}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Deleting…' : 'Yes, Delete Everything'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!isRequired && (
        <p className="text-center text-xs text-gray-400 mt-6">
          Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
        </p>
      )}
    </div>
    </>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading…</div>}>
      <ProfileContent />
    </Suspense>
  )
}
