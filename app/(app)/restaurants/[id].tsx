import FoodCard from "@/components/FoodCard";
import {
  useFoodItemsByRestaurant,
  useRestaurant,
} from "@/hooks/useDataQueries";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Clock, MoreHorizontal, Star } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
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
      <View className="h-[250px] relative">
        <Carousel
          loop={false}
          width={SCREEN_WIDTH}
          height={250}
          data={restaurant.images}
          onSnapToItem={(index) => setActiveImageIndex(index)}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              className="w-full h-full"
              resizeMode="cover"
            />
          )}
        />

        {/* Navigation Buttons */}
        <View className="absolute top-12 left-6 right-6 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-11 h-11 bg-white/90 rounded-full items-center justify-center"
          >
            <ChevronLeft color="#181C2E" size={22} />
          </TouchableOpacity>

          <TouchableOpacity className="w-11 h-11 bg-white/90 rounded-full items-center justify-center">
            <MoreHorizontal color="#181C2E" size={20} />
          </TouchableOpacity>
        </View>

        {/* Pagination Dots */}
        {restaurant.images.length > 1 && (
          <View className="absolute bottom-12 left-0 right-0 flex-row justify-center items-center gap-2">
            {restaurant.images.map((_, index) => (
              <View
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === activeImageIndex
                    ? "bg-white border-2 border-white"
                    : "bg-white/50"
                }`}
              />
            ))}
          </View>
        )}
      </View>

      {/* Content Sheet */}
      <View className="flex-1 bg-white -mt-[30px] rounded-t-[30px] px-6 pt-6">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Restaurant Name */}
          <Text className="text-[28px] font-sen-extra-bold text-[#181C2E] mb-3">
            {restaurant.name}
          </Text>

          {/* Description */}
          {restaurant.description && (
            <Text className="text-[#A0A5BA] font-sen text-[14px] leading-6 mb-6">
              {restaurant.description}
            </Text>
          )}

          {/* Info Pills */}
          <View className="flex-row items-center mb-8 gap-6">
            <View className="flex-row items-center">
              <Star color="#FF7622" size={20} fill="#FF7622" />
              <Text className="ml-2 font-sen-bold text-[#181C2E] text-[14px]">
                4.5
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="ml-2 font-sen text-[#181C2E] text-[14px]">
                ₦
                {restaurant.deliveryFee === 0 ? "Free" : restaurant.deliveryFee}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Clock color="#FF7622" size={20} />
              <Text className="ml-2 font-sen text-[#181C2E] text-[14px]">
                {restaurant.openingTime} - {restaurant.closingTime}
              </Text>
            </View>
          </View>

          {/* Menu Section */}
          <Text className="text-[20px] font-sen-extra-bold text-[#181C2E] mb-5">
            Menu ({foodItems.length})
          </Text>

          {/* Food Items Grid */}
          {foodItemsLoading ? (
            <View className="py-8">
              <ActivityIndicator size="small" color="#FF7622" />
            </View>
          ) : foodItems.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Text className="text-[#A0A5BA] font-sen text-[14px]">
                No menu items available
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between pb-6">
              {foodItems.map((item) => (
                <View key={item._id} className="w-[48%] mb-5">
                  <FoodCard
                    food={item}
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
        </ScrollView>
      </View>
    </View>
  );
}
