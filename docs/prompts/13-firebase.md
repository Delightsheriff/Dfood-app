# Prompt 13 — Firebase

**Do this last**, after 09–12. It is also the one prompt that needs decisions
from the user before it can be written in full — see "Open questions".

---

Read `docs/DESIGN-SYSTEM.md` first, especially §6 (data layer) and §7
(verification).

## Context

The app is deliberately backend-free. Auth was removed in Phase 1; restaurants
come from OpenStreetMap Overpass and dishes from TheMealDB; favorites,
addresses, orders, payment methods and the local profile are Zustand stores
persisted to AsyncStorage.

That works, and it costs nothing to run — which was the original goal. So
Firebase should be added **only where it buys something the local stores can't**,
not as a default.

What it genuinely adds:

| Capability | Buys | Cost |
| --- | --- | --- |
| **Auth** | Identity, so data survives reinstall and syncs across devices | Reintroduces sign-in screens deleted in Phase 1 |
| **Firestore** | Orders/favorites that persist off-device | Free tier is generous; a runaway listener is not |
| **Cloud Messaging** | Real push. `services/notificationService.ts` still exists for this | Needs a development build — **does not work in Expo Go** |
| **Storage** | Profile avatars beyond a local file URI | Only matters if avatars should sync |

## History in this repo — read before starting

Firebase was here before and was removed. Two things to know:

1. `google-services.json` was **committed to git history** and then deleted in
   commit `1045b4e "Remove sensitive credentials"`. It is in the history. If the
   project is ever made public, that old key is exposed — **rotate it in the
   Firebase console rather than assuming deletion was enough**, and tell the user
   this explicitly.
2. `.gitignore` now correctly ignores `google-services.json` **and**
   `GoogleService-Info.plist` (Phase 0 fixed a gap where the first was commented
   out — which is how it got committed). Verify both lines are still there
   *before* you download any config file.

**Never commit a Firebase config file or an API key.** If a step seems to
require it, stop and report instead.

## Expo Go constraint — the big one

`@react-native-firebase/*` requires native modules and **will not run in Expo
Go**. The whole session so far has been tested in Expo Go. Adding native
Firebase means switching to a **development build** (`npx expo run:ios` or an
EAS build), which changes the user's day-to-day workflow.

Two ways around it:

- **Firebase JS SDK (`firebase` npm package)** — works in Expo Go for Auth
  (with `initializeAuth` + AsyncStorage persistence) and Firestore. Does **not**
  do Cloud Messaging. Lowest friction; keeps Expo Go working.
- **`@react-native-firebase`** — full capability including FCM, but requires the
  development-build switch.

**Do not pick this unilaterally.** Ask the user, present the tradeoff plainly,
and wait.

## Open questions — resolve with the user before implementing

1. **Which capabilities?** Auth only, Auth + Firestore, or all four?
2. **Expo Go or development build?** This decides JS SDK vs. native, and it
   affects everything after.
3. **If Auth: does the app go back behind a login wall, or stay guest-first with
   optional sign-in to sync?** Guest-first is strongly recommended — the app was
   explicitly moved out from behind auth earlier in this project, and a portfolio
   reviewer should not have to create an account to see it.
4. **If Firestore: does it replace the Zustand stores, or mirror them?** Mirroring
   (local-first, sync when signed in) keeps the offline behaviour that works
   today. Replacing is simpler but makes the app useless without a network.

## Shape of the work, once decided

Rough sequence — expand into a real plan after the questions above are answered:

1. Firebase project + app registration (the user does this in the console; you
   cannot create accounts on their behalf). Config file placed locally, verified
   gitignored.
2. Install and initialise, gated so a missing config degrades to local-only
   rather than crashing at startup.
3. Auth, if chosen — guest-first, with sign-in surfaced from Profile.
4. Firestore, if chosen — mirroring the existing store shapes. The stores in
   `store/` already define those shapes; follow them rather than inventing new
   ones.
5. FCM, if chosen — this is where `services/notificationService.ts` gets revived
   (prompt 09 decides whether it survives until now; check before assuming).
6. A visible "you're signed out / syncing / synced" state. Silent sync failure
   is the classic bug here.

## Done criteria

- No config file, key, or token committed. `git status` clean of them, and
  `git log -p` for your commits contains none.
- The app still works fully **without** Firebase configured — degraded, not
  broken.
- `npx tsc --noEmit` → 0 errors; `npm run lint` → no new errors.
- Run it: signed out, signed in, and with the network off.

## Report back

What was configured, what you deliberately left out, whether the old committed
key was rotated, and confirmation that nothing sensitive entered git.
