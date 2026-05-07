import type { ReactNode } from 'react'

interface Props {
  title: ReactNode
  subtitle?: string
  action?: ReactNode
  /** Extra content rendered below title row (e.g. a search bar) */
  children?: ReactNode
  wide?: boolean
}

export default function PageBanner({ title, subtitle, action, children, wide = false }: Props) {
  const inner = wide ? 'max-w-6xl' : 'max-w-5xl'

  return (
    <section
      className="-mt-16 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #3d0d7e 0%, #1e1040 50%, #0f172a 100%)' }}
    >
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 20% 80%, rgba(124,58,237,0.22) 0%, transparent 65%)' }}
      />

      <div className={`relative ${inner} mx-auto px-6 pt-24 pb-8`}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">{title}</h1>
            {subtitle && (
              <p className="text-violet-300 mt-1 text-sm">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>

        {children && <div className="mt-5">{children}</div>}
      </div>
    </section>
  )
}
