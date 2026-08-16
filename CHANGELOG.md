# StoryQuestor Feature Changelog

Add new entries at the top. Use `## YYYY-MM-DD` for the date header and `- ` bullet points for each feature.
Each bullet should be a single plain-English sentence: **Feature name** followed by a brief description of what it does for the user.
Skip: dependency bumps, lint fixes, internal refactors, admin-only infrastructure changes users never see.

---

## 2026-08-16

- **Follow request management**: Private-profile owners now get a "Manage Followers" panel in Profile → Privacy with three tabs — Follow Requests, Denied, and Blocked. Incoming requests can be Allowed, Denied, or Blocked directly from the list; denied users can be re-approved or removed later, and blocked users can be unblocked. Denying a request no longer just deletes it — the requester can send a new request later, and their Follow button correctly reflects the denial in the meantime.

## 2026-08-03

- **Dismissible feedback button**: The floating feedback button can now be hidden by clicking the small × badge on its corner. The choice is remembered across visits, and a "Feedback" link in the site footer brings it back at any time.
- **Redesigned Profile Settings**: `/profile` is now organized into a sidebar-tabbed layout (Account, Notifications, Privacy, Billing, Invites, Danger Zone) instead of one long scrolling page, with a new identity summary card up top showing avatar, username, join date, and story/follower/following stats. A "Send invites" link from the invite-friends prompt now opens straight to the Invites tab. Saving now shows an animated confirmation instead of plain text.
- **Public profile polish**: `/u/<username>` now shows when a creator joined, and the follow button has a subtle confirmation animation when you follow or unfollow someone.
- **User profile pages**: Every user now has a public profile page at `storyquestor.com/u/<username>` listing the stories they've made public — available on every plan (free, weekly, monthly). Profiles are public by default; a new "Profile Visibility" toggle in Profile Settings lets anyone switch to private. Existing users are prompted to choose a username the next time they sign in, alongside signing up.
- **Usernames**: Every account now has a username (3–20 lowercase letters, numbers, or underscores) separate from their email, chosen during account setup with live availability checking. Used as the identifier in profile URLs.
- **Blocking**: From Profile Settings, users can block another account by username to prevent that account from viewing their profile page, and unblock at any time from the same "Blocked Users" list.
- **Story author byline**: Story reader pages now show a "by @username" byline linking to the author's public profile, when the author has one.
- **Explore page author bylines & creator search**: Every story card on the Explore page now shows who made it, linking to their profile page when it's public. The search box also matches against creator usernames, not just titles and tags.
- **Follow requests**: Readers can follow an author from their profile page. Following a public profile is instant; following a private profile sends a request the owner approves or declines from a new "Follow Requests" section in Profile Settings (with an email notification when a request comes in). Profile pages now show follower/following counts, and an accepted follower of a private profile can see that profile's public stories. Blocking someone automatically removes any follow relationship between the two accounts.

## 2026-07-28

- **Story analytics**: Monthly subscribers (and admins) can now view a per-story analytics dashboard from an icon on each story card — total reads, social visits, a 30-day reads sparkline, a breakdown of traffic sources (direct, search, social, referral, email, internal), and a list of top referring domains. The pricing page now lists "Story analytics & traffic sources" as a monthly-tier feature.
- **Custom story URLs**: Monthly subscribers can generate a memorable human-readable URL for any story (e.g. `storyquestor.com/story/the-forest-path`). Slugs are auto-generated from the story title, XSS-safe (only `[a-z0-9-]` characters), and deduplicated with a suffix when a conflict occurs. Accessible via the story's Settings modal; the link can be copied and regenerated at any time.

- **Site feedback widget**: A floating violet button (bottom-right) lets any user submit questions or concerns from any page. Input is sanitized server-side to strip HTML tags and XSS vectors before storage. Admins can view, filter, review, and resolve submissions at /admin/feedback with an unread count badge in the admin nav.

