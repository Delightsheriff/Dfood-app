import { ButtonText } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { useCheckFavorite, useFoodItem } from "@/hooks/useDataQueries";
import {
  useAddFavorite,
  useRemoveFavorite,
} from "@/hooks/useFavoriteMutations";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  Add01Icon,
  ArrowLeft01Icon,
  HeartIcon,
  MinusSignIcon,
  Share01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCENT = "#E0533A";
const INK = "#262B33";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
// Full-bleed hero filling roughly the top 40-45% of the screen.
const HERO_HEIGHT = SCREEN_HEIGHT * 0.42;

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1">
      <Text className="text-[11px] text-text-gray font-sen uppercase tracking-wider">
        {label}
      </Text>
      <Text className="mt-1 text-lg font-sen-bold text-secondary">{value}</Text>
    </View>
  );
}

// TheMealDB serves ingredient photography at this fixed path, sized via a
// suffix on the image URL (same convention as strMealThumb).
function ingredientThumbUrl(name: string): string {
  return `https://www.themealdb.com/images/ingredients/${encodeURIComponent(name)}.png/small`;
}

export default function FoodDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

  const addToCartPressed = useSharedValue(0);
  const addToCartStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(addToCartPressed.get(), [0, 1], [1, 0.97]) },
    ],
    opacity: interpolate(addToCartPressed.get(), [0, 1], [1, 0.9]),
  }));

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

  const handleShare = () => {
    if (!food) return;
    Share.share({ message: food.name });
  };

  if (foodLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={ACCENT} />
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

  const addToCartTap = Gesture.Tap()
    .runOnJS(true)
    .enabled(!!restaurant)
    .onBegin(() => {
      addToCartPressed.set(1);
    })
    .onFinalize(() => {
      addToCartPressed.set(0);
    })
    .onEnd((_event, success) => {
      if (success) {
        handleAddToCart();
      }
    });

  const stats: { label: string; value: string }[] = [
    { label: "Rating", value: String(food.rating) },
    ...(food.calories
      ? [{ label: "Calories", value: String(food.calories) }]
      : []),
    { label: "Price", value: `₦${food.price.toLocaleString()}` },
    ...(food.categories?.[0]
      ? [{ label: "Category", value: food.categories[0] }]
      : []),
  ];

  const ingredients = food.ingredients;

  return (
    <View className="flex-1 bg-white">
      {/* Hero image carousel, edge to edge */}
      <View style={{ height: HERO_HEIGHT }}>
        <Carousel
          loop={false}
          width={SCREEN_WIDTH}
          height={HERO_HEIGHT}
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

        {/* Subtle top scrim so the status bar and icon buttons stay legible
            over any photo, regardless of how bright it is. */}
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(0,0,0,0.35)", "rgba(0,0,0,0)"]}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: insets.top + 96,
          }}
        />

        {/* Floating icon buttons, safe-area aware */}
        <View
          className="absolute flex-row items-center justify-between px-4"
          style={{ top: insets.top + 8, left: 0, right: 0 }}
        >
          <IconButton
            icon={ArrowLeft01Icon}
            accessibilityLabel="Go back"
            onPress={() => router.back()}
          />
          <View className="flex-row gap-2">
            <IconButton
              icon={HeartIcon}
              accessibilityLabel={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
              filled={isFavorite}
              fillColor={ACCENT}
              color={isFavorite ? ACCENT : INK}
              disabled={
                addFavoriteMutation.isPending || removeFavoriteMutation.isPending
              }
              onPress={handleToggleFavorite}
            />
            <IconButton
              icon={Share01Icon}
              accessibilityLabel="Share"
              onPress={handleShare}
            />
          </View>
        </View>

        {/* Pagination dots */}
        {food.images.length > 1 && (
          <View className="absolute bottom-10 left-0 right-0 flex-row justify-center items-center gap-2">
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

      {/* Content sheet overlapping the hero's bottom edge */}
      <View
        className="flex-1 bg-white -mt-[30px] rounded-t-[32px]"
        style={{ borderCurve: "continuous" }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 28,
            paddingBottom: 28,
          }}
        >
          {/* Name */}
          <Text className="text-[26px] leading-8 font-sen-extra-bold text-secondary">
            {food.name}
          </Text>

          {/* Rating row — the one place the accent color does its job */}
          <View className="flex-row items-center gap-1.5 mt-2.5">
            <HugeiconsIcon icon={StarIcon} size={15} color={ACCENT} fill={ACCENT} />
            <Text className="text-sm font-sen-bold text-secondary">
              {food.rating}
            </Text>
            <Text className="text-sm font-sen text-text-gray">
              ({food.totalReviews} reviews)
            </Text>
          </View>

          {/* Stat grid, evenly spaced, no dividers */}
          <View className="flex-row justify-between gap-4 mt-8">
            {stats.map((stat) => (
              <Stat key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </View>

          {/* Description */}
          <Text className="mt-8 text-[15px] leading-6 font-sen text-text-gray">
            {food.description}
          </Text>

          {/* Ingredients — real TheMealDB thumbnails, not text-only chips */}
          {ingredients && ingredients.length > 0 && (
            <View className="mt-8">
              <Text className="mb-3 text-lg font-sen-extra-bold text-secondary">
                Ingredients
              </Text>
              <FlashList
                horizontal
                data={ingredients}
                keyExtractor={(item) => item.name}
                renderItem={({ item }) => (
                  <View
                    className="w-[104px] bg-surface-muted rounded-[18px] overflow-hidden"
                    style={{ borderCurve: "continuous" }}
                  >
                    <Image
                      source={{ uri: ingredientThumbUrl(item.name) }}
                      style={{ width: "100%", height: 72 }}
                      contentFit="cover"
                      transition={150}
                    />
                    <View className="px-2.5 py-2">
                      <Text
                        numberOfLines={1}
                        className="text-xs font-sen-bold text-secondary"
                      >
                        {item.name}
                      </Text>
                      <Text
                        numberOfLines={1}
                        className="mt-0.5 text-[11px] font-sen text-text-gray"
                      >
                        {item.measure}
                      </Text>
                    </View>
                  </View>
                )}
                ItemSeparatorComponent={() => <View className="w-2.5" />}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          )}
        </ScrollView>
      </View>

      {/* Sticky bottom bar */}
      <View
        className="bg-white px-5 pt-3"
        style={{
          paddingBottom: insets.bottom + 12,
          boxShadow: "0px -4px 16px rgba(0,0,0,0.06)",
        }}
      >
        <View className="flex-row items-center gap-3">
          {/* Quantity stepper */}
          <View
            className="flex-row items-center bg-surface-muted rounded-[16px]"
            style={{ borderCurve: "continuous" }}
          >
            <IconButton
              icon={MinusSignIcon}
              accessibilityLabel="Decrease quantity"
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="bg-transparent shadow-none"
            />
            <Text className="min-w-[40px] text-center text-base font-sen-extra-bold text-secondary">
              {quantity}
            </Text>
            <IconButton
              icon={Add01Icon}
              accessibilityLabel="Increase quantity"
              onPress={() => setQuantity(quantity + 1)}
              className="bg-transparent shadow-none"
            />
          </View>

          {/* Add to Cart pill with live total */}
          <GestureDetector gesture={addToCartTap}>
            <Animated.View
              accessibilityRole="button"
              accessibilityLabel="Add to cart"
              className={cn(
                "h-14 flex-1 flex-row items-center justify-center gap-2 bg-secondary rounded-full",
                !restaurant && "opacity-50",
              )}
              style={addToCartStyle}
            >
              <ButtonText className="font-sen-bold text-[15px]">
                Add to Cart
              </ButtonText>
              <ButtonText className="font-sen-extra-bold text-[15px]">
                ₦{totalPrice.toLocaleString()}
              </ButtonText>
            </Animated.View>
          </GestureDetector>
        </View>
      </View>
    </View>
  );
}
