import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export interface RelatedReadingItem {
  href: string
  title: string
  description: string
  tag?: string
}

/**
 * Reused across /guide and /resources articles to aggressively cross-link
 * the content ecosystem — every article should point to several others.
 */
export default function RelatedReading({
  items,
  heading = 'Keep reading',
  variant = 'light',
}: {
  items: RelatedReadingItem[]
  heading?: string
  variant?: 'light' | 'dark'
}) {
  const dark = variant === 'dark'
  return (
    <div>
      <p className={`text-xs font-semibold uppercase tracking-widest mb-5 ${dark ? 'text-amber-400' : 'text-amber-600'}`}>
        {heading}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`group flex flex-col rounded-2xl border p-5 transition-all duration-150 hover:-translate-y-0.5 ${
              dark
                ? 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/8'
                : 'border-gray-100 bg-white hover:border-amber-200 hover:shadow-md'
            }`}
          >
            {item.tag && (
              <span className={`self-start text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2.5 ${
                dark ? 'bg-amber-400/15 text-amber-300' : 'bg-amber-100 text-amber-700'
              }`}>
                {item.tag}
              </span>
            )}
            <h3 className={`text-sm font-bold leading-snug mb-1.5 ${dark ? 'text-white' : 'text-gray-900'}`}>
              {item.title}
            </h3>
            <p className={`text-xs leading-relaxed mb-3 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
              {item.description}
            </p>
            <span className={`mt-auto inline-flex items-center gap-1.5 text-xs font-semibold transition-all group-hover:gap-2.5 ${
              dark ? 'text-amber-400' : 'text-amber-600'
            }`}>
              Read more <ArrowRight size={11} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
