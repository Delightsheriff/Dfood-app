# Section 03: Home & Categories Module Improvement Plan

> **Files Involved:**
> - [`app/(app)/index.tsx`](file:///Users/MAC/Documents/Dfood-app/app/(app)/index.tsx)
> - [`app/(app)/categories/index.tsx`](file:///Users/MAC/Documents/Dfood-app/app/(app)/categories/index.tsx)
> - [`app/(app)/categories/[id].tsx`](file:///Users/MAC/Documents/Dfood-app/app/(app)/categories/[id].tsx)
> - [`components/CategoryItem.tsx`](file:///Users/MAC/Documents/Dfood-app/components/CategoryItem.tsx)
> - [`components/RestaurantCard.tsx`](file:///Users/MAC/Documents/Dfood-app/components/RestaurantCard.tsx)
> - [`components/SearchBar.tsx`](file:///Users/MAC/Documents/Dfood-app/components/SearchBar.tsx)

---

## 🔍 Codebase Audit & "Slop" Analysis

### 1. Nested List Virtualization Failure (`app/(app)/index.tsx`)
```tsx
// ❌ SLOP PATTERN: Mapping array inside ScrollView disables list item recycling
<ScrollView>
  ...
  {restaurants.map((restaurant) => (
    <RestaurantCard key={restaurant._id} restaurant={restaurant} />
  ))}
</ScrollView>
```
- **Why it's Slop:** Instantiates DOM/native nodes for ALL restaurants simultaneously, wasting memory and causing frame drops on longer lists.
- **Fix:** Refactor home screen to use a single `FlatList` where categories, header, search bar, and greetings are contained in `ListHeaderComponent`.

### 2. Broken Refresh Control State
```typescript
// ❌ SLOP PATTERN: Hardcoded boolean prevents pull-to-refresh spinner feedback
const isRefreshing = false;
```
- **Fix:** Connect `isRefreshing` to React Query's `isRefetching` property:
```typescript
const isRefreshing = isCategoriesRefetching || isRestaurantsRefetching;
```

### 3. Missing Skeleton Screens & Layout Shift
- **Issue:** Uses a generic centered `<ActivityIndicator />` while fetching data. When data arrives, UI elements pop into view abruptly.
- **Fix:** Create `CategorySkeleton` and `RestaurantCardSkeleton` using `react-native-reanimated` pulse effect.

### 4. Direct Remote Image Loads Without Placeholders (`CategoryItem.tsx`)
- **Issue:** Loads raw URLs without memory/disk caching, memory size bounds, or smooth fade-ins.
- **Fix:** Use `expo-image` with `placeholder` memory hash, `transition={300}`, and `cachePolicy="memory-disk"`.

---

## 🚀 Expo & React Native Best Practice Upgrades

### A. High Performance Unified `FlatList` Architecture
```tsx
export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: categoriesData, isLoading: isCatLoading, refetch: refetchCat, isRefetching: isCatRefetching } = useCategories();
  const { data: restaurantsData, isLoading: isRestLoading, refetch: refetchRest, isRefetching: isRestRefetching } = useRestaurants();

  const isRefreshing = isCatRefetching || isRestRefetching;

  const handleRefresh = async () => {
    await Promise.all([refetchCat(), refetchRest()]);
  };

  const restaurants = restaurantsData?.data.restaurants || [];
  const categories = categoriesData?.data.categories || [];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View className="px-6 mb-4">
            <RestaurantCard
              restaurant={item}
              onPress={() => router.push({ pathname: "/(app)/restaurants/[id]", params: { id: item._id } })}
            />
          </View>
        )}
        ListHeaderComponent={
          <HomeHeader
            user={user}
            categories={categories}
            isCategoriesLoading={isCatLoading}
          />
        }
        ListEmptyComponent={
          isRestLoading ? (
            <RestaurantSkeletonList />
          ) : (
            <EmptyRestaurantsView />
          )
        }
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#FF7622" />
        }
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
```

### B. Skeleton Loader Component Spec (`components/skeletons/RestaurantCardSkeleton.tsx`)
```tsx
import React from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, easing } from "react-native-reanimated";

export function RestaurantCardSkeleton() {
  const opacity = useSharedValue(0.4);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: easing.inOut(easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={animatedStyle} className="mb-4 bg-gray-100 rounded-3xl p-3 h-52">
      <View className="w-full h-32 bg-gray-200 rounded-2xl mb-3" />
      <View className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <View className="h-3 bg-gray-200 rounded w-1/2" />
    </Animated.View>
  );
}
```

---

## 🎨 UI & UX Polish Guidelines

1. **Category Cards:** Add subtle haptic feedback using `expo-haptics` (`Haptics.selectionAsync()`) when categories are tapped.
2. **Search Bar:** Add clear input button, transition animations when entering search route, and recent search history persistence.
3. **Filter Dialog:** Implement price range slider, rating filters, and delivery time filters with instant reactive counts.

---

## ✅ Verification & Test Plan

1. **List Recycling Audit:** Scroll rapidly through 50+ restaurants; verify memory remains flat (<120MB) and frame rate stays at 60fps.
2. **Refresh Verification:** Pull down on list; verify spinner activates, queries refetch in parallel, and spinner hides upon completion.
3. **Offline Image Fallback:** Toggle airplane mode; verify cached images load instantly from disk cache.
