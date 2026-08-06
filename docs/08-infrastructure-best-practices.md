# Section 08: Global Infrastructure, Testing & Expo Best Practices

> **Files Involved:**
> - [`package.json`](file:///Users/MAC/Documents/Dfood-app/package.json)
> - [`tsconfig.json`](file:///Users/MAC/Documents/Dfood-app/tsconfig.json)
> - [`metro.config.js`](file:///Users/MAC/Documents/Dfood-app/metro.config.js)
> - [`babel.config.js`](file:///Users/MAC/Documents/Dfood-app/babel.config.js)
> - [`tailwind.config.js`](file:///Users/MAC/Documents/Dfood-app/tailwind.config.js)
> - [`providers/QueryProvider.tsx`](file:///Users/MAC/Documents/Dfood-app/providers/QueryProvider.tsx)

---

## 🔍 Codebase Audit & "Slop" Analysis

### 1. Missing Automated Testing Infrastructure
- **Issue:** No Jest configuration or unit test files present in codebase. Domain logic (cart totals, auth validators, order payload builder) has zero automated test coverage.
- **Fix:** Install `jest`, `jest-expo`, and `@testing-library/react-native`, creating unit tests for all store actions and validators.

### 2. TanStack React Query v5 Provider Configuration Gaps
- **Issue:** `QueryProvider.tsx` uses default options without setting explicit global `retry` count, error boundary behavior, or mutation defaults.
- **Fix:** Configure `QueryClient` with standard retry strategies (e.g. 1 retry for queries, 0 retries for mutations).

### 3. NativeWind v4 & Tailwind Design System Tokens
- **Issue:** Hardcoded hex colors (`#FF7622`, `#181C2E`, `#F6F8FA`, `#A0A5BA`) scattered across components instead of using semantic Tailwind colors (`bg-primary`, `bg-secondary`, `bg-surface`).
- **Fix:** Consolidate design tokens in `tailwind.config.js`.

---

## 🚀 Expo SDK 57 & React Native 0.86 Standard Configuration

### A. Recommended `package.json` Test & Lint Scripts
```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web",
    "lint": "expo lint",
    "type-check": "tsc --noEmit",
    "test": "jest --watchAll=false",
    "test:coverage": "jest --coverage"
  }
}
```

### B. Standard `QueryProvider.tsx` Implementation Blueprint
```typescript
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes default
      gcTime: 10 * 60 * 1000, // 10 minutes cache persistence
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### C. Design Tokens Config (`tailwind.config.js`)
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FF7622",
          light: "#FFE5D3",
          dark: "#E05D0B",
        },
        secondary: {
          DEFAULT: "#181C2E",
          light: "#2A2F45",
        },
        surface: {
          DEFAULT: "#F6F8FA",
          dark: "#EBF4FF",
        },
        text: {
          primary: "#181C2E",
          gray: "#A0A5BA",
          muted: "#646982",
        },
      },
      fontFamily: {
        sen: ["Sen"],
        "sen-medium": ["Sen-Medium"],
        "sen-bold": ["Sen-Bold"],
        "sen-extra-bold": ["Sen-ExtraBold"],
      },
    },
  },
  plugins: [],
};
```

---

## 🧪 Jest Unit Testing Configuration Setup

### `jest.config.js`
```javascript
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|native-base|react-native-svg|nativewind|@rn-primitives)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};
```

### Sample Unit Test: Cart Store Operations (`__tests__/store/cartStore.test.ts`)
```typescript
import { useCartStore } from "@/store/cartStore";

describe("Cart Store Logic", () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it("should add item to cart from same restaurant", () => {
    const mockItem = {
      foodItem: { _id: "f1", name: "Burger", price: 1000 } as any,
      quantity: 2,
      restaurantId: "r1",
      restaurantName: "Tasty Burgers",
    };

    useCartStore.getState().addItem(mockItem);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });

  it("should replace cart when adding item from different restaurant", () => {
    const item1 = {
      foodItem: { _id: "f1", name: "Burger", price: 1000 } as any,
      quantity: 1,
      restaurantId: "r1",
      restaurantName: "Burger Spot",
    };
    const item2 = {
      foodItem: { _id: "f2", name: "Pizza", price: 2500 } as any,
      quantity: 1,
      restaurantId: "r2",
      restaurantName: "Pizza Hut",
    };

    useCartStore.getState().addItem(item1);
    useCartStore.getState().addItem(item2);

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].foodItem._id).toBe("f2");
  });
});
```

---

## ✅ Quality Assurance Verification Checklist

- [ ] Run `npm run lint` — confirm zero warnings and errors.
- [ ] Run `npx tsc --noEmit` — confirm TypeScript strict mode compilation succeeds cleanly.
- [ ] Run `npm test` — confirm unit test suite passes with >80% code coverage.
- [ ] Test on iOS Simulator and Android Emulator using `npx expo run:ios` and `npx expo run:android`.
