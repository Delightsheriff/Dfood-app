import FoodCard from "@/components/FoodCard";
import { IconButton } from "@/components/ui/icon-button";
import { useFavorites } from "@/hooks/useDataQueries";
import { ArrowLeft01Icon, HeartIcon } from "@hugeicons/core-free-icons";
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
  const { data: favoritesData, isLoading, refetch } = useFavorites();

  const favorites = favoritesData?.data.favorites || [];

  const renderHeader = () => (
    <View
      className="flex-row items-center justify-between px-5 pt-3 pb-3 border-b border-gray-100 mb-4"
      style={{ paddingTop: insets.top + 4 }}
    >
      <IconButton
        icon={ArrowLeft01Icon}
        accessibilityLabel="Go back"
        onPress={() => router.back()}
      />
      <Text className="text-[17px] font-title text-secondary">
        Saved Favourites
      </Text>
      <View className="w-11" />
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {isLoading && !favoritesData ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={ACCENT} />
        </View>
      ) : (
        <FlashList
          data={favorites}
          keyExtractor={(item) => item._id}
          numColumns={2}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{
            paddingHorizontal: 14,
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
