import OnboardingItem from "@/components/OnboardingItem";
import OnboardingPaginator from "@/components/OnboardingPaginator";
import { ButtonText } from "@/components/ui/button";
import { useOnboarding } from "@/hooks/useOnboarding";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const slides = [
  {
    id: "1",
    tagline: "DISCOVER",
    title: "Cravings Delivered Fast",
    description:
      "Explore top-rated restaurants and authentic cuisines right in your neighborhood.",
    image: require("../assets/images/onboarding_1.png"),
  },
  {
    id: "2",
    tagline: "ORDER",
    title: "Effortless Ordering",
    description:
      "Customize your favorite dishes, apply promos, and enjoy seamless quick checkout.",
    image: require("../assets/images/onboarding_2.png"),
  },
  {
    id: "3",
    tagline: "TRACK",
    title: "Doorstep Arrival",
    description:
      "Follow your order in real time from the kitchen right to your doorstep.",
    image: require("../assets/images/onboarding_3.png"),
  },
];

const VIEWABILITY_CONFIG = { viewAreaCoveragePercentThreshold: 50 };

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { completeOnboarding } = useOnboarding();
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.set(event.contentOffset.x);
    },
  });

  const handleComplete = async () => {
    try {
      // Optional location priming on final step
      try {
        await Location.requestForegroundPermissionsAsync();
      } catch (locErr) {
        console.log("Location permission skipped:", locErr);
      }
      await completeOnboarding();
      router.replace("/(app)/(tabs)" as any);
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      router.replace("/(app)/(tabs)" as any);
    }
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleComplete();
    }
  };

  const isLast = currentIndex === slides.length - 1;

  return (
    <View className="flex-1 bg-white">
      {/* Skip Button */}
      <View
        className="absolute z-10 right-5 flex-row justify-end"
        style={{ top: insets.top + 10 }}
      >
        <Pressable
          onPress={handleComplete}
          className="px-4 py-2 rounded-full bg-white/80"
          style={{
            borderCurve: "continuous",
            boxShadow: "0px 2px 6px rgba(0,0,0,0.08)",
          }}
        >
          <Text className="text-secondary font-sen-bold text-xs">
            Skip
          </Text>
        </Pressable>
      </View>

      {/* Slides */}
      <View className="flex-1">
        <Animated.FlatList
          ref={flatListRef}
          data={slides}
          renderItem={({ item }) => <OnboardingItem item={item} />}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={VIEWABILITY_CONFIG}
        />
      </View>

      {/* Bottom Controls */}
      <View
        className="px-6"
        style={{ paddingBottom: insets.bottom + 24 }}
      >
        <OnboardingPaginator data={slides} scrollX={scrollX} />

        <Pressable
          onPress={handleNext}
          accessibilityRole="button"
          accessibilityLabel={isLast ? "Get Started" : "Next slide"}
          className="h-14 w-full bg-secondary rounded-full flex-row items-center justify-center gap-2 active:opacity-90"
          style={{
            borderCurve: "continuous",
            boxShadow: "0px 4px 12px rgba(38,43,51,0.2)",
          }}
        >
          <ButtonText className="font-sen-bold text-[15px] text-white">
            {isLast ? "Get Started" : "Next"}
          </ButtonText>
          <HugeiconsIcon icon={ArrowRight01Icon} size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}
