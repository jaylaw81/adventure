import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          position: 'relative',
          background: 'linear-gradient(135deg, #3d0d7e 0%, #1e1040 50%, #0f172a 100%)',
          overflow: 'hidden',
        }}
      >
        {/* Radial glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 70% 50%, rgba(245,158,11,0.15) 0%, transparent 65%)',
          }}
        />

        {/* Top accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, transparent, #f59e0b, #a78bfa, transparent)',
          }}
        />

        {/* Book spine decorations on the right */}
        <div
          style={{
            position: 'absolute',
            right: 80,
            top: 60,
            bottom: 60,
            display: 'flex',
            gap: 12,
            alignItems: 'stretch',
          }}
        >
          {['#7c3aed', '#0e7490', '#b45309', '#1d4ed8', '#065f46'].map((color, i) => (
            <div
              key={i}
              style={{
                width: 48,
                background: color,
                borderRadius: 6,
                opacity: 0.7 - i * 0.08,
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '64px 80px',
            maxWidth: 760,
          }}
        >
          {/* Badge */}
          <div style={{ display: 'flex', marginBottom: 24 }}>
            <span
              style={{
                background: 'rgba(245,158,11,0.2)',
                border: '1.5px solid rgba(245,158,11,0.5)',
                color: '#fbbf24',
                fontSize: 20,
                fontWeight: 700,
                padding: '6px 20px',
                borderRadius: 999,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              The Original Series
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.05,
              marginBottom: 8,
              letterSpacing: '-2px',
            }}
          >
            Choose Your Own
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: '#fbbf24',
              lineHeight: 1.05,
              marginBottom: 32,
              letterSpacing: '-2px',
            }}
          >
            Adventure
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 40 }}>
            {[
              { num: '184', label: 'Books' },
              { num: '250M+', label: 'Copies sold' },
              { num: '1979', label: 'Est.' },
            ].map(({ num, label }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: '#fbbf24', lineHeight: 1 }}>{num}</span>
                <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* StoryQuestor branding */}
        <div
          style={{
            position: 'absolute',
            bottom: 44,
            right: 68,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #7c3aed, #f59e0b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
              <path d="M19 3H4.5a2.5 2.5 0 0 0 0 5H12" />
            </svg>
          </div>
          <span style={{ fontSize: 24, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>
            StoryQuestor
          </span>
        </div>
      </div>
    ),
    { ...size },
  )
}
