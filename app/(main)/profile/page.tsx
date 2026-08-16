'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Save, Trash2, CalendarDays, ShieldCheck, ArrowLeft, ArrowUpRight, Bell, BellOff, CreditCard,
  ExternalLink, Gift, Send, CheckCircle, Clock, RefreshCw, Globe, AtSign, Check, X, Loader2,
  User, Lock,
} from 'lucide-react'
import Link from 'next/link'
import PageBanner from '@/components/shared/PageBanner'
import OnboardingProgress from '@/components/shared/OnboardingProgress'
import ProfileVisibilityToggle from '@/components/shared/ProfileVisibilityToggle'
import FollowManagementSection from '@/components/shared/FollowManagementSection'
import { calcAge } from '@/lib/age'
import { analytics } from '@/lib/analytics'
import { formatCents, getEnabledIntervals } from '@/lib/pricing'
import type { PricingConfig, BillingInterval } from '@/lib/pricing'
import { ACQUISITION_SOURCES } from '@/lib/acquisitionSources'
import { LANGUAGES } from '@/lib/languages'
import { validateUsername } from '@/lib/username'

interface ProfileData {
  email: string
  displayName: string
  birthDate: string | null
  languagePreference: string
  username: string | null
  profileVisible: boolean
  createdAt: string
  image: string | null
  storyCount: number
  followerCount: number
  followingCount: number
}

type TabId = 'account' | 'notifications' | 'privacy' | 'billing' | 'invites' | 'danger'

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Lock },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'invites', label: 'Invites', icon: Gift },
  { id: 'danger', label: 'Danger Zone', icon: Trash2 },
]

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

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center sm:items-start">
      <span className="text-lg font-bold text-gray-900 tabular-nums leading-tight">{value.toLocaleString()}</span>
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
    </div>
  )
}

