import { dataService } from "@/services/data.service";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (foodItemId: string) => {
      // Resolve the full food item so the favorites screen can render it
      // without refetching.
      const { data } = await dataService.getFoodItemById(foodItemId);
      useFavoritesStore.getState().addFavorite(data.foodItem);
      return { success: true as const, message: "Added to favorites" };
    },
    onSuccess: (_, foodItemId) => {
      // Invalidate favorites list
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      // Update check cache
      queryClient.setQueryData(["favorite-check", foodItemId], {
        success: true,
        data: { isFavorite: true },
      });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (foodItemId: string) => {
      useFavoritesStore.getState().removeFavorite(foodItemId);
      return { success: true as const, message: "Removed from favorites" };
    },
    onSuccess: (_, foodItemId) => {
      // Invalidate favorites list
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      // Update check cache
      queryClient.setQueryData(["favorite-check", foodItemId], {
        success: true,
        data: { isFavorite: false },
      });
    },
  });
}
