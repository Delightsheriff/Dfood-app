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
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

  const totalPrice = food.price * quantity;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 py-4">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-11 h-11 bg-[#ECF0F4] rounded-full items-center justify-center"
            >
              <ChevronLeft color="#181C2E" size={22} />
            </TouchableOpacity>

            <Text className="text-lg font-sen-bold text-secondary">
              Details
            </Text>

            <View className="w-11" />
          </View>
        </View>

        {/* Food Image */}
        <View className="px-6 mb-4">
          <View className="relative">
            <Image
              source={{ uri: food.image }}
              className="w-full h-56 rounded-3xl"
              resizeMode="cover"
            />

            <TouchableOpacity
              onPress={() => setIsFavorite(!isFavorite)}
              className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-full items-center justify-center"
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
        </View>

        {/* Restaurant Badge */}
        <View className="px-6 mb-4">
          <View className="self-start flex-row items-center bg-white border border-[#F0F5FA] rounded-full px-4 py-2">
            <View className="w-2 h-2 bg-primary rounded-full mr-2" />
            <Text className="text-secondary font-sen text-sm">
              {restaurant?.name || "Unknown Restaurant"}
            </Text>
          </View>
        </View>

        {/* Food Name & Description */}
        <View className="px-6 mb-4">
          <Text className="text-2xl font-sen-bold text-secondary mb-2">
            {food.name}
          </Text>
          <Text className="text-text-gray font-sen text-sm leading-5">
            {food.description ||
              "Prosciutto e funghi is a pizza variety that is topped with tomato sauce."}
          </Text>
        </View>

        {/* Rating, Delivery, Time */}
        <View className="flex-row items-center px-6 mb-6">
          <View className="flex-row items-center mr-6">
            <Star color="#FF7622" size={18} fill="#FF7622" />
            <Text className="ml-1.5 font-sen-bold text-secondary text-sm">
              {food.rating || "4.7"}
            </Text>
          </View>

          <View className="flex-row items-center mr-6">
            <Truck color="#FF7622" size={18} />
            <Text className="ml-1.5 font-sen text-secondary text-xs">Free</Text>
          </View>

          <View className="flex-row items-center">
            <Clock color="#FF7622" size={18} />
            <Text className="ml-1.5 font-sen text-secondary text-xs">
              20 min
            </Text>
          </View>
        </View>

        {/* Size Selection */}
        <View className="px-6 mb-6">
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
        <View className="px-6 mb-6">
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

      {/* Bottom Bar */}
      <View className="px-6 py-4 border-t border-[#F0F5FA]">
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
    </SafeAreaView>
  );
}
