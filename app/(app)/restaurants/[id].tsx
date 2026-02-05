// app/(app)/restaurants/[id].tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  Clock,
  MoreHorizontal,
  Star,
  Truck,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { SafeAreaView } from "react-native-safe-area-context";
import FoodCard from "../../../components/FoodCard";
import { FOOD_ITEMS, RESTAURANTS } from "../../../constants/mocks";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function RestaurantDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const restaurant = RESTAURANTS.find((r) => r.id === id);
  const [selectedCategory, setSelectedCategory] = useState<string>("Burger");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!restaurant) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-text-gray font-sen">Restaurant not found</Text>
      </SafeAreaView>
    );
  }

  // Mock multiple images - replace with actual restaurant.images array
  const restaurantImages = [
    restaurant.image,
    restaurant.image,
    restaurant.image,
    restaurant.image,
    restaurant.image,
  ];

  const restaurantFoodItems = FOOD_ITEMS.filter(
    (item) => item.restaurantId === restaurant.id,
  );

  const categories = ["Burger", "Sandwich", "Pizza", "Sandwich"];

  const filteredItems = selectedCategory
    ? restaurantFoodItems.filter((item) =>
        item.name.toLowerCase().includes(selectedCategory.toLowerCase()),
      )
    : restaurantFoodItems;

  const itemCount = filteredItems.length;

  return (
    <View className="flex-1 bg-white">
      {/* Image Carousel */}
      <View className="h-[250px] relative">
        <Carousel
          loop={false}
          width={SCREEN_WIDTH}
          height={250}
          data={restaurantImages}
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
        <View className="absolute bottom-12 left-0 right-0 flex-row justify-center items-center gap-2">
          {restaurantImages.map((_, index) => (
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
      </View>

      {/* Content Sheet */}
      <View className="flex-1 bg-white -mt-[30px] rounded-t-[30px] px-6 pt-6">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Restaurant Name */}
          <Text className="text-[28px] font-sen-extra-bold text-[#181C2E] mb-3">
            {restaurant.name}
          </Text>

          {/* Description */}
          <Text className="text-[#A0A5BA] font-sen text-[14px] leading-6 mb-6">
            Maecenas sed diam eget risus varius blandit sit amet non magna.
            Integer posuere erat a ante venenatis dapibus posuere velit aliquet.
          </Text>

          {/* Info Pills */}
          <View className="flex-row items-center mb-8 gap-6">
            <View className="flex-row items-center">
              <Star color="#FF7622" size={20} fill="#FF7622" />
              <Text className="ml-2 font-sen-bold text-[#181C2E] text-[14px]">
                {restaurant.rating}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Truck color="#FF7622" size={20} />
              <Text className="ml-2 font-sen text-[#181C2E] text-[14px]">
                Free
              </Text>
            </View>
            <View className="flex-row items-center">
              <Clock color="#FF7622" size={20} />
              <Text className="ml-2 font-sen text-[#181C2E] text-[14px]">
                {restaurant.deliveryTime}
              </Text>
            </View>
          </View>

          {/* Category Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-6"
            contentContainerStyle={{ gap: 12 }}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full ${
                  selectedCategory === category
                    ? "bg-primary"
                    : "bg-white border border-[#EDEDED]"
                }`}
              >
                <Text
                  className={`font-sen text-[14px] ${
                    selectedCategory === category
                      ? "text-white"
                      : "text-[#181C2E]"
                  }`}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Section Title */}
          <Text className="text-[20px] font-sen-extra-bold text-[#181C2E] mb-5">
            {selectedCategory} ({itemCount})
          </Text>

          {/* Food Items Grid */}
          <View className="flex-row flex-wrap justify-between">
            {filteredItems.map((item) => (
              <View key={item.id} className="w-[48%] mb-5">
                <FoodCard
                  food={item}
                  restaurantName={restaurant.name}
                  onPress={() =>
                    router.push({
                      pathname: "/(app)/food/[id]",
                      params: { id: item.id },
                    })
                  }
                />
              </View>
            ))}
          </View>

          {filteredItems.length === 0 && (
            <View className="items-center justify-center py-12">
              <Text className="text-[#A0A5BA] font-sen text-[14px]">
                No items found in this category
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
