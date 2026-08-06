import type { Metadata } from 'next'
import {
  School,
  Users,
  ShieldCheck,
  Globe,
  Lock,
  LayoutDashboard,
  BookOpen,
  CheckCircle2,
  Clock,
  Star,
} from 'lucide-react'
import WaitlistForm from './WaitlistForm'

const SITE_URL = 'https://www.storyquestor.com'

export const metadata: Metadata = {
  title: { absolute: 'Organizations — StoryQuestor for Educators & Schools' },
  description: 'Bring interactive branching stories to your classroom. Manage students, review content, and create a private space for your school.',
  alternates: { canonical: `${SITE_URL}/organizations` },
}

const features = [
  {
    icon: LayoutDashboard,
    title: 'Organization Dashboard',
    desc: 'A dedicated admin hub where you manage every student account, story, and permission from one place.',
  },
  {
    icon: Users,
    title: 'Student Invitations',
    desc: 'Invite students by email. They join your organization directly — no public sign-up flow needed.',
  },
  {
    icon: BookOpen,
    title: 'Story Review & Approval',
    desc: 'Review student stories before they go anywhere. Approve, request changes, or keep them org-only.',
  },
  {
    icon: ShieldCheck,
    title: 'Audience & Privacy Controls',
    desc: 'Decide exactly who can read each story — just your org, a password-protected link, or the public.',
  },
  {
    icon: Globe,
    title: 'Branded Organization Page',
    desc: 'A curated public-facing page showcasing your school or classroom\'s published stories.',
  },
  {
    icon: Lock,
    title: 'Password-Protected Sharing',
    desc: 'Share stories with parents, judges, or external audiences using a secure password-gated link.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Sign up for the Organization tier',
    desc: 'Create your organization account and set up your school or classroom profile.',
  },
  {
    number: '02',
    title: 'Invite your students',
    desc: 'Send email invitations. Students join your private space with a single click.',
  },
  {
    number: '03',
    title: 'Students create stories',
    desc: 'Your class uses the same visual editor — but in a managed, moderated environment.',
  },
  {
    number: '04',
    title: 'Review, publish, and share',
    desc: 'Approve stories, build your org page, and share finished work however you choose.',
  },
]

const orgFeatures = [
  'Visual branching story editor for all members',
  'Organization admin dashboard',
  'Student invitation & management',
  'Story review & approval workflow',
  'Audience & privacy controls',
  'Branded organization page',
  'Password-protected sharing',
  'Priority support',
]

export default function OrganizationsPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0f0e17' }}>

      {/* Hero */}
      <section
        className="relative px-6 pt-24 pb-20 text-center overflow-hidden -mt-16"
        style={{ background: 'linear-gradient(160deg, #1a1025 0%, #0f172a 55%, #1a1025 100%)' }}
      >
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(ellipse, #f59e0b, transparent)' }} />
        </div>

        <div className="relative max-w-3xl mx-auto">
          {/* Eyebrow badges */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-amber-500/40 text-amber-400 bg-amber-500/10">
              <School size={12} />
              For Educators &amp; Schools
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-purple-500/40 text-purple-400 bg-purple-500/10">
              <Clock size={12} />
              Coming Soon
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight mb-5">
            Bring Interactive Storytelling{' '}
            <span style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              to Your Classroom
            </span>
          </h1>

          <p className="text-gray-400 text-lg leading-relaxed max-w-xl mx-auto mb-10">
            StoryQuestor Organizations gives educators a private, managed space to run branching story assignments — with full control over student accounts, content, and sharing.
          </p>

          <WaitlistForm />

          <p className="text-xs text-gray-600 mt-4">No commitment. We'll reach out when we're ready to launch.</p>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Everything your classroom needs</h2>
            <p className="text-gray-400 max-w-lg mx-auto">
              Built specifically for educators who want the power of StoryQuestor in a safe, structured environment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl p-6 border border-white/8 flex flex-col gap-4 transition-all hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5"
                style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, #f59e0b22, #f9731622)' }}>
                  <Icon size={18} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1.5">{title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        className="px-6 py-20"
        style={{ background: 'linear-gradient(160deg, #1a1025 0%, #0f172a 100%)' }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">How it works</h2>
            <p className="text-gray-400 max-w-md mx-auto">
              From setup to sharing, the Organization tier is designed to fit your workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {steps.map(({ number, title, desc }) => (
              <div key={number} className="flex gap-5 items-start">
                <div className="text-3xl font-black shrink-0 leading-none"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {number}
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Simple, transparent pricing</h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Organizations get a dedicated tier built for education — separate from individual subscriptions.
            </p>
          </div>

          <div className="max-w-sm mx-auto">
            {/* Organization tier */}
            <div
              className="rounded-2xl p-7 border border-amber-500/30 flex flex-col relative overflow-hidden"
              style={{ background: 'linear-gradient(160deg, #1c1610, #1a1025)' }}
            >
              {/* Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ background: '#f59e0b' }} />

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-amber-400">Organization</p>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Coming Soon
                  </span>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-black text-white">TBD</span>
                </div>
                <p className="text-gray-500 text-sm mt-2">Pricing finalized before launch. Early adopters get special rates.</p>
              </div>

              <ul className="flex flex-col gap-2.5 mb-8 flex-1">
                {orgFeatures.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <CheckCircle2 size={15} className="text-amber-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <div
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-gray-400 border border-amber-500/20"
                style={{ background: 'rgba(245,158,11,0.06)' }}
              >
                <Star size={14} className="text-amber-500" />
                Join the waitlist above
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section
        className="px-6 py-20"
        style={{ background: 'linear-gradient(160deg, #1a1025 0%, #0f172a 100%)' }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Built for every kind of classroom
          </h2>
          <p className="text-gray-400 mb-10 max-w-xl mx-auto">
            Whether you're running a creative writing unit, a language arts class, or an after-school storytelling club — StoryQuestor Organizations adapts to your needs.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {[
              { emoji: '✍️', label: 'Creative Writing', desc: 'Let students author branching narratives and share finished work with the class.' },
              { emoji: '📚', label: 'Language Arts', desc: 'Use interactive stories as comprehension tools or have students write their own.' },
              { emoji: '🏛️', label: 'History & Social Studies', desc: 'Bring historical events to life through choose-your-own-path simulations.' },
            ].map(({ emoji, label, desc }) => (
              <div
                key={label}
                className="rounded-xl p-5 border border-white/8"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <div className="text-2xl mb-3">{emoji}</div>
                <p className="text-white font-semibold text-sm mb-1.5">{label}</p>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border border-purple-500/40 text-purple-400 bg-purple-500/10 mb-6">
            <Clock size={11} />
            Launching Soon
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Be the first to know
          </h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            We're building this for educators like you. Join the waitlist and we'll notify you as soon as the Organization tier is available — early adopters get priority access and special pricing.
          </p>
          <WaitlistForm />
        </div>
      </section>

    </div>
  )
}
