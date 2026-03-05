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
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1025 0%, #0f172a 60%, #1a1025 100%)',
        }}
      >
        {/* Decorative top shimmer line */}
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

        {/* Logo mark */}
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 24,
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 28,
          }}
        >
          <svg
            width="52"
            height="52"
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

        {/* Wordmark */}
        <div
          style={{
            display: 'flex',
            fontSize: 80,
            fontWeight: 800,
            letterSpacing: '-2px',
            marginBottom: 20,
          }}
        >
          <span style={{ color: 'white' }}>Story</span>
          <span style={{ color: '#f59e0b' }}>Questor</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 30,
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: 680,
            lineHeight: 1.4,
          }}
        >
          Create branching stories where every choice matters
        </div>

        {/* Decorative bottom dots */}
        <div
          style={{
            position: 'absolute',
            bottom: 48,
            display: 'flex',
            gap: 8,
          }}
        >
          {['#f59e0b', '#a78bfa', '#f59e0b'].map((color, i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: color,
                opacity: 0.6,
              }}
            />
          ))}
        </div>
      </div>
    ),
    { ...size },
  )
}
