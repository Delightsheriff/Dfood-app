import { IconButton } from "@/components/ui/icon-button";
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
          <Text className="text-xs font-sen-bold text-secondary">
            {restaurant.rating?.toFixed(1) || "4.5"}
          </Text>
          {restaurant.totalReviews ? (
            <Text className="text-[10px] font-sen text-text-gray">
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

        {/* Closed overlay */}
        {!isCurrentlyOpen && (
          <View className="absolute inset-0 bg-black/60 items-center justify-center">
            <View className="bg-white/20 px-4 py-1.5 rounded-full">
              <Text className="text-white font-sen-bold text-xs tracking-wider uppercase">
                Closed
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Details container */}
      <View className="p-3.5">
        <Text
          numberOfLines={1}
          className="text-[16px] leading-5 font-sen-bold text-secondary"
        >
          {restaurant.name}
        </Text>

        <Text
          numberOfLines={1}
          className="mt-1 text-xs font-sen text-text-gray"
        >
          {cuisineText}
        </Text>

        {/* Meta row: 20-30 min • Free delivery • $$ */}
        <View className="mt-2.5 flex-row items-center gap-1.5">
          <Text className="text-[12px] font-sen-medium text-secondary">
            20-30 min
          </Text>
          <Text className="text-[12px] font-sen text-text-gray">•</Text>
          <Text className="text-[12px] font-sen text-text-gray">
            {deliveryFeeText}
          </Text>
          {restaurant.priceLevel && (
            <>
              <Text className="text-[12px] font-sen text-text-gray">•</Text>
              <Text className="text-[12px] font-sen-medium text-text-gray">
                {restaurant.priceLevel}
              </Text>
            </>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default memo(RestaurantCard);
