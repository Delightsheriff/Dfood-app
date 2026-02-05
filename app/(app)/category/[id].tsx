import RestaurantCard from "@/components/RestaurantCard";
import { CATEGORIES, RESTAURANTS } from "@/constants/mocks";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CategoryDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const category = CATEGORIES.find((c) => c.id === id);

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
      <View className="flex-row items-center px-6 py-4 border-b border-[#F0F5FA]">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-11 h-11 bg-[#ECF0F4] rounded-full items-center justify-center mr-3"
        >
          <ChevronLeft color="#181C2E" size={22} />
        </TouchableOpacity>
        <Text className="text-lg font-sen-bold text-secondary flex-1">
          {category.name}
        </Text>
      </View>

      <FlatList
        data={categoryRestaurants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RestaurantCard
            restaurant={item}
            onPress={() => router.push(`/restaurant/${item.id}`)}
          />
        )}
        ListHeaderComponent={
          <Text className="text-sm font-sen-medium text-text-gray mb-4">
            {categoryRestaurants.length}{" "}
            {categoryRestaurants.length === 1 ? "Restaurant" : "Restaurants"}
          </Text>
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Text className="text-text-gray font-sen text-base text-center">
              No restaurants found in this category
            </Text>
          </View>
        }
        contentContainerClassName="px-6 pt-4 pb-6"
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View className="h-4" />}
      />
    </SafeAreaView>
  );
}
