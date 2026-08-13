# Prompt 11 — Card redesign & promo banner imagery

Depends on **Prompt 10** (the new type scale is the main lever here).

---

Read `docs/DESIGN-SYSTEM.md` first. This prompt does not repeat its rules.

## Context

Three surfaces, all currently functional but visually flat.

- `components/RestaurantCard.tsx` — `compact` and `full` variants. Used by
  home (both rails), restaurants list, and search.
- `components/FoodCard.tsx` — used by restaurant detail, category detail,
  favourites, and search.
- The promo banner inside `app/(app)/(tabs)/index.tsx` — currently a
  `LinearGradient` with a headline and no imagery at all. It's a flat colour
  block where the reference apps all use photography.

## A. Restaurant cards

Present state: image, a rating pill top-left, a bookmark top-right, name,
cuisine line, then `20-30 min · ₦2,500 · $$$$`.

Problems worth fixing:

1. **Every card claims "20-30 min".** Delivery time is fabricated but the
   current implementation isn't seeded per restaurant, so it's constant across
   the whole list and reads as fake. Derive it deterministically from the OSM id
   like the other fabricated fields (see `lib/adapters/restaurant.ts` and the
   design-system doc §6) so different restaurants show different times.
2. **The price level renders as `$$$$` in a muted gray**, which is easy to
   misread as disabled. Show the spent portion in ink and the remainder at low
   opacity (`$$`·`$$`), or drop it from the compact variant.
3. The meta row is a single undifferentiated string. Give delivery time slight
   prominence — it's the field people actually scan for.
4. The `CLOSED` overlay is a flat gray wash over the photo. It's readable but
   heavy-handed. Reduce it to a desaturated image plus a clear badge, so the
   food is still appetising while the state stays obvious.

Keep both variants and the same props. This is a visual pass, not an API change.

## B. Food cards

Present state: image, rating pill, name, restaurant name, price, and a circular
`+` button.

1. The restaurant name under the dish is **redundant** on restaurant-detail,
   where every card belongs to the same restaurant already named at the top of
   the screen. Make it conditional — show it in search and favourites, hide it
   on restaurant/category detail. A prop, defaulting to hidden.
2. Prices are the most-scanned element after the photo. With the new `numeric`
   tabular style from prompt 10, set them properly so they align down the column
   in the 2-up grid.
3. The `+` button should give real press feedback. Use the `GestureDetector` +
   shared-value press-scale pattern from `components/ui/icon-button.tsx` rather
   than a plain `Pressable`.

## C. Promo banner — add imagery

This is the screen's one loud moment and it's currently the weakest thing on it.

Each slide should be **food photography with the headline set over it**, not a
solid gradient. Structure per slide: image → dark scrim gradient (bottom-up, so
the text stays legible on any photo) → tag pill → headline → subtitle.

Source the images from **TheMealDB** — the app already pulls from it, the
photography is good, and the licensing question is already settled for this
project (see the design-system doc §6). Two viable approaches:

- **Deterministic and offline-safe (preferred)**: hardcode 2–3 known meal
  thumbnail URLs in the `PROMO_SLIDES` constant. No fetch, no loading state, no
  failure mode on the most prominent element of the home screen.
- Fetch a category's meals and pick one. More "live", but adds a request and a
  loading state to the top of the feed. Only do this if you handle the empty and
  slow paths cleanly.

There's a **trap here that already bit this file once**: `expo-linear-gradient`
is not a core RN component, so NativeWind `className` is silently dropped on it
— it must be styled with the `style` prop. See the existing comment in
`index.tsx` above the banner's `LinearGradient`. The same applies to any other
non-core component you reach for.

Also note the banner sits at `BANNER_HEIGHT = 140`. With a photo behind it, it
likely wants to be taller — reference banners run closer to a 16:9 crop. Adjust
and check it doesn't crowd the categories rail below.

## Tasks

Each its own commit: (1) restaurant card, (2) food card, (3) promo banner
imagery, (4) verify.

## Done criteria

- `npx tsc --noEmit` → 0 errors; `npm run lint` → no new errors
- Delivery times **differ** between restaurants in the list — this is the easiest
  thing to get wrong and the easiest to spot
- **Run the app.** Screenshot home (both rails + the banner), restaurants list,
  restaurant detail (food cards, no redundant restaurant name), search (food
  cards *with* restaurant name), and a closed restaurant.

## Report back

Commits, which promo-image approach you chose, and the screenshots.
