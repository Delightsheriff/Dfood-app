import { useCartStore } from "@/store/cartStore";
import { FoodItem } from "@/types/api";
import { Add01Icon, StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Image } from "expo-image";
import { memo } from "react";
import {
  Alert,
  GestureResponderEvent,
  Pressable,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const ACCENT = "#E0533A";

interface FoodCardProps {
  food: FoodItem;
  onPress: () => void;
  restaurantName?: string;
  restaurantId?: string;
}

function FoodCard({
  food,
  onPress,
  restaurantName,
  restaurantId,
}: FoodCardProps) {
  const addToCart = useCartStore((state) => state.addItem);
  const currentRestaurantId = useCartStore((state) => state.getRestaurantId());

  const handleAddToCart = (e: GestureResponderEvent) => {
    e.stopPropagation();

    // Resolve restaurant from props or foodItem.restaurantId if object
    const resolvedRestaurantId =
      restaurantId ||
      (typeof food.restaurantId === "object" ? food.restaurantId._id : undefined);
    const resolvedRestaurantName =
      restaurantName ||
      (typeof food.restaurantId === "object" ? food.restaurantId.name : undefined);

    if (!resolvedRestaurantId || !resolvedRestaurantName) {
      Alert.alert("Error", "Restaurant information is missing");
      return;
    }

    // Warn if switching restaurants
    if (currentRestaurantId && currentRestaurantId !== resolvedRestaurantId) {
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
                restaurantId: resolvedRestaurantId,
                restaurantName: resolvedRestaurantName,
              });
              Toast.show({
                type: "cart",
                text1: "Added to cart",
                text2: `${food.name} added to your cart`,
                visibilityTime: 2000,
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
      restaurantId: resolvedRestaurantId,
      restaurantName: resolvedRestaurantName,
    });
    Toast.show({
      type: "cart",
      text1: "Added to cart",
      text2: `${food.name} added to your cart`,
      visibilityTime: 2000,
    });
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${food.name}, ₦${food.price}`}
      className="bg-white rounded-[18px] overflow-hidden mb-3.5 flex-1 border border-[#F0EFEB]"
      style={{
        borderCurve: "continuous",
        boxShadow: "0px 2px 6px rgba(0,0,0,0.04)",
      }}
    >
      {/* Image container */}
      <View className="relative w-full overflow-hidden">
        <Image
          source={{ uri: food.images[0] }}
          style={{ width: "100%", height: 130 }}
          contentFit="cover"
          transition={150}
          recyclingKey={food._id}
        />

        {/* Rating pill top-left if available */}
        {food.rating ? (
          <View
            className="absolute top-2 left-2 flex-row items-center gap-0.5 bg-white/95 px-2 py-0.5 rounded-full"
            style={{
              borderCurve: "continuous",
              boxShadow: "0px 1px 4px rgba(0,0,0,0.08)",
            }}
          >
            <HugeiconsIcon icon={StarIcon} size={11} color={ACCENT} fill={ACCENT} />
            <Text className="text-[11px] font-sen-bold text-secondary">
              {food.rating.toFixed(1)}
            </Text>
          </View>
        ) : null}

        {/* Add to cart circular button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Add ${food.name} to cart`}
          onPress={handleAddToCart}
          className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-secondary items-center justify-center"
          style={{
            boxShadow: "0px 2px 6px rgba(38,43,51,0.25)",
          }}
        >
          <HugeiconsIcon icon={Add01Icon} size={16} color="#FFFFFF" strokeWidth={2.5} />
        </Pressable>
      </View>

      {/* Details */}
      <View className="p-3">
        <Text
          numberOfLines={1}
          className="text-[14px] leading-5 font-sen-bold text-secondary"
        >
          {food.name}
        </Text>

        {restaurantName ? (
          <Text
            numberOfLines={1}
            className="mt-0.5 text-[11px] text-text-gray font-sen"
          >
            {restaurantName}
          </Text>
        ) : food.categories?.[0] ? (
          <Text
            numberOfLines={1}
            className="mt-0.5 text-[11px] text-text-gray font-sen"
          >
            {food.categories[0]}
          </Text>
        ) : null}

        <Text className="mt-2 text-[15px] font-sen-extra-bold text-secondary">
          ₦{food.price.toLocaleString()}
        </Text>
      </View>
    </Pressable>
  );
}

export default memo(FoodCard);
