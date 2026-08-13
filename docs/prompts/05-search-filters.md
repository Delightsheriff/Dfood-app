# Prompt 05 — Search & filter sheet

Depends on **Prompts 02–03** (reuses both redesigned cards).

---

Read `docs/DESIGN-SYSTEM.md` first. This prompt does not repeat its rules.

## Context

- `app/(app)/search.tsx` (216 lines) — a search header, then `.map()`ed
  `RestaurantCard`s and `FoodCard`s inside a `ScrollView`. Debounced at 500ms
  via `useDebounce`, fires at 2+ characters through `useSearch()`.
- `components/FilterDialog.tsx` (203 lines) — the existing filter UI, built on
  `@rn-primitives/dialog`. Read it before replacing it.

After Prompt 01 this is a **tab root**, not a pushed screen — so it needs a
resting state when the query is empty, which it currently doesn't have.

## A. Search screen

Reference: the **Zomato search-results screen**.

1. **Search bar** — a real focused input at the top, with a clear (`X`) button.
   Since this is now a tab root, a back button only makes sense when arrived at
   by push; prefer no back button and let the tab bar handle navigation.
2. **Filter chip row**, horizontally scrolling, directly under the search bar.
   Zomato's treatment: an active chip shows a count and an inline `X` to clear
   it (`Filters (2)`, `Type (2)`, `Latte ✕`). Chips: *Filters* (opens the sheet),
   *Open now*, *Free delivery*, *Top rated*, *Under 30 mins*. Active chips get
   a `primary` outline + tint, matching Zomato.
3. **Resting state** (empty query) — don't show a blank screen. Show recent
   searches (persist them in a small Zustand store following the pattern in
   `store/cartStore.ts`) and a "Popular cuisines" chip cloud built from the
   curated category list.
4. **Results** — a single FlashList with section headers, using
   `getItemType` to keep restaurant rows and dish rows in separate recycling
   pools (see the design-system doc's list rules). Sections: `RESTAURANTS`
   then `DISHES`, each with a count, matching the existing convention.
5. **No results** — a designed empty state naming the query.

Keep the 500ms debounce and the 2-character threshold.

## B. Filter sheet

Reference: the **Zomato filter modal** — a bottom sheet with a vertical
category rail down the left side (Type, Flavour, Base, Region…), a scrolling
pane of options on the right, `Clear All` top-right, and a `Close` / `Show
results` footer.

That two-pane structure is designed for far more filter dimensions than Dfood
has. Don't copy it literally — Dfood has maybe four dimensions (sort, price
level, delivery time, open now). Build a **single-pane** bottom sheet with
those as grouped sections, keeping Zomato's `Clear All` and its footer pattern
(`Close` + a filled `Show results (N)` showing the live count).

Use a **native sheet**, not a JS one: either
`Stack.Screen options={{ presentation: 'formSheet', sheetAllowedDetents: 'fitToContents' }}`
or `@expo/ui`'s Universal `BottomSheet`. `@gorhom/bottom-sheet` is still a
dependency used elsewhere — don't add new usage of it, and note in your report
whether it's now unused so it can be dropped later.

Filter state should live in one place both the chip row and the sheet read
from. A small Zustand store is fine; don't thread it through props.

Sort options: *Relevance · Rating · Delivery time · Price*.

## Tasks

Each its own commit: (1) search screen structure + resting state, (2) results
list with item types, (3) filter chip row, (4) native filter sheet + shared
filter state, (5) retire `FilterDialog` if nothing else uses it, (6) verify.

Verification per the design-system doc — run it, type a real query (try
"chicken" and something with no results), open the sheet, apply and clear
filters, confirm the result count updates live.

## Report back

Commits, whether `@gorhom/bottom-sheet` is now unused, what happened to
`FilterDialog`, and confirmation you ran it.
