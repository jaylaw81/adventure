import Link from 'next/link'
import { ArrowRight, Pencil, Check, X } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import RelatedReading from '@/components/content/RelatedReading'

// Shared layout for search-focused product pages (/choose-your-own-adventure-maker, /twine-alternative, …).
// Each page supplies its own copy so no two pages say the same thing.

const SITE_URL = 'https://www.storyquestor.com'

type Icon = React.ComponentType<{ size?: number; className?: string }>

export interface ProductLandingProps {
  path: string
  eyebrow: { icon: Icon; label: string }
  title: [string, string] // rendered as "first" + highlighted "second"
  schemaName: string
  subtitle: string
  intro: { heading: string; paragraphs: React.ReactNode[] }
  steps?: { heading: string; items: { title: string; body: string }[] }
  features: { heading: string; items: { icon: Icon; title: string; body: string }[] }
  comparison?: {
    heading: string
    intro: string
    columns: [string, string]
    rows: { label: string; a: string | boolean; b: string | boolean }[]
  }
  faqs: { q: string; a: string }[]
  related: { href: string; title: string; description: string; tag: string }[]
  cta: { heading: string; body: string }
}

function Cell({ value }: { value: string | boolean }) {
  if (value === true) return <Check size={16} className="text-emerald-600 mx-auto" strokeWidth={2.5} />
  if (value === false) return <X size={16} className="text-gray-300 mx-auto" />
  return <span className="text-sm text-gray-600">{value}</span>
}

export default function ProductLanding(props: ProductLandingProps) {
  const { path, eyebrow, title, schemaName, subtitle, intro, steps, features, comparison, faqs, related, cta } = props
  const url = `${SITE_URL}${path}`

  const appSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'StoryQuestor',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web browser',
    url,
    description: subtitle,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', description: 'Free plan available' },
  }
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: schemaName, item: url },
    ],
  }

  return (
    <div className="flex flex-col">
      <JsonLd data={appSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 pt-36 pb-16 -mt-16 text-center"
        style={{ background: 'linear-gradient(135deg, #3d0d7e 0%, #1e1040 55%, #0f172a 100%)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 80%, rgba(245,158,11,0.15) 0%, transparent 65%)' }} />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-amber-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border"
            style={{ background: 'rgba(245,158,11,0.12)', borderColor: 'rgba(245,158,11,0.3)' }}>
            <eyebrow.icon size={14} />
            {eyebrow.label}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
            {title[0]}<br /><span className="text-amber-400">{title[1]}</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto mb-8">{subtitle}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/sign-up"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-gray-900 bg-amber-500 hover:bg-amber-600 shadow-lg transition-all hover:scale-105">
              <Pencil size={16} />
              Start writing free
            </Link>
            <Link href="/demo"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-white border border-white/25 hover:bg-white/10 transition-colors">
              Try the demo <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Intro ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold mb-6" style={{ color: '#1e0a3c' }}>{intro.heading}</h2>
          <div className="text-gray-600 leading-relaxed space-y-5">
            {intro.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </section>

      {/* ── Steps ── */}
      {steps && (
        <section className="px-6 py-20" style={{ background: '#faf5ff' }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold mb-10" style={{ color: '#1e0a3c' }}>{steps.heading}</h2>
            <ol className="flex flex-col gap-4">
              {steps.items.map((s, i) => (
                <li key={s.title} className="flex gap-4 rounded-2xl border border-violet-100 bg-white p-6">
                  <div className="w-9 h-9 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center shrink-0 text-sm font-bold text-violet-700">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="text-base font-bold mb-1" style={{ color: '#1e0a3c' }}>{s.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* ── Features ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold mb-10" style={{ color: '#1e0a3c' }}>{features.heading}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.items.map(f => (
              <div key={f.title} className="rounded-2xl border border-gray-100 bg-white p-6">
                <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center mb-4">
                  <f.icon size={18} className="text-amber-600" />
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: '#1e0a3c' }}>{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison ── */}
      {comparison && (
        <section className="px-6 py-20" style={{ background: '#faf5ff' }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold mb-4" style={{ color: '#1e0a3c' }}>{comparison.heading}</h2>
            <p className="text-gray-600 leading-relaxed mb-8">{comparison.intro}</p>
            <div className="rounded-2xl border border-violet-100 bg-white overflow-x-auto">
              <table className="w-full text-left min-w-[480px]">
                <thead>
                  <tr className="border-b border-violet-100">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400" />
                    <th className="px-5 py-3 text-sm font-bold text-center" style={{ color: '#1e0a3c' }}>{comparison.columns[0]}</th>
                    <th className="px-5 py-3 text-sm font-bold text-center" style={{ color: '#1e0a3c' }}>{comparison.columns[1]}</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.rows.map(r => (
                    <tr key={r.label} className="border-b border-gray-50 last:border-0">
                      <td className="px-5 py-3.5 text-sm font-medium text-gray-700">{r.label}</td>
                      <td className="px-5 py-3.5 text-center"><Cell value={r.a} /></td>
                      <td className="px-5 py-3.5 text-center"><Cell value={r.b} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      <section className="px-6 py-20" style={{ background: 'linear-gradient(135deg, #1a1025 0%, #0f172a 100%)' }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-8">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-6">
            {faqs.map(f => (
              <div key={f.q}>
                <h3 className="text-base font-bold text-white mb-1.5">{f.q}</h3>
                <p className="text-gray-400 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Related ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <RelatedReading heading="Keep Exploring" items={related} />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden px-6 py-20 text-center bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">{cta.heading}</h2>
          <p className="text-gray-500 text-base mb-10 max-w-lg mx-auto">{cta.body}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-gray-900 bg-amber-500 hover:bg-amber-600 shadow-lg transition-all hover:scale-105">
              <Pencil size={16} />
              Start writing free
            </Link>
            <Link href="/explore"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors">
              Read stories first <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
