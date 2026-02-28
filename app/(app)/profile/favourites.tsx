import FoodCard from "@/components/FoodCard";
import { useFavorites } from "@/hooks/useDataQueries";
import { useRouter } from "expo-router";
import { ChevronLeft, Heart } from "lucide-react-native";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  Pressable,
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
      <View className="flex-row items-center px-6 py-4">
        <Pressable
          onPress={() => router.back()}
          className="w-11 h-11 bg-[#F0F5FA] rounded-2xl items-center justify-center mr-3"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <ChevronLeft color="#181C2E" size={22} />
        </Pressable>
        <Text className="text-lg font-sen-bold text-secondary flex-1">
          Favourites
        </Text>
        {favorites.length > 0 && (
          <View
            className="bg-[#FFF0F0] px-3 py-1.5 rounded-lg"
            style={{ borderWidth: 1, borderColor: "#FECACA" }}
          >
            <Text className="text-red-500 font-sen-bold text-xs">
              {favorites.length}
            </Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF7622" />
        </View>
      ) : favorites.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 bg-[#FFF0F0] rounded-3xl items-center justify-center mb-5">
            <Heart color="#FF4B4B" size={32} />
          </View>
          <Text className="text-base font-sen-bold text-secondary mb-2">
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
