'use client'

import { useState, useEffect } from 'react'
import { X, Sparkles, RefreshCw, ImageOff, BookOpen, Flag } from 'lucide-react'
import type { Node } from '@/lib/schema'
import SoundPicker from '@/components/editor/SoundPicker'
import PhotoSourcePicker from '@/components/editor/PhotoSourcePicker'

interface Props {
  block: Node
  adventureId: string
  storyType?: string | null
  onClose: () => void
  onBlockUpdate: (updated: Partial<Node> & { id: string }) => void
}

const TYPE_LABELS: Record<string, string> = {
  start: 'Story Start',
  scene: 'Scene',
  ending: 'The End',
  chapter_end: 'Chapter End',
}

const SWITCHABLE_TYPES = [
  { value: 'scene', label: 'Scene', icon: BookOpen, description: 'A branching story scene with choices' },
  { value: 'ending', label: 'The End', icon: Flag, description: 'A terminal scene that ends the story' },
] as const

export default function BlockSidebar({ block, adventureId, storyType, onClose, onBlockUpdate }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(block.imageUrl ?? null)
  const [imagePosition, setImagePosition] = useState<'left' | 'right'>((block.imagePosition as 'left' | 'right') ?? 'right')
  const [soundUrl, setSoundUrl] = useState<string | null>(block.soundUrl ?? null)
  const [soundTitle, setSoundTitle] = useState<string | null>(block.soundTitle ?? null)
  const [nodeType, setNodeType] = useState<Node['nodeType']>(block.nodeType)
  const [generatingImage, setGeneratingImage] = useState(false)
  const [regenCount, setRegenCount] = useState(0)
  const isStorybook = storyType === 'storybook'

  useEffect(() => {
    setImageUrl(block.imageUrl ?? null)
    setImagePosition((block.imagePosition as 'left' | 'right') ?? 'right')
    setSoundUrl(block.soundUrl ?? null)
    setSoundTitle(block.soundTitle ?? null)
    setNodeType(block.nodeType)
    setRegenCount(0)
    setGeneratingImage(false)
  }, [block.id])

  async function handleGenerateImage(isRegen = false) {
    const next = isRegen ? regenCount + 1 : regenCount
    if (isRegen) setRegenCount(next)
    setGeneratingImage(true)
    try {
      const res = await fetch(`/api/adventures/${adventureId}/nodes/${block.id}/image`, { method: 'POST' })
      if (res.ok) {
        const updated: Node = await res.json()
        setImageUrl(updated.imageUrl ?? null)
        onBlockUpdate({ id: block.id, imageUrl: updated.imageUrl ?? null })
      }
    } finally {
      setGeneratingImage(false)
    }
  }

  async function handleRemoveImage() {
    await fetch(`/api/adventures/${adventureId}/nodes/${block.id}/image`, { method: 'DELETE' })
    setImageUrl(null)
    onBlockUpdate({ id: block.id, imageUrl: null })
  }

  async function handleSetImage(dataUrl: string) {
    setGeneratingImage(true)
    try {
      const source = dataUrl.startsWith('data:image/png') ? 'draw' : 'upload'
      const res = await fetch(`/api/adventures/${adventureId}/nodes/${block.id}/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, dataUrl }),
      })
      if (res.ok) {
        const updated: Node = await res.json()
        setImageUrl(updated.imageUrl ?? null)
        onBlockUpdate({ id: block.id, imageUrl: updated.imageUrl ?? null })
      }
    } finally {
      setGeneratingImage(false)
    }
  }

  async function handleImagePositionChange(pos: 'left' | 'right') {
    setImagePosition(pos)
    await fetch(`/api/adventures/${adventureId}/nodes/${block.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imagePosition: pos }),
    })
    onBlockUpdate({ id: block.id, imagePosition: pos })
  }

  async function handleSoundSelect(url: string, title: string) {
    setSoundUrl(url)
    setSoundTitle(title)
    await fetch(`/api/adventures/${adventureId}/nodes/${block.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ soundUrl: url, soundTitle: title }),
    })
    onBlockUpdate({ id: block.id, soundUrl: url, soundTitle: title })
  }

  async function handleTypeChange(type: 'scene' | 'ending') {
    setNodeType(type)
    const res = await fetch(`/api/adventures/${adventureId}/nodes/${block.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodeType: type }),
    })
    if (res.ok) {
      const updated = await res.json()
      onBlockUpdate({ id: block.id, nodeType: updated.nodeType })
    }
  }

  async function handleSoundRemove() {
    setSoundUrl(null)
    setSoundTitle(null)
    await fetch(`/api/adventures/${adventureId}/nodes/${block.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ soundUrl: null, soundTitle: null }),
    })
    onBlockUpdate({ id: block.id, soundUrl: null, soundTitle: null })
  }

  const hasContent = !!block.content?.trim()

  return (
    <div className="w-[26rem] shrink-0 h-full bg-white border-l border-gray-200 shadow-xl flex flex-col">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 min-h-[52px]">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {TYPE_LABELS[block.nodeType] ?? 'Scene'}
          </p>
          <p className="text-sm font-semibold text-gray-900 truncate mt-0.5">
            {block.title || 'Untitled'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
          title="Close panel"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">

        {/* Scene Type — switchable for non-start blocks */}
        {block.nodeType !== 'start' && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Scene Type</label>
            <div className="flex gap-2">
              {SWITCHABLE_TYPES.map(({ value, label, icon: Icon, description }) => (
                <button
                  key={value}
                  onClick={() => nodeType !== value && handleTypeChange(value)}
                  className={`flex-1 flex flex-col items-start gap-1 p-2.5 rounded-lg border-2 text-left transition-all ${
                    nodeType === value
                      ? value === 'ending'
                        ? 'border-purple-400 bg-purple-50'
                        : 'border-indigo-400 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon size={12} className={
                      nodeType === value
                        ? value === 'ending' ? 'text-purple-600' : 'text-indigo-600'
                        : 'text-gray-400'
                    } />
                    <span className={`text-xs font-semibold ${
                      nodeType === value
                        ? value === 'ending' ? 'text-purple-700' : 'text-indigo-700'
                        : 'text-gray-600'
                    }`}>{label}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 leading-tight">{description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scene Image */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">{isStorybook ? 'Page Image' : 'Scene Image'}</label>
          {isStorybook ? (
            <PhotoSourcePicker
              imageUrl={imageUrl}
              aspect="square"
              generating={generatingImage}
              canGenerate={hasContent}
              regenCount={regenCount}
              generateDisabledHint="Add page text first to generate an image"
              onGenerate={isRegen => handleGenerateImage(isRegen)}
              onImageReady={handleSetImage}
              onRemove={handleRemoveImage}
            />
          ) : imageUrl ? (
            <div className="relative rounded-lg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Scene illustration" className="w-full object-cover rounded-lg" />
              <div className="absolute top-1.5 right-1.5 flex gap-1">
                <button
                  onClick={() => handleGenerateImage(true)}
                  disabled={generatingImage || regenCount >= 2}
                  title={regenCount >= 2 ? 'Regeneration limit reached (2/2)' : `Regenerate (${regenCount}/2 used)`}
                  className="p-1.5 bg-[#0d0c1a]/70 hover:bg-[#0d0c1a]/90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw size={12} className={generatingImage ? 'animate-spin' : ''} />
                </button>
                <button
                  onClick={handleRemoveImage}
                  title="Remove image"
                  className="p-1.5 bg-[#0d0c1a]/70 hover:bg-red-600/80 text-white rounded-lg transition-colors"
                >
                  <ImageOff size={12} />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => handleGenerateImage()}
              disabled={generatingImage || !hasContent}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles size={15} className={generatingImage ? 'animate-pulse' : ''} />
              {generatingImage ? 'Generating…' : 'Generate Image with AI'}
            </button>
          )}
          {!isStorybook && !hasContent && !imageUrl && (
            <p className="text-xs text-gray-400 mt-1.5">Add scene text first to generate an image</p>
          )}
        </div>

        {/* Page layout — Storybook only */}
        {isStorybook && imageUrl && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Image Position</label>
            <div className="flex gap-2">
              {(['left', 'right'] as const).map(pos => (
                <button
                  key={pos}
                  onClick={() => handleImagePositionChange(pos)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border-2 transition-colors capitalize ${
                    imagePosition === pos
                      ? 'border-teal-400 bg-teal-50 text-teal-700'
                      : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Image {pos}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scene Sound */}
        <SoundPicker
          currentSoundUrl={soundUrl}
          currentSoundTitle={soundTitle}
          onSelect={handleSoundSelect}
          onRemove={handleSoundRemove}
        />
      </div>
    </div>
  )
}
