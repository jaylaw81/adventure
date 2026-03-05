import { ImageResponse } from 'next/og'
import { getAdventure, getStartNode } from '@/lib/queries'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const AUDIENCE_BADGE: Record<string, { label: string; color: string }> = {
  all:    { label: 'All Ages',     color: '#16a34a' },
  teens:  { label: 'Teens',        color: '#d97706' },
  adults: { label: 'Adults Only',  color: '#dc2626' },
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function Image({ params }: Props) {
  const { id } = await params
  const [adventure, startNode] = await Promise.all([
    getAdventure(id),
    getStartNode(id),
  ])

  const title = adventure?.title ?? 'Untitled Story'
  const description = adventure?.description ?? ''
  const imageUrl = startNode?.imageUrl ?? null
  const badge = AUDIENCE_BADGE[adventure?.audience ?? 'all'] ?? AUDIENCE_BADGE.all
  const shortDesc = description.length > 140 ? description.slice(0, 137) + '…' : description

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          position: 'relative',
          background: 'linear-gradient(135deg, #1a1025 0%, #0f172a 60%, #1a1025 100%)',
          overflow: 'hidden',
        }}
      >
        {/* Story cover image as blurred background */}
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '55%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.35,
            }}
          />
        )}

        {/* Left-to-right dark gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: imageUrl
              ? 'linear-gradient(to right, #0f172a 45%, rgba(15,23,42,0.5) 75%, rgba(15,23,42,0.2) 100%)'
              : 'transparent',
          }}
        />

        {/* Top shimmer line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'linear-gradient(90deg, transparent, #f59e0b, #a78bfa, transparent)',
          }}
        />

        {/* Main content */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '64px 80px',
            maxWidth: 720,
          }}
        >
          {/* Audience badge */}
          <div style={{ display: 'flex', marginBottom: 28 }}>
            <span
              style={{
                background: badge.color,
                color: 'white',
                fontSize: 20,
                fontWeight: 700,
                padding: '6px 18px',
                borderRadius: 999,
              }}
            >
              {badge.label}
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: title.length > 36 ? 58 : 72,
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.1,
              marginBottom: 24,
              letterSpacing: '-1px',
            }}
          >
            {title}
          </div>

          {/* Description */}
          {shortDesc && (
            <div
              style={{
                fontSize: 26,
                color: '#94a3b8',
                lineHeight: 1.5,
              }}
            >
              {shortDesc}
            </div>
          )}
        </div>

        {/* StoryQuestor branding — bottom right */}
        <div
          style={{
            position: 'absolute',
            bottom: 48,
            right: 60,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 11,
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
              <path d="M19 3H4.5a2.5 2.5 0 0 0 0 5H12" />
            </svg>
          </div>
          <div style={{ display: 'flex', fontSize: 26, fontWeight: 700 }}>
            <span style={{ color: 'white' }}>Story</span>
            <span style={{ color: '#f59e0b' }}>Questor</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
