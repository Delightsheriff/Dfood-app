# Section 07: Orders & Order Tracking Module Plan

> **Files Involved:**
> - [`app/(app)/profile/orders.tsx`](file:///Users/MAC/Documents/Dfood-app/app/(app)/profile/orders.tsx)
> - [`app/(app)/profile/order-details.tsx`](file:///Users/MAC/Documents/Dfood-app/app/(app)/profile/order-details.tsx)
> - [`services/notificationService.ts`](file:///Users/MAC/Documents/Dfood-app/services/notificationService.ts)
> - [`hooks/useOrderMutations.ts`](file:///Users/MAC/Documents/Dfood-app/hooks/useOrderMutations.ts)

---

## 🔍 Codebase Audit & "Slop" Analysis

### 1. Polling Overhead & Missing Real-Time Socket Connection
- **Issue:** `useOrders` uses a static `staleTime: 1 * 60 * 1000`. Active order status updates (e.g. `PENDING` -> `PREPARING` -> `OUT_FOR_DELIVERY` -> `DELIVERED`) require the user to pull-to-refresh or wait up to a minute.
- **Fix:** Implement WebSocket/SSE (Server-Sent Events) or dynamic polling interval (e.g. poll every 5 seconds ONLY when order status is active).

### 2. Map Marker & Polyline Performance (`order-details.tsx`)
- **Issue:** `react-native-maps` rerenders markers on every frame when driver location updates, causing UI thread lag.
- **Fix:** Animate driver marker using `Marker.animated` or Reanimated worklets.

### 3. Hardcoded Fallback Order Details
- **Issue:** Uses fallback static order object when `orderId` is missing or query errors out.
- **Fix:** Show clear error boundary with "Retry" button or return to Orders list.

---

## 🚀 Expo & React Native Best Practice Upgrades

### A. Dynamic Polling Strategy for Active Orders (`hooks/useOrderQueries.ts`)
```typescript
import { useQuery } from "@tanstack/react-query";
import { dataService } from "@/services/data.service";

export function useOrderDetails(orderId: string) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => dataService.getOrderById(orderId),
    refetchInterval: (query) => {
      const status = query.state.data?.data?.order?.status;
      const isTerminalState = status === "DELIVERED" || status === "CANCELLED";
      return isTerminalState ? false : 5000; // Poll every 5s while active
    },
    enabled: !!orderId,
  });
}
```

### B. Notification Routing Guard & Handler Setup
Ensure deep-linking from push notifications routes to typed parameters cleanly:

```typescript
// inside App Root
useEffect(() => {
  const unsubscribe = notificationService.setupListeners(router);
  notificationService.handleInitialNotification(router);
  return () => unsubscribe();
}, [router]);
```

---

## ✅ Verification & Test Plan

1. **Order Lifecycle Test:** Create order; verify screen automatically polls status every 5 seconds until status transitions to `DELIVERED`.
2. **Notification Navigation Test:** Send simulated push notification with payload `{ type: "order_update", orderNumber: "ORD-101" }`; tap notification; verify app opens directly to order details for ORD-101.
3. **Map Marker Animation:** Test driver coordinate updates; verify driver marker glides smoothly across polyline path.
