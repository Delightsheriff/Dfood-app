# Prompt 03 — Restaurants list & restaurant detail

Depends on **Prompt 02** (it reuses the redesigned `RestaurantCard`).

---

Read `docs/DESIGN-SYSTEM.md` first. This prompt does not repeat its rules.

## A. Restaurants list — `app/(app)/restaurants/index.tsx` (98 lines)

Currently a plain header + a `.map()`ed list of `RestaurantCard`s.

Rebuild as a single vertical FlashList using the `full` card variant from
Prompt 02, with:

- A large screen title, and a filter/sort affordance in the header.
- A sticky horizontal filter-pill row that scrolls with the list header:
  *Open now · Free delivery · Top rated · Nearby · Price*. Same client-side
  filtering as home — the whole restaurant list is already fetched once per
  session and cached in `services/data.service.ts`.
- A result count line ("48 restaurants nearby").
- Empty and error states that read as deliberate design, not a bare centered
  string.

## B. Restaurant detail — `app/(app)/restaurants/[id].tsx` (268 lines)

Currently: a carousel hero, a rounded content sheet overlapping it, badge rows,
and a `.map()`ed grid of `FoodCard`s.

Rebuild against the **DoorDash restaurant page**, which is the closest
reference, and reuse the composition already established in
`app/(app)/food/[id].tsx` (see the design-system doc, §3 — flat edge below the
hero, *not* a rounded overlapping card).

Structure, top to bottom:

1. **Full-bleed hero**, ~35-40% of screen height, with the established
   `IconButton`s floating on it: back (left), share + favorite (right). Top
   gradient scrim for legibility.
2. **Restaurant identity block.** DoorDash overlaps a circular logo avatar onto
   the hero's bottom-left — there is no logo in the data, so instead use the
   restaurant's first image as a small rounded thumbnail, or skip the avatar
   and lead with the name. Your call; pick one and be deliberate.
3. **Name**, then a single meta line: `rating ★ (reviews) · cuisine · distance`.
   Reference: DoorDash's `DashPass · 4,4★ (500+) · American · 800 ft`. Use
   `cuisineTags[0]` and `priceLevel`; both are on the `Restaurant` type.
4. **Delivery / Pickup segmented toggle** plus a stat row (`distance` /
   `delivery time`) in a bordered container, per DoorDash. Pickup is cosmetic —
   there's no pickup flow — so either make the toggle purely visual with
   Delivery locked as selected, or drop it. Don't wire it to something fake
   that silently does nothing.
5. **Menu.** DoorDash uses sticky horizontal category tabs above a 2-column
   grid of featured items with a `+` button on each card. Every dish for a given
   restaurant comes from one synthesized TheMealDB category (see the
   design-system doc §6), so there is realistically only **one** menu section —
   don't build sticky multi-category tabs for a single category. Use one
   section header and a 2-column FlashList (`numColumns={2}`).

## C. FoodCard — `components/FoodCard.tsx`

Shared by restaurant detail, category detail, and search. Redesign against
DoorDash's featured-item card: image, name, price, a small rating line, and a
circular `+` button bottom-right on the image.

Keep the existing add-to-cart logic exactly — including the "switch restaurant
clears cart" Alert and the toast — but note the current `handleAddToCart` takes
an untyped `(e: any)` and calls `e.stopPropagation()`; type it properly when
you touch it.

## Tasks

Each its own commit: (1) `FoodCard` redesign, (2) restaurants list, (3)
restaurant detail hero + identity, (4) restaurant detail menu grid, (5) verify.

Verification per the design-system doc — run it, open a real restaurant from
home, screenshot, scroll the menu, add an item to cart, and check the
switch-restaurant Alert still fires.

## Report back

Commits, what you decided about the logo avatar and the Delivery/Pickup toggle,
and confirmation you ran it.
