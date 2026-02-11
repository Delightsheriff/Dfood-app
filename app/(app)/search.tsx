import FoodCard from "@/components/FoodCard";
import RestaurantCard from "@/components/RestaurantCard";
import { useSearch } from "@/hooks/useDataQueries";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter } from "expo-router";
import { ChevronLeft, Search, X } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 500);

  const { data, isLoading, error } = useSearch(
    debouncedQuery,
    debouncedQuery.length >= 2,
  );

  const foods = data?.data.foods || [];
  const restaurants = data?.data.restaurants || [];
  const hasResults = foods.length > 0 || restaurants.length > 0;
  const showResults = debouncedQuery.length >= 2;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        {/* Search Header */}
        <View className="px-6 py-4 border-b border-[#F0F5FA]">
          <View className="flex-row items-center gap-3">
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-[52px] h-[52px] bg-[#ECF0F4] rounded-full items-center justify-center"
            >
              <ChevronLeft color="#181C2E" size={22} />
            </TouchableOpacity>

            {/* Search Input */}
            <View className="flex-1 flex-row items-center bg-[#F6F6F6] rounded-xl px-4 h-[52px]">
              <Search color="#A0A5BA" size={20} />
              <TextInput
                placeholder="Search dishes, restaurants"
                placeholderTextColor="#A0A5BA"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                className="flex-1 ml-3 font-sen text-sm text-secondary"
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <X color="#A0A5BA" size={20} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        >
          {/* Loading State */}
          {isLoading && showResults && (
            <View className="py-20 items-center">
              <ActivityIndicator size="large" color="#FF7622" />
              <Text className="text-text-gray font-sen text-sm mt-4">
                Searching...
              </Text>
            </View>
          )}

          {/* Error State */}
          {error && showResults && (
            <View className="py-20 items-center">
              <Text className="text-text-gray font-sen text-base text-center">
                Something went wrong. Please try again.
              </Text>
            </View>
          )}

          {/* Empty State - Before Search */}
          {!showResults && !isLoading && (
            <View className="py-20 items-center">
              <Search color="#A0A5BA" size={48} />
              <Text className="text-text-gray font-sen text-base text-center mt-4">
                Search for your favorite dishes{"\n"}or restaurants
              </Text>
            </View>
          )}

          {/* No Results */}
          {showResults && !isLoading && !hasResults && !error && (
            <View className="py-20 items-center">
              <Text className="text-text-gray font-sen text-base text-center">
                No results found for &quot;{debouncedQuery}&quot;
              </Text>
              <Text className="text-text-gray font-sen text-sm text-center mt-2">
                Try searching with different keywords
              </Text>
            </View>
          )}

          {/* Results */}
          {showResults && !isLoading && hasResults && (
            <>
              {/* Restaurants Section */}
              {restaurants.length > 0 && (
                <View className="mt-6">
                  <Text className="text-xl font-sen-extra-bold text-secondary mb-4">
                    Restaurants ({restaurants.length})
                  </Text>
                  {restaurants.map((restaurant) => (
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
                  ))}
                </View>
              )}

              {/* Food Items Section */}
              {foods.length > 0 && (
                <View className="mt-6">
                  <Text className="text-xl font-sen-extra-bold text-secondary mb-4">
                    Dishes ({foods.length})
                  </Text>
                  <View className="flex-row flex-wrap justify-between">
                    {foods.map((food) => (
                      <View key={food._id} className="w-[48%] mb-4">
                        <FoodCard
                          food={food}
                          restaurantId={food.restaurant._id}
                          restaurantName={food.restaurant.name}
                          onPress={() =>
                            router.push({
                              pathname: "/(app)/food/[id]",
                              params: { id: food._id },
                            })
                          }
                        />
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
