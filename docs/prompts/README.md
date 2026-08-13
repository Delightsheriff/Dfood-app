# Dfood prompts

Self-contained handoff prompts. Each is written for a fresh agent with no memory
of this project.

Every prompt starts by pointing at [`../DESIGN-SYSTEM.md`](../DESIGN-SYSTEM.md),
which holds the shared contract — tokens, established patterns, performance
rules, data-layer quirks, verification requirements, commit rules. The prompts
deliberately don't restate it.

---

## Round 1 — screen redesign (done)

All eight landed. `tsc` went 14 errors → 0; lint errors 26 → 12.

| # | Prompt | Status |
| --- | --- | --- |
| 01 | [Tabs & navigation shell](./01-tabs-shell.md) | done |
| 02 | [Home feed](./02-home-feed.md) | done |
| 03 | [Restaurants](./03-restaurants.md) | done |
| 04 | [Categories](./04-categories.md) | done |
| 05 | [Search & filters](./05-search-filters.md) | done |
| 06 | [Cart & checkout](./06-cart-checkout.md) | done |
| 07 | [Profile & orders](./07-profile-orders.md) | **partial** — see below |
| 08 | [Onboarding](./08-onboarding.md) | done |

**07 did not finish.** `profile/add-address.tsx`, `profile/edit-address.tsx`,
and `profile/add-card.tsx` were never touched despite the commit message saying
"and sub-screens". Prompt 09 picks them up.

## Round 2 — refinement & Firebase

Strictly sequential. Each builds on the last.

```
09 cleanup ── 10 typography ── 11 cards & banner ── 12 native chrome ── 13 firebase
```

| # | Prompt | Scope |
| --- | --- | --- |
| 09 | [Cleanup](./09-cleanup.md) | Finish the 3 unconverted screens + 4 UI components, kill dead deps, clear lint to zero |
| 10 | [Typography](./10-typography.md) | Replace Sen with Bricolage Grotesque + Geist; named type scale; 316 usages |
| 11 | [Cards & banner](./11-cards-and-banner.md) | Restaurant + food card redesign; real photography in the promo banner |
| 12 | [Native chrome](./12-native-chrome.md) | One shared header (21 screens hand-roll their own), scroll-linked blur, three motion moments |
| 13 | [Firebase](./13-firebase.md) | **Needs user decisions first** — see its "Open questions" |

## Two external resources that did not pan out

Checked before writing prompt 12, so nobody burns time on them:

- **[hugeicons-animated.com](https://hugeicons-animated.com/)** — React DOM only.
  Icons install as source via the shadcn CLI and animate with
  [motion](https://motion.dev) (Framer Motion), which has no React Native
  renderer. It will not compile in this app. Prompt 12 achieves the same effect
  with Reanimated on the hugeicons SVGs already installed.
- **[nativebloom.dev/blocks](https://nativebloom.dev/blocks)** — 790 React Native
  blocks, but the catalogue renders as video previews and the source is behind a
  sign-in wall, so the components could not be surveyed. If you have an account
  and want specific blocks adopted, name them and it becomes a follow-up.

## Standing gaps

- **Attribution is still owed.** OpenStreetMap (ODbL) and TheMealDB both require
  a visible credit. Prompt 07 was to put it in Profile → About; confirm it
  actually landed, and if not, it needs a home.
- **`checkout.tsx` and `edit-address.tsx`** carry setState-in-effect lint errors
  introduced during round 1. Prompt 09 clears them.
