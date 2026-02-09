import { dataService } from "@/services/data.service";
import { useQuery } from "@tanstack/react-query";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => dataService.getCategories(),
    staleTime: 10 * 60 * 1000, // Categories don't change often - 10min
  });
}

export function useRestaurants(isOpen?: boolean) {
  return useQuery({
    queryKey: ["restaurants", { isOpen }],
    queryFn: () => dataService.getRestaurants(isOpen),
    staleTime: 2 * 60 * 1000, // Restaurant status changes more often - 2min
  });
}

export function useFoodItemsByCategory(categoryId: string | null) {
  return useQuery({
    queryKey: ["foodItems", "category", categoryId],
    queryFn: () => dataService.getFoodItemsByCategory(categoryId!),
    enabled: !!categoryId, // Only fetch when categoryId exists
    staleTime: 5 * 60 * 1000, // 5min
  });
}
