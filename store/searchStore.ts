import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type SortOption = "relevance" | "rating" | "delivery_time" | "price";

export interface SearchFilters {
  sortBy: SortOption;
  openNow: boolean;
  freeDelivery: boolean;
  topRated: boolean;
  under30Min: boolean;
  priceLevel: string | null;
}

const DEFAULT_FILTERS: SearchFilters = {
  sortBy: "relevance",
  openNow: false,
  freeDelivery: false,
  topRated: false,
  under30Min: false,
  priceLevel: null,
};

interface SearchState {
  recentSearches: string[];
  filters: SearchFilters;
  addRecentSearch: (query: string) => void;
  removeRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  setFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
  resetFilters: () => void;
  getActiveFilterCount: () => number;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      recentSearches: ["Pizza", "Burgers", "Jollof Rice", "Chicken", "Pasta"],
      filters: DEFAULT_FILTERS,

      addRecentSearch: (query: string) => {
        const trimmed = query.trim();
        if (!trimmed) return;
        set((state) => {
          const filtered = state.recentSearches.filter(
            (q) => q.toLowerCase() !== trimmed.toLowerCase(),
          );
          return {
            recentSearches: [trimmed, ...filtered].slice(0, 10),
          };
        });
      },

      removeRecentSearch: (query: string) => {
        set((state) => ({
          recentSearches: state.recentSearches.filter((q) => q !== query),
        }));
      },

      clearRecentSearches: () => {
        set({ recentSearches: [] });
      },

      setFilter: (key, value) => {
        set((state) => ({
          filters: {
            ...state.filters,
            [key]: value,
          },
        }));
      },

      resetFilters: () => {
        set({ filters: DEFAULT_FILTERS });
      },

      getActiveFilterCount: () => {
        const f = get().filters;
        let count = 0;
        if (f.sortBy !== "relevance") count++;
        if (f.openNow) count++;
        if (f.freeDelivery) count++;
        if (f.topRated) count++;
        if (f.under30Min) count++;
        if (f.priceLevel) count++;
        return count;
      },
    }),
    {
      name: "dfood-search-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