function ProfileContent() {
  const { data: session, update } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const isRequired = searchParams.get('required') === '1'

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [acquisitionSource, setAcquisitionSource] = useState('')
  const [languagePreference, setLanguagePreference] = useState('en')
  const [username, setUsername] = useState('')
  const [originalUsername, setOriginalUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle')
  const [usernameMsg, setUsernameMsg] = useState('')
  const [profileVisible, setProfileVisible] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [emailSubscribed, setEmailSubscribed] = useState(true)
  const [subSaving, setSubSaving] = useState(false)
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState<TabId>(
    TABS.some(t => t.id === tabParam) ? (tabParam as TabId) : 'account'
  )

  // Invite state
  interface FriendInvite {
    id: string
    inviteeEmail: string
    status: string
    createdAt: string
    rewardedAt: string | null
  }
  const [invites, setInvites] = useState<FriendInvite[]>([])
  const [inviteRemaining, setInviteRemaining] = useState(5)
  const [inviteEmail, setInviteEmail] = useState('')
  const [sendingInvite, setSendingInvite] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState('')

  // Billing state
  interface BillingStatus {
    subscriptionStatus: string | null
    subscriptionAmountCents: number | null
    subscriptionInterval: BillingInterval | null
    hasStripeAccount: boolean
    trialEndsAt: string | null
    gracePeriodEndsAt: string | null
    canCreate: boolean
    isOrgUser: boolean
  }
  const [billing, setBilling] = useState<BillingStatus | null>(null)
  const [pricing, setPricing] = useState<PricingConfig | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [pendingInterval, setPendingInterval] = useState<BillingInterval | null>(null)
  const [intervalChanging, setIntervalChanging] = useState(false)
  const [intervalMsg, setIntervalMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then((data: ProfileData) => {
        setProfile(data)
        setDisplayName(data.displayName || '')
        setBirthDate(data.birthDate || '')
        setLanguagePreference(data.languagePreference || 'en')
        setUsername(data.username || '')
        setOriginalUsername(data.username || '')
        setProfileVisible(data.profileVisible ?? true)
      })
    fetch('/api/profile/email-subscription')
      .then(r => r.json())
      .then(data => { if (typeof data.emailSubscribed === 'boolean') setEmailSubscribed(data.emailSubscribed) })
    fetch('/api/billing/status')
      .then(r => r.json())
      .then(data => { if (!data.error) setBilling(data) })
    fetch('/api/pricing')
      .then(r => r.json())
      .then(data => { if (data?.intervals) setPricing(data) })
    fetch('/api/invites')
      .then(r => r.json())
      .then(data => {
        if (!data.error) {
          setInvites(data.invites ?? [])
          setInviteRemaining(data.remaining ?? 5)
        }
      })
  }, [])

  // Deep-link support: /profile?tab=invites opens straight to a tab, including
  // when navigated to from a page that's already mounted on /profile (a hash
  // change alone wouldn't remount this component or fire a router event).
  useEffect(() => {
    if (TABS.some(t => t.id === tabParam)) {
      setActiveTab(tabParam as TabId)
    }
  }, [tabParam])

  // Live username availability check, debounced
  useEffect(() => {
    const candidate = username.trim().toLowerCase()
    if (!candidate || candidate === originalUsername) {
      setUsernameStatus('idle')
      setUsernameMsg('')
      return
    }
    const formatError = validateUsername(candidate)
    if (formatError) {
      setUsernameStatus('unavailable')
      setUsernameMsg(formatError)
      return
    }
    setUsernameStatus('checking')
    setUsernameMsg('')
    const timeout = setTimeout(() => {
      fetch(`/api/profile/username?check=${encodeURIComponent(candidate)}`)
        .then(r => r.json())
        .then(data => {
          setUsernameStatus(data.available ? 'available' : 'unavailable')
          setUsernameMsg(data.available ? '' : (data.reason ?? 'That username is already taken.'))
        })
        .catch(() => setUsernameStatus('idle'))
    }, 400)
    return () => clearTimeout(timeout)
  }, [username, originalUsername])

  const handleSubscriptionToggle = async () => {
    const wasSubscribed = emailSubscribed
    setSubSaving(true)
    try {
      const res = await fetch('/api/profile/email-subscription', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailSubscribed: !emailSubscribed }),
      })
      if (res.ok) {
        setEmailSubscribed(v => !v)
        if (wasSubscribed) analytics.emailUnsubscribed('profile_settings')
      }
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

  const changeInterval = async (interval: BillingInterval) => {
    setIntervalChanging(true)
    setIntervalMsg(null)
    try {
      const res = await fetch('/api/billing/change-interval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval }),
      })
      const data = await res.json()
      if (!res.ok) {
        setIntervalMsg({ type: 'err', text: data.error ?? 'Failed to change interval' })
      } else {
        setBilling(prev => prev ? { ...prev, subscriptionInterval: interval, subscriptionAmountCents: data.priceCents } : prev)
        setPendingInterval(null)
        setIntervalMsg({ type: 'ok', text: `Switched to ${interval === 'day' ? 'daily' : interval === 'week' ? 'weekly' : 'monthly'} billing.` })
        setTimeout(() => setIntervalMsg(null), 4000)
      }
    } finally {
      setIntervalChanging(false)
    }
  }

  const sendInvite = async () => {
    if (!inviteEmail.trim()) return
    setSendingInvite(true)
    setInviteError('')
    setInviteSuccess('')
    try {
      const res = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteeEmail: inviteEmail.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setInviteError(data.error ?? 'Failed to send invite')
      } else {
        setInviteSuccess(`Invite sent to ${inviteEmail.trim()}!`)
        setInviteEmail('')
        setInvites(prev => [...prev, data.invite])
        setInviteRemaining(prev => Math.max(0, prev - 1))
        setTimeout(() => setInviteSuccess(''), 4000)
      }
    } finally {
      setSendingInvite(false)
    }
  }

  const age = birthDate ? calcAge(birthDate) : null
  const birthdateValid = birthDate.match(/^\d{4}-\d{2}-\d{2}$/) && age !== null && age >= 13
  const usernameValid = !!username.trim() && (username.trim().toLowerCase() === originalUsername || usernameStatus === 'available')

  const handleSave = async () => {
    if (!displayName.trim()) return
    if (!birthdateValid) return
    if (!usernameValid) return
    setSaving(true)
    setSaveMsg('')
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: displayName.trim(),
          birthDate,
          languagePreference,
          username: username.trim().toLowerCase(),
          ...(isRequired && acquisitionSource ? { acquisitionSource } : {}),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setSaveMsg(data.error ?? 'Failed to save')
        return
      }
      setOriginalUsername(username.trim().toLowerCase())
      await update({ displayName: displayName.trim(), birthDate })
      setSaveMsg('Saved!')
      setTimeout(() => setSaveMsg(''), 3000)
      // If this was the required setup flow, hard-navigate to subscribe so the
      // freshly-set JWT cookie is sent in the next request and the middleware
      // sees the updated birthDate (SPA push can race with cookie propagation).
      if (isRequired) window.location.replace('/subscribe?onboarding=1')
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
      analytics.accountDeleted()
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

  // ─────────────────────────────────────────────────────────
  // Required onboarding flow: a focused single-column wizard step.
  // ─────────────────────────────────────────────────────────
  if (isRequired) {
    return (
      <>
        <PageBanner
          title="Set Up Your Account"
          subtitle="Step 2 of 3 — tell us a bit about yourself"
        />
        <div className="max-w-lg mx-auto px-6 py-10">
          <div className="mb-8">
            <OnboardingProgress step={2} theme="light" />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              {profile.image ? (
                <Image src={profile.image} alt={profile.displayName || profile.email} width={56} height={56} className="rounded-full" />
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Username <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <AtSign size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase())}
                  maxLength={20}
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="username"
                />
                {username.trim().toLowerCase() !== originalUsername && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameStatus === 'checking' && <Loader2 size={14} className="text-gray-400 animate-spin" />}
                    {usernameStatus === 'available' && <Check size={14} className="text-green-600" />}
                    {usernameStatus === 'unavailable' && <X size={14} className="text-red-500" />}
                  </span>
                )}
              </div>
              {usernameMsg && username.trim().toLowerCase() !== originalUsername && (
                <p className="text-xs text-red-500 mt-1">{usernameMsg}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                3-20 characters: lowercase letters, numbers, or underscores. Used for your public profile URL.
              </p>
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                How did you find StoryQuestor? <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <select
                value={acquisitionSource}
                onChange={e => setAcquisitionSource(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              >
                <option value="">Select an option…</option>
                {ACQUISITION_SOURCES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Globe size={14} className="text-gray-400" />
                Reading Language
              </label>
              <select
                value={languagePreference}
                onChange={e => setLanguagePreference(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} — {lang.nativeName}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">Stories in other languages will be automatically offered in this language.</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving || !displayName.trim() || !birthdateValid || !usernameValid}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Save size={15} />
                {saving ? 'Saving…' : 'Save & Continue'}
              </button>
              {saveMsg && <span className="text-sm text-red-500" role="alert">{saveMsg}</span>}
            </div>
          </div>
        </div>
      </>
    )
  }

  // ─────────────────────────────────────────────────────────
  // Standard settings flow: identity summary + tabbed sections.
  // ─────────────────────────────────────────────────────────
  const joinDate = new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })

  return (
    <>
      <PageBanner
        title="Profile Settings"
        subtitle="Manage your account, privacy, and subscription"
        action={
          <Link href="/" className="inline-flex items-center gap-1 text-violet-300 hover:text-white text-sm transition-colors">
            <ArrowLeft size={15} />
            Back
          </Link>
        }
      />

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Identity summary */}
        <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            {profile.image ? (
              <Image
                src={profile.image}
                alt={profile.displayName || profile.email}
                width={60}
                height={60}
                className="rounded-full ring-2 ring-violet-100 shrink-0"
              />
            ) : (
              <div
                className="w-[60px] h-[60px] rounded-full flex items-center justify-center text-2xl font-extrabold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #a78bfa, #7c3aed)' }}
              >
                {(profile.displayName || profile.email)[0].toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-lg font-bold text-gray-900 truncate">{profile.displayName || profile.email}</p>
              {originalUsername ? (
                <Link
                  href={`/u/${originalUsername}`}
                  className="text-sm text-violet-500 hover:text-violet-700 transition-colors inline-flex items-center gap-1"
                >
                  @{originalUsername}
                  <ArrowUpRight size={12} />
                </Link>
              ) : (
                <p className="text-sm text-gray-400">No username set yet</p>
              )}
              <p className="text-xs text-gray-400 mt-0.5">Creator since {joinDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-5 sm:gap-6 shrink-0 pt-4 sm:pt-0 sm:pl-6 border-t sm:border-t-0 sm:border-l border-gray-100">
            <StatChip label="Stories" value={profile.storyCount} />
            <StatChip label="Followers" value={profile.followerCount} />
            <StatChip label="Following" value={profile.followingCount} />
          </div>
        </div>

        {/* Mobile tab bar */}
        <div className="flex lg:hidden gap-2 overflow-x-auto pb-4 -mx-1 px-1">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id
            const danger = id === 'danger'
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-colors border ${
                  active
                    ? danger ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-200 text-amber-700'
                    : 'bg-white border-gray-200 text-gray-500'
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            )
          })}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Desktop sidebar nav */}
          <nav className="hidden lg:flex lg:flex-col lg:w-52 shrink-0 gap-0.5 lg:sticky lg:top-24">
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id
              const danger = id === 'danger'
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
                    active
                      ? danger ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                      : danger ? 'text-red-400 hover:bg-red-50/60 hover:text-red-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              )
            })}
          </nav>

          {/* Active panel */}
          <div className="flex-1 min-w-0 w-full">
            <div
              key={activeTab}
              className={`rounded-2xl shadow-sm border p-6 ${
                activeTab === 'danger' ? 'bg-red-50/40 border-red-100' : 'bg-white border-gray-100'
              }`}
              style={{ animation: 'profile-card-in 0.3s cubic-bezier(0.16,1,0.3,1) both' }}
            >

              {/* Account */}
              {activeTab === 'account' && (
                <div className="flex flex-col gap-6">
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <AtSign size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value.toLowerCase())}
                        maxLength={20}
                        className="w-full border border-gray-200 rounded-lg pl-9 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        placeholder="username"
                      />
                      {username.trim().toLowerCase() !== originalUsername && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2">
                          {usernameStatus === 'checking' && <Loader2 size={14} className="text-gray-400 animate-spin" />}
                          {usernameStatus === 'available' && <Check size={14} className="text-green-600" />}
                          {usernameStatus === 'unavailable' && <X size={14} className="text-red-500" />}
                        </span>
                      )}
                    </div>
                    {usernameMsg && username.trim().toLowerCase() !== originalUsername && (
                      <p className="text-xs text-red-500 mt-1">{usernameMsg}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {originalUsername
                        ? `Your public profile: storyquestor.com/u/${username.trim().toLowerCase() || originalUsername}`
                        : '3-20 characters: lowercase letters, numbers, or underscores. Used for your public profile URL.'}
                    </p>
                  </div>

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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                      <Globe size={14} className="text-gray-400" />
                      Reading Language
                    </label>
                    <select
                      value={languagePreference}
                      onChange={e => setLanguagePreference(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                    >
                      {LANGUAGES.map(lang => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name} — {lang.nativeName}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">Stories in other languages will be automatically offered in this language.</p>
                  </div>

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
                      disabled={saving || !displayName.trim() || !birthdateValid || !usernameValid}
                      className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      <Save size={15} />
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                    {saveMsg && (
                      saveMsg === 'Saved!' ? (
                        <span
                          role="status"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-sm font-medium"
                          style={{ animation: 'profile-card-in 0.3s cubic-bezier(0.16,1,0.3,1) both' }}
                        >
                          <CheckCircle size={14} />
                          Saved
                        </span>
                      ) : (
                        <span role="alert" className="text-sm text-red-500">{saveMsg}</span>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-base font-bold text-gray-900 mb-1">Email Preferences</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Receive occasional product updates and new feature announcements.
                  </p>
                  <div className="flex items-center justify-between gap-4 bg-amber-50/60 border border-amber-100 rounded-xl px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      {emailSubscribed
                        ? <Bell size={16} className="text-amber-500 shrink-0" />
                        : <BellOff size={16} className="text-gray-400 shrink-0" />
                      }
                      <span className="text-sm font-medium text-gray-700">
                        {emailSubscribed ? 'Subscribed to update emails' : 'Unsubscribed from update emails'}
                      </span>
                    </div>
                    <button
                      onClick={handleSubscriptionToggle}
                      disabled={subSaving}
                      className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                        emailSubscribed
                          ? 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200'
                          : 'bg-amber-500 hover:bg-amber-600 text-white'
                      }`}
                    >
                      {subSaving ? 'Saving…' : emailSubscribed ? 'Unsubscribe' : 'Re-subscribe'}
                    </button>
                  </div>
                </div>
              )}

              {/* Privacy */}
              {activeTab === 'privacy' && (
                <div>
                  <ProfileVisibilityToggle initialVisible={profileVisible} onChange={setProfileVisible} />
                  <FollowManagementSection />
                </div>
              )}

              {/* Billing */}
              {activeTab === 'billing' && billing && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard size={16} className="text-violet-500" />
                    <h2 className="text-base font-bold text-gray-900">Subscription</h2>
                  </div>

                  {billing.isOrgUser ? (
                    <p className="text-sm text-gray-500">
                      Your access is provided through your organization — no personal subscription required.
                    </p>
                  ) : (billing.subscriptionStatus === 'active' || billing.subscriptionStatus === 'trialing') ? (
                    <>
                      <p className="text-sm text-gray-500 mb-4">
                        {billing.subscriptionStatus === 'trialing' ? 'Free trial active' : 'Active subscriber'}
                        {billing.subscriptionAmountCents && billing.subscriptionInterval
                          ? ` · ${formatCents(billing.subscriptionAmountCents)}/${billing.subscriptionInterval}`
                          : ''}
                      </p>

                      {pricing && getEnabledIntervals(pricing).length > 1 && (
                        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                          <p className="text-xs font-semibold text-gray-600 mb-2.5">Billing interval</p>
                          <div className="flex gap-2 mb-3">
                            {getEnabledIntervals(pricing).map(ic => {
                              const isCurrent = billing.subscriptionInterval === ic.interval
                              const isPending = pendingInterval === ic.interval
                              return (
                                <button
                                  key={ic.interval}
                                  onClick={() => {
                                    if (isCurrent) return
                                    setPendingInterval(isPending ? null : ic.interval)
                                    setIntervalMsg(null)
                                  }}
                                  className={`flex-1 py-2.5 px-2 rounded-lg border-2 text-center transition-colors ${
                                    isCurrent
                                      ? 'border-violet-500 bg-violet-50 cursor-default'
                                      : isPending
                                        ? 'border-amber-500 bg-amber-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <div className={`text-xs font-bold ${isCurrent ? 'text-violet-700' : isPending ? 'text-amber-800' : 'text-gray-700'}`}>
                                    {ic.interval === 'day' ? 'Daily' : ic.interval === 'week' ? 'Weekly' : 'Monthly'}
                                    {isCurrent && <span className="ml-1 text-[9px]">✓</span>}
                                  </div>
                                  <div className={`text-[11px] mt-0.5 font-medium ${isCurrent ? 'text-violet-500' : isPending ? 'text-amber-600' : 'text-gray-400'}`}>
                                    {formatCents(ic.priceCents)}/{ic.interval}
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                          {pendingInterval && (
                            <button
                              onClick={() => changeInterval(pendingInterval)}
                              disabled={intervalChanging}
                              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 w-full justify-center"
                            >
                              {intervalChanging
                                ? <><RefreshCw size={13} className="animate-spin" /> Switching…</>
                                : `Switch to ${pendingInterval === 'day' ? 'daily' : pendingInterval === 'week' ? 'weekly' : 'monthly'} billing · ${formatCents(pricing.intervals.find(i => i.interval === pendingInterval)?.priceCents ?? 0)}/${pendingInterval}`
                              }
                            </button>
                          )}
                          {intervalMsg && (
                            <p className={`text-xs mt-2 font-medium ${intervalMsg.type === 'ok' ? 'text-green-600' : 'text-red-500'}`}>
                              {intervalMsg.text}
                            </p>
                          )}
                          <p className="text-[11px] text-gray-400 mt-2">Interval changes take effect immediately and reset your billing cycle.</p>
                        </div>
                      )}

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
                        {pricing
                          ? (() => { const ic = pricing.intervals.find(i => i.interval === pricing.defaultInterval && i.enabled) ?? pricing.intervals.find(i => i.enabled); return ic ? `Subscribe from ${formatCents(ic.priceCents)}/${ic.interval}` : 'Subscribe' })()
                          : 'Subscribe'}
                      </Link>
                    </>
                  )}
                </div>
              )}

              {/* Invites */}
              {activeTab === 'invites' && !billing?.isOrgUser && (
                <div id="invites">
                  <div className="flex items-center gap-2 mb-1">
                    <Gift size={16} className="text-violet-500" />
                    <h2 className="text-base font-bold text-gray-900">Invite Friends</h2>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    Invite friends to StoryQuestor. When they sign up and subscribe, you&apos;ll receive
                    a <strong>one-week credit</strong> applied to your next billing cycle — up to 5 invites total.
                  </p>

                  {inviteRemaining > 0 ? (
                    <div className="flex gap-2 mb-4">
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={e => { setInviteEmail(e.target.value); setInviteError('') }}
                        placeholder="friend@example.com"
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                        onKeyDown={e => e.key === 'Enter' && sendInvite()}
                      />
                      <button
                        onClick={sendInvite}
                        disabled={sendingInvite || !inviteEmail.trim()}
                        className="flex items-center gap-1.5 px-4 py-2 text-white rounded-lg text-sm font-medium transition-all hover:brightness-110 disabled:opacity-50 shrink-0"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
                      >
                        <Send size={13} />
                        {sendingInvite ? 'Sending…' : 'Send Invite'}
                      </button>
                    </div>
                  ) : (
                    <div className="mb-4 text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                      You&apos;ve used all 5 invites.
                    </div>
                  )}

                  {inviteError && <p className="text-xs text-red-500 mb-3">{inviteError}</p>}
                  {inviteSuccess && (
                    <span
                      role="status"
                      className="inline-flex items-center gap-1.5 mb-3 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-medium"
                      style={{ animation: 'profile-card-in 0.3s cubic-bezier(0.16,1,0.3,1) both' }}
                    >
                      <CheckCircle size={13} />
                      {inviteSuccess}
                    </span>
                  )}

                  <p className="text-xs text-gray-400 mb-3">
                    {inviteRemaining} invite{inviteRemaining !== 1 ? 's' : ''} remaining of 5
                  </p>

                  {invites.length > 0 && (
                    <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
                      {invites.map(invite => (
                        <div key={invite.id} className="flex items-center justify-between gap-2 text-sm">
                          <span className="text-gray-700 truncate">{invite.inviteeEmail}</span>
                          {invite.status === 'rewarded' ? (
                            <span className="flex items-center gap-1 text-green-600 text-xs font-medium shrink-0">
                              <CheckCircle size={12} />
                              Subscribed — week credited
                            </span>
                          ) : invite.status === 'signed_up' ? (
                            <span className="flex items-center gap-1 text-amber-600 text-xs font-medium shrink-0">
                              <Clock size={12} />
                              Signed up
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs shrink-0">Invite sent</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Danger Zone */}
              {activeTab === 'danger' && (
                <div>
                  <h2 className="text-base font-bold text-red-700 mb-1">Danger Zone</h2>
                  <p className="text-sm text-red-800/70 mb-4">
                    Deleting your account is permanent. All your stories, scenes, and images will be removed and cannot be recovered.
                    {billing && (billing.subscriptionStatus === 'active' || billing.subscriptionStatus === 'trialing') && (
                      <span className="block mt-1 text-red-500 font-medium">Your active subscription will also be cancelled immediately.</span>
                    )}
                  </p>

                  {!confirmDelete ? (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Trash2 size={15} />
                      Delete My Account
                    </button>
                  ) : (
                    <div className="flex flex-col gap-3 p-4 bg-white border border-red-200 rounded-xl">
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
            </div>
          </div>
        </div>
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
