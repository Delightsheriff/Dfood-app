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

export function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: (): FavoritesResponse => ({
      success: true,
      data: { favorites: useFavoritesStore.getState().favorites },
    }),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useCheckFavorite(foodItemId: string) {
  return useQuery({
    queryKey: ["favorite-check", foodItemId],
    queryFn: (): FavoriteCheckResponse => ({
      success: true,
      data: { isFavorite: useFavoritesStore.getState().isFavorite(foodItemId) },
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAddresses() {
  return useQuery({
    queryKey: ["addresses"],
    queryFn: (): AddressesResponse => ({
      success: true,
      data: { addresses: useAddressStore.getState().addresses },
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useDefaultAddress() {
  return useQuery({
    queryKey: ["address", "default"],
    queryFn: (): AddressResponse => {
      const address = useAddressStore.getState().getDefaultAddress();
      if (!address) {
        throw new Error("No default address");
      }
      return { success: true, data: { address } };
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: ["paymentMethods"],
    queryFn: (): PaymentMethodsResponse => ({
      success: true,
      data: { paymentMethods: usePaymentMethodStore.getState().paymentMethods },
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useDefaultPaymentMethod() {
  return useQuery({
    queryKey: ["paymentMethod", "default"],
    queryFn: (): PaymentMethodResponse => {
      const paymentMethod = usePaymentMethodStore
        .getState()
        .getDefaultPaymentMethod();
      if (!paymentMethod) {
        throw new Error("No default payment method");
      }
      return { success: true, data: { paymentMethod } };
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: (): OrdersResponse => ({
      success: true,
      data: { orders: useOrderStore.getState().orders },
    }),
    staleTime: 1 * 60 * 1000, // 1 minute - orders change frequently
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: (): OrderResponse => {
      const order = useOrderStore.getState().getOrderById(id);
      if (!order) {
        throw new Error("Order not found");
      }
      return { success: true, data: { order } };
    },
    staleTime: 1 * 60 * 1000,
    retry: false,
  });
}
