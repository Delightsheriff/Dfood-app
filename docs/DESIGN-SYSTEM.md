# Dfood Design System

The shared contract for every screen in the redesign. Read this before
implementing any screen prompt — the prompts assume it and don't repeat it.

Status: established by the food-detail redesign (`app/(app)/food/[id].tsx`),
which is the reference implementation. When a prompt is ambiguous, open that
file and copy its approach.

---

## 1. Direction

Base is **DoorDash / Instacart**: calm neutral surfaces, generous whitespace,
photography carries the page, minimal chrome, one confident accent.

Borrow **Zomato's badge vocabulary** (discount tags, rating pills,
delivery-time pills) but *sparingly* — badges are seasoning, not the meal.
Never stack three badges on one card the way Zomato does.

Reserve **one loud moment per screen** (Gopuff-style), not five.

The failure mode to avoid: the accent color doing every job at once. That reads
as a generic food-delivery template, which is exactly what this project is
moving away from.

## 2. Tokens

Defined in `tailwind.config.js`. Use the token names, not raw hex, in screens.

| Token | Value | Use |
| --- | --- | --- |
| `primary` | `#E0533A` | Deep coral-red. Rating stars, active favorite, selected states. **Not** the default button color. |
| `secondary` | `#262B33` | Ink. Headings, body text, and primary CTA fills. |
| `surface-muted` | `#F4F1ED` | Warm light gray. Cards, steppers, chips, dividers. |
| `text-gray` | `#646982` | Secondary text, labels, meta rows. |

Font: **Sen** only — `font-sen`, `font-sen-medium`, `font-sen-bold`,
`font-sen-extra-bold`. No other family.

Type scale: prefer weight and color for hierarchy over many sizes. Titles
~26px extra-bold, body ~15px, meta ~12-13px, labels ~11px uppercase tracked.

## 3. Established patterns

**Floating icon buttons** — `components/ui/icon-button.tsx` (`IconButton`).
Rounded-square 44×44, real native glass (expo-blur `BlurView`), soft shadow,
gesture press-scale. Use for anything floating over a photo. Don't rebuild it,
don't swap it for a circle.

**Detail-screen composition** (from food detail — reuse for restaurant detail):
1. Full-bleed hero image, ~40-45% of screen height, edge to edge.
2. Subtle top gradient scrim so status bar + icons stay legible.
3. Content cuts to a **flat edge** below the hero — no rounded "scoop"
   overlapping the image. That rounded-overlap card is the old design and was
   explicitly removed.
4. Category/genre pill → title → byline + rating row → divider → stat grid.
5. Sticky bottom bar with the primary action.

**Stat grid** — 4 evenly spaced columns, no dividers between them, small
uppercase label over a bold value. Omit a column entirely when its data is
missing rather than rendering a blank or zero.

**CTA buttons** — solid `bg-secondary` (ink) pill, full width or paired.
Compound components: `Button` / `ButtonText` / `ButtonIcon` from
`components/ui/button.tsx`. Never a component taking `children: string | ReactNode`.

## 4. Performance rules (non-negotiable — this app targets 60fps)

- **Lists**: `@shopify/flash-list`, always, even short horizontal ones. Never
  `ScrollView` + `.map()`. FlashList v2 auto-measures — there is no
  `estimatedItemSize` prop, don't add one.
- **Images**: `expo-image` only, never `react-native`'s `Image`. Set
  `contentFit`, `transition`, and `recyclingKey` inside lists. Request
  appropriately sized images — TheMealDB thumbs take a `/small`, `/medium`,
  `/large` suffix; use `/small` in cards.
- **Animation**: only `transform` and `opacity`. Never animate width, height,
  top, left, margin, or padding.
- **Press states**: `GestureDetector` + `Gesture.Tap()` with a Reanimated
  shared value. Store the press *state* (0/1) and derive scale via
  `interpolate`. Not `Pressable`'s `onPressIn`/`onPressOut` + `setState`.
- **Shared values**: `.get()` / `.set()`, never `.value` — React Compiler is
  enabled in `app.json` and can't track property access.
