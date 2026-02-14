import { useAuth } from "@/contexts/AuthContext";
import { useCategories, useRestaurants } from "@/hooks/useDataQueries";
import { Category } from "@/types/api";
import { useRouter } from "expo-router";
import { ChevronRight, Menu, ShoppingBag } from "lucide-react-native";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CategoryItem from "@/components/CategoryItem";
import RestaurantCard from "@/components/RestaurantCard";
import SearchBar from "@/components/SearchBar";
import { getGreeting } from "@/lib/greeting";
import { useCartStore } from "@/store/cartStore";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  // Data fetching
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    refetch: refetchCategories,
  } = useCategories();
  const {
    data: restaurantsData,
    isLoading: restaurantsLoading,
    refetch: refetchRestaurants,
  } = useRestaurants();

  const isLoading = categoriesLoading || restaurantsLoading;
  const isRefreshing = false;

  const handleRefresh = async () => {
    await Promise.all([refetchCategories(), refetchRestaurants()]);
  };

  // Prepend "All" category
  const allCategory: Category = {
    _id: "all",
    name: "All",
    image: "https://cdn-icons-png.flaticon.com/512/706/706997.png",
    createdAt: "",
    updatedAt: "",
  };

  const categories = categoriesData?.data.categories
    ? [allCategory, ...categoriesData.data.categories]
    : [allCategory];

  const restaurants = restaurantsData?.data.restaurants || [];

  const firstName = user?.name?.split(" ")[0] || "Guest";
  const greeting = getGreeting();
  const cartItemCount = useCartStore((state) => state.getItemCount());

  if (isLoading && !categoriesData && !restaurantsData) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF7622" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 pt-4 pb-2">
          <TouchableOpacity
            onPress={() => router.push("/(app)/profile")}
            className="w-12 h-12 bg-[#F0F5FA] rounded-2xl items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Menu color="#181C2E" size={22} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/cart")}
            className="w-12 h-12 bg-secondary rounded-2xl items-center justify-center relative"
            style={{
              shadowColor: "#32343E",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            <ShoppingBag color="white" size={20} />
            {cartItemCount > 0 && (
              <View className="absolute -top-1.5 -right-1.5 bg-primary min-w-[20px] h-5 rounded-full items-center justify-center border-2 border-white px-1">
                <Text className="text-white text-[10px] font-sen-bold">
                  {cartItemCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View className="px-6 mt-4 mb-6">
          <Text className="font-sen text-text-gray text-sm mb-1">
            Hey {firstName} 👋
          </Text>
          <Text className="font-sen-extra-bold text-secondary text-2xl">
            {greeting}
          </Text>
        </View>

        {/* Search Bar */}
        <View className="px-6">
          <SearchBar onPress={() => router.push("/search")} />
        </View>

        {/* Categories Section */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4 px-6">
            <Text className="text-lg font-sen-bold text-secondary">
              Categories
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(app)/categories")}
              className="flex-row items-center"
            >
              <Text className="text-primary font-sen text-sm mr-1">
                See All
              </Text>
              <ChevronRight color="#FF7622" size={16} />
            </TouchableOpacity>
          </View>

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <CategoryItem
                category={item}
                onPress={() => {
                  if (item._id !== "all") {
                    router.push({
                      pathname: "/(app)/categories/[id]",
                      params: { id: item._id },
                    });
                  }
                }}
              />
            )}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 4 }}
            ListEmptyComponent={
              <View className="py-4">
                <Text className="text-text-gray font-sen text-sm">
                  No categories available
                </Text>
              </View>
            }
          />
        </View>

        {/* Restaurants Section */}
        <View className="px-6 pb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-sen-bold text-secondary">
              Open Restaurants
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(app)/restaurants")}
              className="flex-row items-center"
            >
              <Text className="text-primary font-sen text-sm mr-1">
                See All
              </Text>
              <ChevronRight color="#FF7622" size={16} />
            </TouchableOpacity>
          </View>

          {restaurantsLoading ? (
            <View className="py-8">
              <ActivityIndicator size="small" color="#FF7622" />
            </View>
          ) : restaurants.length === 0 ? (
            <View className="py-12 items-center bg-[#F0F5FA] rounded-2xl">
              <Text className="text-text-gray font-sen text-sm">
                No open restaurants at the moment
              </Text>
            </View>
          ) : (
            restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant._id}
                restaurant={restaurant}
                onPress={() =>
                  router.push({
                    pathname: "/(app)/restaurants/[id]",
                    params: { id: restaurant._id },
                  })
                }
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
