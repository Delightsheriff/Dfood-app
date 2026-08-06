import { useStoreHydrated } from "@/hooks/useStoreHydrated";
import { dataService } from "@/services/data.service";
import { useAddressStore } from "@/store/addressStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useOrderStore } from "@/store/orderStore";
import { usePaymentMethodStore } from "@/store/paymentMethodStore";
import {
  AddressesResponse,
  AddressResponse,
  FavoriteCheckResponse,
  FavoritesResponse,
  OrderResponse,
  OrdersResponse,
  PaymentMethodResponse,
  PaymentMethodsResponse,
} from "@/types/api";
import { useQuery } from "@tanstack/react-query";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => dataService.getCategories(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useRestaurants(isOpen?: boolean) {
  return useQuery({
    queryKey: ["restaurants", { isOpen }],
    queryFn: () => dataService.getRestaurants(isOpen),
    staleTime: 2 * 60 * 1000,
  });
}

export function useRestaurant(id: string) {
  return useQuery({
    queryKey: ["restaurant", id],
    queryFn: () => dataService.getRestaurantById(id),
    staleTime: 5 * 60 * 1000,
  });
}

export function useFoodItemsByRestaurant(restaurantId: string) {
  return useQuery({
    queryKey: ["foodItems", "restaurant", restaurantId],
    queryFn: () => dataService.getFoodItemsByRestaurant(restaurantId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useFoodItemsByCategory(categoryId: string | null) {
  return useQuery({
    queryKey: ["foodItems", "category", categoryId],
    queryFn: () => dataService.getFoodItemsByCategory(categoryId!),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFoodItem(id: string) {
  return useQuery({
    queryKey: ["foodItem", id],
    queryFn: () => dataService.getFoodItemById(id),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => dataService.search(query),
    enabled: enabled && query.length >= 2, // Only search if query is 2+ characters
    staleTime: 30 * 1000, // Cache results for 30 seconds
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => dataService.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// The hooks below read local zustand-persisted stores rather than a
// network resource. They deliberately don't use useQuery: these stores
// rehydrate from AsyncStorage asynchronously, and a queryFn that reads
// `store.getState()` once would cache whatever the store held at that
// instant (often still the empty default) for the query's whole
// staleTime, making saved data appear to vanish after a cold app launch.
// Reactive selectors re-render as soon as rehydration completes, and
// `isLoading` reflects real hydration state instead of guessing.
// `data`/`isLoading`/`refetch` are kept shaped like a useQuery result so
// existing screens don't need to change.

export function useFavorites() {
  const favorites = useFavoritesStore((state) => state.favorites);
  const isLoading = !useStoreHydrated(useFavoritesStore.persist);
  const data: FavoritesResponse = { success: true, data: { favorites } };
  return { data, isLoading, refetch: () => Promise.resolve() };
}

export function useCheckFavorite(foodItemId: string) {
  const isFavorite = useFavoritesStore((state) =>
    state.isFavorite(foodItemId),
  );
  const isLoading = !useStoreHydrated(useFavoritesStore.persist);
  const data: FavoriteCheckResponse = { success: true, data: { isFavorite } };
  return { data, isLoading };
}

export function useAddresses() {
  const addresses = useAddressStore((state) => state.addresses);
  const isLoading = !useStoreHydrated(useAddressStore.persist);
  const data: AddressesResponse = { success: true, data: { addresses } };
  return { data, isLoading };
}

export function useDefaultAddress() {
  const address = useAddressStore((state) => state.getDefaultAddress());
  const isLoading = !useStoreHydrated(useAddressStore.persist);
  const data: AddressResponse | undefined = address
    ? { success: true, data: { address } }
    : undefined;
  return { data, isLoading };
}

export function usePaymentMethods() {
  const paymentMethods = usePaymentMethodStore(
    (state) => state.paymentMethods,
  );
  const isLoading = !useStoreHydrated(usePaymentMethodStore.persist);
  const data: PaymentMethodsResponse = {
    success: true,
    data: { paymentMethods },
  };
  return { data, isLoading };
}

export function useDefaultPaymentMethod() {
  const paymentMethod = usePaymentMethodStore((state) =>
    state.getDefaultPaymentMethod(),
  );
  const isLoading = !useStoreHydrated(usePaymentMethodStore.persist);
  const data: PaymentMethodResponse | undefined = paymentMethod
    ? { success: true, data: { paymentMethod } }
    : undefined;
  return { data, isLoading };
}

export function useOrders() {
  const orders = useOrderStore((state) => state.orders);
  const isLoading = !useStoreHydrated(useOrderStore.persist);
  const data: OrdersResponse = { success: true, data: { orders } };
  return { data, isLoading, refetch: () => Promise.resolve() };
}

export function useOrder(id: string) {
  const order = useOrderStore((state) => state.getOrderById(id));
  const isLoading = !useStoreHydrated(useOrderStore.persist);
  const data: OrderResponse | undefined = order
    ? { success: true, data: { order } }
    : undefined;
  return { data, isLoading };
}
