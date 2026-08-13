# Prompt 07 — Profile, orders & sub-screens

Depends on **Prompt 01** (Orders becomes a tab root).

---

Read `docs/DESIGN-SYSTEM.md` first. This prompt does not repeat its rules.

## Context

The largest cluster in the app, ~2,900 lines across nine files, and the most
old-design:

| File | Lines |
| --- | --- |
| `profile/index.tsx` | 258 |
| `profile/personal-info.tsx` | 462 |
| `profile/order-details.tsx` | 615 |
| `profile/orders.tsx` | 204 |
| `profile/addresses.tsx` | 244 |
| `profile/add-address.tsx` | 429 |
| `profile/edit-address.tsx` | 391 |
| `profile/payment-methods.tsx` | 234 |
| `profile/add-card.tsx` | 197 |

Most of the pre-existing `activeOpacity`-on-Pressable type errors live here.

**There is no auth and no user account.** `getProfile()` returns a hardcoded
placeholder (`name: "Guest"`, `email: "guest@dfood.local"`) — see
`services/data.service.ts`. The current personal-info screen is a full profile
editor with an orange banner, avatar upload, a "CUSTOMER" role badge, and a
"SAVE CHANGES" button that saves to a stub. That's fiction — the screen should
not imply an account exists.

**This is a scope decision, not just a restyle.** Reduce personal-info to a
genuine local profile: a display name and an optional avatar, persisted to a
new local Zustand store (follow `store/cartStore.ts`'s `persist` +
`createJSONStorage(AsyncStorage)` pattern). Drop the email field, the role
badge, and the fake save. Then have `getProfile()` read from that store instead
of returning a constant, so the name shown across the app is real.

No reference images were provided for these screens — derive them from the
design system, and keep them plain. This is the least interesting part of a
food app; it should look clean and get out of the way.

## Screens

**Profile index** — a header with the local name + avatar, then grouped rows
(Addresses, Payment methods, Favourites, Notifications, About). Drop the
Cart and My Orders rows — both are tabs now. Add an **About** row: it's where
the OpenStreetMap and TheMealDB attribution owed under their licenses should
live (see the design-system doc §6).

**Orders** (now a tab root) — a FlashList of order cards: restaurant name,
item count, total, status pill, date. Status colors: pending/preparing warm,
delivered green, cancelled muted. Real data from `useOrders()`. A designed
empty state — this is the common case, since orders only exist after a local
checkout.

**Order details** — 615 lines is far too much. Cut to: status timeline, items,
delivery address, payment method, totals, and a cancel action for pending
orders (`useCancelOrder()` already exists and enforces pending-only).

**Addresses / add / edit** — a list of saved addresses with a default marker,
and a form. `expo-location` is used here for GPS auto-fill and
`react-native-maps` for a picker. Keep both, but note the location bug fixed in
`services/osm.service.ts`: `getCurrentPositionAsync` throws
`LocationUnavailable` on a simulator with no location set. Wrap every location
call in try/catch and degrade to manual entry rather than throwing.

**Payment methods / add card** — cash plus cosmetic saved cards from
`store/paymentMethodStore.ts`. Make the demo nature visible in the UI. If
Prompt 06 hasn't removed the Paystack flow yet, coordinate — don't both do it.

**Favourites** — a 2-column FlashList of the redesigned `FoodCard`, from
`useFavorites()`. Empty state matters here too.

## Tasks

Each its own commit, roughly one per screen. Start with the local-profile store
and `getProfile()`, since profile index and personal-info both depend on it.

Verification per the design-system doc — run every screen, set a profile name
and confirm it appears on home and profile, add and delete an address, favourite
a dish and see it appear, and open an order (place one via Prompt 06's flow, or
check the empty state if none exist). Screenshot each. The `activeOpacity`
errors concentrated in these files should go **down** as you rewrite them.

## Report back

Commits, the type-error count before and after, what you cut from personal-info
and order-details, where attribution landed, and confirmation you ran it.
