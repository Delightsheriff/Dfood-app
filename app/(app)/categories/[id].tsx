/* eslint-disable import/no-unresolved */
import CategoryBackButton from "@/components/CategoryBackButton";
import FoodCard from "@/components/FoodCard";
import { CATEGORIES, FOOD_ITEMS, RESTAURANTS } from "@/constants/mocks";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

  const category = CATEGORIES.find((c) => c.id === id);
  const categoryFoodItems = FOOD_ITEMS.filter((food) => food.categoryId === id);
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
      <CategoryBackButton category={category} />

      <ScrollView
        contentContainerClassName="px-6 pb-6"
        showsVerticalScrollIndicator={false}
      >
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
                          pathname: "/(app)/food/[id]",
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
