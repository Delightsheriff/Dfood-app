# Prompt 12 — Native chrome: headers, blur & motion

Depends on **Prompts 09–11**.

---

Read `docs/DESIGN-SYSTEM.md` first. This prompt does not repeat its rules.

## Context

The app renders correct content but doesn't yet *feel* native. Three gaps.

### A. Headers are inconsistent

Across `app/`: **18 screens** hand-roll a header using `insets.top`, **3** use
`SafeAreaView`, and there is no shared header component at all. Every screen
reinvents its own back button, title placement, and top padding — so title
sizes, button positions, and spacing drift between screens.

Build **one** header component (e.g. `components/ui/screen-header.tsx`) with a
small set of variants, and adopt it everywhere:

- `plain` — back button + centred or leading title, opaque background. Used by
  form and list screens (addresses, payment methods, order details…).
- `floating` — no background; the existing glass `IconButton`s float directly
  over a hero image. Used by food and restaurant detail. This already exists
  inline in those two screens; extract rather than reinvent.
- `large` — a big leading title that collapses into a compact title on scroll.
  Used by the tab roots.

Safe-area handling lives inside the component. No screen should compute
`insets.top` itself afterwards.

### B. The blur that was never wired up

`components/ui/progressive-blur.tsx` (476 lines) is in the repo and has **never
been imported by anything**. It was installed for exactly this and then unused.

It provides `ProgressiveBlurHeader`, `ProgressiveBlurFooter`,
`useProgressiveBlurScroll`, and `useProgressiveBlurInset`. Read the file — its
own doc comments explain the contract, notably that content must render
*before* the blur so `expo-blur` can sample it, and that passing `scrollY` makes
the header transparent at rest and fade in as content scrolls under it.

Wire it into the `large` header variant on the tab roots. That scroll-linked
fade is the single biggest "this feels native" win available here.

One caution from the file's own API: it needs a real `Animated.ScrollView` /
FlashList scroll handler to drive `scrollY`. Use `useAnimatedScrollHandler`,
never scroll position in `useState` (design-system doc, performance rules).

### C. Motion — including the animated-icons question

**You asked about `hugeicons-animated.com`. It is not usable here, and I checked
before writing this.** That library is React DOM only: its icons are installed
as source via the shadcn CLI and animated with [motion](https://motion.dev)
(Framer Motion), which has no React Native renderer. Dropping it in would not
compile. Do not attempt it.

**`nativebloom.dev/blocks`** — 790 React Native blocks, but the catalogue
renders as video previews and the block source sits behind a sign-in wall, so
its specific components could not be surveyed. If the user has an account and
wants particular blocks adopted, that's a follow-up with the block names in
hand. Don't guess at its API.

What *is* available, already installed, and gives the same result:
**Reanimated 4 + `react-native-svg`**, which is what hugeicons already renders
through. Animate a **small number of high-value moments** rather than everything:

1. **Favorite heart** — scale-pop plus a fill transition on toggle. Highest
   value; it's the app's most-used stateful icon.
2. **Add-to-cart `+`** — press-scale (already specced in prompt 11) plus a
   brief success state on tap.
3. **Cart badge** — a small spring when the count increments, so adding an item
   from a card gives feedback even though the badge is off-screen-adjacent.
4. **Tab bar** — native tabs handle their own transitions; leave them alone.

Rules: `transform` and `opacity` only, `.get()`/`.set()` on shared values, and
**respect reduced motion** (`AccessibilityInfo.isReduceMotionEnabled()` — the
app currently checks it nowhere). Resist adding more than these; scattered
animation is the fastest way to make an app feel generated rather than designed.

## Tasks

Each its own commit:

1. Build the header component with its three variants.
2. Adopt it across all 21 screens. Several commits is fine — group by area
   (tabs, detail screens, profile screens).
3. Wire `ProgressiveBlurHeader` into the `large` variant on the tab roots.
4. The three motion moments, with reduced-motion handling.
5. Verify.

## Done criteria

- `grep -rn "insets.top" app/` → only inside the header component (and any
  genuine one-off like a full-bleed hero that documents why)
- `components/ui/progressive-blur.tsx` is actually imported
- `npx tsc --noEmit` → 0 errors; `npm run lint` → no new errors
- **Run the app.** Scroll each tab root and confirm the blur fades in rather
  than popping. Toggle a favorite. Add to cart from a card. Turn on Reduce
  Motion in the simulator (Settings → Accessibility → Motion) and confirm the
  animations degrade instead of disappearing or breaking.

## Report back

Commits, which screens resisted the shared header and why, confirmation the
blur is wired, and screenshots of a tab root at rest and mid-scroll.
