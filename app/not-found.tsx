import Link from 'next/link'
import { Scroll, BookOpen, Compass, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'linear-gradient(135deg, #1a1025 0%, #0f172a 60%, #1a1025 100%)' }}
    >
      {/* Shimmer line */}
      <div
        className="fixed top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, #f59e0b66, #a78bfa66, transparent)' }}
      />

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 group mb-16">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all group-hover:brightness-110"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
        >
          <Scroll size={18} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="text-white font-extrabold text-xl tracking-tight group-hover:text-amber-300 transition-colors">
          Story<span className="text-amber-400">Questor</span>
        </span>
      </Link>

      {/* Big 404 */}
      <div className="relative mb-8 select-none">
        <p
          className="text-[9rem] sm:text-[12rem] font-black leading-none tracking-tighter"
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          404
        </p>
        {/* Faint glow behind number */}
        <div
          className="absolute inset-0 blur-3xl opacity-20 -z-10"
          style={{ background: 'radial-gradient(ellipse at center, #f59e0b, #a78bfa, transparent)' }}
        />
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
        This page doesn&apos;t exist
      </h1>
      <p className="text-gray-400 text-base max-w-sm mb-10 leading-relaxed">
        The story you&apos;re looking for may have been made private, deleted, or the link might be wrong.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-gray-900 transition-all hover:scale-105 hover:shadow-xl"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
        >
          <ArrowLeft size={15} />
          Back to Home
        </Link>
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-gray-200 border border-white/15 hover:bg-white/5 hover:border-white/30 transition-colors"
        >
          <Compass size={15} />
          Explore Stories
        </Link>
      </div>

      {/* Decorative story path */}
      <div className="mt-20 flex items-center gap-4 opacity-20">
        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <div className="w-12 h-px bg-amber-400/60" />
        <BookOpen size={16} className="text-amber-400" />
        <div className="w-12 h-px bg-purple-400/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-purple-400" />
        <div className="w-12 h-px bg-purple-400/40" />
        <div className="w-2.5 h-2.5 rounded-full border-2 border-purple-400/60" />
      </div>
      <p className="mt-3 text-xs text-white/20 tracking-widest uppercase">Dead end</p>
    </div>
  )
}
