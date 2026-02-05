/* eslint-disable import/no-unresolved */
import { Button } from "@/components/ui/button";
import { FOOD_ITEMS, RESTAURANTS } from "@/constants/mocks";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  Clock,
  Heart,
  Minus,
  Plus,
  Star,
  Truck,
} from "lucide-react-native";
import { useState } from "react";
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

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SIZES = ['10"', '14"', '16"'];

const INGREDIENTS = [
  { id: "1", icon: "🧂", name: "Salt" },
  { id: "2", icon: "🌶️", name: "Pepper" },
  { id: "3", icon: "🔥", name: "Hot" },
  { id: "4", icon: "🧄", name: "Garlic" },
  { id: "5", icon: "🧅", name: "Onion" },
];

export default function FoodDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [quantity, setQuantity] = useState(2);
  const [selectedSize, setSelectedSize] = useState('14"');
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const food = FOOD_ITEMS.find((f) => f.id === id);
  const restaurant = food
    ? RESTAURANTS.find((r) => r.id === food.restaurantId)
    : null;

  if (!food) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-text-gray font-sen">Food item not found</Text>
      </SafeAreaView>
    );
  }

  // Mock multiple images - replace with actual food.images array
  const foodImages = [
    food.image,
    food.image,
    food.image,
    food.image,
    food.image,
  ];

  const totalPrice = food.price * quantity;

  return (
    <View className="flex-1 bg-white">
      {/* Image Carousel */}
      <View className="h-[280px] relative">
        <Carousel
          loop={false}
          width={SCREEN_WIDTH}
          height={280}
          data={foodImages}
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

          {/* Favorite Button */}
          <TouchableOpacity
            onPress={() => setIsFavorite(!isFavorite)}
            className="w-12 h-12 bg-white rounded-full items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Heart
              color={isFavorite ? "#FF7622" : "#181C2E"}
              size={22}
              fill={isFavorite ? "#FF7622" : "transparent"}
            />
          </TouchableOpacity>
        </View>

        {/* Pagination Dots */}
        <View className="absolute bottom-12 left-0 right-0 flex-row justify-center items-center gap-2">
          {foodImages.map((_, index) => (
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
      <View className="flex-1 bg-white -mt-[30px] rounded-t-[30px]">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-6 pt-8"
        >
          {/* Restaurant Badge */}
          <View className="mb-4">
            <View className="self-start flex-row items-center bg-white border border-[#F0F5FA] rounded-full px-4 py-2">
              <View className="w-2 h-2 bg-primary rounded-full mr-2" />
              <Text className="text-secondary font-sen text-sm">
                {restaurant?.name || "Unknown Restaurant"}
              </Text>
            </View>
          </View>

          {/* Food Name & Description */}
          <View className="mb-4">
            <Text className="text-2xl font-sen-bold text-secondary mb-2">
              {food.name}
            </Text>
            <Text className="text-text-gray font-sen text-sm leading-5">
              {food.description ||
                "Prosciutto e funghi is a pizza variety that is topped with tomato sauce."}
            </Text>
          </View>

          {/* Rating, Delivery, Time */}
          <View className="flex-row items-center mb-6">
            <View className="flex-row items-center mr-6">
              <Star color="#FF7622" size={18} fill="#FF7622" />
              <Text className="ml-1.5 font-sen-bold text-secondary text-sm">
                {food.rating || "4.7"}
              </Text>
            </View>

            <View className="flex-row items-center mr-6">
              <Truck color="#FF7622" size={18} />
              <Text className="ml-1.5 font-sen text-secondary text-xs">
                Free
              </Text>
            </View>

            <View className="flex-row items-center">
              <Clock color="#FF7622" size={18} />
              <Text className="ml-1.5 font-sen text-secondary text-xs">
                20 min
              </Text>
            </View>
          </View>

          {/* Size Selection */}
          <View className="mb-6">
            <Text className="text-base font-sen-bold text-secondary mb-3">
              SIZE:
            </Text>
            <View className="flex-row gap-3">
              {SIZES.map((size) => (
                <TouchableOpacity
                  key={size}
                  onPress={() => setSelectedSize(size)}
                  className={`w-14 h-14 rounded-full items-center justify-center ${
                    selectedSize === size ? "bg-primary" : "bg-[#F6F6F6]"
                  }`}
                >
                  <Text
                    className={`font-sen-bold ${
                      selectedSize === size ? "text-white" : "text-secondary"
                    }`}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Ingredients */}
          <View className="mb-6">
            <Text className="text-base font-sen-bold text-secondary mb-3">
              INGREDIENTS
            </Text>
            <View className="flex-row gap-3">
              {INGREDIENTS.map((ingredient) => (
                <TouchableOpacity
                  key={ingredient.id}
                  className="w-14 h-14 bg-[#FFF5EE] rounded-full items-center justify-center"
                >
                  <Text className="text-2xl">{ingredient.icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Bottom Bar */}
      <View className="px-6 py-4 border-t border-[#F0F5FA] bg-white">
        <View className="flex-row items-center justify-between">
          <Text className="text-3xl font-sen-bold text-secondary">
            ${totalPrice}
          </Text>

          <View className="flex-row items-center bg-secondary rounded-full">
            <TouchableOpacity
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-12 h-12 items-center justify-center"
            >
              <Minus color="white" size={20} />
            </TouchableOpacity>

            <Text className="text-white font-sen-bold text-lg px-4">
              {quantity}
            </Text>

            <TouchableOpacity
              onPress={() => setQuantity(quantity + 1)}
              className="w-12 h-12 items-center justify-center"
            >
              <Plus color="white" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <Button className="w-full mt-4 h-14">
          <Text className="text-white font-sen-bold uppercase tracking-wide">
            Add to Cart
          </Text>
        </Button>
      </View>
    </View>
  );
}
