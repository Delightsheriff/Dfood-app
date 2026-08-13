import RestaurantCard from "@/components/RestaurantCard";
import { useProgressiveBlurScrollForList } from "@/components/ui/progressive-blur";
import { ScreenHeader } from "@/components/ui/screen-header";
import { useRestaurants } from "@/hooks/useDataQueries";
import {
  Store01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCENT = "#E0533A";

type FilterType = "all" | "open" | "free_delivery" | "top_rated" | "budget";

export default function AllRestaurants() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { scrollY, onScroll } = useProgressiveBlurScrollForList();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");

  const {
    data: restaurantsData,
    isLoading,
    isRefetching,
    refetch,
  } = useRestaurants();

  const rawRestaurants = useMemo(
    () => restaurantsData?.data.restaurants || [],
    [restaurantsData],
  );

  const filteredRestaurants = useMemo(() => {
    switch (selectedFilter) {
      case "open":
        return rawRestaurants.filter(
          (r) => r.isOpen !== false && r.status !== "Closed",
        );
      case "free_delivery":
        return rawRestaurants.filter((r) => r.deliveryFee === 0);
      case "top_rated":
        return rawRestaurants.filter((r) => r.rating >= 4.5);
      case "budget":
        return rawRestaurants.filter(
          (r) => !r.priceLevel || r.priceLevel === "$",
        );
      case "all":
      default:
        return rawRestaurants;
    }
  }, [rawRestaurants, selectedFilter]);

  const filterOptions: { id: FilterType; label: string }[] = [
    { id: "all", label: "All" },
    { id: "open", label: "Open now" },
    { id: "free_delivery", label: "Free delivery" },
    { id: "top_rated", label: "Top rated" },
    { id: "budget", label: "Budget $" },
  ];

  const renderHeader = () => (
    <View className="pb-3 pt-16">
      {/* Screen title & result count */}
      <View className="px-5 mt-3 mb-4">
        <Text className="text-[26px] font-display text-secondary tracking-tight">
          All Restaurants
        </Text>
        <Text className="mt-1 text-xs font-numeric text-text-gray">
          {filteredRestaurants.length}{" "}
          {filteredRestaurants.length === 1 ? "restaurant" : "restaurants"} nearby
        </Text>
      </View>

      {/* Filter chips horizontal rail */}
      <FlashList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={filterOptions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        renderItem={({ item }) => {
          const isSelected = selectedFilter === item.id;
          return (
            <Pressable
              onPress={() => setSelectedFilter(item.id)}
              className={`mr-2 px-3.5 py-2 rounded-full ${
                isSelected ? "bg-secondary" : "bg-surface-muted"
              }`}
              style={{ borderCurve: "continuous" }}
            >
              <Text
                className={`text-xs ${
                  isSelected
                    ? "font-label text-white"
                    : "font-body text-secondary"
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader
        variant="detail"
        title="Restaurants"
        scrollY={scrollY}
        alwaysShowTitle
      />
      {isLoading && !restaurantsData ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={ACCENT} />
        </View>
      ) : (
        <FlashList
          data={filteredRestaurants}
          keyExtractor={(item) => item._id}
          onScroll={onScroll}
          scrollEventThrottle={16}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <View className="px-5 mb-4">
              <RestaurantCard
                restaurant={item}
                onPress={() =>
                  router.push({
                    pathname: "/(app)/restaurants/[id]",
                    params: { id: item._id },
                  })
                }
              />
            </View>
          )}
          ListEmptyComponent={
            <View className="py-16 px-6 items-center bg-surface-muted mx-5 rounded-[20px]">
              <HugeiconsIcon icon={Store01Icon} size={28} color="#646982" />
              <Text className="text-secondary font-title text-base mt-2 mb-1">
                No Restaurants Found
              </Text>
              <Text className="text-text-gray font-body text-xs text-center">
                Try selecting a different filter option above.
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={ACCENT}
            />
          }
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        />
      )}
    </View>
  );
}
