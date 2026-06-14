'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

export interface TimelineEntry {
  year: string
  event: string
}

// Color roles per era — violet for history, amber for milestones, red for end, teal for revival
const YEAR_COLOR: Record<string, string> = {
  '1969': '#a78bfa',
  '1976': '#a78bfa',
  '1979': '#f59e0b',
  '1982': '#a78bfa',
  '1984': '#f59e0b',
  '1989': '#a78bfa',
  '1998': '#ef4444',
  '2003': '#14b8a6',
  '2006': '#14b8a6',
  'Today': '#f59e0b',
}

function StaticTimeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <div className="px-6 py-20" style={{ background: '#1a1025' }}>
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-3" style={{ color: '#a78bfa' }}>
          Timeline
        </p>
        <h2 id="timeline" className="text-3xl font-extrabold text-white mb-12">
          From Bedtime Story to Global Phenomenon
        </h2>
        <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          {entries.map(({ year, event }) => (
            <div
              key={year}
              className="grid sm:grid-cols-[92px_1fr] gap-x-10 gap-y-1.5 py-7 first:pt-0 last:pb-0"
            >
              <p
                className="text-xl font-extrabold tabular-nums"
                style={{ color: YEAR_COLOR[year] ?? '#a78bfa' }}
              >
                {year}
              </p>
              <p
                className="text-[0.9375rem] leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.55)' }}
              >
                {event}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function TimelineScroller({ entries }: { entries: TimelineEntry[] }) {
  const outerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const scrollToEntry = useCallback((index: number) => {
    const outer = outerRef.current
    if (!outer) return
    // Each entry occupies 1 viewport of scroll distance.
    // outerTop + index×vh puts us at the start of that entry's dwell window.
    window.scrollTo({
      top: outer.offsetTop + index * window.innerHeight + 1,
      behavior: 'smooth',
    })
  }, [])

  useEffect(() => {
    const outer = outerRef.current
    if (!outer) return

    const onUpdate = () => {
      // Hidden in reduced-motion CSS: offsetParent is null when display:none
      if (!outer.offsetParent && outer.style.display !== '') return

      const rect = outer.getBoundingClientRect()
      const scrolled = -rect.top
      const totalScrollable = outer.offsetHeight - window.innerHeight

      if (scrolled <= 0) { setActiveIndex(0); return }
      if (scrolled >= totalScrollable) { setActiveIndex(entries.length - 1); return }

      const progress = scrolled / totalScrollable
      setActiveIndex(Math.min(Math.floor(progress * entries.length), entries.length - 1))
    }

    window.addEventListener('scroll', onUpdate, { passive: true })
    window.addEventListener('resize', onUpdate, { passive: true })
    onUpdate()
    return () => {
      window.removeEventListener('scroll', onUpdate)
      window.removeEventListener('resize', onUpdate)
    }
  }, [entries.length])

  const n = entries.length

  return (
    <>
      {/* Reduced-motion: static list, same dark theme */}
      <div className="motion-safe:hidden">
        <StaticTimeline entries={entries} />
      </div>

      {/* Animated sticky scroller — hidden for prefers-reduced-motion */}
      <div
        ref={outerRef}
        className="motion-reduce:hidden"
        style={{ height: `${(n + 1) * 100}vh` }}
      >
        <div
          className="sticky top-0 overflow-hidden"
          style={{ height: '100dvh', background: '#1a1025' }}
        >
          {/* Anchor for #timeline deep links */}
          <h2 id="timeline" className="sr-only">From Bedtime Story to Global Phenomenon</h2>

          {/* Top bar */}
          <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-8 sm:px-14 py-7 pointer-events-none">
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: 'rgba(167,139,250,0.4)' }}
            >
              Timeline
            </span>
            <span
              className="text-[11px] tabular-nums font-medium"
              style={{ color: 'rgba(255,255,255,0.2)' }}
            >
              {String(activeIndex + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
            </span>
          </div>

          {/* Entry panels — all stacked, faded in/out */}
          {entries.map((entry, i) => {
            const isActive = i === activeIndex
            const color = YEAR_COLOR[entry.year] ?? '#a78bfa'
            return (
              <div
                key={entry.year}
                aria-hidden={!isActive}
                className="absolute inset-0 flex flex-col sm:flex-row items-center justify-center sm:justify-start px-8 sm:pl-14 sm:pr-28 gap-8 sm:gap-20"
                style={{
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? 'scale(1)' : 'scale(0.97)',
                  transition: 'opacity 550ms cubic-bezier(0.16,1,0.3,1), transform 550ms cubic-bezier(0.16,1,0.3,1)',
                  pointerEvents: isActive ? 'auto' : 'none',
                }}
              >
                {/* Year — enormous, color-coded */}
                <div className="shrink-0 leading-none">
                  <span
                    className="font-extrabold tabular-nums select-none"
                    style={{
                      fontSize: 'clamp(4.5rem, 14vw, 12rem)',
                      color,
                      letterSpacing: '-0.04em',
                      lineHeight: 1,
                    }}
                  >
                    {entry.year}
                  </span>
                </div>

                {/* Event text */}
                <div style={{ maxWidth: '36rem' }}>
                  <p
                    style={{
                      fontSize: 'clamp(1rem, 1.4vw, 1.2rem)',
                      color: 'rgba(255,255,255,0.68)',
                      lineHeight: 1.78,
                    }}
                  >
                    {entry.event}
                  </p>
                </div>
              </div>
            )
          })}

          {/* Dot navigation — vertical pill on desktop, horizontal on mobile */}
          <nav
            aria-label="Timeline navigation"
            className="absolute z-10 flex flex-row sm:flex-col gap-2
              bottom-8 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0
              sm:right-7 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2"
          >
            {entries.map((entry, i) => (
              <button
                key={i}
                onClick={() => scrollToEntry(i)}
                aria-label={`Jump to ${entry.year}`}
                aria-current={i === activeIndex ? 'step' : undefined}
                style={{
                  borderRadius: 999,
                  transition: 'width 300ms ease-out, height 300ms ease-out, background 300ms ease-out',
                  // Desktop: thin vertical pill when active
                  width: 6,
                  height: i === activeIndex ? 24 : 6,
                  background: i === activeIndex
                    ? YEAR_COLOR[entry.year] ?? '#f59e0b'
                    : 'rgba(255,255,255,0.2)',
                  // Mobile override applied by the sm: grid above
                }}
              />
            ))}
          </nav>

          {/* Scroll hint — fades out after first entry */}
          <div
            aria-hidden
            className="absolute bottom-8 left-8 sm:left-14 flex items-center gap-3 pointer-events-none transition-opacity duration-700"
            style={{ opacity: activeIndex === 0 ? 0.45 : 0 }}
          >
            <div
              className="h-px w-8"
              style={{ background: 'rgba(255,255,255,0.3)' }}
            />
            <span
              className="text-[10px] uppercase tracking-[0.2em]"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              scroll
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
