---
name: StoryQuestor
description: Visual canvas platform for crafting and playing branching interactive stories
colors:
  forge-amber: "#f59e0b"
  orange-fire: "#f97316"
  story-violet: "#a78bfa"
  chapter-teal: "#14b8a6"
  ink-night: "#1a1025"
  deep-slate: "#0f172a"
  parchment: "#f9fafb"
  page-white: "#ffffff"
  body-ink: "#171717"
  muted-ink: "#6b7280"
  danger-red: "#ef4444"
  start-green: "#22c55e"
typography:
  display:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "clamp(2.5rem, 5vw, 3.75rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.05em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "#f59e0b"
    textColor: "#111827"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "#d97706"
    textColor: "#111827"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-secondary:
    backgroundColor: "#f3f4f6"
    textColor: "#374151"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-dark:
    backgroundColor: "#1f2937"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  story-card:
    backgroundColor: "{colors.page-white}"
    textColor: "{colors.body-ink}"
    rounded: "{rounded.lg}"
    padding: "20px"
  choice-button:
    backgroundColor: "{colors.page-white}"
    textColor: "#1e293b"
    rounded: "{rounded.lg}"
    padding: "16px 20px"
  story-node:
    backgroundColor: "#eff6ff"
    textColor: "{colors.body-ink}"
    rounded: "{rounded.lg}"
    padding: "16px"
---

# Design System: StoryQuestor

## 1. Overview

**Creative North Star: "The Story Forge"**

StoryQuestor is a creator's workshop. The aesthetic is kinetic and purposeful: hot amber energy on deep ink-night backgrounds in the editor, cool white parchment in the reader. Two distinct thermal zones, both serving the same forge metaphor. Where the editor feels like a craftsperson hammering a narrative into shape, the reader feels like holding the finished object in your hands.

The system rejects productivity-tool aesthetics. No Notion-clone white cards with blue primary buttons. No gray dashboards that could belong to any SaaS product. Color here earns its place: amber marks the primary creative action, violet traces the structural shimmer, teal marks chapter transitions. Each accent has a semantic role, not a decorative one.

Energy without overwhelm is the governing tension. The palette is rich but never garish; motion feedback is immediate but never theatrical. A first-time creator should feel invited, not auditioned.

**Key Characteristics:**
- Dual thermal zones: dark forge (editor, nav) and bright page (reader, cards)
- Full palette with four named accent roles, each semantically distinct
- Geist Sans across all weights; hierarchy through scale and weight contrast
- Shadows respond to state, not decoration: flat at rest, lifted on interaction
- Rounded edges throughout (8-16px) signal approachability without softness
- Gradient amber-to-orange reserved for the single most important CTA on any surface

---

## 2. Colors: The Forge Palette

Four named accents, each earning its surface. Never use an accent color arbitrarily; if it appears without a semantic reason, it doesn't belong.

### Primary
- **Forge Amber** (`#f59e0b`): The dominant creative energy. Active nav states, primary action buttons, tag chips, story metadata highlights, and the "unsaved changes" warning. When a creator is doing something important, amber marks it.
- **Orange Fire** (`#f97316`): Forge Amber's heat partner. Never used alone; always as the terminal end of the amber-to-orange gradient on CTAs and the logo mark. Together they form the signature brand gradient.

### Secondary
- **Story Violet** (`#a78bfa`): Structural shimmer and secondary paths. Used in the header shimmer line, choice badge alternates (violet-to-purple), and ending-node labels. Signals narrative branching: where amber marks action, violet marks possibility.

### Tertiary
- **Chapter Teal** (`#14b8a6`): Navigation and waypoints. Chapter-end nodes in the editor, chapter sidebar active states. Marks transition and progression through a story's structure.

### Neutral
- **Ink Night** (`#1a1025`): The deep background of the editor and navigation. A purple-tinted near-black; never pure black.
- **Deep Slate** (`#0f172a`): Secondary dark surface. Used alongside Ink Night for gradient depth in headers, dropdowns, and mobile menus.
- **Parchment** (`#f9fafb`): The reading surface. Light gray-white used on the dashboard, explore page, and any creator-facing light surface. Slightly warm; not clinical white.
- **Page White** (`#ffffff`): Story cards, choice buttons, modals. The actual white; used where content needs maximum contrast.
- **Body Ink** (`#171717`): Near-black text on all light surfaces. A very dark gray; no pure black.
- **Muted Ink** (`#6b7280`): Secondary text, timestamps, helper copy.
- **Danger Red** (`#ef4444`): Delete actions and irreversible operations exclusively. Never decorative.
- **Start Green** (`#22c55e`): Start-node indicator in the editor only. Semantic, not decorative.

### Named Rules
**The One Gradient Rule.** The amber-to-orange gradient (`linear-gradient(135deg, #f59e0b, #f97316)`) belongs to primary CTAs and the logo mark only. It is the hottest point of the forge; dilute it and you lose the hierarchy. Use flat amber (`#f59e0b`) everywhere else.

