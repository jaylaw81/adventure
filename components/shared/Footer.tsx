import Link from 'next/link'
import { Scroll } from 'lucide-react'
import CookieSettingsButton from '@/components/gdpr/CookieSettingsButton'
import FeedbackFooterLink from '@/components/shared/FeedbackFooterLink'

const LINK_COLUMNS = [
  {
    label: 'Discover',
    links: [
      { href: '/explore', label: 'Explore stories' },
      { href: '/demo', label: 'Try the demo' },
      { href: '/pricing', label: 'Pricing' },
    ],
  },
  {
    label: 'Learn',
    links: [
      { href: '/guide', label: 'Writing guide' },
      { href: '/how-to', label: 'How it works' },
      { href: '/organizations', label: 'For schools' },
    ],
  },
  {
    label: 'Resources',
    links: [
      { href: '/resources', label: 'All resources' },
      { href: '/resources/choose-your-own-adventure-history', label: 'CYOA history' },
      { href: '/resources/interactive-fiction-history', label: 'IF history' },
      { href: '/blog', label: 'Blog' },
    ],
  },
  {
    label: 'Help',
    links: [
      { href: 'https://discord.gg/SkP85wW3', label: 'Support', external: true },
      { href: '/privacy', label: 'Privacy policy' },
      { href: '/terms', label: 'Terms of service' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-violet-100 mt-auto" style={{ background: 'white' }}>
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-6">

        {/* Main area: logo + link grid */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-20">

          {/* Logo + tagline */}
          <div className="shrink-0">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all group-hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #f59e0b)' }}
              >
                <Scroll size={14} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="font-extrabold text-base tracking-tight" style={{ color: '#1e0a3c' }}>
                Story<span style={{ color: '#7c3aed' }}>Questor</span>
              </span>
            </Link>
            <p className="text-sm mt-3 leading-relaxed" style={{ color: '#9ca3af', maxWidth: '18ch' }}>
              Branching stories where every choice matters.
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 flex-1">
            {LINK_COLUMNS.map(col => (
              <div key={col.label}>
                <p className="text-xs font-semibold mb-3" style={{ color: '#374151' }}>
                  {col.label}
                </p>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map(link => (
                    <li key={link.href}>
                      {'external' in link && link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm hover:opacity-70 transition-opacity"
                          style={{ color: '#6d28d9' }}
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm hover:opacity-70 transition-opacity"
                          style={{ color: '#6d28d9' }}
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                  {col.label === 'Help' && (
                    <>
                      <li>
                        <FeedbackFooterLink
                          className="text-sm hover:opacity-70 transition-opacity"
                          style={{ color: '#6d28d9' }}
                        />
                      </li>
                      <li>
                        <CookieSettingsButton
                          className="text-sm hover:opacity-70 transition-opacity"
                          style={{ color: '#6d28d9' }}
                        >
                          Cookie preferences
                        </CookieSettingsButton>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar: social + copyright */}
        <div className="border-t border-violet-100 mt-8 pt-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="https://discord.gg/SkP85wW3"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="StoryQuestor Discord"
              className="transition-opacity hover:opacity-60"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="#a78bfa" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
              </svg>
            </a>
            <a
              href="https://www.facebook.com/StoryQuestor"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="StoryQuestor on Facebook"
              className="transition-opacity hover:opacity-60"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="#a78bfa" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.514c-1.491 0-1.956.932-1.956 1.887v2.266h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
            </a>
          </div>
          <p className="text-xs" style={{ color: '#a78bfa' }}>
            © {new Date().getFullYear()} StoryQuestor
          </p>
        </div>

      </div>
    </footer>
  )
}
