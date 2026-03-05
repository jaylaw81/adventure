'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

const CHOICE_EMOJIS = ['❤️', '😘', '🔥']

interface Props {
  content: string
  choices: { label: string }[]
}

export default function CopySceneButton({ content, choices }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const lines: string[] = []

    if (content) lines.push(content)

    if (choices.length > 0) {
      lines.push('', 'What do you do?')
      choices.forEach((choice, i) => {
        const emoji = CHOICE_EMOJIS[i] ?? '▶️'
        lines.push(`${emoji} ${choice.label}`)
      })
    }

    await navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 rounded-lg transition-colors bg-white"
      title="Copy scene for SMS"
    >
      {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
      {copied ? 'Copied!' : 'Copy for SMS'}
    </button>
  )
}