**The Ink Night Rule.** Dark backgrounds always carry the purple-shifted ink tones (`#1a1025`, `#0f172a`), never neutral dark grays. Pure gray backgrounds on dark surfaces are forbidden; they belong to a different product entirely.

---

## 3. Typography

**Display / Body Font:** Geist (with Arial, Helvetica, sans-serif fallback)
**Label / Mono Font:** Geist Mono (code snippets, monospaced content only)

**Character:** Geist is clean and technically precise with a slightly warm humanist feel. It reads fast at small sizes and holds weight at display scale without going cold. The single-family system keeps the interface unified; hierarchy is expressed entirely through weight and size contrast, never through font switching.

### Hierarchy
- **Display** (800 weight, clamp(2.5rem–3.75rem), line-height 1.05, tracking -0.02em): Landing page heroes and story cover titles only. The rarest level.
- **Headline** (700 weight, 1.5rem / 24px, line-height 1.2, tracking -0.01em): Section headings on the dashboard, story titles in cards, modal titles.
- **Title** (600 weight, 1.125rem / 18px, line-height 1.35): Node titles in the editor, sidebar section labels, feature headings.
- **Body** (400 weight, 1rem / 16px, line-height 1.6): Scene content in the reader, form labels, card descriptions. Cap line length at 65-75ch in reading contexts.
- **Label** (600 weight, 0.75rem / 12px, line-height 1.4, tracking 0.05em, uppercase): Badges, status chips, node-type labels ("SCENE", "START", "ENDING"). All-caps with generous tracking.

### Named Rules
**The Weight Ladder Rule.** Each step in the hierarchy requires at minimum a 1.25x size ratio or a two-step weight jump. A headline and a title must be immediately distinguishable at a glance; similar size with different weights is not enough separation.

---

## 4. Elevation

StoryQuestor uses a state-responsive shadow vocabulary: surfaces are flat at rest, shadows appear when a surface becomes interactive or elevated above its peers. No decorative shadows; every shadow communicates either interactivity or structural layering.

On dark surfaces (editor, nav), depth is conveyed tonally through the Ink Night / Deep Slate gradient stack rather than shadows. Shadows are reserved for light-surface elements.

### Shadow Vocabulary
- **Resting card** (`shadow-sm` / `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)`): Story cards and nodes at rest. Present but barely perceptible.
- **Interactive hover** (`shadow-md` / `0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)`): Cards and buttons on hover. A clear step up from resting.
- **Floating element** (`shadow-xl` / `0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)`): Primary CTAs, modals, dropdowns. Signals that this element is above the surface plane.
- **Hero elevation** (`shadow-2xl` / `0 25px 50px rgba(0,0,0,0.25)`): Landing page mockups and decorative showcase elements only.

### Named Rules
**The Flat-by-Default Rule.** No element starts with a shadow as decoration. The resting state is flat (or `shadow-sm` for cards that must distinguish themselves from the background). Shadows appear in response to hover, focus, or modal elevation. If removing the shadow doesn't change the user's understanding of the interface, the shadow doesn't belong.

---

## 5. Components

### Buttons

Warm and confident: rounded corners signal approachability, solid fills signal commitment, consistent padding makes them easy to target.

- **Shape:** Gently rounded (8px / `rounded-md`); large enough to feel substantial, not so round as to feel playful.
- **Primary (CTA):** Amber-to-orange gradient (`linear-gradient(135deg, #f59e0b, #f97316)`), dark gray-900 text (`#111827`), 8px/16px padding. On hover: `scale(1.05)`, shadow increase. Used for the single most important action on a surface ("New Story", "Sign up free").
- **Primary flat:** Solid amber (`#f59e0b`), dark text, same shape. Used for secondary-importance actions within the product ("Add Scene", "Play"). No gradient; the gradient is reserved for the top-level CTA.
- **Secondary:** Light gray background (`#f3f4f6`), gray-700 text. Paired with a primary button when a neutral alternative is needed ("Settings", "Edit").
- **Dark / Save:** Gray-800 background, white text. Used in the editor toolbar for the save action when dirty state is active.
- **Ghost (dark surface):** Transparent background, `border border-white/15`, gray-300 text. Used for secondary actions on dark backgrounds ("Sign in").
- **Danger:** Red-50 background (`#fef2f2`), red-600 text. For destructive secondaries (delete icon buttons). The full red-500 fill is reserved for confirmation dialogs.
- **Hover/Focus:** `transition-colors` 150ms on color changes; `scale(1.05)` only on primary gradient CTA. Focus ring: `ring-2 ring-amber-400 ring-offset-2` universally.

### Chips / Tags

