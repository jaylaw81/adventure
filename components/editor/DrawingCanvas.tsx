'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { X, Undo2, Trash2, PenLine } from 'lucide-react'

interface Stroke {
  points: { x: number; y: number }[]
  color: string
  size: number
}

interface Props {
  aspect: 'square' | 'portrait'
  onSave: (dataUrl: string) => void
  onClose: () => void
}

const COLORS = [
  '#171717', '#ffffff', '#78350f', '#ef4444', '#f97316',
  '#f59e0b', '#22c55e', '#14b8a6', '#3b82f6', '#a78bfa',
]

const SIZES = [
  { label: 'Thin', value: 3 },
  { label: 'Medium', value: 8 },
  { label: 'Thick', value: 18 },
]

export default function DrawingCanvas({ aspect, onSave, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [color, setColor] = useState(COLORS[0])
  const [size, setSize] = useState(SIZES[1].value)
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [confirmClear, setConfirmClear] = useState(false)
  const drawingRef = useRef<Stroke | null>(null)

  const dims = aspect === 'portrait' ? { width: 720, height: 960 } : { width: 800, height: 800 }

  const redraw = useCallback((allStrokes: Stroke[]) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    for (const stroke of allStrokes) {
      if (stroke.points.length === 0) continue
      ctx.strokeStyle = stroke.color
      ctx.lineWidth = stroke.size
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
      for (const p of stroke.points.slice(1)) ctx.lineTo(p.x, p.y)
      if (stroke.points.length === 1) ctx.lineTo(stroke.points[0].x + 0.1, stroke.points[0].y + 0.1)
      ctx.stroke()
    }
  }, [])

  useEffect(() => { redraw(strokes) }, [strokes, redraw])

  function getPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    }
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    canvasRef.current?.setPointerCapture(e.pointerId)
    const stroke: Stroke = { points: [getPos(e)], color, size }
    drawingRef.current = stroke
    redraw([...strokes, stroke])
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return
    drawingRef.current.points.push(getPos(e))
    redraw([...strokes, drawingRef.current])
  }

  function handlePointerUp() {
    const finished = drawingRef.current
    if (!finished) return
    drawingRef.current = null
    setStrokes(prev => [...prev, finished])
  }

  function handleUndo() {
    setStrokes(prev => prev.slice(0, -1))
  }

  function handleClear() {
    if (!confirmClear) { setConfirmClear(true); return }
    setStrokes([])
    setConfirmClear(false)
  }

  function handleUse() {
    const canvas = canvasRef.current
    if (!canvas) return
    onSave(canvas.toDataURL('image/png'))
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ backgroundColor: 'rgba(13,12,26,0.75)' }} onClick={onClose} />
      <div
        className="relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1e1b3a 0%, #0f172a 100%)' }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, #f59e0b88, #a78bfa66, transparent)' }}
        />

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #f59e0b33, #f9731633)' }}
            >
              <PenLine size={16} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Draw your illustration</h2>
              <p className="text-xs text-slate-400 mt-0.5">Sketch directly on the page</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors shrink-0 mt-0.5"
          >
            <X size={15} />
          </button>
        </div>

        <div className="px-6 pb-6 flex flex-col gap-4">
          {/* Canvas */}
          <div className="rounded-xl overflow-hidden border border-white/10 bg-white flex items-center justify-center mx-auto" style={{ maxWidth: '100%' }}>
            <canvas
              ref={canvasRef}
              width={dims.width}
              height={dims.height}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className="touch-none cursor-crosshair w-full h-auto block"
              style={{ maxHeight: '48vh' }}
            />
          </div>

          {/* Tools */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${color === c ? 'scale-110 border-amber-400' : 'border-white/20'}`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              {SIZES.map(s => (
                <button
                  key={s.value}
                  onClick={() => setSize(s.value)}
                  title={s.label}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    size === s.value ? 'bg-amber-500/25 border border-amber-400' : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span className="rounded-full bg-white" style={{ width: Math.min(s.value, 14), height: Math.min(s.value, 14) }} />
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleUndo}
                disabled={strokes.length === 0}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <Undo2 size={13} /> Undo
              </button>
              <button
                onClick={handleClear}
                onBlur={() => setConfirmClear(false)}
                disabled={strokes.length === 0}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors disabled:opacity-30 ${
                  confirmClear ? 'text-red-300 bg-red-500/15' : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Trash2 size={13} /> {confirmClear ? 'Confirm clear?' : 'Clear'}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/12 text-sm text-slate-400 hover:bg-white/6 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUse}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-900 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: '#f59e0b' }}
            >
              Use Drawing
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
