# Section 04: Restaurants & Food Details Module Improvement Plan

> **Files Involved:**
> - [`app/(app)/restaurants/index.tsx`](file:///Users/MAC/Documents/Dfood-app/app/(app)/restaurants/index.tsx)
> - [`app/(app)/restaurants/[id].tsx`](file:///Users/MAC/Documents/Dfood-app/app/(app)/restaurants/[id].tsx)
> - [`app/(app)/food/[id].tsx`](file:///Users/MAC/Documents/Dfood-app/app/(app)/food/[id].tsx)
> - [`components/FoodCard.tsx`](file:///Users/MAC/Documents/Dfood-app/components/FoodCard.tsx)
> - [`components/RestaurantCard.tsx`](file:///Users/MAC/Documents/Dfood-app/components/RestaurantCard.tsx)
> - [`components/FilterDialog.tsx`](file:///Users/MAC/Documents/Dfood-app/components/FilterDialog.tsx)

---

## 🔍 Codebase Audit & "Slop" Analysis

### 1. Inconsistent Param Casting & Route Parameter Errors
- **Issue:** Using string params in `useLocalSearchParams` without validation or defensive checks. If a route opens with invalid params, `useFoodItem(id)` sends `GET /food-items/undefined`.
- **Fix:** Add schema validation or early guards for string params in dynamic routes `[id].tsx`.

### 2. Carousel Gesture Lag & Window Dimensions Re-calculations
- **Issue:** `app/(app)/food/[id].tsx` reads `Dimensions.get("window")` at module load time instead of dynamically, causing layout misalignment on screen rotation or foldable devices.
- **Fix:** Use `useWindowDimensions()` hook from `react-native`.

### 3. Missing Add-On Customization Mechanics
- **Issue:** Food details currently only allow selecting quantity. Real food delivery apps require customization options (e.g. extra cheese, size selection, spice level).
- **Fix:** Expand `FoodItem` schema to include optional `addons` array and track selected addons in item state.

---

## 🚀 Expo & React Native Best Practice Upgrades

### A. Dynamic Route Param Schema Validation Pattern
```typescript
import { useLocalSearchParams } from "expo-router";
import { z } from "zod";

const foodRouteParamsSchema = z.object({
  id: z.string().min(1, "Item ID is required"),
});

export function useFoodRouteParams() {
  const params = useLocalSearchParams();
  const result = foodRouteParamsSchema.safeParse(params);

  if (!result.success) {
    throw new Error("Invalid route parameters");
  }

  return result.data;
}
```

### B. Add-On Selection & Dynamic Cart Price Blueprint
```typescript
export interface FoodAddon {
  id: string;
  name: string;
  price: number;
}

// Inside FoodDetails Screen:
const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

const toggleAddon = (addonId: string) => {
  setSelectedAddons((prev) =>
    prev.includes(addonId)
      ? prev.filter((id) => id !== addonId)
      : [...prev, addonId]
  );
};

const addonsTotalPrice = selectedAddons.reduce((sum, id) => {
  const addon = food.addons?.find((a) => a.id === id);
  return sum + (addon?.price || 0);
}, 0);

const finalUnitPrice = food.price + addonsTotalPrice;
const grandTotal = finalUnitPrice * quantity;
```

---

## ✅ Verification & Test Plan

1. **Dynamic Route Validation:** Pass malformed ID in URL `/(app)/food/invalid-123`; verify error state displays without app crash.
2. **Carousel Gesture Smoothness:** Swipe images in food details; verify zero frame drop.
3. **Cart Switch Alert Test:** Add item from Restaurant A, navigate to Restaurant B food item, tap Add to Cart; verify modal confirmation prompt clears previous cart cleanly.
