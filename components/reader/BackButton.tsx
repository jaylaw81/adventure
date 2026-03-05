'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function BackButton() {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm transition-colors"
    >
      <ArrowLeft size={16} />
      Back
    </button>
  )
}
