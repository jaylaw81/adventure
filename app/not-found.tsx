import Link from 'next/link'
import { BookOpen, Compass, ArrowLeft } from 'lucide-react'
import Header from '@/components/shared/Header'
import Footer from '@/components/shared/Footer'

function RippedPageAnimation() {
  return (
    <>
      <style>{`
        @keyframes rip-page {
          0%, 8%   { transform: translate(0px,   0px)   rotate(0deg)  skewX(0deg);  opacity: 0; }
          12%      { transform: translate(0px,   0px)   rotate(0deg)  skewX(0deg);  opacity: 1; }
          28%      { transform: translate(-4px, -18px)  rotate(-6deg) skewX(1deg);  opacity: 1; }
          48%      { transform: translate(18px, -58px)  rotate(18deg) skewX(-2deg); opacity: 1; }
          63%      { transform: translate(36px, -92px)  rotate(30deg) skewX(3deg);  opacity: 1; }
          76%      { transform: translate(52px, -116px) rotate(40deg) skewX(-2deg); opacity: 0.7; }
          88%      { transform: translate(64px, -132px) rotate(48deg) skewX(1deg);  opacity: 0.2; }
          95%, 100%{ transform: translate(72px, -142px) rotate(52deg) skewX(0deg);  opacity: 0; }
        }

        @keyframes rip-shadow {
          0%, 12%  { opacity: 0; }
          20%      { opacity: 0.18; }
          55%      { opacity: 0.10; }
          75%      { opacity: 0; }
          100%     { opacity: 0; }
        }

        @keyframes bit-a {
          0%,  40% { transform: translate(0px, 0px) rotate(0deg);   opacity: 0; }
          45%      { opacity: 1; }
          65%      { transform: translate(-18px, -28px) rotate(-55deg); opacity: 0.9; }
          82%      { transform: translate(-26px, -14px) rotate(-110deg); opacity: 0; }
          100%     { opacity: 0; }
        }
        @keyframes bit-b {
          0%,  44% { transform: translate(0px, 0px) rotate(0deg);   opacity: 0; }
          49%      { opacity: 1; }
          68%      { transform: translate(22px, -22px) rotate(70deg);  opacity: 0.9; }
          85%      { transform: translate(30px,  -8px) rotate(140deg); opacity: 0; }
          100%     { opacity: 0; }
        }
        @keyframes bit-c {
          0%,  48% { transform: translate(0px, 0px) rotate(0deg);   opacity: 0; }
          52%      { opacity: 0.8; }
          70%      { transform: translate(8px, -34px) rotate(40deg);  opacity: 0.7; }
          88%      { transform: translate(12px,-18px) rotate(90deg);  opacity: 0; }
          100%     { opacity: 0; }
        }

        @keyframes book-shake {
          0%,  18%, 100% { transform: rotate(0deg) translateX(0px); }
          22%             { transform: rotate(-1.5deg) translateX(-2px); }
          26%             { transform: rotate(1deg) translateX(1px); }
          30%             { transform: rotate(-0.5deg) translateX(-1px); }
          34%             { transform: rotate(0deg) translateX(0px); }
        }
      `}</style>

      {/* Outer container — sized to give the animation room to fly */}
      <div className="relative flex justify-center items-end mx-auto"
        style={{ width: 280, height: 200 }}>

        {/* ── Book ── */}
        <div style={{ animation: 'book-shake 4s ease-in-out infinite', transformOrigin: 'bottom center' }}>
          <div className="flex items-end relative">

            {/* Left page */}
            <div style={{
              width: 102, height: 134,
              background: 'linear-gradient(to right, #e8d4a8, #f2e0bc)',
              borderRadius: '6px 0 0 4px',
              border: '1px solid #c9a96a',
              borderRight: 'none',
              boxShadow: 'inset -6px 0 12px rgba(0,0,0,0.12), 3px 6px 18px rgba(0,0,0,0.35)',
              padding: '14px 10px 14px 16px',
              display: 'flex', flexDirection: 'column', gap: 7,
            }}>
              {[82, 68, 76, 60, 72, 58].map((w, i) => (
                <div key={i} style={{ height: 2.5, width: `${w}%`, background: 'rgba(110,70,20,0.18)', borderRadius: 2 }} />
              ))}
            </div>

            {/* Spine */}
            <div style={{
              width: 16, height: 138,
              background: 'linear-gradient(to right, #6b3f1e, #9c5f32, #7a4722, #6b3f1e)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.5)',
              flexShrink: 0,
            }} />

            {/* Right page (stays in the book — the "hole" left behind) */}
            <div style={{
              width: 102, height: 134,
              background: 'linear-gradient(to left, #f4deb8, #f2e0bc)',
              borderRadius: '0 6px 4px 0',
              border: '1px solid #c9a96a',
              borderLeft: 'none',
              boxShadow: 'inset 4px 0 10px rgba(0,0,0,0.08), -2px 6px 14px rgba(0,0,0,0.2)',
              padding: '14px 16px 14px 10px',
              display: 'flex', flexDirection: 'column', gap: 7,
            }}>
              {[70, 78, 55, 68, 62, 50].map((w, i) => (
                <div key={i} style={{ height: 2.5, width: `${w}%`, background: 'rgba(110,70,20,0.14)', borderRadius: 2 }} />
              ))}
            </div>
          </div>

          {/* Book cover bottom strip */}
          <div style={{
            height: 10, width: 220,
            background: 'linear-gradient(to bottom, #5a3418, #3d2210)',
            borderRadius: '0 0 6px 6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }} />
        </div>

        {/* ── Flying page shadow on book ── */}
        <div style={{
          position: 'absolute',
          bottom: 10,
          left: '50%',
          marginLeft: 8,
          width: 98,
          height: 130,
          background: 'rgba(0,0,0,0.25)',
          filter: 'blur(6px)',
          borderRadius: 4,
          animation: 'rip-shadow 4s ease-in-out infinite',
          transformOrigin: 'bottom left',
        }} />

        {/* ── Ripping page ── */}
        <div style={{
          position: 'absolute',
          bottom: 10,
          left: '50%',
          marginLeft: 8,
          width: 98,
          height: 130,
          animation: 'rip-page 4s ease-in-out infinite',
          transformOrigin: 'bottom left',
          zIndex: 10,
        }}>
          {/* Page body with torn left edge (where it was bound) */}
          <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #fffef2, #f8efd4)',
            boxShadow: '2px 2px 10px rgba(0,0,0,0.22)',
            clipPath: `polygon(
              10% 0%, 100% 0%, 100% 100%,
              0% 100%, 4% 91%, 10% 84%, 2% 76%,
              8% 68%, 1% 60%, 7% 52%,
              0% 44%, 6% 36%, 1% 28%,
              9% 20%, 3% 12%, 10% 4%
            )`,
            padding: '12px 12px 12px 18px',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {[78, 88, 68, 82, 72, 60, 76].map((w, i) => (
              <div key={i} style={{ height: 2.5, width: `${w}%`, background: 'rgba(90,55,15,0.16)', borderRadius: 2 }} />
            ))}
            {/* Faint "text" character marks */}
            <div style={{ display: 'flex', gap: 3, marginTop: 2 }}>
              {[12, 8, 14, 6, 10].map((w, i) => (
                <div key={i} style={{ height: 2.5, width: w, background: 'rgba(90,55,15,0.12)', borderRadius: 2 }} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Torn paper bits ── */}
        <div style={{
          position: 'absolute', bottom: 18, left: '51%', marginLeft: 12,
          width: 7, height: 9,
          background: '#f5e6c0',
          borderRadius: 1,
          clipPath: 'polygon(0% 0%, 100% 10%, 90% 100%, 5% 88%)',
          animation: 'bit-a 4s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: 14, left: '53%', marginLeft: 16,
          width: 5, height: 7,
          background: '#fffef0',
          borderRadius: 1,
          clipPath: 'polygon(10% 0%, 100% 5%, 88% 100%, 0% 90%)',
          animation: 'bit-b 4s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: 22, left: '52%', marginLeft: 8,
          width: 4, height: 6,
          background: '#f2e0b8',
          borderRadius: 1,
          animation: 'bit-c 4s ease-in-out infinite',
        }} />
      </div>
    </>
  )
}

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main
        className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center"
        style={{ background: 'linear-gradient(135deg, #1a1025 0%, #0f172a 60%, #1a1025 100%)' }}
      >
        {/* Big 404 */}
        <div className="relative mb-6 select-none">
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
          <div
            className="absolute inset-0 blur-3xl opacity-20 -z-10"
            style={{ background: 'radial-gradient(ellipse at center, #f59e0b, #a78bfa, transparent)' }}
          />
        </div>

        {/* Animated ripped page */}
        <RippedPageAnimation />

        <h1 className="text-2xl sm:text-3xl font-bold text-white mt-8 mb-3">
          This page doesn&apos;t exist
        </h1>
        <p className="text-gray-400 text-base max-w-sm mb-10 leading-relaxed">
          The story you&apos;re looking for may have been made private, deleted, or the link might be wrong.
        </p>

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
        <div className="mt-16 flex items-center gap-4 opacity-20">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-12 h-px bg-amber-400/60" />
          <BookOpen size={16} className="text-amber-400" />
          <div className="w-12 h-px bg-purple-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-purple-400" />
          <div className="w-12 h-px bg-purple-400/40" />
          <div className="w-2.5 h-2.5 rounded-full border-2 border-purple-400/60" />
        </div>
        <p className="mt-3 text-xs text-white/20 tracking-widest uppercase">Dead end</p>
      </main>
      <Footer />
    </div>
  )
}
