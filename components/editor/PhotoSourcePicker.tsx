'use client'

import { useRef, useState } from 'react'
import { Sparkles, Upload, PenLine, RefreshCw, ImageOff } from 'lucide-react'
import DrawingCanvas from './DrawingCanvas'
import { fileToResizedDataUrl } from '@/lib/clientImageResize'

interface Props {
  imageUrl: string | null
  aspect: 'square' | 'portrait'
  generating: boolean
  canGenerate: boolean
  regenCount: number
  regenLimit?: number
  generateDisabledHint?: string
  onGenerate: (isRegen: boolean) => void
  onImageReady: (dataUrl: string) => void
  onRemove: () => void
}

export default function PhotoSourcePicker({
  imageUrl,
  aspect,
  generating,
  canGenerate,
  regenCount,
  regenLimit = 2,
  generateDisabledHint,
  onGenerate,
  onImageReady,
  onRemove,
}: Props) {
  const [changing, setChanging] = useState(false)
  const [drawOpen, setDrawOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const showPicker = !imageUrl || changing
  const isRegen = !!imageUrl
  const regenLimitReached = isRegen && regenCount >= regenLimit

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const dataUrl = await fileToResizedDataUrl(file)
      onImageReady(dataUrl)
      setChanging(false)
    } catch {
      // Silent failure — user can retry
    } finally {
      setUploading(false)
    }
  }

  function handleDrawSave(dataUrl: string) {
    setDrawOpen(false)
    setChanging(false)
    onImageReady(dataUrl)
  }

  return (
    <div>
      {imageUrl && !showPicker && (
        <div className="relative rounded-lg overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Illustration"
            className={`w-full object-cover rounded-lg ${aspect === 'portrait' ? 'aspect-[3/4]' : 'aspect-square'}`}
          />
          <div className="absolute top-1.5 right-1.5 flex gap-1">
            <button
              onClick={() => setChanging(true)}
              title="Change image"
              className="p-1.5 bg-[#0d0c1a]/70 hover:bg-[#0d0c1a]/90 text-white rounded-lg transition-colors"
            >
              <RefreshCw size={12} />
            </button>
            <button
              onClick={onRemove}
              title="Remove image"
              className="p-1.5 bg-[#0d0c1a]/70 hover:bg-red-600/80 text-white rounded-lg transition-colors"
            >
              <ImageOff size={12} />
            </button>
          </div>
        </div>
      )}

      {showPicker && (
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => { onGenerate(isRegen); setChanging(false) }}
            disabled={generating || !canGenerate || regenLimitReached}
            title={regenLimitReached ? `Regeneration limit reached (${regenLimit}/${regenLimit})` : undefined}
            className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles size={14} className={generating ? 'animate-pulse' : ''} />
            {generating ? 'Generating…' : 'Generate with AI'}
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-colors disabled:opacity-50"
          >
            <Upload size={14} />
            {uploading ? 'Uploading…' : 'Upload a photo'}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          <button
            onClick={() => setDrawOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
          >
            <PenLine size={14} />
            Draw it yourself
          </button>
          {imageUrl && changing && (
            <button
              onClick={() => setChanging(false)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors self-center mt-0.5"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {!canGenerate && !imageUrl && generateDisabledHint && (
        <p className="text-xs text-gray-400 mt-1">{generateDisabledHint}</p>
      )}

      {drawOpen && (
        <DrawingCanvas aspect={aspect} onSave={handleDrawSave} onClose={() => setDrawOpen(false)} />
      )}
    </div>
  )
}
