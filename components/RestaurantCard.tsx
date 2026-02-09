import { Restaurant } from "@/types/api";
import { Image } from "expo-image";
import { Clock, Star } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
}

export default function RestaurantCard({
  restaurant,
  onPress,
}: RestaurantCardProps) {
  // Calculate if currently open
  const isCurrentlyOpen = restaurant.isOpen;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white rounded-2xl mb-4 overflow-hidden shadow-md border border-[#EDEDED]"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <Image
        source={{ uri: restaurant.images[0] }}
        className="w-full h-44"
        contentFit="cover"
        transition={200}
      />

      {!isCurrentlyOpen && (
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/40 items-center justify-center">
          <Text className="text-white font-sen-bold text-lg">CLOSED</Text>
        </View>
      )}

      <View className="p-4">
        <Text
          className="text-lg font-sen-bold text-secondary mb-1"
          numberOfLines={1}
        >
          {restaurant.name}
        </Text>

        {restaurant.description && (
          <Text
            className="text-text-gray font-sen text-xs mb-3"
            numberOfLines={2}
          >
            {restaurant.description}
          </Text>
        )}

        <View className="flex-row items-center">
          <View className="flex-row items-center mr-6">
            <Star color="#FF7622" size={18} fill="#FF7622" />
            <Text className="ml-1.5 font-sen-bold text-secondary text-sm">
              4.5
            </Text>
          </View>

          <View className="flex-row items-center mr-6">
            <Text className="ml-1.5 font-sen text-secondary text-xs">
              ₦{restaurant.deliveryFee === 0 ? "Free" : restaurant.deliveryFee}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Clock color="#FF7622" size={18} />
            <Text className="ml-1.5 font-sen text-secondary text-xs">
              {restaurant.openingTime} - {restaurant.closingTime}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
