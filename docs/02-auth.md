# Section 02: Authentication & Route Protection Plan

> **Files Involved:**
> - [`app/_layout.tsx`](file:///Users/MAC/Documents/Dfood-app/app/_layout.tsx)
> - [`contexts/AuthContext.tsx`](file:///Users/MAC/Documents/Dfood-app/contexts/AuthContext.tsx)
> - [`lib/api-client.ts`](file:///Users/MAC/Documents/Dfood-app/lib/api-client.ts)
> - [`services/auth.service.ts`](file:///Users/MAC/Documents/Dfood-app/services/auth.service.ts)
> - [`hooks/useAuthMutations.ts`](file:///Users/MAC/Documents/Dfood-app/hooks/useAuthMutations.ts)
> - [`app/(auth)/signin.tsx`](file:///Users/MAC/Documents/Dfood-app/app/(auth)/signin.tsx)
> - [`app/(auth)/signup.tsx`](file:///Users/MAC/Documents/Dfood-app/app/(auth)/signup.tsx)
> - [`app/(auth)/verification.tsx`](file:///Users/MAC/Documents/Dfood-app/app/(auth)/verification.tsx)
> - [`app/(auth)/forgot-password.tsx`](file:///Users/MAC/Documents/Dfood-app/app/(auth)/forgot-password.tsx)
> - [`app/(auth)/reset-password.tsx`](file:///Users/MAC/Documents/Dfood-app/app/(auth)/reset-password.tsx)

---

## 🔍 Codebase Audit & "Slop" Analysis

### 1. Fragile Navigation Ref Guard in `app/_layout.tsx`
```typescript
// ❌ SLOP PATTERN: Ref flag prevents route checks from running on route state changes
const hasNavigated = useRef(false);

useEffect(() => {
  if (isLoading || hasNavigated.current) return;
  // ...
  if (targetRoute) {
    hasNavigated.current = true;
    router.replace(targetRoute as any);
  }
}, [isLoading, hasCompletedOnboarding, isAuthenticated, segments, router]);
```
- **Why it's Slop:** If a user logs out or if deep-linking occurs, `hasNavigated.current` remains `true`, preventing mandatory redirects!
- **Fix:** Remove `hasNavigated` ref entirely and handle route protection declaratively using layout route matching or `<Slot />` conditional rendering.

### 2. Disconnected 401 Interceptor and Auth State
- **Issue:** `lib/api-client.ts` clears token storage on `401 Unauthorized`, but does NOT notify `AuthContext`. The application state remains `isAuthenticated = true` until a query re-render occurs or user manually taps an action.
- **Fix:** Implement an event emitter or callback mechanism in `api-client.ts` that automatically triggers `signOut()` or invalidates session state in `AuthContext`.

### 3. Password Reset OTP Token Flow Gaps
- **Issue:** `verifyOTP` returns `{ resetToken }`, which is stored in temporary local screen state. If the user minimizes the app or navigates away, the token is lost without proper state persistence or navigation param passing.
- **Fix:** Pass `resetToken` securely through Expo Router params or store in a scoped auth memory state.

---

## 🚀 Expo & React Native Best Practice Upgrades

### A. Declarative Expo Router Layout Guards
Use `Stack.Screen` conditional rendering or a custom `useProtectedRoute` hook that synchronizes seamlessly with navigation state:

```typescript
// hooks/useProtectedRoute.ts
import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";

export function useProtectedRoute(
  isAuthenticated: boolean,
  hasCompletedOnboarding: boolean,
  isLoading: boolean
) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inOnboardingGroup = segments[0] === "onboarding";
    const inAuthGroup = segments[0] === "(auth)";
    const inAppGroup = segments[0] === "(app)";

    if (!hasCompletedOnboarding) {
      if (!inOnboardingGroup) {
        router.replace("/onboarding");
      }
    } else if (!isAuthenticated) {
      if (!inAuthGroup) {
        router.replace("/(auth)/signin");
      }
    } else if (isAuthenticated) {
      if (!inAppGroup) {
        router.replace("/(app)");
      }
    }
  }, [isAuthenticated, hasCompletedOnboarding, isLoading, segments]);
}
```

### B. SecureStore Token Management Best Practices
```typescript
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "auth_token_v1";

export const tokenStorage = {
  async save(token: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.setItem(TOKEN_KEY, token);
      return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  },

  async get(): Promise<string | null> {
    if (Platform.OS === "web") {
      return localStorage.getItem(TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },

  async remove(): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.removeItem(TOKEN_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};
```

---

## 🛠 Complete Form Validation Schema (`lib/validations/auth.ts`)

```typescript
import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signUpSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  phone: z.string().min(10, "Enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
});

export const verifyOTPSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits"),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
```

---

## ✅ Verification & Test Plan

1. **Auth Session Recovery:** Log in, hard-close app, re-launch app; verify session restores seamlessly without showing sign-in screen.
2. **Expired Token Simulation:** Trigger a 401 API error; verify token is purged and user is redirected to `/(auth)/signin`.
3. **Invalid Credentials Handling:** Enter incorrect password; verify Toast notification and field-level validation errors work cleanly.
