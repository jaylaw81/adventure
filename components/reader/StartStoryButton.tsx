'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Play, X, ShieldAlert, Star, AlertTriangle } from 'lucide-react'

interface AudienceConfig {
  rating: string
  ratingColor: string
  icon: React.ReactNode
  headline: string
  body: string
  cta: string
  ctaColor: string
}

const AUDIENCE_CONFIG: Record<string, AudienceConfig> = {
  adults: {
    rating: '18+',
    ratingColor: 'bg-red-600 text-white',
    icon: <ShieldAlert size={32} className="text-red-500" />,
    headline: 'Mature Content Warning',
    body: 'This story is intended for adults 18 years of age and older. It may contain explicit language, adult themes, sexual content, graphic violence, or other mature subject matter. Viewer discretion is strongly advised.',
    cta: 'I am 18+ — Enter Story',
    ctaColor: 'bg-red-600 hover:bg-red-700',
  },
  teens: {
    rating: 'PG-13',
    ratingColor: 'bg-amber-500 text-white',
    icon: <AlertTriangle size={32} className="text-amber-500" />,
    headline: 'Teen Content Advisory',
    body: 'This story is recommended for ages 13 and older. It may contain mild profanity, thematic elements, stylized violence, or brief suggestive content. Similar to a PG-13 film rating. Parental guidance is suggested for younger readers.',
    cta: 'Enter Story',
    ctaColor: 'bg-amber-500 hover:bg-amber-600',
  },
  all: {
    rating: 'G',
    ratingColor: 'bg-green-600 text-white',
    icon: <Star size={32} className="text-green-500" />,
    headline: 'Family Friendly',
    body: 'This story is suitable for all ages! It contains family-friendly content with no mature themes, violence, or inappropriate language. Enjoy the adventure with the whole family.',
    cta: 'Start Adventure',
    ctaColor: 'bg-green-600 hover:bg-green-700',
  },
}

interface Props {
  href: string
  audience: string
}

export default function StartStoryButton({ href, audience }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const config = AUDIENCE_CONFIG[audience] ?? AUDIENCE_CONFIG.all

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors text-lg shadow-sm"
      >
        <Play size={18} />
        Start Playing
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header band */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${config.ratingColor}`}>
                {config.rating}
              </span>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-6 flex flex-col items-center text-center gap-4">
              {config.icon}
              <h2 className="text-xl font-bold text-gray-900">{config.headline}</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{config.body}</p>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex flex-col gap-2.5">
              <button
                onClick={() => router.push(href)}
                className={`w-full flex items-center justify-center gap-2 py-3 text-white font-semibold rounded-xl transition-colors ${config.ctaColor}`}
              >
                <Play size={16} />
                {config.cta}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-full py-3 text-gray-600 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
