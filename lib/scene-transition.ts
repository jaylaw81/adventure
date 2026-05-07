let band: HTMLDivElement | null = null
let safety: ReturnType<typeof setTimeout> | null = null

export function startSceneTransition(navigate: () => void): void {
  if (band) { navigate(); return }

  const b = document.createElement('div')
  band = b
  Object.assign(b.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '9000',
    background: '#1a1025',
    transform: 'translateX(-100%)',
    willChange: 'transform',
    pointerEvents: 'all',
    boxShadow: '6px 0 40px rgba(167,139,250,0.14)',
  })
  document.body.appendChild(b)

  let exitFired = false
  function startExit() {
    if (exitFired) return
    exitFired = true
    if (safety) { clearTimeout(safety); safety = null }
    window.removeEventListener('sq:scene-ready', startExit)
    b.style.transition = 'transform 240ms cubic-bezier(0.22, 1, 0.36, 1)'
    b.style.transform = 'translateX(100%)'
    setTimeout(() => { b.remove(); if (band === b) band = null }, 250)
  }

  window.addEventListener('sq:scene-ready', startExit, { once: true })

  // Cap the hold: exit no later than 110ms after entry completes even if
  // sq:scene-ready hasn't fired yet (keeps total visible duration ≤510ms).
  const ENTER_MS = 160
  const MAX_HOLD_MS = 110
  setTimeout(startExit, ENTER_MS + MAX_HOLD_MS)

  // Hard safety for pathological cases (error pages, very slow networks)
  safety = setTimeout(() => {
    b.style.transition = 'opacity 300ms ease'
    b.style.opacity = '0'
    setTimeout(() => { b.remove(); if (band === b) band = null }, 310)
  }, 5000)

  requestAnimationFrame(() => requestAnimationFrame(() => {
    b.style.transition = `transform ${ENTER_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`
    b.style.transform = 'translateX(0)'
  }))

  navigate()
}
