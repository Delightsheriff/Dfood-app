import { ButtonText } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import {
  ProgressiveBlurFooter,
  useProgressiveBlurScroll,
} from "@/components/ui/progressive-blur";
import { ScreenHeader } from "@/components/ui/screen-header";
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
  Share,
  Text,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCENT = "#E0533A";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const HERO_HEIGHT = SCREEN_HEIGHT * 0.42;

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 bg-surface-muted p-3.5 rounded-2xl" style={{ borderCurve: "continuous" }}>
      <Text className="text-[10px] text-text-gray font-caption uppercase tracking-wider">
        {label}
      </Text>
      <Text className="mt-1 text-[15px] font-numeric text-secondary font-semibold">{value}</Text>
    </View>
  );
}

function ingredientThumbUrl(name: string): string {
  return `https://www.themealdb.com/images/ingredients/${encodeURIComponent(name)}.png/small`;
}

export default function FoodDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { scrollY, onScroll } = useProgressiveBlurScroll();

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

  const heroAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [-150, 0, 300],
          [-75, 0, 90],
          Extrapolation.CLAMP,
        ),
      },
      {
        scale: interpolate(
          scrollY.value,
          [-150, 0],
          [1.3, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
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

  const handleAddToCart = () => {
    if (!food) return;

    if (currentRestaurantId && restaurant && currentRestaurantId !== restaurant._id) {
      Alert.alert(
        "Start new basket?",
        "You already have items from another restaurant in your cart. Adding this item will clear your current cart.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Start New Basket",
            style: "destructive",
            onPress: () => {
              addToCart({
                foodItem: food,
                quantity,
                restaurantId: restaurant?._id || "local",
                restaurantName: restaurant?.name || "Local Kitchen",
              });
              router.push("/(app)/cart");
            },
          },
        ],
      );
      return;
    }

    addToCart({
      foodItem: food,
      quantity,
      restaurantId: restaurant?._id || "local",
      restaurantName: restaurant?.name || "Local Kitchen",
    });
    router.push("/(app)/cart");
  };

  const addToCartTap = Gesture.Tap()
    .runOnJS(true)
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

  if (foodLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  if (!food) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-lg font-title text-secondary mb-2">
          Food item not found
        </Text>
        <Text className="text-xs font-body text-text-gray mb-6 text-center">
          The requested dish might no longer be available.
        </Text>
        <IconButton
          icon={MinusSignIcon}
          accessibilityLabel="Go back"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  const totalPrice = food.price * quantity;

  const stats: { label: string; value: string }[] = [
    { label: "Rating", value: `${food.rating} ★` },
    { label: "Reviews", value: `${food.totalReviews}+` },
    ...(food.calories
      ? [{ label: "Calories", value: `${food.calories} kcal` }]
      : [{ label: "Prep Time", value: "15–20 min" }]),
  ];

  const ingredients = food.ingredients;

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader
        variant="detail"
        title={food.name}
        scrollY={scrollY}
        rightElement={
          <View className="flex-row gap-2">
            <IconButton
              icon={HeartIcon}
              accessibilityLabel={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
              filled={isFavorite}
              fillColor={ACCENT}
              color={isFavorite ? ACCENT : "#262B33"}
              disabled={
                addFavoriteMutation.isPending || removeFavoriteMutation.isPending
              }
              onPress={handleToggleFavorite}
            />
            <IconButton
              icon={Share01Icon}
              accessibilityLabel="Share food item"
              onPress={handleShare}
            />
          </View>
        }
      />

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
        }}
      >
        <Animated.View style={[{ height: HERO_HEIGHT }, heroAnimatedStyle]}>
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

          <LinearGradient
            pointerEvents="none"
            colors={["rgba(0,0,0,0.4)", "rgba(0,0,0,0)"]}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: insets.top + 96,
            }}
          />

          {food.images.length > 1 && (
            <View className="absolute bottom-6 left-0 right-0 flex-row justify-center items-center gap-2">
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
        </Animated.View>

        <View className="px-5 pt-5 bg-white">
          {food.categories?.[0] && (
            <View className="self-start bg-surface-muted rounded-full px-3 py-1 mb-2">
              <Text className="text-[11px] font-caption text-secondary uppercase tracking-wider font-semibold">
                {food.categories[0]}
              </Text>
            </View>
          )}

          <Text className="text-[28px] leading-8 font-display text-secondary tracking-tight">
            {food.name}
          </Text>

          <View
            className={cn(
              "flex-row items-center mt-2.5",
              restaurant?.osmId ? "justify-between" : "gap-3",
            )}
          >
            {restaurant?.osmId && (
              <Text className="text-xs font-label uppercase tracking-wide text-text-gray">
                By {restaurant.name}
              </Text>
            )}
            <View className="flex-row items-center gap-1.5">
              <HugeiconsIcon icon={StarIcon} size={14} color={ACCENT} fill={ACCENT} />
              <Text className="text-sm font-numeric text-secondary font-medium">
                {food.rating}
              </Text>
              <Text className="text-sm font-numeric text-text-gray">
                ({food.totalReviews})
              </Text>
            </View>
          </View>

          <View className="h-[1px] bg-gray-100 mt-5" />

          <View className="flex-row justify-between gap-3 mt-5">
            {stats.map((stat) => (
              <Stat key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </View>

          <Text className="mt-6 text-[15px] leading-6 font-body text-text-gray">
            {food.description}
          </Text>

          {ingredients && ingredients.length > 0 && (
            <View className="mt-8">
              <Text className="mb-3 text-lg font-title text-secondary">
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
                        className="text-xs font-label text-secondary"
                      >
                        {item.name}
                      </Text>
                      <Text
                        numberOfLines={1}
                        className="mt-0.5 text-[11px] font-body text-text-gray"
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
        </View>
      </Animated.ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 z-30"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <ProgressiveBlurFooter
          barHeight={74}
          zIndex={1}
          style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
        />
        <View className="px-5 pt-3 flex-row items-center gap-3" style={{ zIndex: 2 }}>
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
            <Text className="min-w-[40px] text-center text-base font-numeric text-secondary">
              {quantity}
            </Text>
            <IconButton
              icon={Add01Icon}
              accessibilityLabel="Increase quantity"
              onPress={() => setQuantity(quantity + 1)}
              className="bg-transparent shadow-none"
            />
          </View>

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
              <ButtonText className="font-label text-[15px]">
                Add to Cart
              </ButtonText>
              <ButtonText className="font-numeric text-[15px]">
                ₦{totalPrice.toLocaleString()}
              </ButtonText>
            </Animated.View>
          </GestureDetector>
        </View>
      </View>
    </View>
  );
}
