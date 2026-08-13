import FoodCard from "@/components/FoodCard";
import RestaurantCard from "@/components/RestaurantCard";
import SearchFilterSheet from "@/components/SearchFilterSheet";
import { useSearch } from "@/hooks/useDataQueries";
import { useDebounce } from "@/hooks/useDebounce";
import { CURATED_CATEGORIES } from "@/lib/adapters/categories";
import { useSearchStore } from "@/store/searchStore";
import { FoodItem, Restaurant, SearchFoodItem } from "@/types/api";
import {
  Cancel01Icon,
  FilterVerticalIcon,
  Search01Icon,
  Time02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCENT = "#E0533A";

type ListItem =
  | { type: "header"; id: string; title: string; count: number }
  | { type: "restaurant"; id: string; data: Restaurant }
  | { type: "food"; id: string; data: SearchFoodItem };

export default function SearchPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 500);

  // Store
  const recentSearches = useSearchStore((state) => state.recentSearches);
  const addRecentSearch = useSearchStore((state) => state.addRecentSearch);
  const removeRecentSearch = useSearchStore(
    (state) => state.removeRecentSearch,
  );
  const clearRecentSearches = useSearchStore(
    (state) => state.clearRecentSearches,
  );
  const filters = useSearchStore((state) => state.filters);
  const setFilter = useSearchStore((state) => state.setFilter);
  const activeFilterCount = useSearchStore((state) =>
    state.getActiveFilterCount(),
  );

  const isSearchActive = debouncedQuery.trim().length >= 2;

  const { data, isLoading, error } = useSearch(
    debouncedQuery.trim(),
    isSearchActive,
  );

  const rawFoods: SearchFoodItem[] = data?.data.foods || [];
  const rawRestaurants: Restaurant[] = data?.data.restaurants || [];

  // Filter & sort results
  const filteredRestaurants = useMemo(() => {
    let list = [...rawRestaurants];

    if (filters.openNow) {
      list = list.filter((r) => r.isOpen !== false && r.status !== "Closed");
    }
    if (filters.freeDelivery) {
      list = list.filter((r) => r.deliveryFee === 0);
    }
    if (filters.topRated) {
      list = list.filter((r) => r.rating >= 4.5);
    }
    if (filters.priceLevel) {
      list = list.filter((r) => r.priceLevel === filters.priceLevel);
    }

    if (filters.sortBy === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (filters.sortBy === "price") {
      list.sort((a, b) => a.deliveryFee - b.deliveryFee);
    }

    return list;
  }, [rawRestaurants, filters]);

  const filteredFoods = useMemo(() => {
    let list = [...rawFoods];

    if (filters.topRated) {
      list = list.filter((f) => f.rating >= 4.5);
    }

    if (filters.sortBy === "price") {
      list.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [rawFoods, filters]);

  // Combine items for FlashList virtualization
  const listItems: ListItem[] = useMemo(() => {
    const items: ListItem[] = [];

    if (filteredRestaurants.length > 0) {
      items.push({
        type: "header",
        id: "header-restaurants",
        title: "Restaurants",
        count: filteredRestaurants.length,
      });
      filteredRestaurants.forEach((r) => {
        items.push({ type: "restaurant", id: `res-${r._id}`, data: r });
      });
    }

    if (filteredFoods.length > 0) {
      items.push({
        type: "header",
        id: "header-dishes",
        title: "Dishes & Items",
        count: filteredFoods.length,
      });
      filteredFoods.forEach((f) => {
        items.push({ type: "food", id: `food-${f._id}`, data: f });
      });
    }

    return items;
  }, [filteredRestaurants, filteredFoods]);

  const totalResults = filteredRestaurants.length + filteredFoods.length;

  const handleSelectQuery = (query: string) => {
    setSearchQuery(query);
    addRecentSearch(query);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim().length >= 2) {
      addRecentSearch(searchQuery.trim());
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View className="flex-1 bg-white">
        {/* Search Header */}
        <View
          className="px-5 pt-3 pb-3 bg-white border-b border-gray-100"
          style={{ paddingTop: insets.top + 6 }}
        >
          {/* Focused Search Input Row */}
          <View
            className="flex-row items-center bg-surface-muted rounded-2xl px-4 h-12"
            style={{ borderCurve: "continuous" }}
          >
            <HugeiconsIcon icon={Search01Icon} size={20} color="#646982" />
            <TextInput
              placeholder='Search "Jollof", "Pizza", "Burgers"...'
              placeholderTextColor="#A0A5BA"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              className="flex-1 ml-3 font-sen text-[15px] text-secondary"
              returnKeyType="search"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => setSearchQuery("")}
                className="w-7 h-7 bg-white rounded-full items-center justify-center"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={14} color="#646982" />
              </Pressable>
            )}
          </View>

          {/* Filter Chips Horizontal Row */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
            contentContainerStyle={{ gap: 8 }}
          >
            {/* Filter Sheet trigger */}
            <Pressable
              onPress={() => setFilterSheetVisible(true)}
              className={`flex-row items-center gap-1.5 px-3.5 py-1.5 rounded-full border ${
                activeFilterCount > 0
                  ? "bg-[#FFF5F3] border-primary"
                  : "bg-surface-muted border-transparent"
              }`}
              style={{ borderCurve: "continuous" }}
            >
              <HugeiconsIcon
                icon={FilterVerticalIcon}
                size={14}
                color={activeFilterCount > 0 ? ACCENT : "#262B33"}
              />
              <Text
                className={`text-xs ${
                  activeFilterCount > 0
                    ? "font-sen-bold text-primary"
                    : "font-sen-medium text-secondary"
                }`}
              >
                Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
              </Text>
            </Pressable>

            {/* Quick Filter: Open now */}
            <Pressable
              onPress={() => setFilter("openNow", !filters.openNow)}
              className={`px-3.5 py-1.5 rounded-full border ${
                filters.openNow
                  ? "bg-secondary border-secondary"
                  : "bg-surface-muted border-transparent"
              }`}
              style={{ borderCurve: "continuous" }}
            >
              <Text
                className={`text-xs ${
                  filters.openNow
                    ? "font-sen-bold text-white"
                    : "font-sen-medium text-secondary"
                }`}
              >
                Open now
              </Text>
            </Pressable>

            {/* Quick Filter: Free delivery */}
            <Pressable
              onPress={() => setFilter("freeDelivery", !filters.freeDelivery)}
              className={`px-3.5 py-1.5 rounded-full border ${
                filters.freeDelivery
                  ? "bg-secondary border-secondary"
                  : "bg-surface-muted border-transparent"
              }`}
              style={{ borderCurve: "continuous" }}
            >
              <Text
                className={`text-xs ${
                  filters.freeDelivery
                    ? "font-sen-bold text-white"
                    : "font-sen-medium text-secondary"
                }`}
              >
                Free delivery
              </Text>
            </Pressable>

            {/* Quick Filter: Top rated */}
            <Pressable
              onPress={() => setFilter("topRated", !filters.topRated)}
              className={`px-3.5 py-1.5 rounded-full border ${
                filters.topRated
                  ? "bg-secondary border-secondary"
                  : "bg-surface-muted border-transparent"
              }`}
              style={{ borderCurve: "continuous" }}
            >
              <Text
                className={`text-xs ${
                  filters.topRated
                    ? "font-sen-bold text-white"
                    : "font-sen-medium text-secondary"
                }`}
              >
                Top rated (4.5+)
              </Text>
            </Pressable>
          </ScrollView>
        </View>

        {/* Content Area */}
        {!isSearchActive ? (
          /* Resting State: Recent Searches + Popular Cuisines */
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1 px-5 pt-4"
          >
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View className="mb-7">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-[11px] font-sen-bold uppercase tracking-wider text-text-gray">
                    Recent Searches
                  </Text>
                  <Pressable onPress={clearRecentSearches}>
                    <Text className="text-xs font-sen-bold text-primary">
                      Clear all
                    </Text>
                  </Pressable>
                </View>

                <View className="flex-row flex-wrap gap-2">
                  {recentSearches.map((item) => (
                    <View
                      key={item}
                      className="flex-row items-center bg-surface-muted rounded-full pl-3.5 pr-2 py-1.5"
                      style={{ borderCurve: "continuous" }}
                    >
                      <HugeiconsIcon
                        icon={Time02Icon}
                        size={12}
                        color="#646982"
                      />
                      <Pressable
                        onPress={() => handleSelectQuery(item)}
                        className="mx-1.5"
                      >
                        <Text className="text-xs font-sen text-secondary">
                          {item}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => removeRecentSearch(item)}
                        className="p-1 rounded-full"
                      >
                        <HugeiconsIcon
                          icon={Cancel01Icon}
                          size={11}
                          color="#646982"
                        />
                      </Pressable>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Popular Cuisines Cloud */}
            <View className="mb-8">
              <Text className="text-[11px] font-sen-bold uppercase tracking-wider text-text-gray mb-3">
                Popular Cuisines
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {CURATED_CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat._id}
                    onPress={() => handleSelectQuery(cat.name)}
                    className="px-4 py-2.5 rounded-2xl bg-surface-muted border border-transparent"
                    style={{ borderCurve: "continuous" }}
                  >
                    <Text className="text-xs font-sen-bold text-secondary">
                      {cat.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>
        ) : isLoading ? (
          /* Loading State */
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color={ACCENT} />
            <Text className="text-text-gray font-sen text-xs mt-3">
              Searching for &quot;{debouncedQuery}&quot;...
            </Text>
          </View>
        ) : totalResults === 0 ? (
          /* No Results State */
          <View className="flex-1 items-center justify-center px-6 py-20">
            <View className="w-16 h-16 rounded-full bg-surface-muted items-center justify-center mb-3">
              <HugeiconsIcon icon={Search01Icon} size={28} color="#646982" />
            </View>
            <Text className="text-base font-sen-bold text-secondary mb-1">
              No Matches for &quot;{debouncedQuery}&quot;
            </Text>
            <Text className="text-xs font-sen text-text-gray text-center max-w-[260px]">
              Try searching for a different dish name, cuisine, or restaurant.
            </Text>
          </View>
        ) : (
          /* Results FlashList */
          <FlashList
            data={listItems}
            keyExtractor={(item) => item.id}
            getItemType={(item) => item.type}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: insets.bottom + 24,
            }}
            renderItem={({ item }) => {
              if (item.type === "header") {
                return (
                  <View className="flex-row items-center justify-between mt-4 mb-3">
                    <Text className="text-[17px] font-sen-bold text-secondary">
                      {item.title}
                    </Text>
                    <Text className="text-xs font-sen text-text-gray">
                      {item.count} {item.count === 1 ? "result" : "results"}
                    </Text>
                  </View>
                );
              }

              if (item.type === "restaurant") {
                return (
                  <RestaurantCard
                    restaurant={item.data}
                    variant="full"
                    onPress={() =>
                      router.push({
                        pathname: "/(app)/restaurants/[id]",
                        params: { id: item.data._id },
                      })
                    }
                  />
                );
              }

              if (item.type === "food") {
                return (
                  <FoodCard
                    food={item.data}
                    restaurantId={item.data.restaurant?._id}
                    restaurantName={item.data.restaurant?.name}
                    onPress={() =>
                      router.push({
                        pathname: "/(app)/food/[id]",
                        params: { id: item.data._id },
                      })
                    }
                  />
                );
              }

              return null;
            }}
          />
        )}

        {/* Filter Modal Sheet */}
        <SearchFilterSheet
          visible={filterSheetVisible}
          onClose={() => setFilterSheetVisible(false)}
          resultCount={isSearchActive ? totalResults : undefined}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