- **Landing page hero redesign**: Replaced the generic dark hero with an atmospheric reader-experience visualization — a styled story card showing choices, a character stats panel, and an endings count badge — capturing the interactive fiction experience rather than a raw editor screenshot. Headline and CTAs also improved for clarity and visual weight.
- **Publish / Move to draft from the editor**: Authors can now publish a story or return it to draft directly from the node graph editor toolbar and the block builder toolbar — no need to go back to the dashboard.
- **All stories start as draft**: Every new story, regardless of plan, begins as a private draft and must be explicitly published before it appears on the Explore page.
- **Draft publish flow for free/trial users**: Stories created by free and trial users now start as a private draft instead of going live immediately. A "Draft — not yet published" badge appears on the story card and the share toggle reads "Publish story". Publishing runs the existing validation flow, makes the story public, and activates it on the Explore page. Draft stories are invisible to all readers until explicitly published.

## 2026-07-27

- **Free tier**: Users without a subscription can now create 1 public story using Block Builder only. Node Graph, World Builder, scene images, and sounds require a paid plan. Free-tier users see a plan banner on their dashboard and an upgrade prompt once their story limit is reached. The create flow gates Node Graph and World Builder with a "Paid plan" badge. The pricing page now shows a Free column alongside Weekly and Monthly.

## 2026-07-26 (private stories)

- **Private stories require a subscription**: trial users can only have public stories. Attempting to make a published story private shows a subscribe CTA. The API enforces this server-side with a 402. Subscribers on any paid plan (weekly or monthly) can freely toggle stories between public and private.
- **Pricing page updated**: "Private stories" added as a feature row for both weekly and monthly plans, and plan card descriptions updated.
- **How-to guide updated**: the publish step now notes that keeping stories private is a subscriber benefit.

## 2026-07-26 (translation)

- **Story translation**: readers can now translate any story into their preferred language. When the story language differs from a reader's preference (or browser language for guests), a translate prompt appears. Once accepted, all scene text and choice labels are translated in one step via Google Cloud Translate and cached for the session — clicking through subsequent scenes auto-translates them. A "Show original" link lets readers toggle back at any time.
- **Reading language preference**: users can set their preferred reading language in Profile Settings. Stories in other languages will offer to translate automatically.
- **Story language setting**: authors can tag their story's language in Story Settings, helping readers discover stories in their language and enabling accurate translation detection.

## 2026-07-26

- **Blog section**: added a public `/blog` with 10 full-length articles covering interactive fiction writing tips, story ideas, history, and education. Blog posts are stored in the database and fully editable from the admin panel — admins can create, edit, reorder sections, toggle publish status, and delete posts via `/admin/blog`.
- **Latest blog post on homepage**: the landing page now surfaces the most recent published blog post between the Features section and the CTA — showing the hero image, category, read time, title, and description as a featured card with a direct read link.

## 2026-07-17

- **Character health, armor, and death system**: hero characters can now have a designated Health attribute and an optional Armor attribute. In combat, foe counterattacks drain armor first and then overflow into health. When health reaches its minimum the character falls — shown with a "Fallen" badge in the party sidebar. If all party members fall, the story ends with a game-over screen and an encouraging "Try Again" message that resets progress and returns to the start. Fallen characters can be revived mid-combat if a party member carries a revival item.
- **Revival items**: the item editor now has a "Can revive" toggle. When enabled and the item is in a party member's inventory during combat, a "Revive" tab appears alongside "Attack" in the combat action picker — letting the player bring a fallen hero back with a configurable amount of health restored.

## 2026-07-17

- **AI character avatars**: editors can generate a portrait-style AI image for any character or foe using the "Generate avatar" button in the character editor (monthly subscription required). Avatars appear alongside character stats in the reader's party sidebar and replace the emoji icon in foe encounter panels for a more immersive dramatic reveal.

## 2026-07-17

