import { useProgressiveBlurScrollForList } from "@/components/ui/progressive-blur";
import { ScreenHeader } from "@/components/ui/screen-header";
import { useCategories, useRestaurants } from "@/hooks/useDataQueries";
import { matchesCategory } from "@/lib/adapters/categories";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCENT = "#E0533A";

export default function AllCategories() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { scrollY, onScroll } = useProgressiveBlurScrollForList();

  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories();
  const { data: restaurantsData } = useRestaurants();

  const categories = categoriesData?.data.categories || [];
  const restaurants = useMemo(
    () => restaurantsData?.data.restaurants || [],
    [restaurantsData],
  );

  const getRestaurantCount = (categoryId: string) => {
    return restaurants.filter((r) =>
      matchesCategory(r.cuisineTags, categoryId),
    ).length;
  };

  const renderHeader = () => (
    <View className="pb-4 pt-16">
      {/* Screen Title */}
      <View className="px-5 mt-3">
        <Text className="text-[26px] font-display text-secondary tracking-tight">
          Explore Cuisines
        </Text>
        <Text className="mt-1 text-xs font-body text-text-gray">
          Discover dishes and places by your favorite craving
        </Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader
        variant="detail"
        title="Categories"
        scrollY={scrollY}
        alwaysShowTitle
      />
      {categoriesLoading && categories.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={ACCENT} />
        </View>
      ) : (
        <FlashList
          data={categories}
          keyExtractor={(item) => item._id}
          numColumns={2}
          onScroll={onScroll}
          scrollEventThrottle={16}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{
            paddingHorizontal: 14,
            paddingBottom: insets.bottom + 24,
          }}
          renderItem={({ item }) => {
            const count = getRestaurantCount(item._id);
            return (
              <View className="p-1.5 flex-1">
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/(app)/categories/[id]",
                      params: { id: item._id },
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`${item.name} category, ${count} places`}
                  className="w-full h-44 rounded-[20px] overflow-hidden relative bg-surface-muted"
                  style={{
                    borderCurve: "continuous",
                    boxShadow: "0px 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  {/* Category Image */}
                  <Image
                    source={{ uri: item.image }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                    transition={150}
                  />

                  {/* Gradient Scrim */}
                  <LinearGradient
                    colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.75)"]}
                    start={{ x: 0.5, y: 0.2 }}
                    end={{ x: 0.5, y: 1 }}
                    style={{
                      position: "absolute",
                      inset: 0,
                    }}
                  />

                  {/* Overlaid Title & Count Badge */}
                  <View className="absolute bottom-3 left-3 right-3">
                    <Text className="text-[17px] leading-5 font-title text-white mb-1">
                      {item.name}
                    </Text>
                    {count > 0 && (
                      <View className="self-start bg-white/25 px-2 py-0.5 rounded-full">
                        <Text className="text-[10px] font-numeric text-white">
                          {count} {count === 1 ? "place" : "places"}
                        </Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}
