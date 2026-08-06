import { searchRestaurantRefFromRestaurant } from "@/lib/adapters/food-item";
import { FavoriteItem, FoodItem } from "@/types/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type FavoritesState = {
  favorites: FavoriteItem[];
  addFavorite: (foodItem: FoodItem) => void;
  removeFavorite: (foodItemId: string) => void;
  isFavorite: (foodItemId: string) => boolean;
};

/**
 * Local favorites store persisted to AsyncStorage.
 * FavoriteItem.foodItem carries an inline restaurant snapshot so the
 * favorites screen renders without refetching the food item.
 */
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: (foodItem: FoodItem) =>
        set((state) => {
          if (state.favorites.some((favorite) => favorite._id === foodItem._id)) {
            return state;
          }

          const restaurant =
            typeof foodItem.restaurantId === "object"
              ? searchRestaurantRefFromRestaurant(foodItem.restaurantId)
              : null;

          return {
            favorites: [
              {
                _id: foodItem._id,
                foodItem: { ...foodItem, restaurant },
                createdAt: new Date().toISOString(),
              },
              ...state.favorites,
            ],
          };
        }),

      removeFavorite: (foodItemId: string) =>
        set((state) => ({
          favorites: state.favorites.filter(
            (favorite) => favorite._id !== foodItemId,
          ),
        })),

      isFavorite: (foodItemId: string) =>
        get().favorites.some((favorite) => favorite._id === foodItemId),
    }),
    {
      name: "favorites-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
