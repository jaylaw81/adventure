const KEY = 'sq_global_muted'
const EVENT = 'sq-mute-change'

export function getGlobalMuted(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(KEY) === 'true'
}

export function setGlobalMuted(muted: boolean) {
  localStorage.setItem(KEY, String(muted))
  window.dispatchEvent(new Event(EVENT))
}

export function onGlobalMuteChange(cb: (muted: boolean) => void): () => void {
  const handler = () => cb(getGlobalMuted())
  window.addEventListener(EVENT, handler)
  return () => window.removeEventListener(EVENT, handler)
}
