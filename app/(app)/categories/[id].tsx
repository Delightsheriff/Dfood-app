import CategoryBackButton from "@/components/CategoryBackButton";
import FoodCard from "@/components/FoodCard";
import { useFoodItemsByCategory, useRestaurant } from "@/hooks/useDataQueries";
import { FoodItem } from "@/types/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Component to fetch restaurant name for each food item
function FoodCardWithRestaurant({ food }: { food: FoodItem }) {
  const router = useRouter();
  const { data: restaurantData } = useRestaurant(food.restaurant);
  const restaurant = restaurantData?.data.restaurant;

  return (
    <View className="w-[48%] mb-4">
      <FoodCard
        food={food}
        restaurantId={food.restaurant}
        restaurantName={restaurant?.name}
        onPress={() =>
          router.push({
            pathname: "/(app)/food/[id]",
            params: { id: food._id },
          })
        }
      />
    </View>
  );
}

export default function CategoryDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: foodItemsData, isLoading, error } = useFoodItemsByCategory(id);

  const foodItems = foodItemsData?.data.foodItems || [];

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF7622" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-text-gray font-sen text-base text-center">
            Failed to load category items
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <CategoryBackButton categoryId={id} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {foodItems.length > 0 ? (
          <View className="mt-4">
            <Text className="text-xl font-sen-extra-bold text-secondary mb-4">
              Available Items
            </Text>

            <View className="flex-row flex-wrap justify-between">
              {foodItems.map((food) => (
                <FoodCardWithRestaurant key={food._id} food={food} />
              ))}
            </View>
          </View>
        ) : (
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
