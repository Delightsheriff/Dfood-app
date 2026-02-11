import { useCartStore } from "@/store/cartStore";
import { FoodItem } from "@/types/api";
import { Image } from "expo-image";
import { Plus } from "lucide-react-native";
import { Alert, Text, TouchableOpacity, View } from "react-native";

interface FoodCardProps {
  food: FoodItem;
  onPress: () => void;
  restaurantName?: string;
  restaurantId?: string;
}

export default function FoodCard({
  food,
  onPress,
  restaurantName,
  restaurantId,
}: FoodCardProps) {
  const addToCart = useCartStore((state) => state.addItem);
  const currentRestaurantId = useCartStore((state) => state.getRestaurantId());
  console.log("FoodCard - Food:", food);

  const handleAddToCart = (e: any) => {
    e.stopPropagation();

    if (!restaurantId || !restaurantName) {
      Alert.alert("Error", "Restaurant information is missing");
      return;
    }

    // Warn if switching restaurants
    if (currentRestaurantId && currentRestaurantId !== restaurantId) {
      Alert.alert(
        "Switch Restaurant?",
        "Your cart contains items from another restaurant. Adding this item will clear your current cart.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Continue",
            onPress: () => {
              addToCart({
                foodItem: food,
                quantity: 1,
                restaurantId,
                restaurantName,
              });
            },
          },
        ],
      );
      return;
    }

    // Add to cart
    addToCart({
      foodItem: food,
      quantity: 1,
      restaurantId,
      restaurantName,
    });
  };
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#EDEDED]"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <Image
        source={{ uri: food.images[0] }}
        className="w-full h-32"
        style={{ width: "100%", height: 128 }}
        contentFit="cover"
        transition={200}
      />

      <View className="p-3">
        <Text
          className="text-base font-sen-bold text-secondary mb-1"
          numberOfLines={1}
        >
          {food.name}
        </Text>
        {restaurantName && (
          <Text
            className="text-xs text-text-gray font-sen mb-3"
            numberOfLines={1}
          >
            {restaurantName}
          </Text>
        )}

        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-sen-bold text-secondary">
            ₦{food.price.toLocaleString()}
          </Text>

          <TouchableOpacity
            className="w-8 h-8 bg-primary rounded-full items-center justify-center"
            onPress={(e) => {
              handleAddToCart(e);
            }}
          >
            <Plus color="white" size={18} strokeWidth={3} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
