'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface Props {
  title: string
  description?: string
  inputLabel: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
  icon?: React.ReactNode
}

export default function InputModal({
  title,
  description,
  inputLabel,
  placeholder,
  value,
  onChange,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  loading,
  icon,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 50)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onCancel])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (value.trim() && !loading) onConfirm()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1e1b3a 0%, #0f172a 100%)' }}
      >
        {/* Top shimmer */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, #f59e0b88, #a78bfa66, transparent)' }}
        />

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #f59e0b33, #f9731633)' }}
              >
                <span className="text-amber-400">{icon}</span>
              </div>
            )}
            <div>
              <h2 className="text-base font-bold text-white">{title}</h2>
              {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors shrink-0 mt-0.5"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
            {inputLabel}
          </label>
          <input
            ref={inputRef}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={200}
            className="w-full px-4 py-2.5 rounded-xl bg-white/8 border border-white/12 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          />

          <div className="flex gap-2 mt-5">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/12 text-sm text-slate-400 hover:bg-white/6 hover:text-white transition-colors"
              style={{ borderColor: 'rgba(255,255,255,0.1)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !value.trim()}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-900 disabled:opacity-40 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
            >
              {loading ? '…' : confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
