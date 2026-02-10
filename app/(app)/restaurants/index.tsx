import RestaurantCard from "@/components/RestaurantCard";
import { useRestaurants } from "@/hooks/useDataQueries";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AllRestaurants() {
  const router = useRouter();
  const { data: restaurantsData, isLoading, refetch } = useRestaurants();

  const restaurants = restaurantsData?.data.restaurants || [];

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
          All Restaurants
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF7622" />
        </View>
      ) : restaurants.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-text-gray font-sen text-base text-center">
            No restaurants available at the moment
          </Text>
        </View>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <RestaurantCard
              restaurant={item}
              onPress={() =>
                router.push({
                  pathname: "/(app)/restaurants/[id]",
                  params: { id: item._id },
                })
              }
            />
          )}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 24,
          }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View className="h-4" />}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => refetch()}
              tintColor="#FF7622"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
