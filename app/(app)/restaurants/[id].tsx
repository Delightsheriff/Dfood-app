import FoodCard from "@/components/FoodCard";
import {
  useFoodItemsByRestaurant,
  useRestaurant,
} from "@/hooks/useDataQueries";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  Clock,
  MapPin,
  MoreHorizontal,
  Star,
  Truck,
  UtensilsCrossed,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function RestaurantDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { data: restaurantData, isLoading: restaurantLoading } =
    useRestaurant(id);
  const { data: foodItemsData, isLoading: foodItemsLoading } =
    useFoodItemsByRestaurant(id);

  const restaurant = restaurantData?.data.restaurant;
  const foodItems = foodItemsData?.data.foodItems || [];

  if (restaurantLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#FF7622" />
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-text-gray font-sen">Restaurant not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Image Carousel */}
      <View className="h-[260px] relative">
        <Carousel
          loop={false}
          width={SCREEN_WIDTH}
          height={260}
          data={restaurant.images}
          onSnapToItem={(index) => setActiveImageIndex(index)}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              className="w-full h-full"
              contentFit="cover"
              style={{ width: "100%", height: "100%" }}
              transition={200}
            />
          )}
        />

        {/* Navigation Buttons */}
        <View className="absolute top-12 left-6 right-6 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-11 h-11 bg-white rounded-2xl items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.12,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            <ChevronLeft color="#181C2E" size={22} />
          </TouchableOpacity>

          <TouchableOpacity
            className="w-11 h-11 bg-white rounded-2xl items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.12,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            <MoreHorizontal color="#181C2E" size={20} />
          </TouchableOpacity>
        </View>

        {/* Pagination Dots */}
        {restaurant.images.length > 1 && (
          <View className="absolute bottom-12 left-0 right-0 flex-row justify-center items-center gap-2">
            {restaurant.images.map((_: string, index: number) => (
              <View
                key={index}
                className={`rounded-full ${
                  index === activeImageIndex
                    ? "w-6 h-2 bg-white"
                    : "w-2 h-2 bg-white/50"
                }`}
              />
            ))}
          </View>
        )}
      </View>

      {/* Content Sheet */}
      <View className="flex-1 bg-white -mt-[30px] rounded-t-[30px]">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          <View className="px-6 pt-7">
            {/* Restaurant Name */}
            <Text className="text-2xl font-sen-extra-bold text-secondary mb-2">
              {restaurant.name}
            </Text>

            {/* Description */}
            {restaurant.description && (
              <Text className="text-text-gray font-sen text-sm leading-5 mb-5">
                {restaurant.description}
              </Text>
            )}

            {/* Address */}
            <View className="flex-row items-center mb-5">
              <View className="w-8 h-8 bg-[#F0F5FA] rounded-xl items-center justify-center mr-2.5">
                <MapPin color="#FF7622" size={15} />
              </View>
              <Text className="text-text-gray font-sen text-sm flex-1">
                {restaurant.address}
              </Text>
            </View>

            {/* Info Pills */}
            <View className="flex-row items-center flex-wrap gap-2.5 mb-7">
              <View
                className="flex-row items-center bg-[#FFF5EE] px-3.5 py-2.5 rounded-xl"
                style={{ borderWidth: 1, borderColor: "#FFE5D3" }}
              >
                <Star color="#FF7622" size={15} fill="#FF7622" />
                <Text className="ml-1.5 font-sen-bold text-secondary text-sm">
                  {restaurant?.rating || "4.5"}
                </Text>
              </View>

              <View className="flex-row items-center bg-[#F0F5FA] px-3.5 py-2.5 rounded-xl">
                <Truck color="#646982" size={15} />
                <Text className="ml-1.5 font-sen text-secondary text-sm">
                  ₦
                  {restaurant.deliveryFee === 0
                    ? "Free"
                    : restaurant.deliveryFee}
                </Text>
              </View>

              <View
                className={`flex-row items-center px-3.5 py-2.5 rounded-xl ${
                  restaurant.status === "Open" ? "bg-green-50" : "bg-red-50"
                }`}
                style={{
                  borderWidth: 1,
                  borderColor:
                    restaurant.status === "Open" ? "#BBF7D0" : "#FECACA",
                }}
              >
                <View
                  className={`w-2 h-2 rounded-full mr-2 ${
                    restaurant.status === "Open" ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <Text
                  className={`font-sen-bold text-sm ${
                    restaurant.status === "Open"
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {restaurant.status}
                </Text>
              </View>

              <View className="flex-row items-center bg-[#F0F5FA] px-3.5 py-2.5 rounded-xl">
                <Clock color="#646982" size={15} />
                <Text className="ml-1.5 font-sen text-secondary text-sm">
                  {restaurant.openingTime} - {restaurant.closingTime}
                </Text>
              </View>
            </View>
          </View>

          {/* Menu Section */}
          <View className="px-6">
            <View className="flex-row items-center mb-5">
              <Text className="text-lg font-sen-bold text-secondary">Menu</Text>
              {foodItems.length > 0 && (
                <View className="bg-primary ml-2 px-2.5 py-0.5 rounded-lg">
                  <Text className="text-white font-sen-bold text-xs">
                    {foodItems.length}
                  </Text>
                </View>
              )}
            </View>

            {/* Food Items Grid */}
            {foodItemsLoading ? (
              <View className="py-8">
                <ActivityIndicator size="small" color="#FF7622" />
              </View>
            ) : foodItems.length === 0 ? (
              <View className="items-center justify-center py-16 bg-[#F0F5FA] rounded-2xl">
                <View className="w-16 h-16 bg-white rounded-2xl items-center justify-center mb-4">
                  <UtensilsCrossed color="#A0A5BA" size={24} />
                </View>
                <Text className="text-secondary font-sen-bold text-sm mb-1">
                  No menu items yet
                </Text>
                <Text className="text-text-gray font-sen text-xs">
                  This restaurant hasn&apos;t added items
                </Text>
              </View>
            ) : (
              <View className="flex-row flex-wrap justify-between pb-6">
                {foodItems.map((item) => (
                  <View key={item._id} className="w-[48%] mb-5">
                    <FoodCard
                      food={item}
                      restaurantId={restaurant._id}
                      restaurantName={restaurant.name}
                      onPress={() =>
                        router.push({
                          pathname: "/(app)/food/[id]",
                          params: { id: item._id },
                        })
                      }
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
