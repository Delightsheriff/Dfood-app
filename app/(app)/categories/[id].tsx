import CategoryBackButton from "@/components/CategoryBackButton";
import FoodCard from "@/components/FoodCard";
import { useFoodItemsByCategory } from "@/hooks/useDataQueries";
import { FoodItem } from "@/types/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { UtensilsCrossed } from "lucide-react-native";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function FoodCardWithRestaurant({ food }: { food: FoodItem }) {
  const router = useRouter();

  const restaurant =
    food?.restaurantId && typeof food.restaurantId === "object"
      ? food.restaurantId
      : null;

  const restaurantName = restaurant?.name;
  const restaurantId = restaurant?._id;

  return (
    <View className="w-[48%] mb-4">
      <FoodCard
        food={food}
        restaurantId={restaurantId}
        restaurantName={restaurantName}
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
          <View className="mt-2">
            <View className="flex-row items-center mb-4">
              <Text className="text-lg font-sen-bold text-secondary">
                Available Items
              </Text>
              <View className="bg-primary ml-2 px-2.5 py-0.5 rounded-lg">
                <Text className="text-white font-sen-bold text-xs">
                  {foodItems.length}
                </Text>
              </View>
            </View>

            <View className="flex-row flex-wrap justify-between">
              {foodItems.map((food) => (
                <FoodCardWithRestaurant key={food._id} food={food} />
              ))}
            </View>
          </View>
        ) : (
          <View className="items-center justify-center py-20 bg-[#F0F5FA] rounded-2xl mt-4">
            <View className="w-16 h-16 bg-white rounded-2xl items-center justify-center mb-4">
              <UtensilsCrossed color="#A0A5BA" size={24} />
            </View>
            <Text className="text-secondary font-sen-bold text-sm mb-1">
              No items found
            </Text>
            <Text className="text-text-gray font-sen text-xs">
              This category doesn&apos;t have any items yet
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
