# Auto Inspect Pro v2 — Complete Build Specification

> This file is the entire spec for building Auto Inspect Pro v2 from scratch.
> Paste it into a fresh Claude Code session in an empty repo and let Claude build it.

---

## 1. Project Overview

**Auto Inspect Pro** is a vehicle inspection tool used by Really Easy Car Credit. Inspectors assess vehicles on phones and tablets, grading items as Pass/Advisory/Fail, capturing photos, marking body damage, and generating reports for customers and sellers.

**v2 goals:** Effortlessly user friendly, frictionless, smart, and slick. Single-screen inspection start, focused card-stack grading, offline-first, rich reports, and a warm premium visual identity called Tangerine and Twilight.

---

## 2. Tech Stack

### Core
- **React 19** + **TypeScript** (strict mode)
- **Vite** (dev server, builds, no SSR)
- **Tailwind CSS v4** (CSS custom properties for tokens, @tailwindcss/forms plugin)
- **Supabase** (auth via magic link, PostgreSQL DB, storage buckets, edge functions)
- **Zustand** (client state with persist middleware and immer for nested updates)

### Libraries
| Purpose | Library |
|---------|---------|
| Offline DB | **Dexie.js** (IndexedDB wrapper, live queries, migrations) |
| Server state | **@tanstack/react-query** (VRM lookups, MOT, Supabase sync) |
| PDF generation | **@react-pdf/renderer** (component-based PDFs with photos) |
| Validation | **Zod** (runtime schemas, form integration) |
| Animations | **Framer Motion** (gestures, springs, layout animations) |
| Forms | **React Hook Form** (performance, Zod resolver) |
| Component variants | **cva** (class-variance-authority, type-safe) |
| Icons | **Lucide React** (stroke 1.75, consistent set) |
| PWA | **vite-plugin-pwa** (service worker, install prompt, offline shell) |
| Keyboard shortcuts | **react-hotkeys-hook** (tablet shortcut support) |
| Routing | **React Router v7** |
| UUID | **crypto.randomUUID()** (native, zero bundle) |

### NOT using
- React Native / Capacitor (PWA covers camera, haptics, offline)
- Next.js / Remix (no SEO needs, no SSR benefits)
- Any AI SDK at build time (mock-first approach, wired up later)

---

## 3. Folder Structure

```
auto-inspect-pro-v2/
├── public/
│   ├── manifest.json
│   └── icons/              (PWA icons 192, 512)
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── src/
│   ├── app/
│   │   ├── App.tsx         (Root: providers, theme init, online listener, toasts)
│   │   ├── routes.tsx      (React Router config + ProtectedRoute wrapper)
│   │   └── providers.tsx   (QueryClientProvider, Zustand context)
│   ├── features/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── useAuth.ts
│   │   ├── dashboard/
│   │   │   ├── DashboardPage.tsx
│   │   │   └── InspectionCard.tsx
│   │   ├── inspection/
│   │   │   ├── QuickStartPage.tsx       (unified VRM + config + begin)
│   │   │   ├── InspectionOverview.tsx   (section grid, free-roam nav)
│   │   │   ├── GradingPage.tsx          (card-stack grading)
│   │   │   ├── SwipeGradeCard.tsx       (single item full-screen card)
│   │   │   ├── GradeButtons.tsx         (Pass/Advisory/Fail, massive targets)
│   │   │   ├── SectionRail.tsx          (bottom rail for cross-section jumping)
│   │   │   ├── ProgressDots.tsx         (Instagram Stories style dots)
│   │   │   └── ListView.tsx             (optional list toggle for experienced users)
│   │   ├── camera/
│   │   │   ├── CameraCapture.tsx        (live brightness, guide overlay)
│   │   │   ├── PhotoGallery.tsx         (pinch-zoom, annotations)
│   │   │   └── BatchMode.tsx            (walkaround continuous capture)
│   │   ├── body-diagram/
│   │   │   ├── BodyDiagramPage.tsx
│   │   │   ├── DiagramCanvas.tsx        (4-view SVG with click-to-place)
│   │   │   └── MarkerSheet.tsx          (damage type/severity bottom sheet)
│   │   ├── report/
│   │   │   ├── SummaryPage.tsx          (final review + submission)
│   │   │   ├── CustomerViewPage.tsx     (public shareable report)
│   │   │   ├── SellerModePage.tsx       (immersive presentation)
│   │   │   ├── PdfReport.tsx            (react-pdf document)
│   │   │   └── WebReport.tsx            (interactive web version)
│   │   └── lookup/
│   │       ├── useDvlaLookup.ts         (VRM → vehicle data, mock-first)
│   │       ├── useMotHistory.ts         (MOT history, mileage anomaly)
│   │       └── useKnownIssues.ts        (model-specific faults, mock-first)
│   ├── shared/
│   │   ├── components/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── TextArea.tsx
│   │   │   ├── StatusPill.tsx
│   │   │   ├── BottomSheet.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── TopBar.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── SaveIndicator.tsx        (green/amber/grey pulsing dot)
│   │   │   ├── BigNumber.tsx            (animated count-up score display)
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── Logo.tsx                 (brand mark + wordmark)
│   │   ├── illustrations/
│   │   │   ├── CarIllustration.tsx
│   │   │   ├── ClipboardIllustration.tsx
│   │   │   ├── MagnifyingGlassIllustration.tsx
│   │   │   ├── TickIllustration.tsx
│   │   │   └── MechanicIllustration.tsx
│   │   ├── hooks/
│   │   │   ├── useHaptics.ts
│   │   │   ├── useOnlineStatus.ts
│   │   │   ├── useAutoSave.ts
│   │   │   └── useKeyboardShortcuts.ts
│   │   ├── lib/
│   │   │   ├── db.ts                    (Dexie setup)
│   │   │   ├── sync.ts                  (offline sync queue)
│   │   │   ├── supabase.ts              (client init)
│   │   │   ├── pdf.ts                   (PDF generation helpers)
│   │   │   └── photo.ts                 (brightness scoring, resize)
│   │   ├── validation/
│   │   │   └── schemas.ts              (all Zod schemas)
│   │   ├── config/
│   │   │   ├── sections.ts             (11 inspection sections + items)
│   │   │   ├── grades.ts               (grade metadata, colours)
│   │   │   └── mockData.ts             (mock VRM + known issues responses)
│   │   └── types/
│   │       └── index.ts                (all TypeScript types)
│   ├── stores/
│   │   ├── inspectionStore.ts
│   │   ├── authStore.ts
│   │   ├── uiStore.ts
│   │   └── themeStore.ts
│   ├── index.css                       (Tailwind + design tokens)
│   └── main.tsx                        (entry point)
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.example
```

---

## 4. Design System — Tangerine and Twilight

### 4.1 Philosophy

The visual language: warm vibrant hero colour, deep grounding dark, warm soft cream surface, generous spacing, bold pill buttons, rounded card based layouts, friendly tone of voice, soft shadows, big confident typography, and a feeling of warmth and human optimism.

Every visual and copy decision passes this filter: "Does this feel warm, human, optimistic and confidently simple?"

- Warm not sterile
- Confident not corporate
- Friendly not childish
- Generous not crammed
- Bold not loud

If a component feels like a generic SaaS dashboard, it is wrong.

Do NOT use Monzo's coral, navy, M logomark, wordmark or Monzo Sans typeface anywhere.

### 4.2 Colour Tokens

Add as CSS custom properties on `:root` AND extend Tailwind config.

```css
:root {
  /* Primary: Tangerine */
  --color-tangerine-50:  #FFF2EE;
  --color-tangerine-100: #FFDFD5;
  --color-tangerine-200: #FFBBA8;
  --color-tangerine-300: #FF9077;
  --color-tangerine-400: #FF7558;
  --color-tangerine-500: #FF6244;  /* Hero tangerine. Default brand colour. */
  --color-tangerine-600: #E54B30;
  --color-tangerine-700: #B83A22;
  --color-tangerine-800: #8A2B18;
  --color-tangerine-900: #5C1B10;

  /* Primary: Twilight */
  --color-twilight-50:  #EDEDF3;
  --color-twilight-100: #CECEE0;
  --color-twilight-200: #9A9AB8;
  --color-twilight-300: #5C5C85;
  --color-twilight-400: #353570;
  --color-twilight-500: #25255A;
  --color-twilight-600: #1F1F52;
  --color-twilight-700: #1B1B47;  /* Hero twilight. Default dark surface. */
  --color-twilight-800: #131333;
  --color-twilight-900: #0A0A1F;

  /* Soft cream surfaces */
  --color-cream-50:  #FFFDF9;
  --color-cream-100: #FBF5EB;   /* Default page background. */
  --color-cream-200: #F5EDD9;
  --color-cream-300: #ECE0C2;

  /* Accents, used sparingly */
  --color-gold:   #FFCC4A;
  --color-blush:  #FFB1C8;
  --color-teal:   #2DBFB0;
  --color-mint:   #8AD9C2;
  --color-lilac:  #B8B5E8;

  /* Semantic */
  --color-success: #2BB673;
  --color-warning: #FFB020;
  --color-danger:  #E63946;
  --color-info:    #4F8DFA;

  /* Text */
  --text-primary:   var(--color-twilight-700);
  --text-secondary: #5C5C85;
  --text-tertiary:  #9A9AB8;
  --text-inverse:   #FFFDF9;
  --text-brand:     var(--color-tangerine-500);
}
```

