import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: { absolute: 'Terms of Service | StoryQuestor' },
  description: 'Terms of service for StoryQuestor — rules for using the platform.',
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

export default function TermsPage() {
  const updated = 'March 5, 2026'

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400">Last updated: {updated}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">

        <Section title="Acceptance of Terms">
          <p>
            By accessing or using StoryQuestor (&quot;the Service&quot;) at{' '}
            <a href="https://www.storyquestor.com" className="text-amber-600 hover:underline">www.storyquestor.com</a>,
            you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
          </p>
        </Section>

        <Section title="Eligibility">
          <p>You must be at least 13 years of age to use StoryQuestor. By creating an account, you confirm that you meet this requirement.</p>
          <p>Access to Adults Only content is restricted to users who are 18 years of age or older, as verified by the date of birth you provide at registration. You must provide an accurate date of birth.</p>
        </Section>

        <Section title="Your Account">
          <p>You are responsible for maintaining the confidentiality of your account and for all activity that occurs under it. You may only use StoryQuestor for lawful purposes and in accordance with these Terms.</p>
          <p>We reserve the right to suspend or terminate accounts that violate these Terms, without prior notice.</p>
        </Section>

        <Section title="User-Generated Content">
          <p><strong>Your content</strong> — you retain ownership of the stories, scenes, and other content you create on StoryQuestor (&quot;User Content&quot;). By publishing content on the Service, you grant us a non-exclusive, worldwide, royalty-free licence to host, display, and distribute that content as part of operating the Service.</p>
          <p><strong>Public stories</strong> — when you make a story public, it is accessible to any visitor of the Service, including unauthenticated users. You can make a story private again at any time by toggling the public setting off.</p>
          <p><strong>Prohibited content</strong> — you must not create or publish content that:</p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>Is illegal or promotes illegal activity</li>
            <li>Involves sexual content depicting minors</li>
            <li>Harasses, threatens, or demeans any individual or group</li>
            <li>Infringes the intellectual property rights of others</li>
            <li>Contains malware, spam, or deceptive material</li>
            <li>Is marked &quot;All Ages&quot; or &quot;Teens&quot; but contains adult content</li>
          </ul>
          <p>We reserve the right to remove any User Content that violates these Terms.</p>
        </Section>

        <Section title="AI-Generated Images">
          <p>StoryQuestor provides an AI image generation feature powered by third-party models. Generated images are stored on our platform and associated with your story. You acknowledge that:</p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>The quality and accuracy of AI-generated images may vary</li>
            <li>We do not guarantee the originality or intellectual property status of generated images</li>
            <li>You must not use the image generation feature to create prohibited content as defined above</li>
          </ul>
        </Section>

        <Section title="Advertising">
          <p>
            StoryQuestor displays third-party advertisements on public pages. These ads are served by Google AdSense and are subject to{' '}
            <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">
              Google&apos;s advertising policies
            </a>. We are not responsible for the content of third-party advertisements.
          </p>
        </Section>

        <Section title="Intellectual Property">
          <p>
            The StoryQuestor name, logo, and the platform itself (excluding User Content) are owned by us and protected by intellectual property laws. You may not reproduce, distribute, or create derivative works from any part of the platform without our express written permission.
          </p>
        </Section>

        <Section title="Disclaimer of Warranties">
          <p>
            The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, error-free, or free of viruses or other harmful components.
          </p>
        </Section>

        <Section title="Limitation of Liability">
          <p>
            To the fullest extent permitted by law, StoryQuestor and its operators shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of or inability to use the Service, even if we have been advised of the possibility of such damages.
          </p>
        </Section>

        <Section title="Changes to These Terms">
          <p>
            We may revise these Terms at any time by updating this page. The &quot;Last updated&quot; date will reflect any changes. Continued use of the Service after changes are posted constitutes your acceptance of the revised Terms.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about these Terms? Contact us at:{' '}
            <a href="mailto:legal@storyquestor.com" className="text-amber-600 hover:underline">
              legal@storyquestor.com
            </a>
          </p>
          <p>
            For privacy-related enquiries, see our{' '}
            <Link href="/privacy" className="text-amber-600 hover:underline">Privacy Policy</Link>.
          </p>
        </Section>

      </div>
    </div>
  )
}
