# Section 01: Onboarding Module Improvement Plan

> **Files Involved:**
> - [`app/onboarding.tsx`](file:///Users/MAC/Documents/Dfood-app/app/onboarding.tsx)
> - [`components/OnboardingItem.tsx`](file:///Users/MAC/Documents/Dfood-app/components/OnboardingItem.tsx)
> - [`components/OnboardingPaginator.tsx`](file:///Users/MAC/Documents/Dfood-app/components/OnboardingPaginator.tsx)
> - [`contexts/AuthContext.tsx`](file:///Users/MAC/Documents/Dfood-app/contexts/AuthContext.tsx)

---

## 🔍 Codebase Audit & "Slop" Analysis

### 1. Duplicated & Generic Copy
- **Issue:** All 3 slides currently use the exact same description text (*"Get all your loved foods in one place..."*).
- **Impact:** Sub-par onboarding experience; gives an unfinished / boilerplate impression to users.

### 2. Layout Jitter & Re-renders via State Updates
- **Issue:** `onViewableItemsChanged` triggers state updates (`setCurrentIndex`) on scroll events. Combined with `useAnimatedScrollHandler` updating `scrollX.value`, JS thread and UI thread are competing.
- **Impact:** Frame drops during fast swipes on lower-end devices.

### 3. Missing Hardware Back Button & Swipe Edge Protection
- **Issue:** Android back button during onboarding allows the user to exit the app or navigate into unauthenticated stack roots without marking onboarding complete.
- **Impact:** Disrupted navigation flow on Android.

### 4. Un-typed Slide Data & Missing Static Asset Declarations
- **Issue:** Slides array is defined inside `app/onboarding.tsx` with untyped objects and inline `require(...)`.
- **Impact:** Lack of dynamic feature configuration, localization support, or schema validation.

---

## 🚀 Expo & React Native Best Practice Upgrades

### A. Expo Router v4 Relative Navigation & Async Storage Sync
- Use `AsyncStorage` via `AuthContext` to persist `@onboarding_completed` atomically before navigation.
- Use `router.replace('/(auth)/signin')` to prevent the user from pressing hardware back to return to onboarding.

### B. Reanimated 3 Worklet Optimization for FlatList
- Use `useSharedValue` and `Extrapolation` from `react-native-reanimated` without forcing React state updates during active drag gestures.
- Decouple active index state from scroll updates by calculating active index strictly upon gesture completion (`onMomentumScrollEnd`).

---

## 🛠 Refactored Architecture & Code Blueprint

### 1. Slide Types & Content System (`types/onboarding.ts`)
```typescript
import { ImageSource } from "expo-image";

export interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: ImageSource;
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: "1",
    title: "ALL YOUR FAVORITES",
    subtitle: "Delicious Meals Delivered",
    description: "Discover top-rated dishes from top local restaurants delivered straight to your doorstep.",
    image: require("@/assets/images/onboarding_1.png"),
  },
  {
    id: "2",
    title: "CRAFTED BY EXPERTS",
    subtitle: "Selected Master Chefs",
    description: "Enjoy gourmet meals prepared by certified culinary experts with fresh ingredients.",
    image: require("@/assets/images/onboarding_2.png"),
  },
  {
    id: "3",
    title: "LIGHTNING FAST DELIVERY",
    subtitle: "Zero Hassle & Live Tracking",
    description: "Track your food order in real-time with instant push notifications and driver maps.",
    image: require("@/assets/images/onboarding_3.png"),
  },
];
```

### 2. Optimized `app/onboarding.tsx` Implementation Blueprint
```tsx
import React, { useRef, useState, useCallback } from "react";
import { View, FlatList, ViewToken } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import OnboardingItem from "@/components/OnboardingItem";
import OnboardingPaginator from "@/components/OnboardingPaginator";
import { ONBOARDING_SLIDES } from "@/types/onboarding";

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleFinish = async () => {
    await completeOnboarding();
    router.replace("/(auth)/signin");
  };

  const handleNext = () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleFinish();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top Bar with Skip */}
      <View className="flex-row justify-end px-6 pt-2">
        {currentIndex < ONBOARDING_SLIDES.length - 1 && (
          <Button
            variant="ghost"
            onPress={handleFinish}
            className="px-4 py-2 rounded-xl bg-gray-100"
          >
            <Text className="text-text-gray font-sen-bold text-xs">Skip</Text>
          </Button>
        )}
      </View>

      {/* Carousel */}
      <View className="flex-1">
        <Animated.FlatList
          ref={flatListRef}
          data={ONBOARDING_SLIDES}
          renderItem={({ item }) => <OnboardingItem item={item} />}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
      </View>

      {/* Footer Controls */}
      <View className="px-6 pb-8">
        <OnboardingPaginator data={ONBOARDING_SLIDES} scrollX={scrollX} />
        <Button
          onPress={handleNext}
          className="h-14 bg-primary rounded-2xl flex-row items-center justify-center shadow-lg"
        >
          <Text className="font-sen-bold uppercase tracking-wider text-white mr-2">
            {currentIndex === ONBOARDING_SLIDES.length - 1 ? "GET STARTED" : "NEXT"}
          </Text>
          <ArrowRight color="white" size={18} />
        </Button>
      </View>
    </SafeAreaView>
  );
}
```

---

## ✅ Verification & Test Plan

1. **First-Launch Test:** Clear application data (`AsyncStorage.clear()`), ensure Onboarding loads automatically.
2. **Persistence Test:** Complete onboarding, restart app via `npx expo start`, verify app directs to `/(auth)/signin` automatically.
3. **Performance Audit:** Verify 60fps gesture rendering using Expo DevTools performance panel without JS thread stalls.
