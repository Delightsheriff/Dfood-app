# Prompt 10 — Typography system

Depends on **Prompt 09** (do the cleanup first so you're not converting files
twice).

---

Read `docs/DESIGN-SYSTEM.md` first. This prompt **changes** part of it — see
the last task.

## Context

The app uses **Sen** for everything — one family, four weights, no display/body
distinction. It's a competent geometric sans, and it's also the default choice
in roughly every food-delivery UI kit on the market. It reads as templated,
which is the specific thing this redesign is trying not to be.

Current wiring:
- `app/_layout.tsx` loads `Sen_400Regular / 500Medium / 700Bold / 800ExtraBold`
  from `@expo-google-fonts/sen` via `useFonts`
- `tailwind.config.js` maps `font-sen`, `font-sen-medium`, `font-sen-bold`,
  `font-sen-extra-bold`
- **316 class usages** across `app/` and `components/`:
  `font-sen-bold` ×166, `font-sen` ×112, `font-sen-extra-bold` ×24,
  `font-sen-medium` ×14

## The new pairing

Two families, each with a job. Both verified published on npm.

**Display — `@expo-google-fonts/bricolage-grotesque`** (v0.4.1)
A variable grotesque with genuine quirk in its letterforms. Used **only** for
things that should feel like a voice: screen titles, dish names, restaurant
names, the promo banner headline, big numbers. Never for body copy or UI chrome.

**Body / UI — `@expo-google-fonts/geist`** (v0.4.2)
Clean, modern, neutral. Everything else: descriptions, meta rows, labels,
buttons, form fields, tab labels. Geist has proper **tabular figures** — this
app is dense with prices, ratings, delivery times and distances, and they should
align in columns rather than jitter.

### Why not the obvious choice

A high-contrast serif display over a warm cream background with a terracotta
accent is the single most common look AI design tools produce right now. Our
palette is already uncomfortably close to it — `surface-muted` is `#F4F1ED`,
a hair from that cliché's `#F4F1EA`. Pairing a serif display on top would land
us squarely in it. Bricolage keeps the editorial confidence without the tell.

**Also do this**: nudge `surface-muted` off `#F4F1ED` to something with a
slightly cooler or grayer cast (your judgment — a warm gray rather than a cream).
Document the new value in the design-system doc. Small change, meaningful
distance from the default look.

## The type scale

Replace ad-hoc sizes (`text-[26px]`, `text-[18px]`, `text-[11px]`, etc. are
scattered through the screens) with a named scale in `tailwind.config.js`.
Define roughly:

| Role | Family | Notes |
| --- | --- | --- |
| `display` | Bricolage ExtraBold | Screen titles, dish/restaurant names. Tight negative tracking. |
| `title` | Bricolage Bold | Section headers |
| `body` | Geist Regular | Descriptions, paragraphs |
| `label` | Geist Medium | Meta rows, card subtitles |
| `caption` | Geist Medium | Small uppercase labels, tracked |
| `numeric` | Geist with tabular figures | Prices, ratings, times, distances |

Pick the actual px values and line heights yourself — but set them once, in the
config, and use the names. Prefer weight and color for hierarchy over inventing
new sizes (the design-system doc already says this; it's currently not followed).

**The one deliberate risk**: set display text large, with tight negative
letter-spacing, and let Bricolage's character show. That's the signature. Keep
everything around it quiet — this is the *only* place the typography should
raise its voice.

## Tasks

Each its own commit:

1. Install both font packages with `npx expo install` (not raw npm) so versions
   stay SDK-aligned. Remove `@expo-google-fonts/sen`.
2. Load the new families in `app/_layout.tsx`, replacing the Sen block. Keep the
   existing splash-screen gating so text never flashes unstyled.
   **Note**: the design-system doc's performance section points at the
   `expo-font` config plugin for build-time embedding as the better approach.
   If you can make that work without a prebuild the user isn't expecting,
   prefer it; otherwise keep `useFonts` and say why.
3. Define the families and the named scale in `tailwind.config.js`. Adjust
   `surface-muted`.
4. Migrate the 316 usages. This is mechanical but wide — go screen by screen,
   not with a blind find-and-replace, because the mapping isn't 1:1: a
   `font-sen-bold` on a dish name becomes `display`, the same class on a meta
   label becomes `label`. Committing this in 2–4 batches is fine.
5. Update `docs/DESIGN-SYSTEM.md` §2: the new families, the scale, the new
   `surface-muted` value, and the display/body split rule. The doc currently
   says "Font: **Sen** only" — that line must go.

## Done criteria

- `grep -rn "font-sen" app/ components/` → no matches
- `grep -rn "@expo-google-fonts/sen" .` (excluding node_modules) → no matches
- `npx tsc --noEmit` → 0 errors; `npm run lint` → no new errors
- **Run the app.** Fonts loading is exactly the kind of thing that typechecks
  and then renders as invisible or fallback text. Screenshot: home, restaurant
  detail, food detail, cart, profile. Confirm both families actually render and
  that no screen shows a system-font fallback.

## Report back

Commits, the final scale values, the new `surface-muted`, whether you got the
config plugin working or stayed on `useFonts`, and the screenshots.
