import FoodCard from "@/components/FoodCard";
import { useFavorites } from "@/hooks/useDataQueries";
import { useRouter } from "expo-router";
import { ChevronLeft, Heart } from "lucide-react-native";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Favourites() {
  const router = useRouter();
  const { data: favoritesData, isLoading, refetch } = useFavorites();

  const favorites = favoritesData?.data.favorites || [];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-[#F0F5FA]">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-11 h-11 bg-[#ECF0F4] rounded-full items-center justify-center mr-3"
        >
          <ChevronLeft color="#181C2E" size={22} />
        </TouchableOpacity>
        <Text className="text-lg font-sen-bold text-secondary flex-1">
          Favourites
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF7622" />
        </View>
      ) : favorites.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Heart color="#A0A5BA" size={64} />
          <Text className="text-xl font-sen-bold text-secondary mt-4 mb-2">
            No Favourites Yet
          </Text>
          <Text className="text-text-gray font-sen text-sm text-center">
            Start adding your favorite dishes to see them here
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 24,
          }}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => refetch()}
              tintColor="#FF7622"
            />
          }
        >
          <Text className="text-text-gray font-sen text-sm mb-4">
            {favorites.length} {favorites.length === 1 ? "item" : "items"}
          </Text>

          <View className="flex-row flex-wrap justify-between">
            {favorites.map((favorite) => (
              <View key={favorite._id} className="w-[48%] mb-4">
                <FoodCard
                  food={favorite.foodItem}
                  restaurantId={favorite.foodItem.restaurant?._id}
                  restaurantName={favorite.foodItem.restaurant?.name}
                  onPress={() =>
                    router.push({
                      pathname: "/(app)/food/[id]",
                      params: { id: favorite.foodItem._id },
                    })
                  }
                />
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