**Colour rules:**
- Page background is cream-100, never pure white. Cream feels warm.
- Body text is twilight 700, never pure black.
- Tangerine 500 is the primary action colour: buttons, CTAs, focused inputs, active nav items, brand mark.
- Twilight 700 is the secondary action colour and dark surface: hero panels, sticky headers in scrolled state, bottom nav.
- Accents (gold, blush, teal, mint, lilac) only for status pills, illustration fills, category tags, and small celebratory moments. Never as primary surface or button colour.
- Lilac picks up the violet lean of twilight. Use for hover states on twilight surfaces.

### 4.3 Typography

Load via Google Fonts link tag in index.html:

- **Display** (h1, h2, hero numbers, big stats, large CTA button text): **Bricolage Grotesque**, weights 600 and 700.
- **Body** (everything else): **Inter**, weights 400, 500 and 600.

```ts
// tailwind.config.ts
fontFamily: {
  display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  sans:    ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
}
```

**Type scale:**

| Token        | Size  | Line height | Weight | Family   | Use                                  |
|--------------|-------|-------------|--------|----------|--------------------------------------|
| display-2xl  | 56px  | 60px        | 700    | display  | Marketing hero, splash               |
| display-xl   | 44px  | 48px        | 700    | display  | Page hero, big number stat           |
| display-lg   | 36px  | 40px        | 700    | display  | Major section title                  |
| display-md   | 28px  | 32px        | 700    | display  | Card hero number                     |
| heading-lg   | 22px  | 28px        | 600    | display  | Card title, modal title              |
| heading-md   | 18px  | 24px        | 600    | sans     | Subsection title, list group label   |
| body-lg      | 17px  | 26px        | 400    | sans     | Long form body                       |
| body-md      | 15px  | 22px        | 400    | sans     | Default body                         |
| body-sm      | 13px  | 18px        | 500    | sans     | Metadata, captions                   |
| label        | 12px  | 16px        | 600    | sans     | Pills, tags, eyebrows               |

Letter spacing: tighten display sizes slightly (`-0.01em` on display-lg and larger). Body stays default.

Numbers always use tabular figures (`font-variant-numeric: tabular-nums`) for scores, prices, mileage, timestamps.

### 4.4 Spacing and Rhythm

4px base grid. Use Tailwind spacing utilities.

- Mobile: 20px horizontal page padding
- Desktop: 32px horizontal page padding, content max-width 1200px centred
- Card internal padding: 20px mobile, 24px desktop
- Section vertical rhythm: 48px mobile, 72px desktop

Be generous. If in doubt, add more space. Cramped layouts feel wrong.

### 4.5 Border Radius

```ts
// tailwind.config.ts
borderRadius: {
  'xs': '6px',
  'sm': '10px',
  'md': '14px',
  'lg': '20px',     // Default card radius
  'xl': '28px',     // Hero panels, modals
  '2xl': '36px',
  'pill': '999px',  // All buttons, pills, chips
}
```

Rules:
- All buttons are pill shaped. No square buttons anywhere.
- Cards use `rounded-lg` (20px).
- Hero panels and bottom sheets use `rounded-xl` (28px) on top corners only.
- Inputs use `rounded-md` (14px).
- Avatars and icons sit inside soft squircles using `rounded-lg`.

### 4.6 Shadows and Elevation

Very soft, low contrast. Shadow colours based on twilight 700 at low opacity.

```ts
// tailwind.config.ts
boxShadow: {
  'soft':      '0 1px 2px rgba(27, 27, 71, 0.04), 0 2px 8px rgba(27, 27, 71, 0.04)',
  'card':      '0 2px 4px rgba(27, 27, 71, 0.04), 0 8px 24px rgba(27, 27, 71, 0.06)',
  'elevated':  '0 4px 8px rgba(27, 27, 71, 0.06), 0 16px 40px rgba(27, 27, 71, 0.10)',
  'tangerine': '0 8px 24px rgba(255, 98, 68, 0.32)',  // Glow under primary CTAs on hover
}
```

Cards on cream: `shadow-soft` resting, `shadow-card` on hover.

### 4.7 Motion

Timing tokens (implement via Framer Motion or Tailwind transitions):

- `fast`: 150ms, ease out cubic
- `base`: 250ms, ease out cubic
- `slow`: 400ms, spring with low bounce

Animation rules:
- Buttons scale to 0.97 on press, return on release
- Cards lift 2px on hover with shadow transition
- Page transitions fade and rise 8px over 250ms
- Bottom sheets spring up with overshoot
- Numbers (scores, totals) count up from 0 over 600ms on mount
- Never jarring bounces or long animations. Everything buttery and quick.
- Route transitions via View Transitions API (shared-element morphing)
- Section completion: brief celebration animation
- Progress bar: elastic overshoot on increment

### 4.8 Iconography

**Lucide React** icons throughout.
- Default stroke width: 1.75
- Size: 20px in body, 24px in nav, 32px in feature cards
- Colour follows parent text by default
- Category/status icons: inside a soft squircle background tinted to the relevant accent colour at 12% opacity, icon at full accent colour

### 4.9 Illustrations

Custom inline SVG illustrations (200-320px wide) for empty states and success states. Use the tangerine and twilight palette with cream backgrounds and accent colours for details. Hand drawn feel, slight wobble, no perfect symmetry. No existing brand illustration set mimicked.

Subjects: friendly car, clipboard, magnifying glass, tick in tangerine circle, confused mechanic.

Build as React components in `src/shared/illustrations/`.

---

## 5. Component Specifications

### 5.1 Button

```tsx
// Props
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';  // 36px | 44px | 56px tall
  fullWidth?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  children: React.ReactNode;
}
```

Specs:
- Always pill shape (`rounded-pill`).
- Display font, weight 600.
- **Primary:** tangerine 500 bg, cream 50 text. Hover: tangerine 600 + `shadow-tangerine`. Active: scale 0.97.
- **Secondary:** twilight 700 bg, cream 50 text. Hover: twilight 800.
- **Tertiary:** cream 200 bg, twilight 700 text. Hover: cream 300.
- **Ghost:** transparent bg, tangerine 500 text. Hover: cream 100 bg.
- **Danger:** danger bg, white text.
- Full width common on mobile.
- Icon: 20px, 8px gap from text.
- Disabled: 50% opacity, no hover effects.

### 5.2 Card

```tsx
interface CardProps {
  variant: 'default' | 'feature' | 'tangerine' | 'outlined';
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}
```

Specs:
- **Default:** cream 50 bg, 1px cream 300 border, 20px radius, padding 24px (20px mobile), shadow-soft resting, shadow-card on hover, 200ms transition.
- **Feature:** twilight 700 bg, cream 50 text, no border. Max one per page for hero stat or main CTA.
- **Tangerine:** tangerine 500 bg, twilight 800 text. Celebratory or attention moments.
- **Outlined:** cream 100 bg, 1px cream 300 border, no shadow.

### 5.3 Input

```tsx
interface InputProps {
  label: string;
  helper?: string;
  error?: string;
  suffix?: string;  // For units (mph, cc, miles)
  size?: 'md' | 'lg';  // 48px desktop | 56px mobile
}
```

Specs:
- `rounded-md` (14px) corners.
- 56px tall on mobile (touch friendly), 48px on desktop.
- Cream 50 bg, cream 300 border.
- Focus: tangerine 500 border + glow ring (`0 0 0 4px rgba(255, 98, 68, 0.16)`).
- Label above: body sm, twilight 400, weight 600.
- Helper text below: body sm, twilight 300.
- Error: danger border, danger helper text.
- Suffix (currency, mileage): faded twilight 200 inside input, right aligned.

### 5.4 StatusPill

```tsx
interface StatusPillProps {
  status: 'pass' | 'advisory' | 'fail' | 'in_progress' | 'draft' | 'info';
  label: string;
}
```

Specs:
- Pill shape, body sm (13px), weight 600, 24px tall, 10px horizontal padding.
- Background at 12% opacity of accent, text at full accent colour.
- Pass: success. Advisory/Warning: warning. Fail: danger. In Progress: info. Draft: twilight 8% + twilight 400 text.

### 5.5 BigNumber (Inspection Score Display)

```tsx
interface BigNumberProps {
  value: number;
  label: string;
  delta?: number;  // +/- change indicator
  animate?: boolean;
}
```

