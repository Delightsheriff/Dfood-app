# Prompt 04 — Categories index & category detail

Depends on **Prompt 03** (reuses the redesigned `FoodCard`).

---

Read `docs/DESIGN-SYSTEM.md` first. This prompt does not repeat its rules.

## Context

Two screens, both small and both on the old design:

- `app/(app)/categories/index.tsx` (94 lines) — a grid of `CategoryItem`s.
- `app/(app)/categories/[id].tsx` (110 lines) — "Available Items" + a
  `.map()`ed 2-column grid of `FoodCard`s inside a `ScrollView`.

`components/CategoryItem.tsx` (42 lines) is the current pill — a coral rounded
rect with a circular thumbnail and a white label. It's also used by the home
rail, which Prompt 02 replaces; check whether that leaves this component used
only here, and simplify accordingly.

Categories are a **curated static list** in `lib/adapters/categories.ts` (10
entries: Pizza, Burgers, Sushi, Italian, Mexican, Chinese, Breakfast, Coffee,
Chicken, Desserts), each pairing an OSM `cuisine` tag with a TheMealDB category
thumbnail. There is no categories API — the list won't grow at runtime.

## A. Categories index

Reference: the **Crouton recipe grid** — a 2-column grid of image-filling
cards with the title overlaid directly on the photo, plus small pill badges.

Rebuild as a 2-column FlashList (`numColumns={2}`) where each cell is an
image-filling card with:

- The category thumbnail filling the cell, with a bottom gradient scrim.
- The category name in bold white, overlaid bottom-left.
- A small count pill (e.g. "12 places") — derive it by counting matching
  restaurants from the cached list via `matchesCategory()` in
  `lib/adapters/categories.ts`. If that's awkward to get without an extra fetch,
  omit the pill rather than faking a number.

Large screen title above the grid, matching Crouton's "All Recipes" treatment.
A search affordance in the header is optional — the Search tab already exists,
so don't duplicate a live input here.

## B. Category detail

The screen for one cuisine. Two things belong here that the current version
misses: this route can show **both** the dishes in that category *and* the
restaurants matching that cuisine tag. Right now it only shows dishes.

Structure:

1. Header with back button and the category name as the title.
2. A hero strip using the category thumbnail — keep it short (~140px), this is
   a browse screen not a detail screen.
3. **Restaurants** section — horizontal FlashList of `compact` restaurant cards
   filtered by `matchesCategory(restaurant.cuisineTags, categoryId)`. Omit the
   whole section when nothing matches (common for narrower cuisines).
4. **Dishes** section — 2-column FlashList of the redesigned `FoodCard`, from
   `useFoodItemsByCategory(id)`.

Note the data quirk in the design-system doc §6: dishes reached this way attach
to a synthetic placeholder restaurant named after the category. Don't render
"By {restaurant}" anywhere on these cards — it'll read as "By Pizza".

Empty and error states designed, not bare strings.

## Tasks

Each its own commit: (1) categories index grid, (2) category detail, (3) retire
or simplify `CategoryItem` depending on what still uses it, (4) verify.

Verification per the design-system doc — run it, open the categories tab,
tap into at least two different categories (one broad like Pizza, one narrow),
screenshot both, and confirm the restaurants section correctly disappears when
empty.

## Report back

Commits, whether the count pill was feasible, what happened to `CategoryItem`,
and confirmation you ran it.
