# Prompt 17 — Expo UI audit, blur coverage & Firebase plug-and-play

The final pass. Three parts; do them in order.

---

Read `docs/DESIGN-SYSTEM.md` first. This prompt does not repeat its rules.

---

## Part A — Audit `@expo/ui` and port what genuinely wins

**Read these before writing any code. Do not work from memory — the API has
moved and parts are still unstable:**

- https://docs.expo.dev/versions/latest/sdk/ui/ — overview, platform support
- https://docs.expo.dev/versions/latest/sdk/ui/universal/ — cross-platform components
- https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/ — iOS/SwiftUI specifics
- https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/ — Android specifics
- https://docs.expo.dev/router/advanced/native-tabs/ — native tabs (already in use)

Confirm every component name and prop against the installed package's type
definitions before using it. `@expo/ui` is **not currently a dependency** —
install with `npx expo install @expo/ui` so the version matches SDK 57.

### The constraint you must respect

`@expo/ui` renders **genuine native OS controls** — SwiftUI on iOS, Jetpack
Compose on Android — styled by the *system*, not by this app's palette. There is
no `className`, no brand colour, no Bricolage type. That is the entire point of
it, and it is also why "port everything" is the wrong instruction to follow
literally.

This app has a deliberate visual identity: coral `#E0533A` reserved for ratings
and active states, ink `#262B33` CTAs, Bricolage display type, custom cards with
photography. Porting the cards, buttons, badges or banners to `@expo/ui` would
replace all of that with stock iOS/Android chrome and throw away the design
work.

So: **port where native genuinely wins, and report what you deliberately did
not port and why.** Native wins on *system-behaviour* surfaces — the things
users expect to feel like the OS:

| Candidate | Currently | Worth porting? |
| --- | --- | --- |
| Filter sheet | `components/SearchFilterSheet.tsx` | Yes — native sheet detents, drag, and dismiss beat a JS reimplementation |
| Auth sheet | `components/auth/auth-sheet.tsx` | Yes, if it isn't already a native `formSheet` |
| Switches / toggles | any settings rows | Yes — a native `Switch` is instantly familiar |
| Pickers / segmented controls | Delivery/Pickup toggle on restaurant detail | Evaluate; the current one is brand-styled, so weigh it |
| Sliders | none yet | n/a |
| Context menus | none yet | Consider for card long-press |
| **Cards, badges, buttons, banners, headers, lists** | custom | **No.** These carry the brand. Leave them. |

If the docs reveal something genuinely better that this table missed, say so —
the table is a starting point, not a limit.

### On 60fps

`@expo/ui` is not what makes this app fast, and porting components will not by
itself raise the frame rate. The performance rules in the design-system doc
already cover what actually matters (FlashList everywhere, `expo-image`,
`transform`/`opacity` only, gesture-driven press states on the UI thread).

So **measure before and after** rather than assuming. Profile a scroll on Home
and on a restaurant menu, note the frame timings, and report real numbers. If a
port doesn't move them, say that plainly instead of claiming an improvement.

---

## Part B — Finish the progressive-blur coverage

Prompt 15 was reported complete but **eight screens still have no
`ScreenHeader` at all** (verified by grep):

- `app/(app)/order-confirmation.tsx`
- `app/(app)/profile/add-address.tsx`
- `app/(app)/profile/add-card.tsx`
- `app/(app)/profile/addresses.tsx`
- `app/(app)/profile/edit-address.tsx`
- `app/(app)/profile/order-details.tsx`
- `app/(app)/profile/payment-methods.tsx`
- `app/(app)/profile/personal-info.tsx`

Give every one of them the pinned `detail` header with scroll-linked
progressive blur, matching what `cart.tsx`, `checkout.tsx`, `food/[id].tsx` and
`restaurants/[id].tsx` already do. Same rule as before: the back button must be
reachable at any scroll position.

`app/(app)/categories/[id].tsx` still uses a `compact` variant that isn't in the
design system. Prompt 15 asked for this to be reconciled and it wasn't — either
fold it into `detail` or document it properly in `docs/DESIGN-SYSTEM.md`.

**There is also a live layout bug on cart.** The pinned header's title and
subtitle ("Bite" / "2 items") render *on top of* the delivery-ETA banner
beneath them — the header is pinned but the scroll content doesn't inset for
it, so the first block collides. Check every screen using `detail` for the same
collision; the content needs top padding equal to the header height (there's
already `useProgressiveBlurHeaderHeight` for exactly this).

Add `ProgressiveBlurFooter` to any screen with a sticky bottom bar that doesn't
have it yet — `order-confirmation` is the obvious gap.

---

## Part C — Make Firebase truly plug-and-play

The goal: **the user adds six env vars to `.env` and everything works.** No
other setup, no code changes.

Current state: `lib/firebase/config.ts` reads the vars and gates on
`isFirebaseConfigured`; `store/authStore.ts` and `lib/firebase/sync.ts` exist;
`.env.example` documents the vars; the auth sheet offers Google and Apple.

Verify the whole path end to end and fix whatever is incomplete:

1. **Unconfigured** (no env vars): app runs fully local — browse, cart, checkout,
   favourites, addresses all work. The auth sheet either doesn't offer sign-in
   or explains that sync isn't configured. **Nothing crashes, nothing hangs.**
2. **Configured, signed out**: same as above, plus a working sign-in entry point.
3. **Configured, signing in**: Google actually completes. If it only works in a
   development build rather than Expo Go, **say so explicitly** — don't leave it
   silently broken. Apple stays a placeholder with a clear message.
4. **Configured, signed in**: local Zustand stores sync to Firestore *and back*.
   Reinstall-and-sign-in restores favourites, addresses and orders. Sync is
   **mirrored, not replaced** — the app must still work offline.
5. **Sign-out**: clears remote session, keeps local data usable.

Surface sync state in the UI. Silent sync failure is the classic bug here — the
user should be able to tell whether they're signed out, syncing, synced, or
errored.

**Never commit a real key.** `.env` is gitignored; `.env.example` holds empty
placeholders only. Note in your report that the `google-services.json` committed
back in `1045b4e` is still in git history and its key should be rotated in the
Firebase console.

---

## Done criteria

- `npx tsc --noEmit` → 0 errors; `npm run lint` → 0 problems. Both are at zero
  now; **do not regress them.**
- `grep -rn 'variant="compact"' app/` → no matches, or documented
- Every pushed screen has a pinned header; no header/content collisions
- **Run the app** and walk all four Firebase states above. Screenshot each of
  the eight newly-headered screens at rest and mid-scroll.
- Dev-server note: start with plain `npx expo start`. `--clear` triggers the
  NativeWind/Metro watcher crash deterministically (design-system doc §7), and
  Metro will die repeatedly regardless — restart it, it isn't your code.

## Report back

Commits; which components you ported to `@expo/ui` and which you deliberately
left custom and why; **real before/after frame timings**, not claims; whether
Google sign-in works in Expo Go or needs a development build; and the
screenshots.
