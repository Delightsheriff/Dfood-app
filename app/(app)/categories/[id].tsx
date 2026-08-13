import FoodCard from "@/components/FoodCard";
import RestaurantCard from "@/components/RestaurantCard";
import { IconButton } from "@/components/ui/icon-button";
import {
  useCategories,
  useFoodItemsByCategory,
  useRestaurants,
} from "@/hooks/useDataQueries";
import { matchesCategory } from "@/lib/adapters/categories";
import { ArrowLeft01Icon, Dish01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCENT = "#E0533A";

export default function CategoryDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: categoriesData } = useCategories();
  const { data: foodItemsData, isLoading: foodItemsLoading } =
    useFoodItemsByCategory(id);
  const { data: restaurantsData } = useRestaurants();

  const category = categoriesData?.data.categories.find(
    (cat) => cat._id === id,
  );
  const categoryName = category?.name || "Category";
  const categoryImage = category?.image;

  const foodItems = useMemo(
    () => foodItemsData?.data.foodItems || [],
    [foodItemsData],
  );

  const matchingRestaurants = useMemo(() => {
    const list = restaurantsData?.data.restaurants || [];
    return list.filter((r) => matchesCategory(r.cuisineTags, id));
  }, [restaurantsData, id]);

  const renderHeader = () => (
    <View className="pb-3">
      {/* 1. Header Navigation */}
      <View
        className="flex-row items-center justify-between px-5 pt-3 pb-3"
        style={{ paddingTop: insets.top + 4 }}
      >
        <IconButton
          icon={ArrowLeft01Icon}
          accessibilityLabel="Go back"
          onPress={() => router.back()}
        />
        <Text className="text-lg font-sen-bold text-secondary">
          {categoryName}
        </Text>
        <View className="w-11" />
      </View>

      {/* 2. Hero Strip (~130px) */}
      {categoryImage ? (
        <View className="px-5 mb-5">
          <View
            className="w-full h-32 rounded-[20px] overflow-hidden relative bg-surface-muted"
            style={{ borderCurve: "continuous" }}
          >
            <Image
              source={{ uri: categoryImage }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              transition={150}
            />
            <LinearGradient
              colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.6)"]}
              style={{ position: "absolute", inset: 0 }}
            />
            <View className="absolute bottom-3.5 left-4">
              <Text className="text-[22px] font-sen-extra-bold text-white">
                {categoryName} Cuisines
              </Text>
              <Text className="text-xs font-sen text-white/80">
                {foodItems.length} delicious {foodItems.length === 1 ? "dish" : "dishes"} to choose from
              </Text>
            </View>
          </View>
        </View>
      ) : null}

      {/* 3. Matching Restaurants Section (omitted when empty) */}
      {matchingRestaurants.length > 0 ? (
        <View className="mb-6">
          <View className="px-5 mb-3">
            <Text className="text-[18px] font-sen-bold text-secondary">
              {categoryName} Places Nearby
            </Text>
          </View>
          <FlashList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={matchingRestaurants}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            renderItem={({ item }) => (
              <RestaurantCard
                restaurant={item}
                variant="compact"
                onPress={() =>
                  router.push({
                    pathname: "/(app)/restaurants/[id]",
                    params: { id: item._id },
                  })
                }
              />
            )}
          />
        </View>
      ) : null}

      {/* 4. Dishes Section Header */}
      <View className="px-5 flex-row justify-between items-center mb-2">
        <Text className="text-[18px] font-sen-bold text-secondary">
          All {categoryName} Dishes
        </Text>
        <Text className="text-xs font-sen text-text-gray">
          {foodItems.length} {foodItems.length === 1 ? "dish" : "dishes"}
        </Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {foodItemsLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={ACCENT} />
        </View>
      ) : (
        <FlashList
          data={foodItems}
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
                food={item}
                onPress={() =>
                  router.push({
                    pathname: "/(app)/food/[id]",
                    params: { id: item._id },
                  })
                }
              />
            </View>
          )}
          ListEmptyComponent={
            <View className="py-16 px-6 items-center bg-surface-muted mx-3 rounded-[20px]">
              <HugeiconsIcon icon={Dish01Icon} size={28} color="#646982" />
              <Text className="text-secondary font-sen-bold text-base mt-2 mb-1">
                No Dishes Available
              </Text>
              <Text className="text-text-gray font-sen text-xs text-center">
                Check back soon for new dishes in this category.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
