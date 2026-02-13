import { dataService } from "@/services/data.service";
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
    queryFn: () => dataService.getFavorites(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useCheckFavorite(foodItemId: string) {
  return useQuery({
    queryKey: ["favorite-check", foodItemId],
    queryFn: () => dataService.checkFavorite(foodItemId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAddresses() {
  return useQuery({
    queryKey: ["addresses"],
    queryFn: () => dataService.getAddresses(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useDefaultAddress() {
  return useQuery({
    queryKey: ["address", "default"],
    queryFn: () => dataService.getDefaultAddress(),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: ["paymentMethods"],
    queryFn: () => dataService.getPaymentMethods(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useDefaultPaymentMethod() {
  return useQuery({
    queryKey: ["paymentMethod", "default"],
    queryFn: () => dataService.getDefaultPaymentMethod(),
    staleTime: 5 * 60 * 1000,
  });
}
