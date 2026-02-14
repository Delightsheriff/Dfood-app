import { Restaurant } from "@/types/api";
import { Image } from "expo-image";
import { Clock, MapPin, Star, Truck } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

interface RestaurantCardProps {
  restaurant: Restaurant | any;
  onPress: () => void;
}

export default function RestaurantCard({
  restaurant,
  onPress,
}: RestaurantCardProps) {
  const isCurrentlyOpen = restaurant.isOpen ?? restaurant.status === "Open";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white rounded-2xl mb-4 overflow-hidden border border-[#F0F0F0]"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      {/* Image Container */}
      <View className="relative">
        <Image
          source={{ uri: restaurant.images[0] }}
          className="w-full"
          style={{ width: "100%", height: 180 }}
          contentFit="cover"
          transition={200}
        />

        {/* Gradient overlay for text readability */}
        <View
          className="absolute bottom-0 left-0 right-0 h-20"
          style={{
            backgroundColor: "transparent",
          }}
        />

        {/* Rating Badge */}
        <View
          className="absolute top-3 left-3 flex-row items-center bg-white px-2.5 py-1.5 rounded-xl"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Star color="#FF7622" size={13} fill="#FF7622" />
          <Text className="ml-1 font-sen-bold text-secondary text-xs">
            {restaurant?.rating || "4.5"}
          </Text>
        </View>

        {/* Delivery Fee Badge */}
        <View
          className="absolute top-3 right-3 flex-row items-center bg-white px-2.5 py-1.5 rounded-xl"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Truck color="#FF7622" size={13} />
          <Text className="ml-1 font-sen-bold text-secondary text-xs">
            {restaurant.deliveryFee === 0
              ? "Free"
              : `₦${restaurant.deliveryFee}`}
          </Text>
        </View>

        {/* Closed Overlay */}
        {!isCurrentlyOpen && (
          <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 items-center justify-center rounded-t-2xl">
            <View className="bg-white/20 px-6 py-2 rounded-full">
              <Text className="text-white font-sen-bold text-base tracking-wider">
                CLOSED
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Details */}
      <View className="p-4">
        <Text
          className="text-base font-sen-bold text-secondary mb-1"
          numberOfLines={1}
        >
          {restaurant.name}
        </Text>

        {restaurant.description && (
          <Text
            className="text-text-gray font-sen text-xs mb-2.5"
            numberOfLines={1}
          >
            {restaurant.description}
          </Text>
        )}

        {/* Info Row */}
        <View className="flex-row items-center">
          <View className="flex-row items-center flex-1">
            <MapPin color="#A0A5BA" size={12} />
            <Text
              className="text-text-gray font-sen text-[11px] ml-1 flex-1"
              numberOfLines={1}
            >
              {restaurant.address}
            </Text>
          </View>

          <View className="flex-row items-center ml-3 bg-[#F0F5FA] px-2.5 py-1 rounded-lg">
            <Clock color="#646982" size={12} />
            <Text className="font-sen text-text-gray text-[11px] ml-1">
              {restaurant.openingTime} - {restaurant.closingTime}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
