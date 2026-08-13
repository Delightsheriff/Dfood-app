import FoodCard from "@/components/FoodCard";
import { useProgressiveBlurScrollForList } from "@/components/ui/progressive-blur";
import { ScreenHeader } from "@/components/ui/screen-header";
import { useFavorites } from "@/hooks/useDataQueries";
import { HeartIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCENT = "#E0533A";

export default function Favourites() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { scrollY, onScroll } = useProgressiveBlurScrollForList();
  const { data: favoritesData, isLoading, refetch } = useFavorites();

  const favorites = favoritesData?.data.favorites || [];

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader
        variant="detail"
        title="Saved Favourites"
        scrollY={scrollY}
        alwaysShowTitle
      />
      {isLoading && !favoritesData ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={ACCENT} />
        </View>
      ) : (
        <FlashList
          data={favorites}
          keyExtractor={(item) => item._id}
          numColumns={2}
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingHorizontal: 14,
            paddingTop: insets.top + 56,
            paddingBottom: insets.bottom + 24,
          }}
          renderItem={({ item }) => (
            <View className="px-1.5 flex-1">
              <FoodCard
                food={item.foodItem}
                restaurantId={item.foodItem.restaurant?._id}
                restaurantName={item.foodItem.restaurant?.name}
                showRestaurantName={true}
                onPress={() =>
                  router.push({
                    pathname: "/(app)/food/[id]",
                    params: { id: item.foodItem._id },
                  })
                }
              />
            </View>
          )}
          ListEmptyComponent={
            <View className="py-20 px-6 items-center bg-surface-muted mx-3 rounded-[24px]">
              <HugeiconsIcon icon={HeartIcon} size={36} color="#646982" />
              <Text className="text-secondary font-title text-base mt-3 mb-1">
                No Favourites Saved
              </Text>
              <Text className="text-text-gray font-body text-xs text-center max-w-[240px]">
                Tap the heart icon on any dish or restaurant to save it here for later.
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => refetch()}
              tintColor={ACCENT}
            />
          }
        />
      )}
    </View>
  );
}
