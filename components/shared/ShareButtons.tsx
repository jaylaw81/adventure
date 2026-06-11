'use client'

import { useState } from 'react'
import { Check, Link2 } from 'lucide-react'

interface Props {
  title: string
  url: string
}

function openPopup(href: string) {
  window.open(href, '_blank', 'width=620,height=460,resizable=yes,scrollbars=yes,toolbar=no,menubar=no')
}

const platforms = (encodedUrl: string, encodedText: string) => [
  {
    key: 'facebook',
    label: 'Share on Facebook',
    href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    idle: 'bg-[#e7f0fd] text-[#1877f2]',
    hot:  'hover:bg-[#1877f2] hover:text-white',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.514c-1.491 0-1.956.932-1.956 1.887v2.266h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
      </svg>
    ),
  },
  {
    key: 'twitter',
    label: 'Share on X',
    href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    idle: 'bg-slate-100 text-slate-700',
    hot:  'hover:bg-[#0f1419] hover:text-white',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    key: 'linkedin',
    label: 'Share on LinkedIn',
    href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    idle: 'bg-[#e8f3fb] text-[#0a66c2]',
    hot:  'hover:bg-[#0a66c2] hover:text-white',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
]

export default function ShareButtons({ title, url }: Props) {
  const [copied, setCopied] = useState(false)

  const encodedUrl  = encodeURIComponent(url)
  const encodedText = encodeURIComponent(`"${title}" — a free choose-your-own-adventure story on StoryQuestor 📖`)

  function copyLink() {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] font-medium text-slate-400 mr-0.5 tracking-wide">Share</span>
      {platforms(encodedUrl, encodedText).map(p => (
        <button
          key={p.key}
          onClick={() => openPopup(p.href)}
          title={p.label}
          aria-label={p.label}
          className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-150 ${p.idle} ${p.hot}`}
        >
          {p.icon}
        </button>
      ))}
      <button
        onClick={copyLink}
        title="Copy link"
        aria-label="Copy story link"
        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-150 ${
          copied
            ? 'bg-green-100 text-green-600'
            : 'bg-violet-100 text-violet-600 hover:bg-violet-600 hover:text-white'
        }`}
      >
        {copied ? <Check size={12} strokeWidth={2.5} /> : <Link2 size={12} />}
      </button>
    </div>
  )
}
