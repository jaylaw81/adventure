# StoryQuestor Feature Changelog

Add new entries at the top. Use `## YYYY-MM-DD` for the date header and `- ` bullet points for each feature.
Each bullet should be a single plain-English sentence: **Feature name** followed by a brief description of what it does for the user.
Skip: dependency bumps, lint fixes, internal refactors, admin-only infrastructure changes users never see.

---

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
