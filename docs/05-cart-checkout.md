# Section 05: Cart & Checkout Module Improvement Plan

> **Files Involved:**
> - [`store/cartStore.ts`](file:///Users/MAC/Documents/Dfood-app/store/cartStore.ts)
> - [`app/(app)/cart.tsx`](file:///Users/MAC/Documents/Dfood-app/app/(app)/cart.tsx)
> - [`app/(app)/checkout.tsx`](file:///Users/MAC/Documents/Dfood-app/app/(app)/checkout.tsx)
> - [`app/(app)/order-confirmation.tsx`](file:///Users/MAC/Documents/Dfood-app/app/(app)/order-confirmation.tsx)
> - [`components/checkout/*`](file:///Users/MAC/Documents/Dfood-app/components/checkout)

---

## 🔍 Codebase Audit & "Slop" Analysis

### 1. Zustand `getTotalPrice` Function Property Anti-Pattern
```typescript
// ❌ SLOP PATTERN: Invoking store getter as property instead of memoized selector
const getTotalPrice = useCartStore((state) => state.getTotalPrice());
```
- **Why it's Slop:** Calling `getTotalPrice()` returns a static number on initial render rather than listening reactively to changes in items array, leading to stale price displays.
- **Fix:** Derived state (subtotal, item count) should be computed directly in selectors or via memoized hooks (`useMemo`).

### 2. Lack of Cart Optimistic Lock & Storage Hydration Check
- **Issue:** On initial cold launch, persisted cart state from `AsyncStorage` takes a few milliseconds to hydrate. UI briefly renders empty cart before items pop in.
- **Fix:** Use Zustand's `onFinishHydration` callback to track `hasHydrated` state in store.

### 3. Payment Gateway Webview Fallback & Sandbox Handling
- **Issue:** `addCard` requires Paystack reference verification. If network fails or webview crashes, there is no automatic retry or order state rollback.
- **Fix:** Implement idempotent payment intent creation on backend, passing client secret / transaction reference cleanly.

---

## 🚀 Expo & React Native Best Practice Upgrades

### A. Improved Reactive Zustand Store (`store/cartStore.ts`)
```typescript
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FoodItem } from "@/types/api";

export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
}

interface CartState {
  items: CartItem[];
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  addItem: (item: CartItem) => void;
  removeItem: (foodItemId: string) => void;
  updateQuantity: (foodItemId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,
      setHasHydrated: (state) => set({ hasHydrated: state }),

      addItem: (newItem) => {
        const currentItems = get().items;
        const currentRestaurantId = currentItems[0]?.restaurantId;

        if (currentRestaurantId && currentRestaurantId !== newItem.restaurantId) {
          // Replace with new restaurant item
          set({ items: [newItem] });
          return;
        }

        const existingIndex = currentItems.findIndex(
          (i) => i.foodItem._id === newItem.foodItem._id
        );

        if (existingIndex > -1) {
          const updated = [...currentItems];
          updated[existingIndex].quantity += newItem.quantity;
          set({ items: updated });
        } else {
          set({ items: [...currentItems, newItem] });
        }
      },

      removeItem: (foodItemId) =>
        set((state) => ({
          items: state.items.filter((i) => i.foodItem._id !== foodItemId),
        })),

      updateQuantity: (foodItemId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.foodItem._id === foodItemId
              ? { ...i, quantity: Math.max(1, quantity) }
              : i
          ),
        })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "dfood_cart_v1",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Memoized Reactive Selectors
export const useCartSubtotal = () =>
  useCartStore((state) =>
    state.items.reduce((sum, i) => sum + i.foodItem.price * i.quantity, 0)
  );

export const useCartItemCount = () =>
  useCartStore((state) =>
    state.items.reduce((sum, i) => sum + i.quantity, 0)
  );
```

### B. Optimized BottomSheet Snap Points Memoization (`app/(app)/checkout.tsx`)
```typescript
// Always declare snapPoints outside component or wrap in static useMemo
const ADDRESS_SNAP_POINTS = ["70%"];
const PAYMENT_SNAP_POINTS = ["50%"];
```

---

## ✅ Verification & Test Plan

1. **Hydration Check:** Kill app with items in cart, launch app; verify cart populates immediately without flickering empty state.
2. **Order Placement E2E:** Complete order flow; verify cart clears *only* after server returns 201 Created for order.
3. **Empty Cart Boundary:** Access `/checkout` with 0 items; verify user is bounced back to `/cart` or `/index`.
