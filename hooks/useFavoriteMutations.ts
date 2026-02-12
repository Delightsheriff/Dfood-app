import { dataService } from "@/services/data.service";
import { ErrorResponse } from "@/types/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (foodItemId: string) => dataService.addFavorite(foodItemId),
    onSuccess: (_, foodItemId) => {
      // Invalidate favorites list
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      // Update check cache
      queryClient.setQueryData(["favorite-check", foodItemId], {
        success: true,
        data: { isFavorite: true },
      });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error("Add favorite failed:", error.response?.data);
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (foodItemId: string) => dataService.removeFavorite(foodItemId),
    onSuccess: (_, foodItemId) => {
      // Invalidate favorites list
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      // Update check cache
      queryClient.setQueryData(["favorite-check", foodItemId], {
        success: true,
        data: { isFavorite: false },
      });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error("Remove favorite failed:", error.response?.data);
    },
  });
}
