'use client'

import { useState, useEffect, useRef } from 'react'
import RestartButton from './RestartButton'
import ReviewForm from './ReviewForm'

// ── Ember canvas ───────────────────────────────────────────────────────────────

const EMBER_COLORS = ['#f59e0b', '#fbbf24', '#a78bfa', '#c4b5fd', '#fef3c7', '#fffbeb']
const EMBER_DURATION = 2600
const EMBER_COUNT = 52

interface Ember {
  x: number; y: number; vx: number; vy: number
  size: number; color: string; alpha: number; decay: number; born: number
}

function spawnEmbers(cx: number, cy: number, now: number): Ember[] {
  return Array.from({ length: EMBER_COUNT }, () => {
    const angle = Math.random() * Math.PI * 2
    const speed = 0.3 + Math.random() * 0.7
    return {
      x: cx + (Math.random() - 0.5) * 60,
      y: cy + (Math.random() - 0.5) * 20,
      vx: Math.cos(angle) * speed * 0.4,
      vy: -(0.4 + Math.random() * 0.9) * speed,
      size: 1 + Math.random() * 2.2,
      color: EMBER_COLORS[Math.floor(Math.random() * EMBER_COLORS.length)],
      alpha: 0.7 + Math.random() * 0.3,
      decay: 0.008 + Math.random() * 0.012,
      born: now + Math.random() * 400,
    }
  })
}

function EmberCanvas({
  originRef,
  active,
}: {
  originRef: React.RefObject<HTMLDivElement | null>
  active: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!active) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = window.innerWidth
    const H = window.innerHeight
    canvas.width = W
    canvas.height = H
    canvas.style.opacity = '1'

    const originEl = originRef.current
    let cx = W / 2, cy = H / 2
    if (originEl) {
      const rect = originEl.getBoundingClientRect()
      cx = rect.left + rect.width / 2
      cy = rect.top + rect.height / 2
    }

    const start = performance.now()
    const embers = spawnEmbers(cx, cy, start)
    let raf = 0

    function tick(now: number) {
      if (!ctx || !canvas) return
      if (now - start > EMBER_DURATION) {
        ctx.clearRect(0, 0, W, H)
        canvas.style.opacity = '0'
        return
      }
      ctx.clearRect(0, 0, W, H)
      for (const e of embers) {
        if (now < e.born) continue
        e.x += e.vx; e.y += e.vy
        e.vy -= 0.005; e.vx *= 0.995
        e.alpha = Math.max(0, e.alpha - e.decay)
        if (e.alpha <= 0) continue
        ctx.save()
        ctx.globalAlpha = e.alpha
        const glow = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.size * 2.5)
        glow.addColorStop(0, e.color)
        glow.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()
        ctx.restore()
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, originRef])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none transition-opacity duration-500"
      style={{ zIndex: 50 }}
      aria-hidden
    />
  )
}

// ── Polaroid slam sequence ─────────────────────────────────────────────────────

// Deterministic per-card rotation so the stack looks organic
const CARD_ROTATIONS = [-6, 4, -3, 7, -5, 2, -8, 5, -2, 6, -4, 3]

// Where each card flies when the stack explodes (dx, dy in px)
const EXPLOSION_VECTORS: [number, number][] = [
  [-200, -220], [210, -190], [-230, 180], [200, 210],
  [-110, -260], [260, -90], [-260, 110], [110, 260],
  [0, -250], [0, 250], [-240, -40], [240, 40],
]

function PolaroidCard({
  label,
  index,
  isExploding,
}: {
  label: string
  index: number
  isExploding: boolean
}) {
  const rot = CARD_ROTATIONS[index % CARD_ROTATIONS.length]
  const [dx, dy] = EXPLOSION_VECTORS[index % EXPLOSION_VECTORS.length]

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        '--card-rot': `${rot}deg`,
        '--card-dx': `${dx}px`,
        '--card-dy': `${dy}px`,
        animation: isExploding
          ? 'explodeCard 420ms cubic-bezier(0.4, 0, 0.6, 1) forwards'
          : 'slamIn 310ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
        zIndex: index,
      } as React.CSSProperties}
    >
      {/* Polaroid frame */}
      <div style={{
        width: '100%',
        height: '100%',
        background: '#fffef9',
        borderRadius: 3,
        boxShadow: '0 14px 48px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.35)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Photo area */}
        <div style={{
          flex: 1,
          background: '#f5f3ec',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '28px 22px 18px',
          gap: 10,
        }}>
          <span style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#9ca3af',
          }}>
            you chose
          </span>
          <p style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#111827',
            lineHeight: 1.35,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {label}
          </p>
        </div>

        {/* Classic polaroid bottom strip — Ink Night with a violet accent dot */}
        <div style={{
          height: 60,
          background: '#1a1025',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(167,139,250,0.5)' }} />
          <div style={{ width: 24, height: 2, borderRadius: 1, background: 'rgba(245,158,11,0.35)' }} />
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(167,139,250,0.5)' }} />
        </div>
      </div>
    </div>
  )
}

