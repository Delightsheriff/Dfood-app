import { Button } from "@/components/ui/button";
import { useCheckFavorite, useFoodItem } from "@/hooks/useDataQueries";
import {
  useAddFavorite,
  useRemoveFavorite,
} from "@/hooks/useFavoriteMutations";
import { useCartStore } from "@/store/cartStore";
import { Image } from "expo-image";
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
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  Text,
  Pressable,
  View,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function FoodDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { data: foodData, isLoading: foodLoading } = useFoodItem(id);
  const { data: favoriteCheck } = useCheckFavorite(id);
  const addFavoriteMutation = useAddFavorite();
  const removeFavoriteMutation = useRemoveFavorite();

  const food = foodData?.data.foodItem;
  const isFavorite = favoriteCheck?.data.isFavorite || false;

  const restaurant =
    food?.restaurantId && typeof food.restaurantId === "object"
      ? food.restaurantId
      : null;

  const addToCart = useCartStore((state) => state.addItem);
  const currentRestaurantId = useCartStore((state) => state.getRestaurantId());

  const handleToggleFavorite = () => {
    if (isFavorite) {
      removeFavoriteMutation.mutate(id, {
        onError: (error: any) => {
          const message =
            error.response?.data?.message || "Failed to remove from favorites";
          Alert.alert("Error", message);
        },
      });
    } else {
      addFavoriteMutation.mutate(id, {
        onError: (error: any) => {
          const message =
            error.response?.data?.message || "Failed to add to favorites";
          Alert.alert("Error", message);
        },
      });
    }
  };

  if (foodLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#FF7622" />
      </View>
    );
  }

  if (!food) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-text-gray font-sen">Food item not found</Text>
      </View>
    );
  }

  const totalPrice = food.price * quantity;

  const handleAddToCart = () => {
    if (!food || !restaurant) return;

    if (currentRestaurantId && currentRestaurantId !== restaurant._id) {
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
                quantity,
                restaurantId: restaurant._id,
                restaurantName: restaurant.name,
              });
              router.back();
            },
          },
        ],
      );
      return;
    }

    addToCart({
      foodItem: food,
      quantity,
      restaurantId: restaurant._id,
      restaurantName: restaurant.name,
    });
    router.back();
  };

  return (
    <View className="flex-1 bg-white">
      {/* Image Carousel */}
      <View className="h-[280px] relative">
        <Carousel
          loop={false}
          width={SCREEN_WIDTH}
          height={280}
          data={food.images}
          onSnapToItem={(index) => setActiveImageIndex(index)}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              className="w-full h-full"
              contentFit="cover"
              style={{ width: "100%", height: "100%" }}
              transition={200}
            />
          )}
        />

        {/* Navigation Buttons */}
        <View className="absolute top-12 left-6 right-6 flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="w-11 h-11 bg-white rounded-2xl items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.12,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            <ChevronLeft color="#181C2E" size={22} />
          </Pressable>

          {/* Favorite Button */}
          <Pressable
            onPress={handleToggleFavorite}
            disabled={
              addFavoriteMutation.isPending || removeFavoriteMutation.isPending
            }
            className="w-11 h-11 bg-white rounded-2xl items-center justify-center"
            style={{
              shadowColor: isFavorite ? "#FF7622" : "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isFavorite ? 0.25 : 0.12,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            {addFavoriteMutation.isPending ||
            removeFavoriteMutation.isPending ? (
              <ActivityIndicator size="small" color="#FF7622" />
            ) : (
              <Heart
                color={isFavorite ? "#FF7622" : "#181C2E"}
                size={20}
                fill={isFavorite ? "#FF7622" : "transparent"}
              />
            )}
          </Pressable>
        </View>

        {/* Pagination Dots */}
        {food.images.length > 1 && (
          <View className="absolute bottom-12 left-0 right-0 flex-row justify-center items-center gap-2">
            {food.images.map((_: string, index: number) => (
              <View
                key={index}
                className={`rounded-full ${
                  index === activeImageIndex
                    ? "w-6 h-2 bg-white"
                    : "w-2 h-2 bg-white/50"
                }`}
              />
            ))}
          </View>
        )}
      </View>

      {/* Content Sheet */}
      <View className="flex-1 bg-white -mt-[30px] rounded-t-[30px]">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 28,
            paddingBottom: 16,
          }}
        >
          {/* Restaurant Badge */}
          {restaurant && (
            <View className="mb-4">
              <View
                className="self-start flex-row items-center bg-[#F0F5FA] rounded-xl px-3.5 py-2"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.04,
                  shadowRadius: 4,
                  elevation: 1,
                }}
              >
                <View className="w-2 h-2 bg-primary rounded-full mr-2" />
                <Text className="text-secondary font-sen text-sm">
                  {restaurant.name}
                </Text>
              </View>
            </View>
          )}

          {/* Food Name & Price Preview */}
          <View className="mb-3">
            <Text className="text-2xl font-sen-extra-bold text-secondary mb-2">
              {food.name}
            </Text>
            <Text className="text-text-gray font-sen text-sm leading-5">
              {food.description}
            </Text>
          </View>

          {/* Info Pills */}
          <View className="flex-row items-center flex-wrap gap-2.5 mb-5">
            <View
              className="flex-row items-center bg-[#FFF5EE] px-3 py-2 rounded-xl"
              style={{ borderWidth: 1, borderColor: "#FFE5D3" }}
            >
              <Star color="#FF7622" size={14} fill="#FF7622" />
              <Text className="ml-1.5 font-sen-bold text-secondary text-sm">
                4.5
              </Text>
            </View>

            {restaurant && (
              <>
                <View className="flex-row items-center bg-[#F0F5FA] px-3 py-2 rounded-xl">
                  <Truck color="#646982" size={14} />
                  <Text className="ml-1.5 font-sen text-secondary text-sm">
                    ₦
                    {restaurant.deliveryFee === 0
                      ? "Free"
                      : restaurant.deliveryFee}
                  </Text>
                </View>

                <View className="flex-row items-center bg-[#F0F5FA] px-3 py-2 rounded-xl">
                  <Clock color="#646982" size={14} />
                  <Text className="ml-1.5 font-sen text-secondary text-sm">
                    {restaurant.openingTime} - {restaurant.closingTime}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Calories */}
          {food.calories && (
            <View className="mb-5">
              <Text className="text-xs text-text-gray font-sen uppercase mb-2 tracking-wide">
                NUTRITIONAL INFO
              </Text>
              <View
                className="flex-row items-center bg-[#FFF5EE] rounded-2xl px-4 py-3.5"
                style={{ borderWidth: 1, borderColor: "#FFE5D3" }}
              >
                <Text className="text-xl mr-2.5">🔥</Text>
                <Text className="text-secondary font-sen-bold text-sm">
                  {food.calories} calories
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Bottom Bar */}
      <View
        className="px-6 py-4 bg-white"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-[10px] text-text-gray font-sen uppercase tracking-widest mb-0.5">
              TOTAL PRICE
            </Text>
            <Text className="text-2xl font-sen-extra-bold text-primary">
              ₦{totalPrice.toLocaleString()}
            </Text>
          </View>

          <View className="flex-row items-center bg-[#F0F5FA] rounded-2xl">
            <Pressable
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-11 h-11 items-center justify-center"
            >
              <Minus color="#181C2E" size={18} />
            </Pressable>

            <Text className="text-secondary font-sen-extra-bold text-lg px-4 min-w-[40px] text-center">
              {quantity}
            </Text>

            <Pressable
              onPress={() => setQuantity(quantity + 1)}
              className="w-11 h-11 bg-primary rounded-xl items-center justify-center"
            >
              <Plus color="white" size={18} />
            </Pressable>
          </View>
        </View>

        <Button
          className="w-full h-14"
          onPress={handleAddToCart}
          disabled={!restaurant}
          style={{
            shadowColor: "#FF7622",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: restaurant ? 0.3 : 0,
            shadowRadius: 8,
            elevation: restaurant ? 6 : 0,
          }}
        >
          <Text className="text-white font-sen-bold text-[14px] uppercase tracking-wider">
            ADD TO CART
          </Text>
        </Button>
      </View>
    </View>
  );
}
