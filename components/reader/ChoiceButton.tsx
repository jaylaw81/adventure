import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

const CHOICE_EMOJIS = ['❤️', '😘', '🔥']

interface Props {
  href: string
  label: string
  index: number
}

export default function ChoiceButton({ href, label, index }: Props) {
  const emoji = CHOICE_EMOJIS[index]

  return (
    <Link
      href={href}
      className="flex items-center justify-between w-full px-5 py-4 bg-white border-2 border-amber-200 rounded-xl text-gray-800 font-medium hover:bg-amber-50 hover:border-amber-400 transition-all group shadow-sm"
    >
      <span className="flex items-center gap-3">
        {emoji && <span className="text-xl">{emoji}</span>}
        {label}
      </span>
      <ChevronRight size={18} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
    </Link>
  )
}
