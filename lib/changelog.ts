// Claude-maintained feature changelog for StoryQuestor.
// Admin dashboard reads this to help draft email blasts.
// Add newest entries at the top; keep one entry per logical feature group per date.

export interface ChangelogEntry {
  date: string   // YYYY-MM-DD
  items: string[] // plain-text feature descriptions
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    date: '2026-05-24',
    items: [
      'Ambient sound on scenes: attach background music or audio to any scene in the editor — it autoplays when readers reach that scene, with a mute control.',
      'Chapter entry scene linking: Next Chapter scenes now support an Entry scene picker — send readers directly to a specific scene in the next chapter instead of the default start.',
      'Survey interaction analytics: survey shown, completed, and dismissed events are now tracked in Google Analytics for deeper insight into user engagement.',
      'Analytics exclusions: admin accounts and localhost visits are excluded from Google Analytics so internal use does not skew data.',
    ],
  },
  {
    date: '2026-05-23',
    items: [
      'Story templates: when creating a new story you can now choose from pre-built templates to get started quickly with ready-made scenes and structure.',
    ],
  },
  {
    date: '2026-05-20',
    items: [
      'Admin user management: admins can view, suspend or unsuspend, and delete user accounts from the admin dashboard.',
      'Admin direct messaging: admins can send a personalised email directly to any user from their user detail page.',
    ],
  },
  {
    date: '2026-05-19',
    items: [
      'Security updates: session handling and authentication improvements to better protect user accounts.',
    ],
  },
  {
    date: '2026-05-18',
    items: [
      'Performance improvements: fixed caching issues that could occasionally serve stale content.',
    ],
  },
  {
    date: '2026-05-12',
    items: [
      'Public story visibility banner: authors now see a notice when their story is not listed publicly, with a one-click option to publish it.',
    ],
  },
  {
    date: '2026-05-09',
    items: [
      'Google AdSense: display advertising is now available on the free tier to help support the platform.',
    ],
  },
  {
    date: '2026-05-08',
    items: [
      'Organization waitlist processing: admins can accept or deny waitlist applications from the dashboard — accepted applicants receive a personalised invite email automatically.',
      'Survey timing improvements: qualitative surveys now have a longer cooldown (monthly) compared to quantitative surveys, reducing survey fatigue.',
    ],
  },
  {
    date: '2026-05-07',
    items: [
      'Design refresh: comprehensive visual update across all main pages for a cleaner, more polished experience.',
    ],
  },
  {
    date: '2026-05-01',
    items: [
      'Organization features: added group management, member roles, role scope controls, and org-level privacy settings.',
    ],
  },
]

export function formatChangelogHtml(entries: ChangelogEntry[]): string {
  return entries.map(entry => {
    const date = new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
    const items = entry.items.map(item => `<li>${item}</li>`).join('')
    return `<h3>${date}</h3><ul>${items}</ul>`
  }).join('')
}
