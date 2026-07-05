'use client'

import { Check } from 'lucide-react'

const STEPS = ['Account', 'Profile', 'Subscribe']

interface Props {
  step: 1 | 2 | 3
  theme?: 'light' | 'dark'
}

export default function OnboardingProgress({ step, theme = 'light' }: Props) {
  const dark = theme === 'dark'

  return (
    <div className="flex items-start w-full max-w-xs mx-auto select-none">
      {STEPS.map((label, i) => {
        const n = i + 1
        const done = n < step
        const active = n === step

        return (
          <div key={label} className={`flex items-start ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
            {/* Step node */}
            <div className="flex flex-col items-center shrink-0">
              <div
                className={[
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                  done
                    ? 'bg-amber-500 text-white'
                    : active
                      ? dark
                        ? 'bg-white text-violet-900'
                        : 'bg-violet-600 text-white'
                      : dark
                        ? 'bg-white/10 text-white/30'
                        : 'bg-gray-100 text-gray-400',
                  active && (dark ? 'ring-4 ring-white/15' : 'ring-4 ring-violet-100'),
                ].filter(Boolean).join(' ')}
              >
                {done ? <Check size={13} strokeWidth={3} /> : n}
              </div>
              <span
                className={[
                  'text-[11px] mt-1.5 whitespace-nowrap',
                  done
                    ? dark ? 'text-amber-300 font-medium' : 'text-amber-600 font-medium'
                    : active
                      ? dark ? 'text-white font-semibold' : 'text-violet-700 font-semibold'
                      : dark ? 'text-white/30' : 'text-gray-400',
                ].filter(Boolean).join(' ')}
              >
                {label}
              </span>
            </div>

            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div className="flex-1 mt-4 px-2">
                <div
                  className={[
                    'h-px w-full',
                    done
                      ? dark ? 'bg-amber-400/60' : 'bg-amber-300'
                      : dark ? 'bg-white/10' : 'bg-gray-200',
                  ].join(' ')}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
