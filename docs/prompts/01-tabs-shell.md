# Prompt 01 — Tab bar & navigation shell

**Do this one first.** Every other screen prompt assumes tabs exist.

---

Read `docs/DESIGN-SYSTEM.md` first — it defines tokens, patterns, performance
rules, data quirks, verification requirements, and commit rules. This prompt
does not repeat them.

## Context

`app/(app)/_layout.tsx` is currently a bare `<Stack screenOptions={{ headerShown: false }} />`
— five lines, no tab bar anywhere in the app. Every screen is a stack push, so
Home, Search, Orders, and Profile are all reached by pushing and popping.

All four reference apps use a persistent bottom tab bar (DoorDash:
Home/Pickup/Browse/Me · Zomato: Delivery/Dining · Affirm: Home/Deals/Card/Manage ·
Crouton: a floating blurred pill bar). Dfood needs one.

`@react-navigation/bottom-tabs` is in `package.json` but **unused** — do not
use it. Use expo-router's native tabs
(`import { NativeTabs } from 'expo-router/unstable-native-tabs'`), which renders
real `UITabBarController` on iOS. Read
https://docs.expo.dev/router/advanced/native-tabs before starting; confirm the
API against the installed `expo-router` version rather than assuming.

## Tabs

Four, in order: **Home · Search · Orders · Profile**.

Cart is deliberately *not* a tab — it stays as a badged icon in the Home
header, matching DoorDash and Zomato. The badge count comes from
`useCartStore((s) => s.getItemCount())`.

Route mapping — this is a restructure, not just a layout swap:

| Tab | Current file | Target |
| --- | --- | --- |
| Home | `app/(app)/index.tsx` | stays |
| Search | `app/(app)/search.tsx` | becomes a tab root |
| Orders | `app/(app)/profile/orders.tsx` | promoted out of profile to a tab root |
| Profile | `app/(app)/profile/index.tsx` | becomes a tab root |

Screens that must remain **stack pushes above the tabs** (full-screen, no tab
bar): `food/[id]`, `restaurants/[id]`, `categories/[id]`, `cart`, `checkout`,
`order-confirmation`, and every `profile/*` sub-screen except `orders`.

Moving `orders` out of `profile/` will break its existing links — grep for
`profile/orders` and fix every caller. Keep the profile menu row pointing at
Orders; it should switch tabs rather than push a duplicate screen.

## Tasks

1. Restructure routes so the four tabs are tab roots and everything else stays
   a stack push above them. Commit alone.
2. Implement the native tab bar. Icons from hugeicons (confirm exact export
   names against the package's type definitions — see the design-system doc).
   Active tint `primary`, inactive `text-gray`. Labels shown.
3. Make sure every pushed screen still renders full-screen without the tab bar
   showing through, and that back navigation returns to the right tab.
4. Verify per the design-system doc's verification section: run the app, tap
   through all four tabs, push into a detail screen from each, come back.
   Screenshot each tab.

## Report back

Commits, the exact hugeicons names used, anything the native-tabs API forced
you to do differently than this prompt assumed, and confirmation you ran it.
