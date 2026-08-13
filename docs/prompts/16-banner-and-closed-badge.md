# Prompt 16 — Promo banner crop & CLOSED badge

Small, self-contained. Independent of prompts 14–15.

---

Read `docs/DESIGN-SYSTEM.md` first. This prompt does not repeat its rules.

## A. The promo banner — `app/(app)/(tabs)/index.tsx`

The banner now has real photography (`PROMO_SLIDES`, TheMealDB URLs, all
verified 200) but it reads badly. Two separate faults:

**1. The crop destroys the subject.** TheMealDB images are roughly square.
They're being forced into a `BANNER_HEIGHT = 168` wide box with
`contentFit="cover"`, which crops hard to the centre. On the current first
slide, a photo of a whole burger becomes an unrecognisable horizontal band of
lettuce and cheese. The food is no longer readable as food, which defeats the
entire point of putting photography there.

Fix by some combination of — your judgement, but justify it:

- Give the banner more height so the crop is less severe. 168pt is short for a
  full-bleed image card; the reference apps run nearer a 2:1 or 16:9 crop of a
  taller box.
- Use `expo-image`'s `contentPosition` to bias the crop (many food shots have
  the subject slightly above centre).
- Pick images that survive a wide crop. Plated wide dishes and spreads crop far
  better than tall stacked subjects like burgers. **Verify every URL returns
  200 before committing** — one of the three originally shipped as a 404 and
  rendered an empty grey card in production. Check with
  `curl -s -o /dev/null -w '%{http_code}' <url>`.

**2. The scrim is eating the photo.** The current gradient darkens the entire
left half to near-black so the headline can sit on it. The text is legible and
the image is gone — the worst of both.

Use a scrim that protects only what needs protecting: a bottom-up gradient
behind the text block, or a left-to-right gradient that fades out by the
midpoint, leaving the right half of the photo clean. Keep the tag pill's own
background so it reads on any crop. The photo should look like appetising food
first and a text backdrop second.

While you're in here: `activeBannerIndex` drives the pagination dots — confirm
they still track correctly if you change the slide count.

## B. The CLOSED badge — `components/RestaurantCard.tsx`

Currently: the image desaturates and a dark pill reading `● CLOSED` sits **dead
centre** over the photo.

Problems:

- Centre-of-image is the worst position for a status badge. It lands squarely
  on the food, which is the one thing the card is selling, and it fights the
  rating pill (top-left) and bookmark (top-right) for attention.
- A closed restaurant is still worth browsing — people plan ahead. The current
  treatment reads as "broken card" rather than "opens later".

Redesign it as a **state**, not a stamp:

- Move the badge out of the optical centre. A corner, or a strip along the
  bottom edge of the image, keeps the dish visible.
- Say something useful. "Closed" is a dead end; "Opens 9:00 AM" is information
  the user can act on — and `restaurant.openingTime` is already on the
  `Restaurant` type and already fabricated deterministically. Use it.
- Keep the desaturation subtle. Enough to signal unavailability, not so much
  that the food looks grey and unappetising.
- Make sure the treatment reads at both `compact` and `full` variants — the
  compact card in the "Fastest Near You" rail is much smaller, and a
  bottom-strip that works at full width may crowd it.

Cross-check the same state anywhere else it appears (restaurant detail's
`STATUS` row already shows `Closed` in red — make sure the two agree in tone).

## Done criteria

- Every promo image URL returns 200 — verified with curl, not assumed
- `npx tsc --noEmit` → 0 errors; `npm run lint` → 0 problems. Both are at zero
  now; do not regress them.
- **Run it.** Screenshot: the home banner on all slides (swipe through), a
  closed restaurant in the vertical list, and a closed restaurant in the
  compact horizontal rail. The food should be legible in every one.

## Report back

Commits, what you changed about the banner crop and why, the new closed-state
copy, and the screenshots.