Specs:
- Number in display-2xl (56px), tangerine 500.
- Animated count up from 0 over 600ms on mount (using requestAnimationFrame).
- Label below in body sm, twilight 300.
- Optional delta: up arrow in success, down arrow in danger, body sm.
- Tabular nums for alignment.

### 5.6 SaveIndicator

Persistent in top bar:
- Green pulsing dot: saved
- Amber pulsing dot: saving in progress
- Grey dot: offline (queued)
- Every save triggers a subtle ring animation (scale 1 → 1.5 → 0, 300ms)

### 5.7 BottomSheet

- Mobile only (desktop uses Modal).
- 28px top radius, springs up over 400ms with slight overshoot.
- Drag handle: 32px wide, 4px tall, cream 300, centred at top with 12px top margin.
- Backdrop: twilight 900 at 40% opacity.
- Swipe down to dismiss.

### 5.8 Modal

- Desktop only (mobile uses BottomSheet).
- Max width 480px (confirms) or 640px (forms).
- Cream 50 bg, 28px radius, elevated shadow.
- Backdrop: twilight 900 at 40% + 4px backdrop blur.
- Focus trap, return focus on close.
- Title in heading-lg, body in body-md, actions right-aligned.

### 5.9 Navigation

**Mobile bottom nav:**
- Floating pill shape, twilight 700 bg, 16px from viewport bottom, centred.
- 4-5 icons max, 24px Lucide icons.
- Active: tangerine 500 icon + small tangerine pill (16px wide, 3px tall) underneath.
- Inactive: cream 200 icons.
- 64px tall, safe area padding below.

**Desktop sidebar:**
- 240px wide, fixed left.
- Cream 100 bg, 1px right border in cream 300.
- Logo top left with generous padding.
- Nav items: 44px tall pills, full width minus 16px padding each side.
- Active: tangerine 50 bg, tangerine 700 text, tangerine 500 icon.
- Inactive: twilight 400 text, twilight 700 on hover.
- 8px gap between nav items.

### 5.10 EmptyState

```tsx
interface EmptyStateProps {
  illustration: 'car' | 'clipboard' | 'magnifying-glass' | 'tick' | 'mechanic';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

Specs:
- Custom illustration top, 200-240px wide.
- Title in heading-lg: upbeat tone ("Nothing here yet", "Let's get started").
- Description in body-md: 1-2 sentences, warm and specific.
- Primary button for obvious next action.
- All vertically and horizontally centred.

### 5.11 ProgressBar

- Tangerine 500 fill on cream 200 track.
- 8px tall, rounded-pill ends.
- Elastic overshoot animation on increment (spring physics via Framer Motion).
- Label above: body sm showing "Step X of Y" or percentage.

### 5.12 Logo

- Rounded tangerine 500 squircle, 40x40px, 12px corner radius.
- "AI" inside in cream 50, Bricolage Grotesque 700, optically centred.
- Wordmark version: squircle + "Auto Inspect Pro" in Bricolage Grotesque 700, twilight 700, 18px, 8px gap.

---

## 6. Page Specifications

### 6.1 Login Page

**Desktop:** Split layout.
- Left half: tangerine 500 bg, display headline "Inspect with confidence" in cream 50. Car illustration bottom right of panel.
- Right half: cream 100 bg. Centred form card (max 400px). Email input + "Send magic link" primary button. Demo login links below.

**Mobile:** Stacked.
- Top: tangerine strip 200px tall with title only.
- Below: form on cream 100.

**Auth flow:** Supabase magic link (OTP via email). Demo mode available with hardcoded users.

**Demo users:**
- Inspector: `inspector@recc.co.uk` / role: inspector / name: "Demo Inspector"
- Manager: `manager@recc.co.uk` / role: manager / name: "Demo Manager"

### 6.2 Dashboard Page

**Header:** display-lg "Inspections" + primary "New inspection" button top right.

**Feature card (twilight variant):** This week's stats:
- Total inspections (display-md, tangerine, animated count-up)
- Average score
- Pass rate percentage
- 3 numbers in a row, each with body-sm label below

**Inspection list:** Cards in single column mobile, 2-3 column grid desktop. Each card:
- Vehicle make + model (heading-md)
- VRM in mono weight
- Date, inspector name (body-sm, twilight 300)
- StatusPill showing overall grade
- Tap to navigate to inspection detail

**Manager additions:**
- Fourth stat: Failed count
- Filter bar: pills for type (All/Private/PDI), status (Active/Done), grade (All/Pass/Advisory/Fail)
- Shows all inspectors' work

**Empty state:** Clipboard illustration + "No inspections yet, your first one will live here" + "Start inspection" button.

### 6.3 Quick Start Page (New Inspection)

**Single screen replaces the old 4-screen wizard.**

Layout:
1. Large VRM input at top (display font, uppercase, pill shape, auto-focus). "Go" button right of input.
2. On VRM submit: vehicle card auto-fills inline below (make, colour, year, fuel, engine from DVLA/mock)
3. Below vehicle card: compact pill selectors for:
   - Fuel type (pre-filled from lookup, editable)
   - Transmission (manual/automatic)
   - Mileage input (with "miles" suffix)
   - Inspection type (Private Purchase / PDI pills)
4. Known Issues card (collapsed by default, expand to see model-specific faults from mock/AI)
5. One large "Begin Inspection" primary button at bottom

**Total interaction: type VRM + 3 taps = inspecting within 10 seconds.**

**Mock data:** When `VITE_USE_MOCKS=true`, VRM lookups return canned responses. See section 12.

### 6.4 Inspection Overview Page

**Free-roam grid** showing all 11 sections as cards. Each card:
- Section icon (Lucide, inside accent squircle)
- Section name (heading-md)
- Progress: "3/5 items graded" (body-sm)
- Status indicator: not started (grey), in progress (info), completed (success tick)
- Tap to enter grading for that section

**"Continue where you left off"** prominent card at top if inspection is in progress (shows last graded section + next ungraded item).

**"Suggested next"** section highlighted with subtle tangerine border.

**Bottom action bar:** "Body Diagram" button (secondary) + "Complete Inspection" button (primary, only active when all sections done).

### 6.5 Grading Page (Card Stack)

**The core innovation of v2.** One item fills the screen at a time.

**Layout:**
- **Top:** Progress dots (Instagram Stories style). Tap any to jump. Current dot is tangerine 500, completed dots are success green, remaining are cream 300.
- **Middle:** Item card:
  - Item name (heading-lg)
  - Description text (body-md, twilight 300)
  - Hint text in a subtle info box (body-sm)
  - Photo thumbnail strip if photos attached
- **Bottom half:** Three MASSIVE grade buttons (thumb-zone optimised):
  - Pass (success green bg, white text, checkmark icon)
  - Advisory (warning amber bg, twilight 800 text, alert-triangle icon)
  - Fail (danger red bg, white text, x-circle icon)
  - Each button: 72px tall minimum, full width, 12px gap between
- **Section rail** at very bottom: horizontal scroll of section names as pills, current highlighted

**Interactions:**
- Tap Pass → auto-advance to next item (200ms slide animation)
- Tap Advisory or Fail → notes panel slides up (TextArea + photo capture button), then "Next" button to advance
- Swipe left/right between items (Framer Motion gesture)
- Haptic feedback on grade: light buzz (pass), double-buzz (advisory), long buzz (fail)

**Tyre depth items:** When item has `hasTyreDepths: true`, show 4 number inputs (NSF, OSF, NSR, OSR) with "mm" suffix instead of the standard notes panel.

**List view toggle:** Icon button top right. Switches to scrollable list (for experienced users who prefer scanning). Persisted preference in localStorage.

### 6.6 Body Diagram Page

**Inline during Exterior Condition grading** (appears below grade buttons when on exterior items) AND accessible as full-page from Inspection Overview.

**4 views:** Front, Rear, Driver Side, Passenger Side (tab pills at top).

**SVG canvas:** Vehicle outline for selected view. Tap to place marker. Markers are numbered circles colour-coded by severity:
- Minor: warning colour
- Moderate: tangerine 600
- Severe: danger colour

**On marker place:** BottomSheet opens with:
- Damage type pills: Dent, Scratch, Chip, Crack, Rust, Other
- Severity pills: Minor, Moderate, Severe
- Notes TextArea
- "Add photo" button
- "Save marker" primary button

**Marker list:** Below diagram, scrollable list of all markers for current view. Tap to edit, swipe to delete.

**Coordinates:** Percentage-based (0-100 on both axes) for responsive scaling.

### 6.7 Summary Page

**Top:** BigNumber component inside feature card showing overall grade and counts:
- Pass count (success), Advisory count (warning), Fail count (danger)
- Overall grade as large StatusPill

**Sections:** Expandable cards for each section. Collapsed shows section name + grade summary. Expanded shows each item with its grade, notes, and photo thumbnails.

**Known Issues card** (if available): Lists model-specific issues from lookup.

**Actions:**
- "Download PDF" (secondary button)
- "Share with customer" (primary button, generates/copies public URL)
- "Present to seller" (tertiary button, navigates to seller mode)

### 6.8 Seller Mode Page

**Immersive fullscreen experience for private purchase negotiations.**

- Full-screen mode (hides browser chrome where supported via Fullscreen API)
- **PIN-locked exit:** triple-tap bottom-right corner reveals PIN prompt. 4-digit PIN (generated per inspection).

**Layout:**
1. Vehicle hero: large photo gallery (swipeable), make/model/year in display-lg
2. Animated grade reveal: overall grade StatusPill scales up with spring animation
3. Fault list: only advisory and fail items shown, each with:
   - Item label
   - Grade pill
   - Notes
   - Photo evidence thumbnails (tap to expand)
4. Body diagram summary (if markers exist): mini diagram with markers
5. **Price waterfall** (the key negotiation element):
   - "Agreed Price" in display-md (twilight 700)
   - Minus sign + "Estimated Repairs" in body-lg (danger colour) showing cost range
   - Equals sign + "Revised Offer" in display-lg (tangerine 500, prominent)
   - Calculation: `agreedPrice - ((totalCostLow + totalCostHigh) / 2)`
6. Digital signature pad for acceptance (canvas element)
7. "All clear" message with tick illustration if no faults found

### 6.9 Customer View Page (Public)

**Accessed via `/view/:token` (no auth required).**

Interactive web report:
- Vehicle info header
- Overall grade with BigNumber
- Photo gallery (swipeable, pinch-zoom)
- Body diagram with markers (read-only)
- Expandable section cards with grades
- QR code to download PDF
- "Powered by Auto Inspect Pro" footer with brand mark

### 6.10 Settings Page

Single centred column, max 640px.
- Section headings in heading-md
- Cream 300 dividers
- Generous vertical rhythm (48px between sections)
- Sections: Profile, Notifications, Theme toggle, About

---

## 7. Data Model (Zod Schemas)

```typescript
import { z } from 'zod';

