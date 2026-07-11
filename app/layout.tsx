import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import JsonLd from '@/components/JsonLd'

const SITE_URL = 'https://www.storyquestor.com'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'StoryQuestor — Free Choose Your Own Adventure Story Creator',
    template: '%s | StoryQuestor',
  },
  description: 'Create free choose-your-own-adventure stories with a visual canvas. Build non-linear, branching tales where every reader choice leads somewhere different — then share them with the world.',
  openGraph: {
    title: 'StoryQuestor — Free Choose Your Own Adventure Story Creator',
    description: 'Create free choose-your-own-adventure stories. Build non-linear, branching tales where every reader choice leads somewhere different.',
    url: 'https://www.storyquestor.com',
    siteName: 'StoryQuestor',
    type: 'website',
    images: [{ url: `${SITE_URL}/storyquestor-fb.png`, width: 1200, height: 630, alt: 'StoryQuestor' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StoryQuestor — Free Choose Your Own Adventure Story Creator',
    description: 'Create free choose-your-own-adventure stories. Build non-linear, branching tales where every reader choice leads somewhere different.',
    images: [`${SITE_URL}/storyquestor-fb.png`],
  },
  other: {
    'google-adsense-account': 'ca-pub-9068413627358148',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ colorScheme: 'light' }}>
      <head>
        <meta property="fb:app_id" content="859715873260802" />
        {/* Google Consent Mode v2 defaults — must run before any GA/Ads scripts */}
        <script dangerouslySetInnerHTML={{ __html: `
(function(){
  try {
    var m=document.cookie.match(/(?:^|; )sq_consent=([^;]*)/);
    var c=m?JSON.parse(decodeURIComponent(m[1])):null;
    var a=c&&c.version===1&&c.analytics===true;
    var d=c&&c.version===1&&c.advertising===true;
    window.dataLayer=window.dataLayer||[];
    function gtag(){dataLayer.push(arguments);}
    window.gtag=gtag;
    gtag('consent','default',{
      analytics_storage:a?'granted':'denied',
      ad_storage:d?'granted':'denied',
      ad_user_data:d?'granted':'denied',
      ad_personalization:d?'granted':'denied',
      wait_for_update:500
    });
  }catch(e){}
})();
        `}} />
      </head>
      <body className={`${geist.className} antialiased min-h-screen`} style={{ background: '#faf5ff' }}>
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebSite',
              name: 'StoryQuestor',
              url: SITE_URL,
              description: 'Create branching interactive stories where every choice matters.',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${SITE_URL}/explore?q={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
            },
            {
              '@type': 'Organization',
              name: 'StoryQuestor',
              url: SITE_URL,
              logo: `${SITE_URL}/icon.png`,
            },
          ],
        }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