function PolaroidFlashback({
  history,
  onDone,
}: {
  history: string[]
  onDone: () => void
}) {
  const [visibleCount, setVisibleCount] = useState(0)
  const [exploding, setExploding] = useState(false)
  const [overlayOut, setOverlayOut] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    const INTERVAL = 390 // ms between each card slam (310ms anim + 80ms settle)

    history.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleCount(i + 1), 280 + i * INTERVAL))
    })

    // Hold last card, then fire the explosion
    const explodeAt = 280 + (history.length - 1) * INTERVAL + INTERVAL + 480
    timers.push(setTimeout(() => { setExploding(true); setOverlayOut(true) }, explodeAt))
    timers.push(setTimeout(() => { setGone(true); onDone() }, explodeAt + 520))

    return () => timers.forEach(clearTimeout)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (gone) return null

  return (
    <>
      {/* Ink Night overlay — fades out as cards explode */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 60,
          background: '#1a1025',
          opacity: overlayOut ? 0 : 1,
          transition: 'opacity 520ms ease-in',
          pointerEvents: overlayOut ? 'none' : 'auto',
        }}
        aria-hidden
      />

      {/* "Your path" label — sits above the cards */}
      {visibleCount > 0 && !exploding && (
        <div
          style={{
            position: 'fixed',
            top: '18%',
            left: 0,
            right: 0,
            zIndex: 62,
            textAlign: 'center',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(167,139,250,0.5)',
            pointerEvents: 'none',
          }}
        >
          your path
        </div>
      )}

      {/* Card stack */}
      {visibleCount > 0 && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 61,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div style={{ position: 'relative', width: 258, height: 318 }}>
            {history.slice(0, visibleCount).map((label, i) => (
              <PolaroidCard
                key={i}
                label={label}
                index={i}
                isExploding={exploding}
              />
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// ── EndingView ─────────────────────────────────────────────────────────────────

interface Props {
  adventureId: string
  restartHref: string
}

export default function EndingView({ adventureId, restartHref }: Props) {
  const [showReview, setShowReview] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [flashbackDone, setFlashbackDone] = useState(false)
  const [animateContent, setAnimateContent] = useState(false)
  const [embersActive, setEmbersActive] = useState(false)
  const originRef = useRef<HTMLDivElement>(null)
  // Prevent React 18 Strict Mode's double-invocation from consuming the
  // sessionStorage key twice (which would skip the flashback in development).
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const key = `sq_history_${adventureId}`
    let parsed: string[] = []
    try {
      parsed = JSON.parse(sessionStorage.getItem(key) ?? '[]')
      sessionStorage.removeItem(key)
    } catch { /* ignore */ }

    if (reduced || parsed.length === 0) {
      setFlashbackDone(true)
      setEmbersActive(true)
    } else {
      setHistory(parsed.slice(-10)) // cap at 10 most recent choices
    }
  }, [adventureId])

  const handleFlashbackDone = () => {
    setAnimateContent(true)
    setFlashbackDone(true)
    setEmbersActive(true)
  }

  const contentStyle: React.CSSProperties = !flashbackDone
    ? { opacity: 0 }
    : animateContent
      ? { animation: 'fadeInEnding 600ms ease-out forwards' }
      : { opacity: 1 }

  return (
    <>
      {history.length > 0 && !flashbackDone && (
        <PolaroidFlashback history={history} onDone={handleFlashbackDone} />
      )}

      <EmberCanvas originRef={originRef} active={embersActive} />

      <div className="py-10" style={contentStyle}>
        {/* Ending ceremony */}
        <div ref={originRef} className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="h-px w-16" style={{ background: 'linear-gradient(to right, transparent, #a78bfa)' }} />
            <span className="text-xs font-bold tracking-widest uppercase text-purple-400">The End</span>
            <div className="h-px w-16" style={{ background: 'linear-gradient(to left, transparent, #a78bfa)' }} />
          </div>
          <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
            You&apos;ve reached one ending. There may be others waiting if you choose differently.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <RestartButton href={restartHref} adventureId={adventureId} />
        </div>

        {showReview ? (
          <ReviewForm adventureId={adventureId} />
        ) : (
          <div className="text-center">
            <button
              onClick={() => setShowReview(true)}
              className="text-sm text-gray-400 hover:text-amber-500 transition-colors"
            >
              Rate this story ★
            </button>
          </div>
        )}
      </div>
    </>
  )
}
