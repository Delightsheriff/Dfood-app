import RestaurantCard from "@/components/RestaurantCard";
import SearchBar from "@/components/SearchBar";
import { IconButton } from "@/components/ui/icon-button";
import {
  useCategories,
  useDefaultAddress,
  useRestaurants,
} from "@/hooks/useDataQueries";
import { matchesCategory } from "@/lib/adapters/categories";
import { getGreeting } from "@/lib/greeting";
import { useCartStore } from "@/store/cartStore";
import { Category, Restaurant } from "@/types/api";
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
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCENT = "#E0533A";
const INK = "#262B33";
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BANNER_WIDTH = SCREEN_WIDTH - 40;
const BANNER_HEIGHT = 140;

type FilterType = "all" | "open" | "free_delivery" | "top_rated" | "nearby";

const PROMO_SLIDES = [
  {
    id: "1",
    tag: "SPECIAL OFFER",
    title: "Free Delivery on Your 1st Order",
    subtitle: "Use code WELCOME at checkout",
    colors: ["#E0533A", "#B92B15"] as const,
  },
  {
    id: "2",
    tag: "POPULAR PICKS",
    title: "Up to 25% Off Top Cuisines",
    subtitle: "Taste the finest flavors in town",
    colors: ["#262B33", "#121418"] as const,
  },
  {
    id: "3",
    tag: "LIGHTNING FAST",
    title: "Delivered in Under 30 Mins",
    subtitle: "Hot & fresh meals to your doorstep",
    colors: ["#E0533A", "#7C1A0A"] as const,
  },
];

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  // Queries
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    refetch: refetchCategories,
    isRefetching: categoriesRefetching,
  } = useCategories();

  const {
    data: restaurantsData,
    isLoading: restaurantsLoading,
    error: restaurantsError,
    refetch: refetchRestaurants,
    isRefetching: restaurantsRefetching,
  } = useRestaurants();

  const { data: defaultAddressData } = useDefaultAddress();
  const defaultAddress = defaultAddressData?.data.address;

  const isRefreshing = categoriesRefetching || restaurantsRefetching;

  const handleRefresh = async () => {
    await Promise.all([refetchCategories(), refetchRestaurants()]);
  };

  const allCategory: Category = {
    _id: "all",
    name: "All",
    image: "https://www.themealdb.com/images/category/miscellaneous.png",
    createdAt: "",
    updatedAt: "",
  };

  const categories = useMemo(() => {
    const list = categoriesData?.data.categories || [];
    return [allCategory, ...list];
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
      {/* 1. Location Header Row */}
      <View
        className="flex-row items-center justify-between px-5 pt-3 pb-2"
        style={{ paddingTop: insets.top + 4 }}
      >
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
              <Text className="text-[11px] font-sen-bold text-primary uppercase tracking-wider">
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
              className="text-[14px] font-sen-bold text-secondary"
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
              <View className="absolute -top-1 -right-1 bg-primary min-w-[18px] h-[18px] rounded-full items-center justify-center border-2 border-white px-1">
                <Text className="text-white text-[10px] font-sen-bold">
                  {cartItemCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Greeting */}
      <View className="px-5 mt-3 mb-3">
        <Text className="text-2xl font-sen-extra-bold text-secondary">
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
              <LinearGradient
                colors={item.colors as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-full h-full rounded-[22px] p-5 justify-between overflow-hidden"
                style={{ borderCurve: "continuous" }}
              >
                <View>
                  <View className="flex-row items-center gap-1.5 self-start bg-white/20 px-2.5 py-0.5 rounded-full mb-1.5">
                    <HugeiconsIcon
                      icon={SparklesIcon}
                      size={12}
                      color="#FFFFFF"
                    />
                    <Text className="text-[10px] font-sen-bold text-white tracking-wider">
                      {item.tag}
                    </Text>
                  </View>
                  <Text className="text-[18px] leading-6 font-sen-extra-bold text-white max-w-[220px]">
                    {item.title}
                  </Text>
                </View>

                <Text className="text-[12px] font-sen text-white/80">
                  {item.subtitle}
                </Text>
              </LinearGradient>
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
          <Text className="text-[18px] font-sen-bold text-secondary">
            Categories
          </Text>
          <Pressable
            onPress={() => router.push("/(app)/categories")}
            className="flex-row items-center gap-1"
          >
            <Text className="text-xs font-sen-bold text-primary">See all</Text>
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
                onPress={() => {
                  setSelectedCategoryId(item._id);
                }}
                className="items-center mr-3 w-[68px]"
              >
                <View
                  className={`w-14 h-14 rounded-full items-center justify-center overflow-hidden ${
                    isSelected
                      ? "border-2 border-primary bg-white"
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
                      ? "font-sen-bold text-primary"
                      : "font-sen text-secondary"
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
                      ? "font-sen-bold text-white"
                      : "font-sen-medium text-secondary"
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
            <Text className="text-[18px] font-sen-bold text-secondary">
              Fastest Near You
            </Text>
            <Pressable
              onPress={() => router.push("/(app)/restaurants")}
              className="flex-row items-center gap-1"
            >
              <Text className="text-xs font-sen-bold text-primary">See all</Text>
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
        <Text className="text-[18px] font-sen-bold text-secondary">
          {selectedCategoryId === "all"
            ? "All Restaurants"
            : `${categories.find((c) => c._id === selectedCategoryId)?.name || "Category"} Places`}
        </Text>
        <Text className="text-xs font-sen text-text-gray">
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
          <View className="py-12 px-6 items-center bg-surface-muted mx-5 rounded-[20px]">
            <Text className="text-secondary font-sen-bold text-base mb-1">
              No Restaurants Found
            </Text>
            <Text className="text-text-gray font-sen text-xs text-center">
              {restaurantsError
                ? "Couldn't load restaurants. Pull down to try again."
                : "Try selecting another category or filter."}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={ACCENT}
          />
        }
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </View>
  );
}
