import RestaurantCard from "@/components/RestaurantCard";
import { useRestaurants } from "@/hooks/useDataQueries";
import { useRouter } from "expo-router";
import { ChevronLeft, Store } from "lucide-react-native";
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
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity
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
        </TouchableOpacity>
        <Text className="text-lg font-sen-bold text-secondary flex-1">
          All Restaurants
        </Text>
        {restaurants.length > 0 && (
          <View className="bg-[#F0F5FA] px-3 py-1.5 rounded-lg">
            <Text className="text-text-gray font-sen text-xs">
              {restaurants.length}
            </Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF7622" />
        </View>
      ) : restaurants.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 bg-[#F0F5FA] rounded-3xl items-center justify-center mb-5">
            <Store color="#A0A5BA" size={32} />
          </View>
          <Text className="text-secondary font-sen-bold text-base text-center mb-2">
            No restaurants available
          </Text>
          <Text className="text-text-gray font-sen text-sm text-center">
            Check back later for new restaurants
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
            paddingTop: 8,
            paddingBottom: 24,
          }}
          showsVerticalScrollIndicator={false}
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
