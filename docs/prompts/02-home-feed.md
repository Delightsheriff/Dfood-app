# Prompt 02 — Home feed

Depends on **Prompt 01 (tabs)** being merged.

---

Read `docs/DESIGN-SYSTEM.md` first. This prompt does not repeat its rules.

## Context

`app/(app)/index.tsx` (225 lines) is the old design: a hamburger + cart header,
a plain greeting, a search bar, a horizontal category rail of solid-coral
pills, and a vertical list of `RestaurantCard`s rendered with `.map()` inside a
`ScrollView` — no virtualization at all.

Rebuild it. This is a redesign, not a restyle: rebuild the layout from the spec
below, preserve only data wiring.

**Preserve**: `useCategories()`, `useRestaurants()` from
`hooks/useDataQueries.ts`; `getGreeting()` from `lib/greeting.ts`; the cart
badge count from `useCartStore`; the "All" category prepended to the rail;
`refetch` wired to pull-to-refresh.

**Fix while you're here**: `isRefreshing` is hardcoded `false`, so the refresh
spinner never appears. Bind it to the query's `isRefetching`.

## Reference composition

Drawn from the DoorDash and Zomato home screens, which share a structure:

1. **Location header row.** A pin icon + the current delivery address + a
   chevron (tappable → address list), with notification and badged cart icons
   on the right. There's no address concept on the home screen today — read the
   default address from `useDefaultAddress()`, and fall back to a neutral
   "Set your location" affordance when none is set (the store starts empty, so
   this is the common first-run state — design it deliberately, don't let it
   render blank).
2. **Search bar.** Tappable, not a live input — pushes to the Search tab.
   Placeholder cycles a hint like `Search "Jollof"`.
3. **Category rail.** Horizontal, image + label. Replace the current
   solid-coral pills: use a circular/rounded thumbnail above a small label, on
   a neutral background, selected state in `primary`. Reference: DoorDash's
   emoji-style icon rail and Zomato's image rail. FlashList, horizontal.
4. **Filter pills.** Horizontal row: *Open now · Free delivery · Top rated ·
   Nearby*. These filter the already-fetched restaurant list client-side —
   don't add network calls. Selected state fills with `secondary` (ink), per
   the reference apps.
5. **Promo banner.** One wide card, ~16:9, in a horizontal pager. This is the
   screen's **one loud moment** — use `expo-linear-gradient` and let it carry
   the accent. Content is static/fabricated (e.g. "Free delivery on your first
   order"); there's no promotions API. Keep it to two or three slides.
6. **"Fastest near you"** — horizontal FlashList of compact restaurant cards.
7. **"All restaurants"** — vertical FlashList of full-width restaurant cards.

Section headers are title + a "See all" affordance on the right, matching the
existing convention.

**Do not nest scrollables.** The current file puts `FlatList`s inside a
`ScrollView`, which kills virtualization. Use a single root FlashList with the
header content as `ListHeaderComponent`, and let the horizontal rails be
FlashLists inside that header.

## Restaurant cards

`components/RestaurantCard.tsx` is the old design — white card, 180px image,
two shadowed badges pinned to opposite image corners, a footer with address and
hours. It's used by home, restaurants list, and search.

Redesign it against the Zomato search-result card, which is the strongest
reference: image with rounded corners, a **single** rating pill (not a rating
badge *and* a delivery badge stacked), name, cuisine line, and a compact meta
row (delivery time · distance · price level). Add a bookmark/favorite affordance
in the image's top-right corner, per Zomato.

Support two variants — `compact` (fixed width, for horizontal rails) and
`full` (full width, for vertical lists) — rather than duplicating the component.

Because it's shared, changing it will visibly change the restaurants list and
search results too. That's intended.

## Tasks

Each its own commit:

1. Redesign `RestaurantCard` with `compact` / `full` variants.
2. Rebuild the home screen structure (single FlashList, no nested scrollables).
3. Category rail + filter pills, wired to client-side filtering.
4. Promo banner.
5. Verify per the design-system doc — run it, screenshot it, scroll it, tap a
   card through to a restaurant, pull to refresh, and check the empty state
   (no address set) and the error state.

## Report back

Commits, how you handled the no-address-set case, and confirmation you ran it.
