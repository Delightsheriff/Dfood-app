import RestaurantCard from "@/components/RestaurantCard";
import SearchBar from "@/components/SearchBar";
import { IconButton } from "@/components/ui/icon-button";
import { ScreenHeader } from "@/components/ui/screen-header";
import {
  useProgressiveBlurHeaderHeight,
  useProgressiveBlurScroll,
} from "@/components/ui/progressive-blur";
import {
  useCategories,
  useDefaultAddress,
  useRestaurants,
} from "@/hooks/useDataQueries";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { matchesCategory } from "@/lib/adapters/categories";
import { getGreeting } from "@/lib/greeting";
import { useCartStore } from "@/store/cartStore";
import { Category } from "@/types/api";
import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  Location01Icon,
  Notification02Icon,
  ShoppingBag01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCENT = "#E0533A";
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BANNER_HEIGHT = 168;

const ALL_CATEGORY: Category = {
  _id: "all",
  name: "All",
  image: "https://www.themealdb.com/images/category/miscellaneous.png",
  createdAt: "",
  updatedAt: "",
};

type FilterType = "all" | "open" | "free_delivery" | "top_rated" | "nearby";

const PROMO_SLIDES = [
  {
    id: "1",
    tag: "SPECIAL OFFER",
    title: "Free Delivery on Your 1st Order",
    subtitle: "Use code WELCOME at checkout",
    image: "https://www.themealdb.com/images/media/meals/urzj1d1587670726.jpg",
  },
  {
    id: "2",
    tag: "POPULAR PICKS",
    title: "Up to 25% Off Top Cuisines",
    subtitle: "Taste the finest artisan pizza & grills",
    image: "https://www.themealdb.com/images/media/meals/x0lk931587671470.jpg",
  },
  {
    id: "3",
    tag: "LIGHTNING FAST",
    title: "Delivered in Under 30 Mins",
    subtitle: "Hot & fresh meals straight to your doorstep",
    image: "https://www.themealdb.com/images/media/meals/1529446352.jpg",
  },
];

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { scrollY, onScroll } = useProgressiveBlurScroll();
  const headerHeight = useProgressiveBlurHeaderHeight(56);
  const reduceMotion = useReducedMotion();
  const cartBadgeScale = useSharedValue(1);

  // Queries
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    refetch: refetchCategories,
  } = useCategories();

  const {
    data: restaurantsData,
    isLoading: restaurantsLoading,
    error: restaurantsError,
    refetch: refetchRestaurants,
  } = useRestaurants();

  const { data: defaultAddressData } = useDefaultAddress();
  const defaultAddress = defaultAddressData?.data.address;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchCategories(), refetchRestaurants()]);
    setIsRefreshing(false);
  };

  const categories = useMemo(() => {
    const list = categoriesData?.data.categories || [];
    return [ALL_CATEGORY, ...list];
  }, [categoriesData]);

  const rawRestaurants = useMemo(
    () => restaurantsData?.data.restaurants || [],
    [restaurantsData],
  );

  // Client-side filtering by category and filter pill
  const filteredRestaurants = useMemo(() => {
    let result = rawRestaurants;

    // Filter by category
    if (selectedCategoryId !== "all") {
      result = result.filter((r) =>
        matchesCategory(r.cuisineTags, selectedCategoryId),
      );
    }

    // Filter by filter pill
    switch (selectedFilter) {
      case "open":
        result = result.filter(
          (r) => r.isOpen !== false && r.status !== "Closed",
        );
        break;
      case "free_delivery":
        result = result.filter((r) => r.deliveryFee === 0);
        break;
      case "top_rated":
        result = result.filter((r) => r.rating >= 4.5);
        break;
      case "nearby":
        // Already sorted by distance in data adapter
        break;
      case "all":
      default:
        break;
    }

    return result;
  }, [rawRestaurants, selectedCategoryId, selectedFilter]);

  // Fastest restaurants for the horizontal rail
  const fastestRestaurants = useMemo(() => {
    return rawRestaurants
      .filter((r) => r.isOpen !== false && r.status !== "Closed")
      .slice(0, 6);
  }, [rawRestaurants]);

  const greeting = getGreeting();
  const cartItemCount = useCartStore((state) => state.getItemCount());

  useEffect(() => {
    if (cartItemCount > 0 && !reduceMotion) {
      cartBadgeScale.value = withSequence(
        withTiming(1.35, { duration: 140 }),
        withSpring(1, { damping: 9, stiffness: 220 }),
      );
    } else {
      cartBadgeScale.value = 1;
    }
  }, [cartItemCount, reduceMotion, cartBadgeScale]);

  const cartBadgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cartBadgeScale.value }],
  }));

  const filterOptions: { id: FilterType; label: string }[] = [
    { id: "all", label: "All" },
    { id: "open", label: "Open now" },
    { id: "free_delivery", label: "Free delivery" },
    { id: "top_rated", label: "Top rated" },
    { id: "nearby", label: "Nearby" },
  ];

  if (
    (categoriesLoading || restaurantsLoading) &&
    !categoriesData &&
    !restaurantsData
  ) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  const renderHeader = () => (
    <View className="pb-4">
      {/* Greeting */}
      <View className="px-5 mt-2 mb-3">
        <Text className="text-2xl font-display text-secondary">
          {greeting}
        </Text>
      </View>

      {/* 2. Tappable Search Bar */}
      <View className="px-5 mb-5">
        <SearchBar onPress={() => router.push("/search")} />
      </View>

      {/* 3. Promo Banner Carousel — The One Loud Moment */}
      <View className="mb-6">
        <Carousel
          loop
          width={SCREEN_WIDTH}
          height={BANNER_HEIGHT}
          autoPlay
          autoPlayInterval={4000}
          data={PROMO_SLIDES}
          onSnapToItem={(index) => setActiveBannerIndex(index)}
          renderItem={({ item }) => (
            <View className="px-5 w-full h-full">
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 22,
                  borderCurve: "continuous",
                  overflow: "hidden",
                  position: "relative",
                  boxShadow: "0px 4px 16px rgba(0,0,0,0.12)",
                }}
              >
                {/* Background food photography from TheMealDB */}
                <Image
                  source={{ uri: item.image }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: "100%",
                    height: "100%",
                  }}
                  contentFit="cover"
                  transition={200}
                />

                {/* Dark bottom-up scrim gradient for legibility */}
                <LinearGradient
                  colors={[
                    "rgba(18,20,24,0.2)",
                    "rgba(18,20,24,0.55)",
                    "rgba(18,20,24,0.92)",
                  ]}
                  locations={[0, 0.45, 1]}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: "100%",
                    height: "100%",
                  }}
                />

                {/* Content Overlay */}
                <View
                  style={{
                    padding: 18,
                    justifyContent: "space-between",
                    height: "100%",
                  }}
                >
                  <View className="flex-row items-center gap-1.5 self-start bg-black/40 px-2.5 py-1 rounded-full border border-white/20">
                    <HugeiconsIcon
                      icon={SparklesIcon}
                      size={12}
                      color="#FFFFFF"
                    />
                    <Text className="text-[10px] font-caption text-white tracking-wider">
                      {item.tag}
                    </Text>
                  </View>

                  <View>
                    <Text className="text-[19px] leading-6 font-display text-white max-w-[280px]">
                      {item.title}
                    </Text>
                    <Text className="text-[12px] font-body text-white/85 mt-1">
                      {item.subtitle}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        />

        {/* Paginator dots */}
        <View className="flex-row justify-center items-center gap-1.5 mt-2.5">
          {PROMO_SLIDES.map((_, index) => (
            <View
              key={index}
              className={`rounded-full ${
                index === activeBannerIndex
                  ? "w-5 h-1.5 bg-primary"
                  : "w-1.5 h-1.5 bg-surface-muted"
              }`}
            />
          ))}
        </View>
      </View>

      {/* 4. Category Rail */}
      <View className="mb-5">
        <View className="flex-row justify-between items-center px-5 mb-3">
          <Text className="text-[18px] font-title text-secondary">
            Categories
          </Text>
          <Pressable
            onPress={() => router.push("/(app)/categories")}
            className="flex-row items-center gap-1"
          >
            <Text className="text-xs font-label text-primary">See all</Text>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={12}
              color={ACCENT}
            />
          </Pressable>
        </View>

        <FlashList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          renderItem={({ item }) => {
            const isSelected = selectedCategoryId === item._id;
            return (
              <Pressable
                onPress={() => setSelectedCategoryId(item._id)}
                className="items-center mr-4"
              >
                <View
                  className={`w-16 h-16 rounded-[20px] items-center justify-center ${
                    isSelected
                      ? "bg-[#FFF5F3] border-2 border-primary"
                      : "bg-surface-muted border border-transparent"
                  }`}
                  style={{
                    borderCurve: "continuous",
                    boxShadow: isSelected
                      ? "0px 2px 8px rgba(224,83,58,0.25)"
                      : "none",
                  }}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={{ width: 36, height: 36 }}
                    contentFit="contain"
                    transition={150}
                  />
                </View>
                <Text
                  numberOfLines={1}
                  className={`mt-1.5 text-[11px] text-center ${
                    isSelected
                      ? "font-label text-primary"
                      : "font-body text-secondary"
                  }`}
                >
                  {item.name}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* 5. Filter Pills */}
      <View className="mb-6">
        <FlashList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterOptions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          renderItem={({ item }) => {
            const isSelected = selectedFilter === item.id;
            return (
              <Pressable
                onPress={() => setSelectedFilter(item.id)}
                className={`mr-2 px-3.5 py-2 rounded-full ${
                  isSelected ? "bg-secondary" : "bg-surface-muted"
                }`}
                style={{ borderCurve: "continuous" }}
              >
                <Text
                  className={`text-xs ${
                    isSelected
                      ? "font-label text-white"
                      : "font-label text-secondary"
                  }`}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* 6. "Fastest near you" horizontal rail */}
      {fastestRestaurants.length > 0 && selectedCategoryId === "all" && (
        <View className="mb-6">
          <View className="flex-row justify-between items-center px-5 mb-3">
            <Text className="text-[18px] font-title text-secondary">
              Fastest Near You
            </Text>
            <Pressable
              onPress={() => router.push("/(app)/restaurants")}
              className="flex-row items-center gap-1"
            >
              <Text className="text-xs font-label text-primary">See all</Text>
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={12}
                color={ACCENT}
              />
            </Pressable>
          </View>

          <FlashList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={fastestRestaurants}
            keyExtractor={(item) => `fastest-${item._id}`}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            renderItem={({ item }) => (
              <RestaurantCard
                restaurant={item}
                variant="compact"
                onPress={() =>
                  router.push({
                    pathname: "/(app)/restaurants/[id]",
                    params: { id: item._id },
                  })
                }
              />
            )}
          />
        </View>
      )}

      {/* 7. "All Restaurants" header */}
      <View className="flex-row justify-between items-center px-5 mb-3">
        <Text className="text-[18px] font-title text-secondary">
          {selectedCategoryId === "all"
            ? "All Restaurants"
            : `${categories.find((c) => c._id === selectedCategoryId)?.name || "Category"} Places`}
        </Text>
        <Text className="text-xs font-numeric text-text-gray">
          {filteredRestaurants.length} {filteredRestaurants.length === 1 ? "place" : "places"}
        </Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <FlashList
        data={filteredRestaurants}
        keyExtractor={(item) => item._id}
        onScroll={onScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <View className="px-5">
            <RestaurantCard
              restaurant={item}
              variant="full"
              onPress={() =>
                router.push({
                  pathname: "/(app)/restaurants/[id]",
                  params: { id: item._id },
                })
              }
            />
          </View>
        )}
        ListEmptyComponent={
          restaurantsLoading ? (
            <View className="py-12 items-center">
              <ActivityIndicator size="small" color={ACCENT} />
              <Text className="text-text-gray font-body text-xs mt-3">
                Finding restaurants near you…
              </Text>
            </View>
          ) : (
            <View className="py-12 px-6 items-center bg-surface-muted mx-5 rounded-[20px]">
              <Text className="text-secondary font-title text-base mb-1">
                No Restaurants Found
              </Text>
              <Text className="text-text-gray font-body text-xs text-center">
                {restaurantsError
                  ? "Couldn't load restaurants. Pull down to try again."
                  : "Try selecting another category or filter."}
              </Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={ACCENT}
          />
        }
        contentContainerStyle={{
          paddingTop: headerHeight + 8,
          paddingBottom: insets.bottom + 32,
        }}
      />

      {/* Progressive Blur Header with Location and Cart */}
      <ScreenHeader variant="large" scrollY={scrollY} barHeight={56}>
        <View className="flex-row items-center justify-between px-5 w-full">
          <Pressable
            onPress={() => router.push("/profile/addresses" as any)}
            className="flex-row items-center flex-1 mr-3"
            accessibilityRole="button"
            accessibilityLabel="Change delivery location"
          >
            <View className="w-10 h-10 rounded-full bg-surface-muted items-center justify-center mr-2.5">
              <HugeiconsIcon icon={Location01Icon} size={20} color={ACCENT} />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-1">
                <Text className="text-[11px] font-caption text-primary uppercase tracking-wider">
                  Deliver To
                </Text>
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  size={12}
                  color={ACCENT}
                />
              </View>
              <Text
                numberOfLines={1}
                className="text-[14px] font-title text-secondary"
              >
                {defaultAddress
                  ? defaultAddress.label || defaultAddress.street
                  : "Set your location"}
              </Text>
            </View>
          </Pressable>

          {/* Action icons: notification + badged cart */}
          <View className="flex-row items-center gap-2">
            <IconButton
              icon={Notification02Icon}
              accessibilityLabel="Notifications"
              size={20}
              className="h-[42px] w-[42px] rounded-[14px]"
              onPress={() => {}}
            />

            <View className="relative">
              <Pressable
                onPress={() => router.push("/cart")}
                accessibilityRole="button"
                accessibilityLabel={`Cart with ${cartItemCount} items`}
                className="w-[42px] h-[42px] rounded-[14px] bg-secondary items-center justify-center"
                style={{
                  borderCurve: "continuous",
                  boxShadow: "0px 2px 8px rgba(38,43,51,0.2)",
                }}
              >
                <HugeiconsIcon
                  icon={ShoppingBag01Icon}
                  size={20}
                  color="#FFFFFF"
                />
              </Pressable>
              {cartItemCount > 0 && (
                <Animated.View
                  style={cartBadgeAnimatedStyle}
                  className="absolute -top-1 -right-1 bg-primary min-w-[18px] h-[18px] rounded-full items-center justify-center border-2 border-white px-1"
                >
                  <Text className="text-white text-[10px] font-numeric">
                    {cartItemCount}
                  </Text>
                </Animated.View>
              )}
            </View>
          </View>
        </View>
      </ScreenHeader>
    </View>
  );
}
