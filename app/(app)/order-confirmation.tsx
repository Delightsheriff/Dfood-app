import { ButtonText } from "@/components/ui/button";
import {
  ProgressiveBlurFooter,
  useProgressiveBlurScroll,
} from "@/components/ui/progressive-blur";
import { ScreenHeader } from "@/components/ui/screen-header";
import { useOrder } from "@/hooks/useDataQueries";
import {
  CheckmarkCircle02Icon,
  Clock01Icon,
  Location01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCENT = "#E0533A";

export default function OrderConfirmation() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { scrollY, onScroll } = useProgressiveBlurScroll();
  const { data: orderData, isLoading } = useOrder(orderId);

  const order = orderData?.data.order;

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-text-gray font-body text-base text-center">
          Order not found
        </Text>
        <Pressable
          onPress={() => router.replace("/(app)/(tabs)" as any)}
          className="mt-4 px-6 py-3 bg-secondary rounded-full"
        >
          <Text className="text-white font-label text-sm">Back to Home</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader
        variant="detail"
        title="Order Placed"
        scrollY={scrollY}
        alwaysShowTitle
      />

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: insets.top + 56,
          paddingBottom: insets.bottom + 140,
        }}
      >
        {/* Success Header */}
        <Animated.View
          entering={ZoomIn.duration(400)}
          className="items-center mb-6"
        >
          <View className="w-20 h-20 rounded-full bg-[#FFF5F3] items-center justify-center mb-4">
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              size={44}
              color={ACCENT}
            />
          </View>
          <Text className="text-2xl font-display text-secondary text-center">
            Order Placed!
          </Text>
          <Text className="mt-1 text-xs font-numeric text-text-gray text-center">
            Order #{order.orderNumber || order._id.slice(-6).toUpperCase()}
          </Text>
        </Animated.View>

        {/* ETA & Status Card */}
        <Animated.View
          entering={FadeInDown.delay(150).duration(400)}
          className="p-4 bg-surface-muted rounded-[20px] mb-4 flex-row items-center"
          style={{ borderCurve: "continuous" }}
        >
          <View className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3">
            <HugeiconsIcon icon={Clock01Icon} size={20} color="#262B33" />
          </View>
          <View className="flex-1">
            <Text className="text-[14px] font-title text-secondary">
              Estimated Arrival: 25–35 min
            </Text>
            <Text className="text-xs font-body text-text-gray mt-0.5">
              Preparing your food at {order.restaurantId.name}
            </Text>
          </View>
        </Animated.View>

        {/* Delivery Address Card */}
        <Animated.View
          entering={FadeInDown.delay(250).duration(400)}
          className="p-4 bg-surface-muted rounded-[20px] mb-4 flex-row items-center"
          style={{ borderCurve: "continuous" }}
        >
          <View className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3">
            <HugeiconsIcon icon={Location01Icon} size={20} color={ACCENT} />
          </View>
          <View className="flex-1">
            <Text className="text-[14px] font-title text-secondary">
              Delivering to
            </Text>
            <Text className="text-xs font-body text-text-gray mt-0.5">
              {order.deliveryAddress.street}, {order.deliveryAddress.city}
            </Text>
          </View>
        </Animated.View>

        {/* Order Details Summary */}
        <Animated.View
          entering={FadeInDown.delay(350).duration(400)}
          className="p-5 bg-surface-muted rounded-[20px] mb-6"
          style={{ borderCurve: "continuous" }}
        >
          <Text className="text-[15px] font-title text-secondary mb-3">
            Order Items
          </Text>

          <View className="gap-2.5 mb-3">
            {order.items.map((item, idx) => (
              <View
                key={idx}
                className="flex-row items-center justify-between"
              >
                <Text
                  numberOfLines={1}
                  className="text-xs font-body text-secondary flex-1 mr-2"
                >
                  {item.quantity}x {item.name}
                </Text>
                <Text className="text-xs font-numeric text-secondary">
                  ₦{(item.price * item.quantity).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>

          <View className="h-[1px] bg-gray-200 my-2" />

          <View className="gap-2">
            <View className="flex-row justify-between items-center">
              <Text className="text-xs font-body text-text-gray">Subtotal</Text>
              <Text className="text-xs font-numeric text-secondary">
                ₦{order.subtotal.toLocaleString()}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-xs font-body text-text-gray">Delivery Fee</Text>
              <Text className="text-xs font-numeric text-secondary">
                {order.deliveryFee === 0
                  ? "Free"
                  : `₦${order.deliveryFee.toLocaleString()}`}
              </Text>
            </View>
            <View className="flex-row justify-between items-center pt-1">
              <Text className="text-sm font-title text-secondary">Total</Text>
              <Text className="text-base font-numeric text-secondary">
                ₦{order.total.toLocaleString()}
              </Text>
            </View>
          </View>
        </Animated.View>
      </Animated.ScrollView>

      {/* Sticky Bottom Actions with ProgressiveBlurFooter */}
      <View
        className="absolute bottom-0 left-0 right-0 z-30"
        style={{
          paddingBottom: insets.bottom + 12,
        }}
      >
        <ProgressiveBlurFooter
          barHeight={130}
          zIndex={1}
          style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
        />
        <View className="px-5 pt-3 gap-2.5" style={{ zIndex: 2 }}>
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(app)/profile/order-details" as any,
                params: { orderId: order._id },
              })
            }
            className="w-full h-14 bg-secondary rounded-full items-center justify-center"
          >
            <ButtonText className="font-label text-sm text-white">
              Track Order
            </ButtonText>
          </Pressable>

          <Pressable
            onPress={() => router.replace("/(app)/(tabs)" as any)}
            className="w-full h-12 bg-surface-muted rounded-full items-center justify-center"
          >
            <Text className="font-label text-xs text-secondary uppercase tracking-wider">
              Back to Home
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
