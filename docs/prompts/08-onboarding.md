# Prompt 08 — Onboarding

Independent. Can run any time. Smallest of the set — do it last, or in parallel.

---

Read `docs/DESIGN-SYSTEM.md` first. This prompt does not repeat its rules.

## Context

- `app/onboarding.tsx` (140 lines) — a 3-slide `Animated.FlatList` pager.
- `components/OnboardingItem.tsx` (51 lines), `components/OnboardingPaginator.tsx` (61 lines)
- Slide art: `assets/images/onboarding_1.png`, `_2.png`, `_3.png` (~400-660KB each)

Completion is tracked by `hooks/useOnboarding.ts` (`ONBOARDING_KEY` in
AsyncStorage), read by `app/_layout.tsx` to decide whether to route into the
app. That routing logic works — don't touch it. This is a visual rebuild of the
slides only.

No reference images were provided. Derive from the design system.

## Direction

Three slides, full-bleed photography with the copy overlaid on a gradient
scrim — consistent with the hero treatment used on food and restaurant detail.
Avoid the common template look of a small centered illustration above centered
text.

- Large `font-sen-extra-bold` headline, one supporting line in `text-gray`.
- Paginator: the active dot elongates into a pill. Animate `transform`/`opacity`
  only.
- Primary ink CTA ("Next" → "Get started" on the last slide) and a "Skip"
  affordance that completes onboarding immediately.
- Swipe *and* button navigation both work.

The existing PNGs are large and generic. Either keep them, or replace them with
food photography — if you replace them, make sure whatever you add is
appropriately licensed and say where it came from in your report. Don't add
large binaries without flagging it.

**Note:** the app has no location permission priming anywhere. Restaurants come
from OpenStreetMap based on the device's location, and with permission denied
the app silently falls back to New York City. A third slide explaining why
location is useful, followed by the system prompt, would be a genuine
improvement — optional, your call, but call out what you decided.

## Tasks

Each its own commit: (1) slide layout + paginator, (2) navigation/skip
behavior, (3) optional location priming, (4) verify.

Verification per the design-system doc. To re-test onboarding after completing
it once, clear the `ONBOARDING_KEY` AsyncStorage entry (or reinstall the app on
the simulator) — otherwise you'll be routed straight past it and won't see your
changes. Screenshot all three slides.

## Report back

Commits, whether you replaced the slide art and its provenance, what you decided
about location priming, and confirmation you ran it.