- **World Builder foe system**: editors can create Foe / Villain characters with HP, per-round damage, and a defeat description, then assign them to any scene. Readers arriving at a foe scene see a dramatic full-screen reveal with the foe's icon, name, and lore; they can choose to fight (selecting a party member and a weapon from their inventory) or run away to an editor-defined escape route. Combat tracks foe HP and item durability across rounds, with a victory screen shown when the foe is conquered.
- **Item combat stats**: items now carry optional damage-per-use and durability fields. Weapons show their damage value in the combat picker; items with limited durability track uses and become spent when exhausted — both persisted in session storage.
- **Character type selector**: the character editor now lets editors define characters as Party Members (existing behavior) or Foes/Villains. Foes get dedicated combat stats (HP, damage/round, defeat text, icon emoji) instead of the attribute/inventory system. The left sidebar in the World Builder editor shows heroes and foes in visually distinct sections.
- **Sidebar nav icon rail**: the World Builder editor's left panel tabs (Characters, Items, Chapters) are now an icon rail replacing the cramped horizontal tab strip — each tab is a 40×40px icon button with a color-coded active indicator, making sections easy to switch between.

## 2026-07-17 (3)

- World Builder choice path modal: clicking a choice arrow on the canvas now opens a full modal where editors can edit the choice label and configure character stat effects and conditions for that path — replacing the previous inline sidebar panel.
- World Builder items system: editors can define a library of items (weapons, potions, armor, abilities, etc.) in the left panel's new Items tab, then place "findable item" pickups inside individual scenes. Readers encounter item pickup buttons while playing, acquiring items that are stored in their inventory and can apply character stat effects when picked up. Items and inventory persist across scenes via session storage.

## 2026-07-17 (2)

- World Builder story type: a new story creation option alongside the classic Story Path. World Builder stories let authors create characters with fully custom attributes (HP, Gold, Strength, etc.), apply stat effects to each choice (e.g. "−10 HP when the player fights"), and gate choices behind stat conditions (e.g. "only show 'Climb the wall' if Strength ≥ 15"). Readers see a persistent character sidebar showing their party's live stats as they play. Available during the trial period.

## 2026-07-17

- Acquisition source tracking: new users are asked "How did you find StoryQuestor?" during onboarding profile setup (Google, Facebook, friend, Reddit, YouTube, TikTok, Instagram, Other). Responses are saved to their account.
- Acquisition insights: admin insights page shows a breakdown of acquisition sources with percentage bars.
- Acquisition email segmentation: custom email blast segments can now filter by "Found us via" to target users from a specific source (e.g. send a campaign only to users who came from Facebook).

## 2026-07-16

- Pricing page: new public `/pricing` page shows a weekly vs monthly feature comparison table with live pricing from the admin config and CTAs to sign up or manage your subscription.
- Feature gating by plan: weekly subscribers get the story editor and publishing; monthly subscribers additionally unlock AI scene image generation and scene soundscapes.
- Interval pre-selection: clicking a plan on the pricing page lands on the subscribe page with that interval already selected.

## 2026-07-11

- Pricing configuration: admin can now set subscription presets, minimums, and billing intervals (daily / weekly / monthly) from /admin/pricing. Changes apply to new subscribers only; existing subscribers are unaffected unless they opt in.
- Dynamic pricing across the site: all mentions of subscription cost on the homepage, how-to page, subscribe page, banner, and emails now pull from the admin-configured pricing in real time.
- Price reduction offers: when the admin lowers the minimum, affected subscribers appear in a table. Admin can send each an email offering the lower rate; users click an accept link to switch at their next billing cycle.
- Multi-interval billing: subscribers can now choose daily, weekly, or monthly billing at checkout. Admin controls which intervals are enabled and their pricing from the dashboard.

- Demo-to-subscribe conversion bar: after 40 seconds in the demo editor (or on first creative action like adding a node or connecting scenes), a sticky bar slides up from the bottom prompting users to subscribe and save their work — dismissed per-session, never shown to already-subscribed users.

## 2026-07-05

- Onboarding flow: after completing their profile, new users are guided directly to subscription setup via a 3-step progress indicator (Account → Profile → Subscribe), making the activation sequence feel like a single coherent flow instead of disconnected pages.

## 2026-07-04

