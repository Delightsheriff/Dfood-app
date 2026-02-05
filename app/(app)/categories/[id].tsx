/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
import FoodCard from "@/components/FoodCard";
import { CATEGORIES, FOOD_ITEMS, RESTAURANTS } from "@/constants/mocks";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, SlidersHorizontal } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// RestaurantCard component - add this if it's not imported
function RestaurantCard({
  restaurant,
  onPress,
}: {
  restaurant: any;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="mb-4 p-4 bg-white rounded-lg border border-gray-200"
    >
      <Text className="font-sen-bold text-lg">{restaurant.name}</Text>
      <Text className="text-text-gray">{restaurant.tags.join(", ")}</Text>
    </TouchableOpacity>
  );
}

export default function CategoryDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(id);

  const category = CATEGORIES.find((c) => c.id === id);

  // Get food items in this category
  const categoryFoodItems = FOOD_ITEMS.filter((food) => food.categoryId === id);

  // Get restaurants that serve this category
  const categoryRestaurants = RESTAURANTS.filter(
    (r) =>
      category &&
      r.tags.some((tag) =>
        tag.toLowerCase().includes(category.name.toLowerCase()),
      ),
  );

  if (!category) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-text-gray font-sen">Category not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="px-6 py-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-11 h-11 bg-[#ECF0F4] rounded-full items-center justify-center mr-3"
            >
              <ChevronLeft color="#181C2E" size={22} />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center flex-1">
              <Text className="text-secondary font-sen-bold text-sm uppercase mr-2">
                {category.name}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity className="w-11 h-11 bg-[#ECF0F4] rounded-full items-center justify-center ml-2">
            <SlidersHorizontal color="#181C2E" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerClassName="px-6 pb-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Popular Items Section */}
        {categoryFoodItems.length > 0 && (
          <View className="mb-6">
            <Text className="text-xl font-sen-extra-bold text-secondary mb-4">
              Popular {category.name}s
            </Text>

            <View className="flex-row flex-wrap justify-between">
              {categoryFoodItems.map((food) => {
                const restaurant = RESTAURANTS.find(
                  (r) => r.id === food.restaurantId,
                );
                return (
                  <View key={food.id} className="w-[48%] mb-4">
                    <FoodCard
                      food={food}
                      restaurantName={restaurant?.name || "Unknown Restaurant"}
                      onPress={() =>
                        router.push({
                          pathname: "../(app)/food/[id]",
                          params: { id: food.id },
                        })
                      }
                    />
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Open Restaurants Section */}
        {categoryRestaurants.length > 0 && (
          <View>
            <Text className="text-xl font-sen-extra-bold text-secondary mb-4">
              Open Restaurants
            </Text>

            {categoryRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onPress={() =>
                  router.push({
                    pathname: "/(app)/restaurants/[id]",
                    params: { id: restaurant.id },
                  })
                }
              />
            ))}
          </View>
        )}

        {/* Empty State */}
        {categoryFoodItems.length === 0 && categoryRestaurants.length === 0 && (
          <View className="items-center justify-center py-20">
            <Text className="text-text-gray font-sen text-base text-center">
              No items found in this category
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
