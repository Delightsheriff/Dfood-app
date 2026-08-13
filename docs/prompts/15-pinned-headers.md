# Prompt 15 — Pinned blur headers on every detail page

Independent of prompt 14. Can run in parallel.

---

Read `docs/DESIGN-SYSTEM.md` first. This prompt does not repeat its rules.

## The problem

On `food/[id].tsx` and `restaurants/[id].tsx` the header uses
`ScreenHeader variant="floating"`, which is absolutely positioned **inside the
hero image container**. The hero scrolls, so the header scrolls with it — scroll
down a long menu and the back button is gone. You have to scroll all the way
back up just to leave the screen. Neither screen passes `scrollY`, so there's no
scroll-linked behaviour at all.

Meanwhile the tab roots got the good treatment: `variant="large"` with
`ProgressiveBlurHeader`, which stays pinned and fades its blur in as content
passes under it. Detail pages should get the same quality.

Other gaps found in the same sweep:

- `cart.tsx` and `checkout.tsx` have **no `ScreenHeader` at all**
- `categories/[id].tsx` invented a `compact` variant that isn't in the design
  system — reconcile it (fold into the new variant, or document it properly)

## What to build

A **`detail`** variant on `components/ui/screen-header.tsx`. Behaviour:

- **Always pinned** to the top of the *screen*, never inside the scroller. Back
  button reachable at any scroll position — this is the whole point.
- **At rest** (scrollTop, over a hero): fully transparent background, glass
  `IconButton`s floating on the photo, no title. Exactly what `floating` looks
  like today.
- **On scroll**: `ProgressiveBlur` fades in behind it and the screen title fades
  up into the bar. Drive it with `scrollY` and `interpolate` — the tab roots
  already do this; copy that mechanism rather than inventing one.
- **On screens with no hero** (cart, checkout, profile sub-screens): start with
  the title visible and the blur fading in on scroll. Same component, hero
  simply absent.

**FlashList caution — this has already caused a crash.** Use
`useProgressiveBlurScrollForList` for FlashList-backed screens and
`useProgressiveBlurScroll` for `Animated.ScrollView` screens. FlashList v2 does
not forward `onScroll` to its scroller, so a Reanimated worklet handler throws
`undefined is not a function`. See the comment in
`components/ui/progressive-blur.tsx` and commit `6f12234`.

Apply `detail` to every pushed screen: `food/[id]`, `restaurants/[id]`,
`categories/[id]`, `cart`, `checkout`, `order-confirmation`, and all of
`profile/*`. When you're done, `floating` should have no remaining callers —
retire it, or keep it only if something genuinely can't scroll.

## Design — "do better"

The structure is sound now; the surfaces are still plain. Specific direction,
not general polish:

**1. Give the hero depth.** Right now it's a flat photo with a scrim. Scale the
image slightly as you scroll (parallax — the image moves slower than the
content) and let the content sheet ride over it. `transform` only, no layout
animation. This is the single biggest perceived-quality win on a detail page.

**2. Fix the stat grid.** On food detail it currently reads
`RATING 4.3 / CALORIES 150 / PRICE ₦1,899 / CATEGORY Lamb` — and there's a
`LAMB` badge directly above it. The category is stated twice, and *Price* is
redundant with the sticky Add-to-Cart bar that already shows it. Cut the grid to
what the badge and CTA don't already say, and let the survivors breathe.

**3. Type hierarchy is flat.** Bricolage is loaded but barely used — dish and
restaurant names should be noticeably larger with tight negative tracking, and
everything else should recede. Currently the title and the section headers are
close in weight, so nothing leads. Push the contrast.

**4. Sticky bottom bars need a top edge.** Cart and food detail both dock a CTA
over scrolling content with no separation. Give them the same progressive blur
treatment as the header (`ProgressiveBlurFooter` already exists in
`progressive-blur.tsx` and has never been used) so content dissolves under them
instead of colliding.

**5. Empty and error states.** Several are still a centred grey sentence. Each
one is a chance to direct the user somewhere — give them an icon, a real
sentence, and an action.

Keep the restraint the design system asks for: coral stays reserved for ratings
and active states, ink carries the CTAs. Don't add a second accent.

## Done criteria

- `grep -rn 'variant="floating"' app/` → no matches (or documented exceptions)
- `ProgressiveBlurFooter` is actually used
- `npx tsc --noEmit` → 0 errors; `npm run lint` → 0 problems. Both are at zero;
  do not regress them.
- **Run it, and specifically test the thing this prompt exists to fix**: open a
  restaurant with a long menu, scroll to the bottom, and confirm you can hit
  back without scrolling up. Do the same on food detail and cart.
- Screenshot each detail screen at rest and mid-scroll, so the blur transition
  is visible.

## Report back

Commits, what happened to the `compact` variant, which screens needed exceptions,
and the screenshots.