- Subscription required at signup: new accounts must subscribe (starting at $2/week) — no free trial for new signups; existing trial accounts continue unaffected.
- Friend invite program: subscribers can send up to 5 invite links to friends; when an invited friend signs up and subscribes, the inviter earns a one-week credit applied to their next billing cycle (or free trial weeks banked for future subscribers).
- Invite page: a dedicated landing page at `/invite/[token]` explains StoryQuestor and lets the invitee create an account or sign in directly via the invite link.
- Post-login invite prompt: authenticated users see a one-time modal introducing the invite program and linking directly to their invite section on the profile page.

## 2026-06-19

- Org consent form: org admins can now create a custom consent form (title and body text) that members must accept before accessing the platform; the form appears during invite acceptance for new members and can be re-enabled per member from the Members page, blocking access until they agree.
- Block Builder editor: users can now choose between the Node Graph canvas and a new Block Builder mode when creating a story — Block Builder presents scenes as draggable stacked blocks with inline choice connectors, inspired by Scratch, and can be switched at any time from story settings.

## 2026-06-11

- Admin Insights page: new admin dashboard showing actionable recommendations based on user behavior — trials expiring soon, unpublished creators, new users who haven't started a story, abandoned stories, social content suggestions with one-click post copy, and optional Google Analytics integration for feature usage and traffic source data.

## 2026-06-10

- Admin Earnings page: new admin dashboard page showing MRR, ARR, projected revenue if trial users convert, revenue distribution by subscription amount, subscriber status breakdown, and a sortable table of all active subscribers.

## 2026-06-01

- Discord community: a Discord server invite link is now visible in the site footer, the desktop user menu, and the mobile menu so users can quickly get live support.
- Organization access: org admins and members invited to an organization no longer see subscription prompts — their access is covered by the organization and the profile page reflects this.
- Onboarding birthdate fix: users who complete the required profile setup (date of birth) are now correctly redirected to the home page without being asked to complete their profile a second time.

## 2026-05-30

- Pay-what-you-want subscription: users can now subscribe for as little as $2/month (choosing any amount they wish) to unlock story creation and editing, with a 7-day free trial for new accounts and a 30-day grace period for existing users.
- Subscription management: subscribers can pause or cancel their subscription at any time from the Profile Settings page via the Stripe billing portal.

## 2026-05-25

- Email blast: admins can now send formatted update emails to all subscribed users directly from the admin dashboard, with a rich text editor and a changelog reference panel for drafting messages.
- Email preferences: users can subscribe or unsubscribe from product update emails at any time from their Profile Settings page, and every blast email includes a one-click unsubscribe link.

## 2026-05-24

- Ambient sound on scenes: attach background music or audio to any scene in the editor — it autoplays when readers reach that scene, with a mute control.
- Chapter entry scene linking: Next Chapter scenes now support an Entry scene picker — send readers directly to a specific scene in the next chapter instead of the default start.
- Survey interaction analytics: survey shown, completed, and dismissed events are now tracked in Google Analytics for deeper insight into user engagement.
- Analytics exclusions: admin accounts and localhost visits are excluded from Google Analytics so internal use does not skew data.

## 2026-05-23

- Story templates: when creating a new story you can now choose from pre-built templates to get started quickly with ready-made scenes and structure.

## 2026-05-20

- Admin user management: admins can view, suspend or unsuspend, and delete user accounts from the admin dashboard.
- Admin direct messaging: admins can send a personalised email directly to any user from their user detail page.

## 2026-05-19

- Security updates: session handling and authentication improvements to better protect user accounts.

## 2026-05-18

- Performance improvements: fixed caching issues that could occasionally serve stale content.

## 2026-05-12

- Public story visibility banner: authors now see a notice when their story is not listed publicly, with a one-click option to publish it.

## 2026-05-09

- Google AdSense: display advertising is now available on the free tier to help support the platform.

## 2026-05-08

- Organization waitlist processing: admins can accept or deny waitlist applications from the dashboard — accepted applicants receive a personalised invite email automatically.
- Survey timing improvements: qualitative surveys now have a longer cooldown (monthly) compared to quantitative surveys, reducing survey fatigue.

## 2026-05-07

- Design refresh: comprehensive visual update across all main pages for a cleaner, more polished experience.

## 2026-05-01

- Organization features: added group management, member roles, role scope controls, and org-level privacy settings.
