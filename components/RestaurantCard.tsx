import { IconButton } from "@/components/ui/icon-button";
import { deliveryTimeForRestaurant } from "@/lib/adapters/restaurant";
import { Restaurant } from "@/types/api";
import {
  Bookmark02Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Image } from "expo-image";
import { memo, useState } from "react";
import { Pressable, Text, View } from "react-native";

const ACCENT = "#E0533A";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
  variant?: "full" | "compact";
}

function RestaurantCard({
  restaurant,
  onPress,
  variant = "full",
}: RestaurantCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const isCurrentlyOpen = restaurant.isOpen ?? restaurant.status !== "Closed";

  const cuisineText =
    restaurant.cuisineTags && restaurant.cuisineTags.length > 0
      ? restaurant.cuisineTags
          .slice(0, 3)
          .map((tag) => tag.charAt(0).toUpperCase() + tag.slice(1))
          .join(" • ")
      : restaurant.description || "Fresh Food • Fast Delivery";

  const deliveryFeeText =
    restaurant.deliveryFee === 0 ? "Free delivery" : `₦${restaurant.deliveryFee.toLocaleString()}`;

  const isCompact = variant === "compact";
  const deliveryTime = deliveryTimeForRestaurant(restaurant._id || restaurant.name);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${restaurant.name}, rating ${restaurant.rating}`}
      className={`bg-white rounded-[20px] overflow-hidden ${
        isCompact ? "w-[240px] mr-3.5" : "w-full mb-4"
      }`}
      style={{
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: "#F0EFEB",
        boxShadow: "0px 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      {/* Image container */}
      <View className="relative w-full overflow-hidden">
        <Image
          source={{ uri: restaurant.images[0] }}
          style={{ width: "100%", height: isCompact ? 130 : 168 }}
          contentFit="cover"
          transition={150}
          recyclingKey={restaurant._id}
        />

        {/* Rating pill top-left */}
        <View
          className="absolute top-2.5 left-2.5 flex-row items-center gap-1 bg-white/95 px-2.5 py-1 rounded-full"
          style={{
            borderCurve: "continuous",
            boxShadow: "0px 2px 6px rgba(0,0,0,0.08)",
          }}
        >
          <HugeiconsIcon icon={StarIcon} size={13} color={ACCENT} fill={ACCENT} />
          <Text className="text-xs font-numeric text-secondary">
            {restaurant.rating?.toFixed(1) || "4.5"}
          </Text>
          {restaurant.totalReviews ? (
            <Text className="text-[10px] font-label text-text-gray">
              ({restaurant.totalReviews})
            </Text>
          ) : null}
        </View>

        {/* Bookmark/Favorite button top-right */}
        <View className="absolute top-2.5 right-2.5">
          <IconButton
            icon={Bookmark02Icon}
            accessibilityLabel="Bookmark restaurant"
            size={16}
            className="h-9 w-9 rounded-xl"
            filled={isBookmarked}
            fillColor={ACCENT}
            color={isBookmarked ? ACCENT : "#262B33"}
            onPress={() => setIsBookmarked((prev) => !prev)}
          />
        </View>

        {/* Closed bottom status strip with actionable opening time */}
        {!isCurrentlyOpen && (
          <View className="absolute bottom-0 left-0 right-0 bg-[#1A1D23]/85 px-2.5 py-1 flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <View className="w-1.5 h-1.5 rounded-full bg-[#FF7E67]" />
              <Text className="text-white font-caption text-[10px] uppercase tracking-wider font-semibold">
                Closed
              </Text>
            </View>
            <Text className="text-white/90 font-numeric text-[10px]">
              {restaurant.openingTime ? `Opens ${restaurant.openingTime}` : "Opens 9:00 AM"}
            </Text>
          </View>
        )}
      </View>

      {/* Details container */}
      <View className="p-3.5">
        <Text
          numberOfLines={1}
          className="text-[16px] leading-5 font-title text-secondary"
        >
          {restaurant.name}
        </Text>

        <Text
          numberOfLines={1}
          className="mt-1 text-xs font-body text-text-gray"
        >
          {cuisineText}
        </Text>

        {/* Meta row: Delivery time • Delivery fee */}
        <View className="mt-2.5 flex-row items-center gap-1.5">
          <Text className="text-[12px] font-numeric text-secondary">
            {deliveryTime}
          </Text>
          <Text className="text-[12px] font-body text-text-gray/50">•</Text>
          <Text className="text-[12px] font-label text-text-gray">
            {deliveryFeeText}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default memo(RestaurantCard);
