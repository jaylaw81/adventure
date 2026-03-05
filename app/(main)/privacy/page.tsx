import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | StoryQuestor',
  description: 'Privacy policy for StoryQuestor — how we collect, use, and protect your data.',
  robots: { index: true, follow: true },
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
      <div className="text-gray-600 text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

export default function PrivacyPage() {
  const updated = 'March 5, 2026'

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400">Last updated: {updated}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">

        <Section title="Overview">
          <p>
            StoryQuestor (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the website{' '}
            <a href="https://www.storyquestor.com" className="text-amber-600 hover:underline">
              www.storyquestor.com
            </a>{' '}
            (the &quot;Service&quot;). This policy explains what information we collect, how we use it, and
            your rights regarding your data. By using StoryQuestor you agree to the practices described here.
          </p>
        </Section>

        <Section title="Information We Collect">
          <p><strong>Account information</strong> — when you sign in with Google we receive your name, email address, and profile picture from your Google account. We store your email as your account identifier.</p>
          <p><strong>Profile information</strong> — you may optionally provide a display name. You are required to provide a date of birth so we can apply age-appropriate content filters. We store this in our database but do not share it with third parties.</p>
          <p><strong>Content you create</strong> — story titles, scene text, choices, tags, and audience settings you author on StoryQuestor are stored in our database and, if you choose to make them public, are visible to other users.</p>
          <p><strong>Usage data</strong> — we collect anonymised analytics data (pages visited, actions taken, browser and device type) via Google Analytics 4. This data is aggregated and used to improve the Service.</p>
          <p><strong>Cookies</strong> — we use session cookies to keep you signed in and analytics cookies placed by Google Analytics. No advertising cookies are set by StoryQuestor itself; however, see the Advertising section below.</p>
        </Section>

        <Section title="How We Use Your Information">
          <ul className="list-disc list-inside space-y-1">
            <li>To create and manage your account</li>
            <li>To display your stories and allow other users to read them when you make them public</li>
            <li>To enforce our age-based content restrictions (13+ to use the Service; 18+ for Adults Only stories)</li>
            <li>To generate AI scene images using the content of your scenes (sent to Hugging Face inference API; not stored by that service)</li>
            <li>To understand how the Service is used and improve it over time</li>
            <li>To serve relevant advertisements (see Advertising below)</li>
          </ul>
        </Section>

        <Section title="Third-Party Services">
          <p>We use the following third-party services that may process your data under their own privacy policies:</p>
          <ul className="list-disc list-inside space-y-2 mt-2">
            <li>
              <strong>Google Sign-In (OAuth)</strong> — handles authentication.{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">Google Privacy Policy</a>
            </li>
            <li>
              <strong>Google Analytics 4</strong> — collects anonymised usage statistics.{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">Google Privacy Policy</a>
            </li>
            <li>
              <strong>Google AdSense</strong> — serves advertisements on public pages. AdSense may use cookies to show personalised ads based on your browsing activity. You can opt out of personalised ads via{' '}
              <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">Google Ads Settings</a>.{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">Google Privacy Policy</a>
            </li>
            <li>
              <strong>Neon (database hosting)</strong> — our PostgreSQL database is hosted by Neon. Your data is stored on servers in the United States.{' '}
              <a href="https://neon.tech/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">Neon Privacy Policy</a>
            </li>
            <li>
              <strong>Hugging Face (AI image generation)</strong> — scene content is sent to Hugging Face&apos;s inference API to generate images. Content is not stored by Hugging Face beyond processing.{' '}
              <a href="https://huggingface.co/privacy" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">Hugging Face Privacy Policy</a>
            </li>
          </ul>
        </Section>

        <Section title="Advertising">
          <p>
            StoryQuestor displays advertisements on public-facing pages (story browsing, story reading, and informational pages) through Google AdSense. Ads are not shown on account management or story editing pages.
          </p>
          <p>
            Google AdSense may use cookies and similar technologies to serve ads based on your prior visits to StoryQuestor and other websites. You can opt out of personalised advertising by visiting{' '}
            <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">aboutads.info</a> or{' '}
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">Google Ads Settings</a>.
          </p>
        </Section>

        <Section title="Children's Privacy">
          <p>
            StoryQuestor requires all users to be at least 13 years old. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has created an account, please contact us immediately and we will delete it.
          </p>
          <p>
            Users aged 13–17 are restricted from accessing Adults Only content. Adult content filters are enforced based on the date of birth provided at registration.
          </p>
        </Section>

        <Section title="Data Retention">
          <p>
            We retain your account data and stories for as long as your account is active. You may delete your account at any time from your{' '}
            <Link href="/profile" className="text-amber-600 hover:underline">Profile Settings</Link>.
            Deleting your account permanently removes all associated stories, scenes, and personal data from our database.
          </p>
        </Section>

        <Section title="Your Rights">
          <p>Depending on where you live you may have the right to:</p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data (use the Delete Account feature in Profile Settings)</li>
            <li>Object to or restrict certain processing of your data</li>
            <li>Data portability</li>
          </ul>
          <p>To exercise any of these rights, or if you have questions about this policy, contact us at the address below.</p>
        </Section>

        <Section title="Changes to This Policy">
          <p>
            We may update this policy from time to time. When we do, we will update the &quot;Last updated&quot; date at the top of this page. Continued use of the Service after changes constitutes acceptance of the updated policy.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            If you have any questions about this Privacy Policy, please contact us at:{' '}
            <a href="mailto:privacy@storyquestor.com" className="text-amber-600 hover:underline">
              privacy@storyquestor.com
            </a>
          </p>
        </Section>

      </div>
    </div>
  )
}