// Enums
export const GradeSchema = z.enum(['pass', 'advisory', 'fail']);
export const InspectionTypeSchema = z.enum(['private_purchase', 'pdi']);
export const InspectionStatusSchema = z.enum(['draft', 'in_progress', 'completed', 'submitted', 'amended']);
export const FuelTypeSchema = z.enum(['petrol', 'diesel', 'hybrid', 'electric']);
export const TransmissionTypeSchema = z.enum(['manual', 'automatic']);
export const DamageTypeSchema = z.enum(['dent', 'scratch', 'chip', 'crack', 'rust', 'other']);
export const DamageSeveritySchema = z.enum(['minor', 'moderate', 'severe']);
export const DiagramViewSchema = z.enum(['front', 'rear', 'driver', 'passenger']);
export const SyncStatusSchema = z.enum(['pending', 'syncing', 'synced', 'error']);
export const SectionStatusSchema = z.enum(['not_started', 'in_progress', 'completed']);
export const UserRoleSchema = z.enum(['inspector', 'manager', 'admin']);

// Core entities
export const TyreDepthsSchema = z.object({
  nsf: z.number().min(0).max(20).nullable(),
  osf: z.number().min(0).max(20).nullable(),
  nsr: z.number().min(0).max(20).nullable(),
  osr: z.number().min(0).max(20).nullable(),
});