- **Touchables**: `Pressable` only. Never `TouchableOpacity`/`TouchableHighlight`.
  Note: `activeOpacity` is not a Pressable prop — several existing screens pass
  it and produce type errors. Don't copy that.
- **Scroll position**: never in `useState`. Use a Reanimated shared value with
  `useAnimatedScrollHandler`, or a ref.
- **Styling**: `gap` for space *between*, `padding` for space *within*.
  `borderCurve: 'continuous'` alongside every `borderRadius`. CSS `boxShadow`
  string syntax — not `shadowColor`/`shadowOffset`/`shadowOpacity`/`elevation`
  objects (most existing screens still use the old form; replace it as you
  touch them).
- **Gradients**: `expo-linear-gradient`, already a dependency.

## 5. Icons

`@hugeicons/react-native` + `@hugeicons/core-free-icons`, rendered via
`<HugeiconsIcon icon={...} />`.

**Confirm every icon name against the installed package's type definitions
before using it** (`node_modules/@hugeicons/core-free-icons/dist/types/index.d.ts`).
Names are not guessable — it's `ArrowLeft01Icon`, `Add01Icon`,
`MinusSignIcon`, `Share01Icon`, `Fire02Icon`, `Tag01Icon`.

`lucide-react-native` is still imported by ~35 unconverted files. Swap a file's
icons to hugeicons when you redesign that file — don't do a repo-wide swap.

Sizing: ~22px in a 44×44 button, ~14-16px inline with text, 44×44 minimum
touch target.

## 6. Data layer

No backend, no auth. Restaurants come from **OpenStreetMap Overpass**
(`services/osm.service.ts`), menu items from **TheMealDB**
(`services/mealdb.service.ts`), joined by adapters in `lib/adapters/`.
Favorites / addresses / orders / payment methods are local Zustand stores in
`store/`, surfaced through hooks in `hooks/useDataQueries.ts`.

Things that are **fabricated deterministically** (seeded by a stable id, so
they don't change between app opens): rating, review count, price, calories,
delivery fee, price level, open/closed status, opening hours, and each
restaurant's menu. Real data: restaurant name, address, cuisine tags,
coordinates; dish name, image, instructions, ingredients.

Consequences for UI work:
- `restaurant.osmId` is present **only** on real OSM-backed restaurants. Items
  reached via category browse attach to a synthetic placeholder restaurant
  named after the category itself (e.g. "Pizza"). Gate any "By {restaurant}"
  UI on `osmId` or it renders nonsense.
- `food.ingredients` is populated **only** on the single-item fetch path
  (`getFoodItemById`), not in menu lists. Omit the section when empty.
- Attribution is still owed: "© OpenStreetMap contributors" and "Recipe data
  and imagery: TheMealDB" need a home in the UI. Put it in Profile → About,
  or a small footer on the home feed. Flagged, not yet built.

## 7. Verification (read this — it has bitten us)

`tsc` and lint passing means **nothing** about whether a screen works. Three
separate bugs shipped clean typechecks while leaving every restaurant list
empty: an uncaught location error, an Overpass 406 from a default User-Agent,
and a negative `String.repeat` count from a signed bit-shift.

So, for every screen you touch:

1. Run the app and open the screen on a simulator.
2. Screenshot it. Look at it.
3. Exercise the interactions — tap the buttons, scroll the lists, toggle the
   states.
4. Check both the populated **and** empty/error states.

If you can't run it, say so explicitly in your report rather than implying it
was verified.

Baseline: there are pre-existing type errors in `checkout.tsx`,
`profile/*.tsx`, `notificationService.ts`, and lint errors in
`components/ui/toast-config.tsx`. Don't fix them as drive-bys, but don't add
to them either — compare counts before and after.

## 8. Commits

- No `Co-Authored-By` trailer, ever.
- Leave the repo's existing git config alone (`Delight Sheriff
  <delightsheriff@gmail.com>`).
- One logical change per commit, small and separately reviewable. Not one
  giant commit at the end.
- `git log --oneline -1` after each to confirm it landed.
