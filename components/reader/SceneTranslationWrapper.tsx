'use client'

import { useState, useEffect, useCallback } from 'react'
import { Globe, Loader2 } from 'lucide-react'
import ChoiceButton from './ChoiceButton'
import SceneAudioPlayer from './SceneAudioPlayer'
import { getLanguageName, normalizeLanguageCode } from '@/lib/languages'
import type { Node } from '@/lib/schema'

interface Choice {
  id: string
  label: string
  targetNodeId: string
}

interface TranslatedData {
  title: string
  content: string
  choiceLabels: string[]
}

interface Props {
  node: Node
  /** Pass choices for standard path stories. Pass [] for WorldBuilder (choices handled externally). */
  choices: Choice[]
  adventureId: string
  storyLanguage: string
  /** From session for logged-in users. null for guests — browser language used instead. */
  userLanguage: string | null
  dark?: boolean
}

function prefKey(adventureId: string) { return `sq_translation:${adventureId}` }
function declinedKey(adventureId: string) { return `sq_translation_declined:${adventureId}` }
function cacheKey(adventureId: string, nodeId: string, lang: string) {
  return `sq_tc:${adventureId}:${nodeId}:${lang}`
}

export default function SceneTranslationWrapper({
  node,
  choices,
  adventureId,
  storyLanguage,
  userLanguage,
  dark = false,
}: Props) {
  type Phase = 'idle' | 'offered' | 'translating' | 'translated' | 'error'
  const [phase, setPhase] = useState<Phase>('idle')
  const [translatedData, setTranslatedData] = useState<TranslatedData | null>(null)
  const [targetLang, setTargetLang] = useState<string | null>(null)
  const [sourceName, setSourceName] = useState('')
  const [targetName, setTargetName] = useState('')

  const doTranslate = useCallback(async (target: string, source: string) => {
    setPhase('translating')

    const cKey = cacheKey(adventureId, node.id, target)
    try {
      const hit = sessionStorage.getItem(cKey)
      if (hit) {
        setTranslatedData(JSON.parse(hit) as TranslatedData)
        setPhase('translated')
        return
      }
    } catch { /* ignore */ }

    const textsToTranslate = [
      node.title || '',
      node.content || '',
      ...choices.map(c => c.label),
    ]

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: textsToTranslate, targetLanguage: target, sourceLanguage: source }),
      })

      if (!res.ok) throw new Error('Translation failed')

      const { translations } = (await res.json()) as { translations: string[] }
      const data: TranslatedData = {
        title: translations[0] ?? node.title,
        content: translations[1] ?? node.content,
        choiceLabels: translations.slice(2),
      }

      try { sessionStorage.setItem(cKey, JSON.stringify(data)) } catch { /* ignore */ }
      setTranslatedData(data)
      setPhase('translated')
    } catch {
      setPhase('error')
      setTimeout(() => setPhase('idle'), 3000)
    }
  }, [node, choices, adventureId])

  useEffect(() => {
    const rawTarget = userLanguage || (typeof navigator !== 'undefined' ? navigator.language : null)
    if (!rawTarget) return

    const target = normalizeLanguageCode(rawTarget)
    const source = normalizeLanguageCode(storyLanguage)
    if (!target || target === source) return

    setTargetLang(target)
    setSourceName(getLanguageName(source))
    setTargetName(getLanguageName(target))

    try {
      const declined = sessionStorage.getItem(declinedKey(adventureId))
      if (declined) return

      const pref = sessionStorage.getItem(prefKey(adventureId))
      if (pref === target) {
        doTranslate(target, source)
      } else {
        setPhase('offered')
      }
    } catch {
      setPhase('offered')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleTranslate = useCallback(() => {
    if (!targetLang) return
    const source = normalizeLanguageCode(storyLanguage)
    try { sessionStorage.setItem(prefKey(adventureId), targetLang) } catch { /* ignore */ }
    doTranslate(targetLang, source)
  }, [targetLang, storyLanguage, adventureId, doTranslate])

  const handleDecline = useCallback(() => {
    try { sessionStorage.setItem(declinedKey(adventureId), '1') } catch { /* ignore */ }
    setPhase('idle')
  }, [adventureId])

  const handleShowOriginal = useCallback(() => {
    try { sessionStorage.removeItem(prefKey(adventureId)) } catch { /* ignore */ }
    setTranslatedData(null)
    setPhase('offered')
  }, [adventureId])

  const isTranslated = phase === 'translated' && translatedData !== null
  const displayTitle = isTranslated ? translatedData.title : (node.title || '')
  const displayContent = isTranslated ? translatedData.content : (node.content || '')

  return (
    <div>
      {/* ── Scene content ── */}
      <div className="max-w-2xl mx-auto">
        {node.soundUrl && node.soundTitle && (
          <SceneAudioPlayer soundUrl={node.soundUrl} soundTitle={node.soundTitle} />
        )}

        {node.imageUrl && (
          <div className="relative w-full h-64 rounded-2xl overflow-hidden mb-6 shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={node.imageUrl}
              alt={node.title || 'Scene illustration'}
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${
              node.nodeType === 'ending'
                ? 'from-purple-900/60 to-transparent'
                : 'from-black/40 to-transparent'
            }`} />
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              {node.nodeType === 'start' && (
                <span className="px-2 py-0.5 bg-green-500/90 text-white text-xs rounded-full font-medium">Start</span>
              )}
              {node.nodeType === 'ending' && (
                <span className="px-2 py-0.5 bg-purple-500/90 text-white text-xs rounded-full font-medium">Ending</span>
              )}
            </div>
          </div>
        )}

        {!node.imageUrl && (node.nodeType === 'start' || node.nodeType === 'ending') && (
          <div className="mb-4 flex items-center gap-2">
            {node.nodeType === 'start' && (
              <span className={`px-2.5 py-1 text-xs rounded-full font-semibold ${dark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'}`}>Start</span>
            )}
            {node.nodeType === 'ending' && (
              <span className={`px-2.5 py-1 text-xs rounded-full font-semibold ${dark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>Ending</span>
            )}
          </div>
        )}

        <h1 className={`text-3xl font-bold mb-6 ${dark ? 'text-white' : 'text-gray-900'}`}>
          {phase === 'translating' ? (
            <span className="inline-flex items-center gap-2">
              {node.title || 'Untitled Scene'}
              <Loader2 size={18} className={`animate-spin ${dark ? 'text-white/30' : 'text-gray-300'}`} />
            </span>
          ) : displayTitle || 'Untitled Scene'}
        </h1>

        <div className={`prose prose-lg leading-relaxed whitespace-pre-wrap ${dark ? 'text-white/85 prose-invert' : 'text-gray-700'} ${phase === 'translating' ? 'opacity-40 transition-opacity' : ''}`}>
          {displayContent || <em className={dark ? 'text-white/40' : 'text-gray-400'}>No content written yet.</em>}
        </div>
      </div>

      {/* ── Translation status strip ── */}
      {phase === 'offered' && targetLang && (
        <div className={`mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm ${
          dark
            ? 'bg-violet-900/30 border border-violet-500/20'
            : 'bg-violet-50 border border-violet-100'
        }`}>
          <span className={`flex items-center gap-2 ${dark ? 'text-white/70' : 'text-gray-600'}`}>
            <Globe size={14} className={dark ? 'text-violet-400' : 'text-violet-500'} />
            This story is in <strong className="mx-0.5">{sourceName}</strong> — translate to <strong className="mx-0.5">{targetName}</strong>?
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTranslate}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white transition-colors"
            >
              Translate
            </button>
            <button
              onClick={handleDecline}
              className={`px-2 py-1.5 rounded-lg text-xs transition-colors ${
                dark ? 'text-white/40 hover:text-white/60' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Keep original
            </button>
          </div>
        </div>
      )}

      {phase === 'translating' && (
        <div className={`mt-4 flex items-center gap-2 text-sm ${dark ? 'text-white/40' : 'text-gray-400'}`}>
          <Loader2 size={13} className="animate-spin" />
          Translating…
        </div>
      )}

      {phase === 'error' && (
        <p className={`mt-4 text-xs ${dark ? 'text-red-400/60' : 'text-red-400'}`}>
          Translation unavailable — showing original.
        </p>
      )}

      {/* ── Choices (standard path stories) ── */}
      {choices.length > 0 && (
        <div className="mt-10 flex flex-col gap-3">
          <p className={`text-sm font-medium mb-1 ${dark ? 'text-white/50' : 'text-gray-500'}`}>What do you do?</p>
          {choices.map((choice, index) => (
            <ChoiceButton
              key={choice.id}
              href={`/play/${adventureId}/${choice.targetNodeId}`}
              label={isTranslated && translatedData.choiceLabels[index] ? translatedData.choiceLabels[index] : choice.label}
              index={index}
              adventureId={adventureId}
            />
          ))}
        </div>
      )}

      {/* ── Translated attribution ── */}
      {phase === 'translated' && (
        <div className={`mt-5 flex items-center gap-1.5 text-xs ${dark ? 'text-white/35' : 'text-gray-400'}`}>
          <Globe size={11} />
          Translated from {sourceName}
          <span className="mx-0.5">·</span>
          <button
            onClick={handleShowOriginal}
            className={`underline underline-offset-2 hover:no-underline transition-all ${
              dark ? 'text-white/45 hover:text-white/65' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Show original
          </button>
        </div>
      )}
    </div>
  )
}
