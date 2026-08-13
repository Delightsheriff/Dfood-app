# Prompt 09 — Pre-Firebase codebase cleanup

**Do this before 10–12 and before any Firebase work.** It removes dead weight
that later prompts would otherwise carry forward.

---

Read `docs/DESIGN-SYSTEM.md` first. This prompt does not repeat its rules.

## Context

The screen redesign (prompts 01–08) is merged. `tsc` is at **0 errors**, down
from 14. But an audit found real gaps.

### A. Three screens were never converted

The commit `1594350 feat: redesign profile, orders, order details, and
sub-screens…` claims sub-screens, but these three were **not touched** (verify
with `git log --oneline d8016cd..HEAD -- <file>` — zero commits each):

| File | Lines |
| --- | --- |
| `app/(app)/profile/add-address.tsx` | 429 |
| `app/(app)/profile/edit-address.tsx` | 391 |
| `app/(app)/profile/add-card.tsx` | 197 |

They are the **sole remaining consumer** of six dependencies. Convert them to
the current design system (see prompt 07 for the intent — local profile, cosmetic
cards, GPS with graceful fallback). They are forms, so keep them plain and
functional; don't over-design them.

Also unconverted, and holding most of the remaining lint errors:
`components/ui/toast-config.tsx`, `components/ui/dialog.tsx`,
`components/ui/icon.tsx`, `components/ui/BackButton.tsx`.

### B. Dead dependencies

Confirmed **zero imports** anywhere in `app/ components/ hooks/ lib/ services/
store/ providers/`:

- `@react-navigation/bottom-tabs` — superseded by expo-router native tabs
- `expo-symbols` — never used
- `expo-secure-store` — auth is gone. **Also still listed as a plugin in
  `app.json`**, which is the same dangling-reference class of bug that Phase 0
  fixed for `googleServicesFile`. Remove from both.

Used **only** by the three unconverted screens above — so once (A) is done,
re-check each and remove any that are then unused:

- `react-native-paystack-webview` (add-card only)
- `@gorhom/bottom-sheet` (add-address only)
- `react-hook-form`, `zod`, `@hookform/resolvers` (add/edit-address only)
- `react-native-maps` (add/edit-address only) — **keep** if you retain a map
  picker; it's the one that may legitimately survive. Your call, state it.

`lucide-react-native` survives in exactly 7 files: the 3 screens above plus the
4 UI components above. Converting all 7 to hugeicons removes it entirely.

### C. Dead file

`components/ui/progressive-blur.tsx` (476 lines) is **never imported**. It was
added for a scroll-linked blur header that no screen ended up using.

**Do not delete it yet** — prompt 12 (native chrome) is going to use it for
exactly that. Leave it, and don't count it as dead weight.

### D. Lint regressions introduced by the redesign

Current: **12 errors, 17 warnings**. Errors break down as:

- 7 × "Cannot access refs during render" — `components/ui/toast-config.tsx`
  (pre-existing, fixed by converting it in A)
- 2 × same — `app/onboarding.tsx` (**new**, introduced by prompt 08)
- 3 × "Calling setState synchronously within an effect" — `checkout.tsx` (×2)
  and `profile/edit-address.tsx` (**new**, introduced by prompts 06/07)

Also a direct design-system violation: `app/onboarding.tsx:63` uses
`scrollX.value = …` instead of `.set()`. React Compiler is enabled and can't
track property access. Fix it, then grep for other `.value` usages (only
`progressive-blur.tsx` should remain — that's vendored, leave it).

Warnings are mostly unused imports/vars and `react-hooks/exhaustive-deps`.
Clear the unused ones; for the exhaustive-deps warnings, actually fix the
dependency rather than suppressing the rule.

### E. Push notifications — a decision, not a cleanup

`services/notificationService.ts` still runs, wired through
`hooks/useNotifications.ts` into `app/_layout.tsx:68`. But the backend
device-token registration was removed in Phase 1, and Expo Go logs on every
launch that remote notifications aren't supported there since SDK 53.

So it currently does nothing useful and adds startup noise. Options:

1. Remove the service, the hook, the `_layout` call, and the `expo-notifications`
   / `expo-device` dependencies. Cleanest.
2. Keep it dormant for the Firebase phase (Cloud Messaging is a plausible later
   feature), but stop calling it at startup.

**Recommend (2)** and say so in your report — but if you find nothing else
references it, (1) is defensible. Don't silently keep the startup call.

## Tasks

Each its own commit, in this order:

1. Convert `toast-config.tsx`, `dialog.tsx`, `icon.tsx`, `BackButton.tsx` to
   the design system + hugeicons. Fixes 7 lint errors.
2. Convert `add-address.tsx` and `edit-address.tsx`.
3. Convert `add-card.tsx`.
4. Fix the onboarding `.value` violation and its 2 ref-during-render errors.
5. Fix the 3 setState-in-effect errors.
6. Clear unused-import/var warnings and fix exhaustive-deps properly.
7. Remove dead dependencies (re-verify each with a grep first) and the
   `expo-secure-store` plugin entry in `app.json`.
8. Handle the notifications decision.

## Done criteria

- `npx tsc --noEmit` → 0 errors (it is 0 now; do not regress it)
- `npm run lint` → **0 errors**; warnings substantially reduced
- `grep -rn "lucide-react-native" app/ components/` → no matches
- `npx expo-doctor` → no *new* findings (there are pre-existing app.json schema
  warnings about `newArchEnabled` / `notification` / `edgeToEdgeEnabled`; you
  may fix those too, but say so)
- The app still runs. Open every screen you touched — especially add-address,
  which uses GPS and a map — and confirm no crash.

## Report back

Commits, the before/after lint counts, which dependencies you actually removed
vs. kept and why, and what you decided about notifications.
