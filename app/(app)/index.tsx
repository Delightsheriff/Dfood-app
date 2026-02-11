import { useAuth } from "@/contexts/AuthContext";
import { useCategories, useRestaurants } from "@/hooks/useDataQueries";
import { Category } from "@/types/api";
import { useRouter } from "expo-router";
import { Menu, ShoppingBag } from "lucide-react-native";
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
  } = useRestaurants(); // Only fetch open restaurants

  // Combine loading states
  const isLoading = categoriesLoading || restaurantsLoading;
  const isRefreshing = false; // Track manual refresh

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    await Promise.all([refetchCategories(), refetchRestaurants()]);
  };

  // Prepend "All" category
  const allCategory: Category = {
    _id: "all",
    name: "All",
    image: "https://cdn-icons-png.flaticon.com/512/706/706997.png", // Generic "all" icon
    createdAt: "",
    updatedAt: "",
  };

  const categories = categoriesData?.data.categories
    ? [allCategory, ...categoriesData.data.categories]
    : [allCategory];

  const restaurants = restaurantsData?.data.restaurants || [];

  // Get user's first name
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
        <View className="flex-row justify-between items-center px-6 pt-4 pb-6">
          <TouchableOpacity
            onPress={() => router.push("/profile")}
            className="w-12 h-12 bg-[#ECF0F4] rounded-full items-center justify-center"
          >
            <Menu color="#181C2E" size={24} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/cart")}
            className="w-12 h-12 bg-secondary rounded-full items-center justify-center relative"
          >
            <ShoppingBag color="white" size={22} />
            {cartItemCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-primary w-5 h-5 rounded-full items-center justify-center border-2 border-white">
                <Text className="text-white text-[10px] font-sen-bold">
                  {cartItemCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View className="px-6 mb-6">
          <Text className="font-sen text-secondary text-base">
            Hey {firstName}, <Text className="font-sen-bold">{greeting}</Text>
          </Text>
        </View>

        {/* Search Bar */}
        <View className="px-6">
          <SearchBar onPress={() => router.push("/search")} />
        </View>

        {/* All Categories Section */}
        <View className="mt-6 mb-6">
          <View className="flex-row justify-between items-center mb-4 px-6">
            <Text className="text-xl font-sen-extra-bold text-secondary">
              All Categories
            </Text>
            <TouchableOpacity onPress={() => router.push("/(app)/categories")}>
              <Text className="text-secondary font-sen text-sm">
                See All {">"}
              </Text>
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
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 8 }}
            ListEmptyComponent={
              <View className="py-4">
                <Text className="text-text-gray font-sen text-sm">
                  No categories available
                </Text>
              </View>
            }
          />
        </View>

        {/* Open Restaurants Section */}
        <View className="px-6 pb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-sen-extra-bold text-secondary">
              Open Restaurants
            </Text>
            <TouchableOpacity onPress={() => router.push("/(app)/restaurants")}>
              <Text className="text-secondary font-sen text-sm">
                See All {">"}
              </Text>
            </TouchableOpacity>
          </View>

          {restaurantsLoading ? (
            <View className="py-8">
              <ActivityIndicator size="small" color="#FF7622" />
            </View>
          ) : restaurants.length === 0 ? (
            <View className="py-8 items-center">
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
