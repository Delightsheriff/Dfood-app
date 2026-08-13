import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="food/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="restaurants/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="restaurants/index" options={{ headerShown: false }} />
      <Stack.Screen name="categories/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="categories/index" options={{ headerShown: false }} />
      <Stack.Screen name="cart" options={{ headerShown: false }} />
      <Stack.Screen name="checkout" options={{ headerShown: false }} />
      <Stack.Screen name="order-confirmation" options={{ headerShown: false }} />
      <Stack.Screen name="profile/order-details" options={{ headerShown: false }} />
      <Stack.Screen name="profile/personal-info" options={{ headerShown: false }} />
      <Stack.Screen name="profile/addresses" options={{ headerShown: false }} />
      <Stack.Screen name="profile/add-address" options={{ headerShown: false }} />
      <Stack.Screen name="profile/edit-address" options={{ headerShown: false }} />
      <Stack.Screen name="profile/payment-methods" options={{ headerShown: false }} />
      <Stack.Screen name="profile/add-card" options={{ headerShown: false }} />
      <Stack.Screen name="profile/favourites" options={{ headerShown: false }} />
    </Stack>
  );
}
