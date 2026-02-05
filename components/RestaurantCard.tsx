// components/ui/RestaurantCard.tsx
import { Clock, Star, Truck } from "lucide-react-native";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface Restaurant {
  id: string;
  name: string;
  image: string;
  tags: string[];
  rating: number;
  deliveryTime: string;
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
}

export default function RestaurantCard({
  restaurant,
  onPress,
}: RestaurantCardProps) {
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
        source={{ uri: restaurant.image }}
        className="w-full h-44"
        resizeMode="cover"
      />

      <View className="p-4">
        <Text
          className="text-lg font-sen-bold text-secondary mb-1"
          numberOfLines={1}
        >
          {restaurant.name}
        </Text>
        <Text
          className="text-text-gray font-sen text-xs mb-3"
          numberOfLines={1}
        >
          {restaurant.tags.join(" - ")}
        </Text>

        <View className="flex-row items-center">
          <View className="flex-row items-center mr-6">
            <Star color="#FF7622" size={18} fill="#FF7622" />
            <Text className="ml-1.5 font-sen-bold text-secondary text-sm">
              {restaurant.rating}
            </Text>
          </View>

          <View className="flex-row items-center mr-6">
            <Truck color="#FF7622" size={18} />
            <Text className="ml-1.5 font-sen text-secondary text-xs">Free</Text>
          </View>

          <View className="flex-row items-center">
            <Clock color="#FF7622" size={18} />
            <Text className="ml-1.5 font-sen text-secondary text-xs">
              {restaurant.deliveryTime}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