export const InspectionItemSchema = z.object({
  id: z.string().uuid(),
  sectionKey: z.string(),
  itemKey: z.string(),
  label: z.string(),
  grade: GradeSchema.nullable(),
  notes: z.string().nullable(),
  tyreDepths: TyreDepthsSchema.nullable(),
  itemOrder: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const InspectionSectionSchema = z.object({
  id: z.string().uuid(),
  sectionKey: z.string(),
  sectionOrder: z.number(),
  status: SectionStatusSchema,
  items: z.array(InspectionItemSchema),
});

export const BodyDamageMarkerSchema = z.object({
  id: z.string().uuid(),
  inspectionId: z.string().uuid(),
  view: DiagramViewSchema,
  xPercent: z.number().min(0).max(100),
  yPercent: z.number().min(0).max(100),
  damageType: DamageTypeSchema,
  severity: DamageSeveritySchema,
  notes: z.string().nullable(),
  photoId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
});

export const InspectionPhotoSchema = z.object({
  id: z.string().uuid(),
  inspectionId: z.string().uuid(),
  itemId: z.string().uuid().nullable(),
  markerId: z.string().uuid().nullable(),
  storagePath: z.string(),
  thumbnailPath: z.string().nullable(),
  caption: z.string().nullable(),
  brightnessScore: z.number().nullable(),
  resolutionOk: z.boolean(),
  sortOrder: z.number(),
  createdAt: z.string().datetime(),
});

export const InspectionSchema = z.object({
  id: z.string().uuid(),
  inspectorId: z.string().uuid(),
  type: InspectionTypeSchema,
  status: InspectionStatusSchema,
  vrm: z.string().min(2).max(8),
  vehicleMake: z.string(),
  vehicleModel: z.string(),
  vehicleYear: z.number().min(1900).max(2030),
  vehicleColor: z.string().nullable(),
  vehicleFuelType: FuelTypeSchema,
  vehicleEngineSize: z.string().nullable(),
  vehicleTransmissionType: TransmissionTypeSchema,
  mileage: z.number().min(0),
  motData: z.any().nullable(),
  dvlaData: z.any().nullable(),
  agreedPurchasePrice: z.number().nullable(),
  finalAgreedPrice: z.number().nullable(),
  overallGrade: GradeSchema.nullable(),
  passCounts: z.number().default(0),
  advisoryCounts: z.number().default(0),
  failCounts: z.number().default(0),
  knownIssues: z.array(z.object({
    issue: z.string(),
    detail: z.string(),
  })).nullable(),
  publicToken: z.string(),
  sellerPin: z.string().length(4),
  notes: z.string().nullable(),
  isReinspection: z.boolean().default(false),
  originalInspectionId: z.string().uuid().nullable(),
  syncStatus: SyncStatusSchema,
  sections: z.array(InspectionSectionSchema),
  damageMarkers: z.array(BodyDamageMarkerSchema),
  photos: z.array(InspectionPhotoSchema),
  completedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string(),
  role: UserRoleSchema,
  phone: z.string().nullable(),
  pin: z.string().length(4).nullable(),
});

// Form schemas (subset for creation)
export const NewInspectionFormSchema = z.object({
  vrm: z.string().min(2).max(8).transform(v => v.toUpperCase().replace(/\s/g, '')),
  type: InspectionTypeSchema,
  fuelType: FuelTypeSchema,
  transmissionType: TransmissionTypeSchema,
  mileage: z.number().min(0),
  agreedPurchasePrice: z.number().min(0).optional(),
});
```

---

## 8. Inspection Sections Configuration

```typescript
// src/shared/config/sections.ts

import { FileText, Car, Lightbulb, Circle, Disc, Wrench, Armchair, Zap, Gauge, Cpu, Sparkles } from 'lucide-react';

export interface InspectionItemConfig {
  key: string;
  label: string;
  description: string;
  hint: string;
  requiredPhotos: boolean;
  photoPrompt: string;
  fuelTypeFilter?: FuelType[];
  transmissionFilter?: TransmissionType[];
  hasTyreDepths?: boolean;
}

export interface SectionConfig {
  key: string;
  label: string;
  icon: LucideIcon;
  order: number;
  inspectionTypes: InspectionType[];
  items: InspectionItemConfig[];
}

export const SECTIONS: SectionConfig[] = [
  {
    key: 'vehicle_identity',
    label: 'Vehicle Identity and Documentation',
    icon: FileText,
    order: 1,
    inspectionTypes: ['private_purchase', 'pdi'],
    items: [
      {
        key: 'v5c_present',
        label: 'V5C present and verified',
        description: 'Check the V5C logbook is present and matches the vehicle.',
        hint: 'Compare VRM, VIN, make, model, and colour against the physical vehicle. Check the watermark and paper quality for authenticity.',
        requiredPhotos: true,
        photoPrompt: 'Photograph the V5C front page showing the VRM and registered keeper details.',
      },
      {
        key: 'mot_status',
        label: 'MOT status',
        description: 'Verify current MOT status and history.',
        hint: 'Cross reference with the MOT history data. Check expiry date, any recent advisories that became failures.',
        requiredPhotos: false,
        photoPrompt: '',
      },
      {
        key: 'timing_belt',
        label: 'Timing belt status',
        description: 'Determine timing belt/chain service history.',
        hint: 'Check service book or stamps for belt replacement. Most belts need replacement every 60k to 100k miles or 5 years. Chains are typically lifetime but listen for rattle.',
        requiredPhotos: false,
        photoPrompt: '',
        fuelTypeFilter: ['petrol', 'diesel'],
      },
      {
        key: 'both_keys',
        label: 'Both keys present',
        description: 'Verify both keys are available and functional.',
        hint: 'Test both keys lock, unlock, and start the vehicle. Check key fob battery condition (dim LED or slow response indicates low battery).',
        requiredPhotos: false,
        photoPrompt: '',
      },
      {
        key: 'locking_nut_key',
        label: 'Locking wheel nut key',
        description: 'Check locking wheel nut key is present.',
        hint: 'Usually found in the boot with the spare wheel kit, glovebox, or in a pouch. Match the pattern to one of the wheel nuts.',
        requiredPhotos: false,
        photoPrompt: '',
      },
    ],
  },
  {
    key: 'exterior',
    label: 'Exterior Condition',
    icon: Car,
    order: 2,
    inspectionTypes: ['private_purchase', 'pdi'],
    items: [
      {
        key: 'exterior_condition',
        label: 'Overall exterior condition',
        description: 'Assess the overall bodywork, paint, and exterior trim.',
        hint: 'Walk around the vehicle slowly. Check for dents, scratches, stone chips, rust, misaligned panels, overspray, different paint textures between panels (indicates previous repair). Use the body diagram to mark specific damage.',
        requiredPhotos: true,
        photoPrompt: 'Photograph each corner of the vehicle and any damage found. Mark damage on the body diagram.',
      },
    ],
  },
  {
    key: 'glass_lights',
    label: 'Glass and Lights',
    icon: Lightbulb,
    order: 3,
    inspectionTypes: ['private_purchase', 'pdi'],
    items: [
      {
        key: 'glass_lights_condition',
        label: 'Glass and lights condition',
        description: 'Inspect all glass, mirrors, and lighting.',
        hint: 'Check windscreen for chips (especially in the swept area), all windows for cracks, mirrors for damage. Test all lights: headlights (dipped and main beam), fog lights, indicators, brake lights, reverse lights, number plate lights. Check for condensation inside light units.',
        requiredPhotos: true,
        photoPrompt: 'Photograph any glass damage, condensation in light units, or non functioning lights.',
      },
    ],
  },
  {
    key: 'tyres_wheels',
    label: 'Tyres and Wheels',
    icon: Circle,
    order: 4,
    inspectionTypes: ['private_purchase', 'pdi'],
    items: [
      {
        key: 'tyre_condition',
        label: 'Tyre condition and tread',
        description: 'Measure tread depth and assess tyre condition on all four corners.',
        hint: 'Use a tread depth gauge. Legal minimum is 1.6mm across the central 3/4 of the tread. Check for uneven wear (indicates alignment or suspension issues), sidewall damage, bulges, cracking, and age (DOT code on sidewall). Note tyre brand and whether they match across axles.',
        requiredPhotos: true,
        photoPrompt: 'Photograph any damaged tyres showing the issue clearly.',
        hasTyreDepths: true,
      },
    ],
  },
  {
    key: 'brakes',
    label: 'Brakes',
    icon: Disc,
    order: 5,
    inspectionTypes: ['private_purchase', 'pdi'],
    items: [
      {
        key: 'brake_condition',
        label: 'Overall brake condition',
        description: 'Assess brake discs, pads, and system.',
        hint: 'Visually inspect disc condition through the wheel spokes (look for lipping, scoring, rust). Check pad depth if visible. Test brake pedal feel (should be firm, not spongy). Test handbrake holds on a slope. Listen for grinding or squealing.',
        requiredPhotos: true,
        photoPrompt: 'Photograph brake discs through wheels showing condition.',
      },
    ],
  },
  {
    key: 'under_bonnet',
    label: 'Under Bonnet',
    icon: Wrench,
    order: 6,
    inspectionTypes: ['private_purchase', 'pdi'],
    items: [
      {
        key: 'fluid_levels',
        label: 'Fluid levels and condition',
        description: 'Check all fluid levels and their condition.',
        hint: 'Check engine oil (level and colour, milky = head gasket), coolant (level and colour, should not be rusty), brake fluid (level, should be clear/amber not dark), power steering fluid, washer fluid. Check for contamination between fluids.',
        requiredPhotos: false,
        photoPrompt: '',
      },
      {
        key: 'visual_leaks',
        label: 'Visual leaks and condition',
        description: 'Look for any fluid leaks or damage under the bonnet.',
        hint: 'Look for oil seepage around rocker cover gasket, head gasket area, around turbo (if fitted). Check for coolant residue (white/green crystals). Check hoses for perishing or swelling. Look underneath the car for drip marks.',
        requiredPhotos: true,
        photoPrompt: 'Photograph any visible leaks, residue, or damage.',
      },
      {
        key: 'engine_bay_condition',
        label: 'General engine bay condition',
        description: 'Overall assessment of the engine bay.',
        hint: 'Look for overall cleanliness (overly clean may be hiding leaks), corrosion, modified parts, missing covers, damaged wiring, rodent damage, and general neglect indicators.',
        requiredPhotos: false,
        photoPrompt: '',
      },
    ],
  },
  {
    key: 'interior',
    label: 'Interior',
    icon: Armchair,
    order: 7,
    inspectionTypes: ['private_purchase', 'pdi'],
    items: [
      {
        key: 'interior_condition',
        label: 'Interior condition',
        description: 'Assess seats, carpet, headlining, trim, and dashboard.',
        hint: 'Check driver seat bolster wear, carpet staining, headlining sagging, dashboard cracks, steering wheel wear, gear knob wear. These indicate true usage. Check boot area including spare wheel well for water ingress.',
        requiredPhotos: true,
        photoPrompt: 'Photograph any interior damage, staining, or excessive wear.',
      },
      {
        key: 'smells',
        label: 'Smells',
        description: 'Check for unusual or concerning odours.',
        hint: 'Sit in the car with windows closed. Check for damp/musty smell (water leak), burning smell (electrical or oil), sweet smell (coolant leak into heater matrix), cigarette smoke (check headlining staining). Run the heater to check for sweet smell.',
        requiredPhotos: false,
        photoPrompt: '',
      },
    ],
  },
  {
    key: 'electrics_hvac',
    label: 'Electrics and HVAC',
    icon: Zap,
    order: 8,
    inspectionTypes: ['private_purchase', 'pdi'],
    items: [
      {
        key: 'warning_lights',
        label: 'Dashboard warning lights',
        description: 'Check for any active warning lights after engine start.',
        hint: 'Turn ignition to position 2 (all lights should illuminate for bulb check). Start the engine, all warning lights should extinguish within a few seconds. Any remaining lights indicate faults. Pay special attention to: engine management, ABS, airbag, DPF, battery.',
        requiredPhotos: true,
        photoPrompt: 'Photograph the dashboard with engine running showing any active warning lights.',
      },
      {
        key: 'electrical_systems',
        label: 'Electrical systems and HVAC',
        description: 'Test all electrical systems and climate control.',
        hint: 'Test: all windows (up and down fully), central locking, electric mirrors, heated rear screen, air conditioning (should blow cold within 30 seconds), heater, blower on all speeds, radio/infotainment, USB ports, 12V socket, parking sensors, reversing camera if fitted.',
        requiredPhotos: false,
        photoPrompt: '',
      },
    ],
  },
  {
    key: 'mechanical_drive',
    label: 'Mechanical and Drive',
    icon: Gauge,
    order: 9,
    inspectionTypes: ['private_purchase', 'pdi'],
    items: [
      {
        key: 'engine_startup',
        label: 'Engine startup and idle',
        description: 'Assess engine starting behaviour and idle quality.',
        hint: 'Cold start preferred. Listen for: extended cranking, misfires, rough idle, tapping (HLA/tappets), rattling (timing chain), diesel knock (normal but excessive = injector issues). Check for blue smoke (oil burning) or white smoke (head gasket) from exhaust on startup.',
        requiredPhotos: false,
        photoPrompt: '',
      },
      {
        key: 'clutch',
        label: 'Clutch',
        description: 'Test clutch operation and condition.',
        hint: 'Check biting point (very high = worn clutch). Test for slip: in high gear at low speed, press accelerator firmly, if revs rise without matching acceleration the clutch is slipping. Check for judder on take off. Check pedal feel is smooth.',
        requiredPhotos: false,
        photoPrompt: '',
        transmissionFilter: ['manual'],
      },
      {
        key: 'gearbox',
        label: 'Gearbox',
        description: 'Assess gearbox operation.',
        hint: 'Manual: check all gears engage smoothly, no crunching (synchro wear), no jumping out of gear. Automatic: check smooth shifts up and down, no hesitation, no jerking, check kickdown works. Check reverse engages cleanly.',
        requiredPhotos: false,
        photoPrompt: '',
      },
      {
        key: 'steering_suspension',
        label: 'Steering, suspension, and temperature',
        description: 'Test steering, suspension and monitor engine temperature during drive.',
        hint: 'Drive at various speeds. Check: steering pulls, vibration through wheel (worn CV joints, buckled wheels), knocking over bumps (drop links, bushes, shock absorbers), wallowing (worn shocks). Monitor temp gauge stays at normal. Check power steering for whine or heavy spots.',
        requiredPhotos: false,
        photoPrompt: '',
      },
    ],
  },
  {
    key: 'obd2',
    label: 'OBD2 Diagnostic Scan',
    icon: Cpu,
    order: 10,
    inspectionTypes: ['private_purchase', 'pdi'],
    items: [
      {
        key: 'active_faults',
        label: 'Active fault codes',
        description: 'Record any active/stored fault codes from OBD2 scan.',
        hint: 'Connect OBD2 scanner. Record all active (confirmed) DTCs. Note the code, description, and which system it relates to. Common serious codes: P0300 series (misfires), P0400 series (EGR), P2000 series (DPF/NOx).',
        requiredPhotos: true,
        photoPrompt: 'Photograph the OBD2 scanner screen showing any active fault codes.',
      },
      {
        key: 'pending_faults',
        label: 'Pending fault codes',
        description: 'Record any pending fault codes.',
        hint: 'Pending codes are faults that have been detected but not confirmed by a second drive cycle. They may indicate developing issues. Record all pending codes.',
        requiredPhotos: false,
        photoPrompt: '',
      },
      {
        key: 'readiness_monitors',
        label: 'Readiness monitors',
        description: 'Check OBD2 readiness monitor status.',
        hint: 'All monitors should show "Ready" or "Complete". If multiple monitors show "Not Ready" or "Incomplete", the ECU may have been recently reset to clear fault codes. This is a red flag, especially if combined with no stored codes on a high mileage vehicle.',
        requiredPhotos: true,
        photoPrompt: 'Photograph the readiness monitor screen from the OBD2 scanner.',
      },
    ],
  },
  {
    key: 'valeting',
    label: 'Valeting and Presentation',
    icon: Sparkles,
    order: 11,
    inspectionTypes: ['pdi'],
    items: [
      {
        key: 'presentation_standard',
        label: 'Overall presentation standard',
        description: 'Assess the vehicle presentation for customer handover.',
        hint: 'Check the vehicle has been properly valeted inside and out. Verify: clean exterior, polished, no water marks, clean wheels, dressed tyres, clean interior, hoovered, dashboard dressed, glass cleaned inside and out, boot clean, engine bay presentable.',
        requiredPhotos: true,
        photoPrompt: 'Photograph the vehicle showing overall presentation quality.',
      },
    ],
  },
];

// Helper: get sections filtered for a specific inspection
export function getSectionsForInspection(
  type: InspectionType,
  fuelType: FuelType,
  transmissionType: TransmissionType
): SectionConfig[] {
  return SECTIONS
    .filter(s => s.inspectionTypes.includes(type))
    .map(section => ({
      ...section,
      items: section.items.filter(item => {
        if (item.fuelTypeFilter && !item.fuelTypeFilter.includes(fuelType)) return false;
        if (item.transmissionFilter && !item.transmissionFilter.includes(transmissionType)) return false;
        return true;
      }),
    }))
    .filter(s => s.items.length > 0);
}
```

---

## 9. Business Logic

### 9.1 Grade Computation

```typescript
function computeGrades(sections: InspectionSection[]): {
  overallGrade: Grade | null;
  passCounts: number;
  advisoryCounts: number;
  failCounts: number;
} {
  let pass = 0, advisory = 0, fail = 0;

  for (const section of sections) {
    for (const item of section.items) {
      if (item.grade === 'pass') pass++;
      else if (item.grade === 'advisory') advisory++;
      else if (item.grade === 'fail') fail++;
    }
  }

  let overallGrade: Grade | null = null;
  if (fail > 0) overallGrade = 'fail';
  else if (advisory > 0) overallGrade = 'advisory';
  else if (pass > 0) overallGrade = 'pass';

  return { overallGrade, passCounts: pass, advisoryCounts: advisory, failCounts: fail };
}
```

**Rule:** Fail takes precedence over advisory, advisory over pass.

### 9.2 Section Status

```typescript
function computeSectionStatus(items: InspectionItem[]): SectionStatus {
  const graded = items.filter(i => i.grade !== null).length;
  if (graded === 0) return 'not_started';
  if (graded === items.length) return 'completed';
  return 'in_progress';
}
```

### 9.3 Inspection Creation

On "Begin Inspection":
1. Generate UUID via `crypto.randomUUID()`
2. Generate 8-char public token: `crypto.randomUUID().slice(0, 8)`
3. Generate 4-digit seller PIN: `String(Math.floor(1000 + Math.random() * 9000))`
4. Call `getSectionsForInspection(type, fuelType, transmission)` to build section/item structure
5. Initialize all items with `grade: null`
6. Set status to `in_progress`
7. Persist to Dexie (IndexedDB)

### 9.4 Price Calculation (Seller Mode)

```typescript
const revisedOffer = agreedPrice - ((totalRepairCostLow + totalRepairCostHigh) / 2);
```

Note: repair cost estimates are only available when the Known Issues/repair estimate features are wired up to live AI. In mock mode, this section is hidden unless manual price entry is added.

### 9.5 Mileage Anomaly Detection

```typescript
function checkMileageAnomaly(enteredMileage: number, lastMotOdometer: number): boolean {
  return enteredMileage < lastMotOdometer;
}
```

If entered mileage is LESS than last MOT reading, flag as potential mileage tampering.

### 9.6 Auto-save

Every grade change, note edit, or photo addition triggers:
1. Persist to Dexie immediately
2. Update SaveIndicator to "saving" (amber)
3. Add to sync queue if online
4. On sync success: update to "saved" (green)
5. If offline: update to "offline" (grey), sync when connection returns

---

## 10. State Management

### 10.1 Zustand Stores

```typescript
// inspectionStore.ts
interface InspectionStore {
  inspections: Inspection[];
  activeInspectionId: string | null;

  createInspection: (form: NewInspectionForm) => Promise<string>;
  gradeItem: (sectionKey: string, itemKey: string, grade: Grade) => void;
  updateItemNotes: (sectionKey: string, itemKey: string, notes: string) => void;
  updateTyreDepths: (sectionKey: string, itemKey: string, depths: TyreDepths) => void;
  addDamageMarker: (marker: Omit<BodyDamageMarker, 'id' | 'createdAt'>) => void;
  removeDamageMarker: (markerId: string) => void;
  setKnownIssues: (issues: KnownIssue[]) => void;
  submitInspection: (id: string) => void;
  loadInspections: () => Promise<void>;
  getActiveInspection: () => Inspection | undefined;
}

// authStore.ts
interface AuthStore {
  user: UserProfile | null;
  isLoading: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string) => Promise<void>;
  signOut: () => void;
  isDemoMode: boolean;
}

// uiStore.ts
interface UiStore {
  isOnline: boolean;
  saveStatus: 'saved' | 'saving' | 'offline';
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

// themeStore.ts (note: v2 is cream/light by default, dark mode is secondary)
interface ThemeStore {
  theme: 'light' | 'dark';
  toggle: () => void;
}
```

### 10.2 TanStack Query

```typescript
// VRM lookup
const useDvlaLookup = (vrm: string) => useQuery({
  queryKey: ['dvla', vrm],
  queryFn: () => lookupVrm(vrm),
  enabled: vrm.length >= 2,
  staleTime: Infinity,  // VRM data doesn't change
});

// MOT history
const useMotHistory = (vrm: string) => useQuery({
  queryKey: ['mot', vrm],
  queryFn: () => lookupMotHistory(vrm),
  enabled: vrm.length >= 2,
});

// Known issues
const useKnownIssues = (make: string, model: string, year: number) => useQuery({
  queryKey: ['known-issues', make, model, year],
  queryFn: () => fetchKnownIssues(make, model, year),
  enabled: Boolean(make && model && year),
});
```

---

## 11. Database

### 11.1 Dexie (IndexedDB) Setup

```typescript
// src/shared/lib/db.ts
import Dexie, { Table } from 'dexie';

class AutoInspectDB extends Dexie {
  inspections!: Table<Inspection>;
  photos!: Table<InspectionPhoto>;
  syncQueue!: Table<SyncQueueEntry>;

  constructor() {
    super('auto-inspect-pro-v2');
    this.version(1).stores({
      inspections: 'id, status, updatedAt, inspectorId',
      photos: 'id, inspectionId, itemId',
      syncQueue: 'id, timestamp',
    });
  }
}

export const db = new AutoInspectDB();
```

### 11.2 Supabase Schema

```sql
-- supabase/migrations/001_initial_schema.sql

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'inspector' CHECK (role IN ('inspector', 'manager', 'admin')),
  phone TEXT,
  pin TEXT CHECK (char_length(pin) = 4),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inspections
CREATE TABLE inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspector_id UUID NOT NULL REFERENCES profiles(id),
  type TEXT NOT NULL CHECK (type IN ('private_purchase', 'pdi')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'submitted', 'amended')),
  vrm TEXT NOT NULL,
  vehicle_make TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_year INT,
  vehicle_color TEXT,
  vehicle_fuel_type TEXT CHECK (vehicle_fuel_type IN ('petrol', 'diesel', 'hybrid', 'electric')),
  vehicle_engine_size TEXT,
  vehicle_transmission_type TEXT CHECK (vehicle_transmission_type IN ('manual', 'automatic')),
  mileage INT,
  mot_data JSONB,
  dvla_data JSONB,
  agreed_purchase_price DECIMAL(10,2),
  final_agreed_price DECIMAL(10,2),
  overall_grade TEXT CHECK (overall_grade IN ('pass', 'advisory', 'fail')),
  pass_counts INT DEFAULT 0,
  advisory_counts INT DEFAULT 0,
  fail_counts INT DEFAULT 0,
  known_issues JSONB,
  public_token TEXT UNIQUE,
  seller_pin TEXT CHECK (char_length(seller_pin) = 4),
  notes TEXT,
  is_reinspection BOOLEAN DEFAULT false,
  original_inspection_id UUID REFERENCES inspections(id),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inspection sections
CREATE TABLE inspection_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL,
  section_order INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inspection items
CREATE TABLE inspection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES inspection_sections(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL,
  label TEXT NOT NULL,
  grade TEXT CHECK (grade IN ('pass', 'advisory', 'fail')),
  notes TEXT,
  tyre_depths JSONB,
  item_order INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Photos
CREATE TABLE inspection_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  item_id UUID REFERENCES inspection_items(id) ON DELETE SET NULL,
  marker_id UUID,
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  caption TEXT,
  brightness_score FLOAT,
  resolution_ok BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Body damage markers
CREATE TABLE body_damage_markers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  x_percent FLOAT NOT NULL CHECK (x_percent >= 0 AND x_percent <= 100),
  y_percent FLOAT NOT NULL CHECK (y_percent >= 0 AND 100),
  view TEXT NOT NULL CHECK (view IN ('front', 'rear', 'driver', 'passenger')),
  damage_type TEXT NOT NULL CHECK (damage_type IN ('dent', 'scratch', 'chip', 'crack', 'rust', 'other')),
  severity TEXT NOT NULL CHECK (severity IN ('minor', 'moderate', 'severe')),
  notes TEXT,
  photo_id UUID REFERENCES inspection_photos(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  field_changed TEXT,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_damage_markers ENABLE ROW LEVEL SECURITY;

-- Inspectors see their own, managers see all
CREATE POLICY "Users see own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Inspectors see own inspections" ON inspections FOR SELECT USING (
  auth.uid() = inspector_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('manager', 'admin'))
);
CREATE POLICY "Inspectors create own inspections" ON inspections FOR INSERT WITH CHECK (auth.uid() = inspector_id);
CREATE POLICY "Inspectors update own inspections" ON inspections FOR UPDATE USING (auth.uid() = inspector_id);

-- Public access for customer view
CREATE POLICY "Public view via token" ON inspections FOR SELECT USING (public_token IS NOT NULL AND status = 'submitted');

-- Indexes
CREATE INDEX idx_inspections_inspector ON inspections(inspector_id);
CREATE INDEX idx_inspections_status ON inspections(status);
CREATE INDEX idx_inspections_public_token ON inspections(public_token);
CREATE INDEX idx_sections_inspection ON inspection_sections(inspection_id);
CREATE INDEX idx_items_section ON inspection_items(section_id);
CREATE INDEX idx_photos_inspection ON inspection_photos(inspection_id);
CREATE INDEX idx_markers_inspection ON body_damage_markers(inspection_id);
```

---

## 12. Mock Data (for DVLA Lookup and Known Issues)

```typescript
// src/shared/config/mockData.ts

export const MOCK_VRM_RESPONSES: Record<string, VehicleDetails> = {
  'AB12CDE': {
    vrm: 'AB12CDE',
    make: 'Ford',
    model: 'Fiesta',
    year: 2019,
    colour: 'Blue',
    fuelType: 'petrol',
    engineSize: '1000cc',
    transmissionType: null,  // DVLA doesn't return this
  },
  'FG34HIJ': {
    vrm: 'FG34HIJ',
    make: 'Volkswagen',
    model: 'Golf',
    year: 2020,
    colour: 'White',
    fuelType: 'diesel',
    engineSize: '2000cc',
    transmissionType: null,
  },
  'KL56MNO': {
    vrm: 'KL56MNO',
    make: 'BMW',
    model: '3 Series',
    year: 2018,
    colour: 'Black',
    fuelType: 'diesel',
    engineSize: '2000cc',
    transmissionType: null,
  },
  'PQ78RST': {
    vrm: 'PQ78RST',
    make: 'Vauxhall',
    model: 'Corsa',
    year: 2021,
    colour: 'Red',
    fuelType: 'petrol',
    engineSize: '1200cc',
    transmissionType: null,
  },
  'UV90WXY': {
    vrm: 'UV90WXY',
    make: 'Audi',
    model: 'A3',
    year: 2017,
    colour: 'Grey',
    fuelType: 'petrol',
    engineSize: '1500cc',
    transmissionType: null,
  },
  'AA19BGT': {
    vrm: 'AA19BGT',
    make: 'Nissan',
    model: 'Qashqai',
    year: 2019,
    colour: 'Silver',
    fuelType: 'diesel',
    engineSize: '1500cc',
    transmissionType: null,
  },
  'BC20DEF': {
    vrm: 'BC20DEF',
    make: 'Toyota',
    model: 'Yaris',
    year: 2020,
    colour: 'White',
    fuelType: 'hybrid',
    engineSize: '1500cc',
    transmissionType: null,
  },
  'EF21GHI': {
    vrm: 'EF21GHI',
    make: 'Tesla',
    model: 'Model 3',
    year: 2021,
    colour: 'White',
    fuelType: 'electric',
    engineSize: 'N/A',
    transmissionType: null,
  },
};

export const MOCK_KNOWN_ISSUES: Record<string, KnownIssue[]> = {
  'Ford Fiesta': [
    { issue: 'EcoBoost coolant leak', detail: 'The 1.0 EcoBoost engine is known for coolant leaks around the thermostat housing and water pump area. Check for white residue or sweet smell from the engine bay.' },
    { issue: 'Door latch recall', detail: 'Certain model years had a recall for door latches that could allow doors to open while driving. Check the recall status and whether it has been completed.' },
    { issue: 'Clutch judder on take off', detail: 'Common complaint on manual models. Dual mass flywheel wear causes vibration when pulling away from stationary. Worse when cold.' },
    { issue: 'Sync infotainment freezing', detail: 'The Ford Sync system can become unresponsive. Check the software version is up to date and test all functions.' },
  ],
  'Volkswagen Golf': [
    { issue: 'DSG mechatronic unit failure', detail: 'The 7 speed DSG gearbox (DQ200) is known for mechatronic unit issues. Listen for clunking on low speed manoeuvres and hesitation when pulling away.' },
    { issue: 'Water pump failure (TSI engines)', detail: 'The plastic water pump impeller can crack, leading to coolant loss and overheating. Check coolant level and look for any signs of recent coolant system work.' },
    { issue: 'AdBlue system faults', detail: 'Diesel models with AdBlue can develop sensor and heating element failures. Check for any AdBlue warning messages on the dashboard.' },
    { issue: 'Timing chain tensioner wear', detail: '1.4 TSI and 2.0 TSI engines can develop timing chain stretch. Listen for a rattle on cold start that goes away after a few seconds.' },
  ],
  'BMW 3 Series': [
    { issue: 'Timing chain wear (N47 diesel)', detail: 'The N47 2.0 diesel engine has a rear mounted timing chain that is known to stretch and eventually fail. Listen for a rattle from the rear of the engine. High mileage examples are particularly at risk.' },
    { issue: 'Swirl flap failure', detail: 'Diesel models have intake swirl flaps that can break apart and be ingested by the engine. Check for any rough running or error codes related to the intake manifold.' },
    { issue: 'Electric water pump failure', detail: 'The electric water pump can fail without warning, leading to rapid overheating. Check the cooling system has been maintained and look for any signs of overheating (discoloured coolant, warped hoses).' },
    { issue: 'iDrive screen delamination', detail: 'The iDrive display can develop bubble like delamination between the layers. Check the screen in direct sunlight for any distortion or separation.' },
  ],
  'Vauxhall Corsa': [
    { issue: 'Timing chain rattle (1.2/1.4)', detail: 'The A12/A14 series engines are known for timing chain stretch, causing a rattle on startup. If the rattle persists beyond the first few seconds, the chain and guides likely need replacement.' },
    { issue: 'EGR valve carbon buildup', detail: 'Diesel models suffer from carbon buildup on the EGR valve, causing rough running and loss of power. Check for any related fault codes.' },
    { issue: 'Front suspension knocking', detail: 'Front anti roll bar drop links wear quickly on Corsas. Check for knocking or clunking over bumps at low speed.' },
  ],
  'Audi A3': [
    { issue: 'DSG mechatronic issues', detail: 'Shares the same DQ200 7 speed DSG as the VW Golf with similar issues. Check for hesitation, jerking at low speeds, and any gearbox warning lights.' },
    { issue: 'Oil consumption (TFSI)', detail: 'Some 1.8 and 2.0 TFSI engines consume excessive oil between services. Check the oil level and ask about oil consumption history.' },
    { issue: 'LED running light failure', detail: 'Individual LEDs in the daytime running lights can fail. Replacement requires the entire light unit which is expensive.' },
  ],
  'Nissan Qashqai': [
    { issue: 'CVT transmission judder', detail: 'The CVT automatic gearbox can develop a judder at low speeds, particularly when the transmission fluid is degraded. Check for smooth acceleration from rest.' },
    { issue: 'DPF regeneration issues', detail: 'Diesel models used primarily for short journeys can develop DPF blockage. Check for DPF warning light and ask about typical journey lengths.' },
    { issue: 'Panoramic roof drain blockage', detail: 'If fitted with a panoramic sunroof, the drainage channels can block causing water ingress into the cabin. Check headlining for damp marks.' },
  ],
  'Toyota Yaris': [
    { issue: 'Hybrid battery degradation', detail: 'On hybrid models, check the battery health indicator if available. Most Toyota hybrid batteries last well beyond 100k miles but performance can degrade.' },
    { issue: 'CVT whine at speed', detail: 'Some owners report a whining noise from the CVT at motorway speeds. This is often normal but excessive noise may indicate bearing wear.' },
  ],
  'Tesla Model 3': [
    { issue: 'Panel gap inconsistencies', detail: 'Tesla is known for variable panel gaps and alignment. Check all body panels for consistent gaps and flush fitting. Pay attention to the boot/trunk lid and frunk alignment.' },
    { issue: 'Suspension clunking', detail: 'Some Model 3s develop a clunk from the front suspension over bumps, often traced to upper control arm ball joints. Check for any noise over speed bumps.' },
    { issue: 'Screen yellowing', detail: 'Some early Model 3 screens develop a yellow border around the edge of the display. Check the screen in various lighting conditions.' },
    { issue: 'Phantom braking', detail: 'The autopilot system can occasionally apply brakes unexpectedly. While a software issue, check the current software version is up to date.' },
  ],
};

// Fallback for unknown models
export const GENERIC_KNOWN_ISSUES: KnownIssue[] = [
  { issue: 'No model specific data available', detail: 'We do not have pre loaded known issues for this specific make and model. Proceed with a thorough general inspection following the standard checklist.' },
];
```

### Mock Toggle Implementation

```typescript
// src/shared/lib/lookup.ts
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export async function lookupVrm(vrm: string): Promise<VehicleDetails | null> {
  const normalised = vrm.toUpperCase().replace(/\s/g, '');

  if (USE_MOCKS) {
    await new Promise(r => setTimeout(r, 800)); // Simulate network delay
    return MOCK_VRM_RESPONSES[normalised] ?? null;
  }

  // Live DVLA API call
  const response = await fetch('https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_DVLA_API_KEY,
    },
    body: JSON.stringify({ registrationNumber: normalised }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  return mapDvlaResponse(data);
}

export async function fetchKnownIssues(make: string, model: string, year: number): Promise<KnownIssue[]> {
  if (USE_MOCKS) {
    await new Promise(r => setTimeout(r, 600));
    const key = `${make} ${model}`;
    return MOCK_KNOWN_ISSUES[key] ?? GENERIC_KNOWN_ISSUES;
  }

  // Live AI call via Supabase Edge Function
  const { data, error } = await supabase.functions.invoke('ai-known-issues', {
    body: { make, model, year },
  });

  if (error || !data) return GENERIC_KNOWN_ISSUES;
  return data.issues;
}
```

---

## 13. Copy and Microcopy Guidelines

- Use contractions (it's, we're, you'll)
- Plain English. No "leverage", "utilise", "synergy", "robust solution"
- Speak to user as "you" and system as "we"
- Be specific: "Saved" beats "Operation successful"
- Be warm in errors: "That didn't quite work, mind trying again?" beats "Error 500"
- Be specific in empty states: "No inspections yet, your first one will live here" beats "No data"
- Never more than one exclamation mark per screen
- Never use emoji in product UI
- No hyphens or em dashes in user facing copy. Use commas, full stops, or restructure the sentence.

---

## 14. Accessibility Requirements

- All body text contrast ratio at least 4.5:1 against background
- Tangerine 500 on cream 100: switch to tangerine 700 for any text under 18px
- Tangerine 500 buttons with cream 50 text: verify AA contrast. If it fails, switch button text to twilight 800
- Focus rings always visible, never removed. Use tangerine glow ring on focus
- All interactive elements at least 44x44px tap target on mobile
- Forms have proper label associations
- Modals trap focus and return it on close
- `prefers-reduced-motion` respected: disable animations, use instant transitions
- Semantic HTML: proper heading hierarchy, landmarks, ARIA labels where needed

---

## 15. PWA Configuration

```json
// public/manifest.json
{
  "name": "Auto Inspect Pro",
  "short_name": "Inspect Pro",
  "description": "Vehicle inspection tool",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FBF5EB",
  "theme_color": "#FF6244",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Service worker strategy: Cache app shell (HTML, CSS, JS, fonts, icons). Network-first for API calls. IndexedDB for data persistence.

---

## 16. Environment Variables

```env
# .env.example
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_DVLA_API_KEY=your-dvla-api-key
VITE_MOT_API_KEY=your-mot-api-key
VITE_USE_MOCKS=true
```

---

## 17. Build Order (Phase 1)

Build in this order to have a working flow as quickly as possible:

1. Project scaffold: `npm create vite@latest . -- --template react-ts` + install all deps
2. Tailwind config with all design tokens (colours, typography, radius, shadows)
3. `index.css` with CSS custom properties and Google Fonts link
4. Zod schemas (`src/shared/validation/schemas.ts`)
5. Types (`src/shared/types/index.ts`)
6. Section config (`src/shared/config/sections.ts`)
7. Mock data (`src/shared/config/mockData.ts`)
8. Dexie DB setup (`src/shared/lib/db.ts`)
9. Supabase client (`src/shared/lib/supabase.ts`)
10. Zustand stores (auth, inspection, ui, theme)
11. Base components: Logo, Button, Card, Input, StatusPill, SaveIndicator, EmptyState, BigNumber
12. Navigation: TopBar, BottomNav, Sidebar
13. App shell + routing + ProtectedRoute
14. Login page
15. Dashboard page
16. Quick Start page (with mock VRM lookup)
17. Inspection Overview page
18. Grading page (card stack + grade buttons)
19. Body Diagram page
20. Summary page
21. Seller Mode page
22. Customer View page
23. PDF generation
24. PWA manifest + service worker
25. Offline sync queue

**Milestone:** After step 18 you have a complete grading flow. After step 22 you have the full app.

---

## 18. What NOT to Do

- Do not introduce per-use AI costs (no live AI calls unless `VITE_USE_MOCKS=false`)
- Do not change Supabase auth logic from magic link + demo mode
- Do not use Monzo brand assets (coral, navy, Monzo Sans, M logomark, illustrations)
- Do not use pure white (#FFFFFF) as page background. Always cream-100.
- Do not use pure black (#000000) for text. Always twilight-700.
- Do not use square buttons anywhere. All buttons are pill shape.
- Do not use emoji in the product UI.
- Do not use hyphens or em dashes in any user facing copy.
- Do not stub features. If something cannot be built yet, note it as a TODO.
- Do not add SSR, React Native, or native wrappers.
- Do not skip accessibility checks.

---

## Quick Reference: Tangerine and Twilight Palette

| Role            | Token                        | Hex      |
|-----------------|------------------------------|----------|
| Hero brand      | tangerine 500                | #FF6244  |
| Hero brand dark | tangerine 700 (text on cream)| #B83A22  |
| Dark surface    | twilight 700                 | #1B1B47  |
| Deepest dark    | twilight 900                 | #0A0A1F  |
| Page background | cream 100                    | #FBF5EB  |
| Card background | cream 50                     | #FFFDF9  |
| Body text       | twilight 700                 | #1B1B47  |
| Muted text      | twilight 300                 | #5C5C85  |
| Gold accent     | gold                         | #FFCC4A  |
| Blush accent    | blush                        | #FFB1C8  |
| Teal accent     | teal                         | #2DBFB0  |
| Mint accent     | mint                         | #8AD9C2  |
| Lilac accent    | lilac                        | #B8B5E8  |
| Pass/Success    | success                      | #2BB673  |
| Advisory/Warn   | warning                      | #FFB020  |
| Fail/Danger     | danger                       | #E63946  |
| Info            | info                         | #4F8DFA  |