- **Story tags:** Amber-100 background, amber-800 text, pill radius (`rounded-full`), 12px font, medium weight. Used on story cards and explore filters.
- **Status badges:** Colored light background (blue-100/red-100) with matching text. Small, rounded-full, label weight (uppercase + tracking). Used on editor nodes.
- **Choice badges:** Gradient-filled circular badge (A/B/C lettering), 32px diameter, white text. Cycles through six color pairs (amber/orange, violet/purple, emerald/teal, sky/blue, rose/pink, fuchsia/indigo). The only place in the product where multiple gradients coexist; justified by the game-like reading context.

### Cards / Containers

- **Story card:** Page-white background, `rounded-xl` (12px), `shadow-md`, `border border-gray-100`, 20px internal padding. Hover: `shadow-lg`. Contains title, description, tags, metadata row, share toggle, and action buttons in a flex-column layout.
- **Editor story node:** Light-colored background tinted by node type (blue-50 for in-progress, red-50 for completed, teal-50 for chapter-end), `rounded-xl` (12px), `border-2` in matching accent color, 16px padding. Selected state: amber `ring-2 ring-offset-1`.
- **Dropdown / user menu:** `rounded-xl` (12px), `border border-white/10`, `shadow-2xl`, dark gradient background (`#1e1b3a` to `#0f172a`). Only appears on dark surfaces.

### Inputs / Fields

- **Standard input:** White background, `rounded-lg` (8px), `border border-gray-200`, 16px vertical / 12px horizontal padding. Focus: `ring-2 ring-amber-400 ring-offset-2`, border shifts to amber.
- **Dark surface input:** `bg-white/5` background, `border border-white/10`, white text. Focus: same amber ring.
- **Error state:** `border-red-400`, red-50 background tint, red error text below.

### Navigation

- **Desktop header:** Dark gradient background (`linear-gradient(135deg, #1a1025, #0f172a, #1a1025)`), top shimmer line in amber/violet. Nav links in gray-300, white on hover. Active link in amber-400 with a 2px amber underline bar.
- **Mobile menu:** Slides open as a panel in the same dark gradient. Active links gain `bg-white/10` fill + amber text.
- **Editor toolbar:** Reversed to light: white background, `border-b border-gray-200`, `shadow-sm`. Amber primary action, gray secondary, dark save button. The contrast with the dark canvas below it is intentional; the toolbar reads as the interface's control plane.

### Signature Component: Choice Button (Reader)

The choice button is the most distinctive component in the product. A full-width `rounded-xl` button with a white background, 2px slate-200 border, amber hover border, and an alphabetic badge on the left. The badge cycles through six gradient color pairs to create visual rhythm across choices. An arrow icon on the right translates to amber on hover. Hover state lifts the button slightly (`-translate-y-0.5`) with an increased shadow. Disabled state dims to 70% opacity and removes hover movement.

---

## 6. Do's and Don'ts

### Do:
- **Do** use the amber-to-orange gradient exclusively on the single highest-priority CTA per surface. Its rarity makes it the product's visual north star.
- **Do** use Ink Night (`#1a1025`) and Deep Slate (`#0f172a`) for all dark surfaces. Purple-tinted near-blacks only.
- **Do** express hierarchy through type weight and size contrast: at least a 1.25x size ratio or two weight steps between adjacent levels.
- **Do** let shadows respond to state: `shadow-sm` at rest, `shadow-md` or higher on hover or elevation.
- **Do** use rounded corners throughout: 8px for buttons/inputs, 12px for cards and nodes, 16px for modals and larger containers.
- **Do** tint every neutral toward the product's brand hue. Ink Night is purple-tinted, not charcoal. Parchment is warm gray, not cold.
- **Do** use amber (`#f59e0b`) flat for in-product primary actions; reserve the gradient for top-level acquisition and navigation CTAs.
- **Do** keep body text within 65-75ch in reading contexts (scene content, long descriptions).

### Don't:
- **Don't** use generic SaaS aesthetics: no Notion-clone white card grids with blue primary buttons, no gray dashboards that could belong to any productivity tool. StoryQuestor is a creative tool for storytellers.
- **Don't** use pure black (`#000000`) or pure white (`#ffffff`) as backgrounds. Page White is the lightest surface; Ink Night is the darkest.
- **Don't** apply the amber-to-orange gradient to more than one element per surface. If two things have the gradient, neither stands out.
- **Don't** use `border-left` or `border-right` greater than 1px as a colored accent stripe on cards or list items. Use background tints or full borders instead.
- **Don't** use gradient text (`background-clip: text`). Use solid amber or violet for color emphasis; use weight and size for hierarchy.
- **Don't** add decorative shadows. Every shadow communicates state (hover, elevation, focus) or structure. A shadow with no interactive or structural purpose is removed.
- **Don't** mix more than two accent colors on a single screen without semantic justification. The choice badge is the exception, and it's justified by the game-like context.
- **Don't** use glassmorphism (blurred backgrounds, semi-transparent glass cards) as a default aesthetic. The header shimmer line is the limit of blur-adjacent decoration.
- **Don't** use neutral dark grays for dark backgrounds. All dark surfaces use the purple-shifted Ink Night palette; a mid-gray dark background signals a different product.
