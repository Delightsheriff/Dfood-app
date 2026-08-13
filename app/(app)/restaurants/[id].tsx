import FoodCard from "@/components/FoodCard";
import { IconButton } from "@/components/ui/icon-button";
import { useProgressiveBlurScrollForList } from "@/components/ui/progressive-blur";
import { ScreenHeader } from "@/components/ui/screen-header";
import {
  useFoodItemsByRestaurant,
  useRestaurant,
} from "@/hooks/useDataQueries";
import {
  HeartIcon,
  Share01Icon,
  StarIcon,
  Store01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Share,
  Text,
  View,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCENT = "#E0533A";
const INK = "#262B33";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const HERO_HEIGHT = SCREEN_HEIGHT * 0.36;

export default function RestaurantDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeOrderType] = useState<"delivery" | "pickup">("delivery");

  const { scrollY, onScroll } = useProgressiveBlurScrollForList();

  const { data: restaurantData, isLoading: restaurantLoading } =
    useRestaurant(id);
  const { data: foodItemsData, isLoading: foodItemsLoading } =
    useFoodItemsByRestaurant(id);

  const restaurant = restaurantData?.data.restaurant;
  const foodItems = foodItemsData?.data.foodItems || [];

  const handleShare = () => {
    if (!restaurant) return;
    Share.share({
      message: `Check out ${restaurant.name} on Dfood!`,
    });
  };

  if (restaurantLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-text-gray font-body">Restaurant not found</Text>
      </View>
    );
  }

  const primaryCuisine =
    restaurant.cuisineTags && restaurant.cuisineTags.length > 0
      ? restaurant.cuisineTags[0].charAt(0).toUpperCase() +
        restaurant.cuisineTags[0].slice(1)
      : "Dining";

  const renderHeader = () => (
    <View>
      {/* 1. Full-bleed Hero Image Carousel */}
      <View style={{ height: HERO_HEIGHT }} className="relative w-full">
        <Carousel
          loop={false}
          width={SCREEN_WIDTH}
          height={HERO_HEIGHT}
          data={restaurant.images}
          onSnapToItem={(index) => setActiveImageIndex(index)}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              transition={150}
            />
          )}
        />

        {/* Top gradient scrim */}
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(0,0,0,0.4)", "rgba(0,0,0,0)"]}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: insets.top + 80,
          }}
        />

        {/* Pagination dots */}
        {restaurant.images.length > 1 && (
          <View className="absolute bottom-4 left-0 right-0 flex-row justify-center items-center gap-1.5">
            {restaurant.images.map((_, index) => (
              <View
                key={index}
                className={`rounded-full ${
                  index === activeImageIndex
                    ? "w-5 h-1.5 bg-white"
                    : "w-1.5 h-1.5 bg-white/60"
                }`}
              />
            ))}
          </View>
        )}
      </View>

      {/* 2. Restaurant Identity Block — Flat Edge, No Scoop Card */}
      <View className="px-5 pt-5 pb-3">
        {/* Name */}
        <Text className="text-[26px] leading-8 font-display text-secondary">
          {restaurant.name}
        </Text>

        {/* Meta line: 4.5 ★ (120+) · Cuisine · PriceLevel */}
        <View className="flex-row items-center gap-2 mt-2">
          <View className="flex-row items-center gap-1">
            <HugeiconsIcon icon={StarIcon} size={14} color={ACCENT} fill={ACCENT} />
            <Text className="text-sm font-numeric text-secondary">
              {restaurant.rating?.toFixed(1) || "4.5"}
            </Text>
            {restaurant.totalReviews ? (
              <Text className="text-xs font-numeric text-text-gray">
                ({restaurant.totalReviews})
              </Text>
            ) : null}
          </View>
          <Text className="text-xs text-text-gray">•</Text>
          <Text className="text-xs font-label text-text-gray">
            {primaryCuisine}
          </Text>
          {restaurant.priceLevel && (
            <>
              <Text className="text-xs text-text-gray">•</Text>
              <Text className="text-xs font-label text-text-gray">
                {restaurant.priceLevel}
              </Text>
            </>
          )}
        </View>

        {/* Description or address */}
        {restaurant.address && (
          <Text className="mt-2 text-xs font-body text-text-gray" numberOfLines={1}>
            {restaurant.address}
          </Text>
        )}

        {/* 3. Delivery / Pickup Segmented Toggle + Stat Row */}
        <View
          className="mt-5 p-3.5 bg-surface-muted rounded-[18px]"
          style={{ borderCurve: "continuous" }}
        >
          {/* Segmented selector */}
          <View className="flex-row bg-white p-1 rounded-full mb-3">
            <View
              className={`flex-1 py-1.5 rounded-full items-center justify-center ${
                activeOrderType === "delivery" ? "bg-secondary" : ""
              }`}
            >
              <Text
                className={`text-xs font-label ${
                  activeOrderType === "delivery" ? "text-white" : "text-text-gray"
                }`}
              >
                Delivery
              </Text>
            </View>
            <View
              className={`flex-1 py-1.5 rounded-full items-center justify-center ${
                activeOrderType === "pickup" ? "bg-secondary" : ""
              }`}
            >
              <Text
                className={`text-xs font-label ${
                  activeOrderType === "pickup" ? "text-white" : "text-text-gray"
                }`}
              >
                Pickup
              </Text>
            </View>
          </View>

          {/* Stat details */}
          <View className="flex-row justify-between items-center px-2">
            <View className="items-center">
              <Text className="text-[10px] font-caption uppercase tracking-wider text-text-gray">
                Time
              </Text>
              <Text className="text-[13px] font-numeric text-secondary mt-0.5">
                25-35 min
              </Text>
            </View>

            <View className="w-[1px] h-6 bg-gray-200" />

            <View className="items-center">
              <Text className="text-[10px] font-caption uppercase tracking-wider text-text-gray">
                Fee
              </Text>
              <Text className="text-[13px] font-numeric text-secondary mt-0.5">
                {restaurant.deliveryFee === 0
                  ? "Free"
                  : `₦${restaurant.deliveryFee}`}
              </Text>
            </View>

            <View className="w-[1px] h-6 bg-gray-200" />

            <View className="items-center">
              <Text className="text-[10px] font-caption uppercase tracking-wider text-text-gray">
                Status
              </Text>
              <Text
                className={`text-[13px] font-label mt-0.5 ${
                  restaurant.status === "Closed"
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {restaurant.status === "Closed" ? "Closed" : "Open now"}
              </Text>
            </View>
          </View>
        </View>

        {/* 4. Menu Section Title */}
        <View className="mt-7 mb-3 flex-row justify-between items-center">
          <Text className="text-[20px] font-title text-secondary">
            Featured Menu
          </Text>
          <Text className="text-xs font-numeric text-text-gray">
            {foodItems.length} {foodItems.length === 1 ? "item" : "items"}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Pinned Detail Header (Accessible at any scroll position) */}
      <ScreenHeader
        variant="detail"
        title={restaurant.name}
        scrollY={scrollY}
        rightElement={
          <View className="flex-row gap-2">
            <IconButton
              icon={HeartIcon}
              accessibilityLabel="Favorite restaurant"
              filled={isFavorite}
              fillColor={ACCENT}
              color={isFavorite ? ACCENT : INK}
              onPress={() => setIsFavorite((prev) => !prev)}
            />
            <IconButton
              icon={Share01Icon}
              accessibilityLabel="Share restaurant"
              onPress={handleShare}
            />
          </View>
        }
      />

      {foodItemsLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={ACCENT} />
        </View>
      ) : (
        <FlashList
          data={foodItems}
          keyExtractor={(item) => item._id}
          numColumns={2}
          onScroll={onScroll}
          scrollEventThrottle={16}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{
            paddingHorizontal: 14,
            paddingBottom: insets.bottom + 24,
          }}
          renderItem={({ item }) => (
            <View className="px-1.5 flex-1">
              <FoodCard
                food={item}
                restaurantId={restaurant._id}
                restaurantName={restaurant.name}
                onPress={() =>
                  router.push({
                    pathname: "/(app)/food/[id]",
                    params: { id: item._id },
                  })
                }
              />
            </View>
          )}
          ListEmptyComponent={
            <View className="py-12 px-6 items-center bg-surface-muted mx-3 rounded-[20px]">
              <HugeiconsIcon icon={Store01Icon} size={28} color="#646982" />
              <Text className="text-secondary font-title text-base mt-2 mb-1">
                No Menu Items
              </Text>
              <Text className="text-text-gray font-body text-xs text-center">
                This restaurant hasn&apos;t listed menu items yet.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
