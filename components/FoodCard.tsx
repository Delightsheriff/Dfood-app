import { useCartStore } from "@/store/cartStore";
import { FoodItem } from "@/types/api";
import { Add01Icon, StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Image } from "expo-image";
import { memo } from "react";
import {
  Alert,
  Pressable,
  Text,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";

const ACCENT = "#E0533A";

interface FoodCardProps {
  food: FoodItem;
  onPress: () => void;
  restaurantName?: string;
  restaurantId?: string;
  showRestaurantName?: boolean;
}

function FoodCard({
  food,
  onPress,
  restaurantName,
  restaurantId,
  showRestaurantName = false,
}: FoodCardProps) {
  const addToCart = useCartStore((state) => state.addItem);
  const currentRestaurantId = useCartStore((state) => state.getRestaurantId());

  const addButtonPressed = useSharedValue(0);

  const handleAddToCart = () => {
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

  const addTapGesture = Gesture.Tap()
    .runOnJS(true)
    .onBegin(() => {
      addButtonPressed.value = 1;
    })
    .onFinalize(() => {
      addButtonPressed.value = 0;
    })
    .onEnd((_event, success) => {
      if (success) {
        handleAddToCart();
      }
    });

  const addAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(addButtonPressed.value, [0, 1], [1, 0.88]);
    const opacity = interpolate(addButtonPressed.value, [0, 1], [1, 0.85]);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

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
            <Text className="text-[11px] font-numeric text-secondary">
              {food.rating.toFixed(1)}
            </Text>
          </View>
        ) : null}

        {/* Add to cart button with press-scale gesture */}
        <View className="absolute bottom-2 right-2">
          <GestureDetector gesture={addTapGesture}>
            <Animated.View
              accessibilityRole="button"
              accessibilityLabel={`Add ${food.name} to cart`}
              className="w-8 h-8 rounded-full bg-secondary items-center justify-center"
              style={[
                {
                  boxShadow: "0px 2px 6px rgba(38,43,51,0.25)",
                },
                addAnimatedStyle,
              ]}
            >
              <HugeiconsIcon icon={Add01Icon} size={16} color="#FFFFFF" strokeWidth={2.5} />
            </Animated.View>
          </GestureDetector>
        </View>
      </View>

      {/* Details */}
      <View className="p-3 justify-between flex-1">
        <View>
          <Text
            numberOfLines={1}
            className="text-[14px] leading-5 font-title text-secondary"
          >
            {food.name}
          </Text>

          {showRestaurantName && restaurantName ? (
            <Text
              numberOfLines={1}
              className="mt-0.5 text-[11px] text-text-gray font-label"
            >
              {restaurantName}
            </Text>
          ) : null}
        </View>

        <Text className="mt-2 text-[15px] font-numeric text-secondary tabular-nums">
          ₦{food.price.toLocaleString()}
        </Text>
      </View>
    </Pressable>
  );
}

export default memo(FoodCard);
