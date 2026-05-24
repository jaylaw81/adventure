'use client'

import { useState, useEffect, useRef } from 'react'
import { Music, Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { getGlobalMuted, onGlobalMuteChange } from '@/lib/globalMute'

interface Props {
  soundUrl: string
  soundTitle: string
}

export default function SceneAudioPlayer({ soundUrl, soundTitle }: Props) {
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [ready, setReady] = useState(false)
  const [globalMuted, setGlobalMutedState] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Create / swap audio element when URL changes
  useEffect(() => {
    const audio = new Audio(soundUrl)
    audio.loop = false
    audio.volume = volume
    audio.muted = getGlobalMuted() || muted
    audioRef.current = audio

    audio.oncanplaythrough = () => {
      setReady(true)
      audio.play()
        .then(() => setPlaying(true))
        .catch(() => {/* browser blocked autoplay — user can press play manually */})
    }
    audio.onerror = () => setReady(false)
    audio.onended = () => setPlaying(false)
    audio.load()

    setPlaying(false)
    setReady(false)

    return () => {
      audio.pause()
      audio.src = ''
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundUrl])

  // Sync with global mute toggle from the header
  useEffect(() => {
    setGlobalMutedState(getGlobalMuted())
    return onGlobalMuteChange((gm) => {
      setGlobalMutedState(gm)
      if (audioRef.current) audioRef.current.muted = gm || muted
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Apply combined mute whenever either flag changes
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = globalMuted || muted
  }, [globalMuted, muted])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio || !ready) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {})
    }
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return
    const next = !muted
    audio.muted = next
    setMuted(next)
  }

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    setVolume(val)
    if (audioRef.current) audioRef.current.volume = val
    if (val === 0) setMuted(true)
    else if (muted) {
      setMuted(false)
      if (audioRef.current) audioRef.current.muted = false
    }
  }

  const soundName = soundTitle.split(' by ')[0] ?? soundTitle
  const attribution = soundTitle.split(' by ').slice(1).join(' by ')

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-violet-100 mb-6"
      style={{ background: 'linear-gradient(135deg, #faf5ff, #f5f3ff)' }}>
      {/* Icon */}
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'linear-gradient(135deg, #a78bfa, #7c3aed)' }}>
        <Music size={14} className="text-white" />
      </div>

      {/* Track info + play */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            disabled={!ready}
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all disabled:opacity-40"
            style={{ background: playing ? 'linear-gradient(135deg, #a78bfa, #7c3aed)' : '#e9d5ff' }}
            aria-label={playing ? 'Pause' : 'Play scene music'}
          >
            {playing
              ? <Pause size={11} className="text-white" />
              : <Play size={11} className="text-violet-700" />}
          </button>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-violet-900 truncate leading-tight">{soundName}</p>
            {attribution && (
              <p className="text-[10px] text-violet-400 truncate">by {attribution}</p>
            )}
          </div>
        </div>
      </div>

      {/* Volume controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button onClick={toggleMute} className="text-violet-400 hover:text-violet-600 transition-colors" aria-label="Toggle mute">
          {(globalMuted || muted || volume === 0) ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={(globalMuted || muted) ? 0 : volume}
          onChange={handleVolume}
          className="w-16 accent-violet-500"
          aria-label="Volume"
        />
      </div>
    </div>
  )
}
