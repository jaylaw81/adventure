'use client'

import { useEffect, useRef } from 'react'

export default function SceneEntrance({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const animated = useRef(false)

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('sq:scene-ready'))

    if (animated.current) return
    animated.current = true

    const el = ref.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.opacity = '1'
      return
    }

    el.animate(
      [
        { opacity: '0', transform: 'translateY(10px)' },
        { opacity: '1', transform: 'none' },
      ],
      { duration: 260, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' }
    )
  }, [])

  return (
    <div ref={ref} className="scene-entrance">
      {children}
    </div>
  )
}
