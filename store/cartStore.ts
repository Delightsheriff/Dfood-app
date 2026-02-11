import { FoodItem } from "@/types/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartItem = {
  foodItem: FoodItem;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
};

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (foodItemId: string) => void;
  incrementItem: (foodItemId: string) => void;
  decrementItem: (foodItemId: string) => void;
  updateQuantity: (foodItemId: string, quantity: number) => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
  getRestaurantId: () => string | null;
  clearCart: () => void;
};

/**
 * Zustand store for managing shopping cart with persistence.
 *
 * Rules:
 * - Only items from ONE restaurant can be in cart at a time
 * - Adding item from different restaurant clears cart
 * - Cart persists across app restarts
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item: CartItem) => {
        const currentRestaurantId = get().getRestaurantId();

        // If adding from different restaurant, clear cart first
        if (currentRestaurantId && currentRestaurantId !== item.restaurantId) {
          set({ items: [item] });
          return;
        }

        const existingItem = get().items.find(
          (i) => i.foodItem._id === item.foodItem._id,
        );

        if (existingItem) {
          set((state) => ({
            items: state.items.map((i) =>
              i.foodItem._id === item.foodItem._id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i,
            ),
          }));
        } else {
          set((state) => ({ items: [...state.items, item] }));
        }
      },

      removeItem: (foodItemId: string) =>
        set((state) => ({
          items: state.items.filter((item) => item.foodItem._id !== foodItemId),
        })),

      incrementItem: (foodItemId: string) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.foodItem._id === foodItemId
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        })),

      decrementItem: (foodItemId: string) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.foodItem._id === foodItemId && item.quantity > 1
              ? { ...item, quantity: item.quantity - 1 }
              : item,
          ),
        })),

      updateQuantity: (foodItemId: string, quantity: number) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.foodItem._id === foodItemId
              ? { ...item, quantity: Math.max(1, quantity) }
              : item,
          ),
        })),

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce(
          (total, item) => total + item.foodItem.price * item.quantity,
          0,
        );
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },

      getRestaurantId: () => {
        const { items } = get();
        return items.length > 0 ? items[0].restaurantId : null;
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
