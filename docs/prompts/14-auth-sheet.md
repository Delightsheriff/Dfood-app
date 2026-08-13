# Prompt 14 — Google / Apple auth in a bottom sheet

Depends on the Firebase work in `8867409` already being in the tree.

---

Read `docs/DESIGN-SYSTEM.md` first. This prompt does not repeat its rules.

## Context

Firebase Auth landed as **three full-screen pages** — `app/(auth)/login.tsx`,
`app/(auth)/signup.tsx`, `app/(auth)/forgot-password.tsx` — plus
`app/(auth)/_layout.tsx`. They're email/password forms.

That's the wrong shape for this app, twice over:

1. This project deliberately moved *out* from behind an auth wall. Sign-in is
   optional sync, not a gate — full-screen pages make it feel like a gate.
2. Email/password is the highest-friction option. A portfolio reviewer will not
   type an email and invent a password to look at your app.

Replace all of it with **one bottom sheet offering Google and Apple**.

## What to build

A single `components/auth/auth-sheet.tsx`, opened from anywhere sign-in is
offered (Profile is the main entry; also wherever an action needs an account).

**Presentation** — a native sheet, per the design-system doc: either
`Stack.Screen options={{ presentation: 'formSheet', sheetAllowedDetents: 'fitToContents' }}`
or `@expo/ui`'s Universal `BottomSheet`. Not a JS bottom-sheet library.

**Content**, in order:

1. A short, honest headline. Not "Welcome back" — the user has no account.
   Something that says what signing in *does*: keeps your orders and favourites
   when you switch devices. One line, plain language, no marketing voice.
2. **Continue with Apple** — first on iOS, per Apple's convention.
3. **Continue with Google**.
4. A quiet "Maybe later" dismiss. The sheet must always be dismissible; nothing
   in the app should be reachable *only* by signing in.
5. Small print: what gets synced. Be specific and true — orders, favourites,
   addresses. Not a legal wall.

**Buttons** — full-width, stacked, generous height. Apple's is black with the
Apple mark; Google's is white with a border and the Google mark. These are the
two most recognisable buttons in mobile software; matching their conventions
matters more than matching your palette here. Use the official marks, and follow
Apple's Sign in with Apple guidelines for the button — it's a review
requirement if this ever ships.

## Implementation scope — read carefully

**Apple is a placeholder.** The user asked for it as a placeholder, and real
Sign in with Apple needs `expo-apple-authentication`, a paid Apple Developer
account, and a native build. Wire the button and its full visual state, then
have it surface a clear "Apple sign-in isn't set up yet" message. Do **not**
fake a successful sign-in.

**Google is the one to actually make work**, if it can be done inside Expo Go.
Investigate `expo-auth-session` with Firebase's `signInWithCredential` — that
path generally works in Expo Go, unlike `@react-native-google-signin`. If it
turns out to need a development build, **stop and report that** rather than
switching the project's build workflow on your own; make Google a placeholder
too and say so.

Either way, `store/authStore.ts` and `lib/firebase/sync.ts` already exist —
plug into them rather than inventing parallel state.

## Also fix

`.env.example` still says *"No environment variables are currently required"*.
Firebase needs six (`EXPO_PUBLIC_FIREBASE_API_KEY`, `_AUTH_DOMAIN`,
`_PROJECT_ID`, `_STORAGE_BUCKET`, `_MESSAGING_SENDER_ID`, `_APP_ID` — see
`lib/firebase/config.ts`). Document them, with a note that the app runs fine
with none of them set.

## Delete

`app/(auth)/login.tsx`, `signup.tsx`, `forgot-password.tsx`, `_layout.tsx`, and
the `(auth)` handling in `app/_layout.tsx`'s routing effect. Check nothing else
links to those routes first.

## Done criteria

- `npx tsc --noEmit` → 0 errors; `npm run lint` → 0 problems. Both are at zero
  now; do not regress them.
- `grep -rn "(auth)" app/` → no matches
- The app works fully signed-out. Sign-in is never required to browse, add to
  cart, or check out.
- **Run it.** Open the sheet from Profile, dismiss it by swipe and by button,
  and confirm both provider buttons render correctly. Screenshot the sheet.

## Report back

Commits, whether Google actually works in Expo Go or had to become a
placeholder, and the screenshot.
