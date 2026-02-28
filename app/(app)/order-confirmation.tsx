import { Button } from "@/components/ui/button";
import { useOrder } from "@/hooks/useDataQueries";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  CheckCircle,
  CreditCard,
  MapPin,
  Package,
  Truck,
} from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  Text,
  Pressable,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OrderConfirmation() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const { data: orderData, isLoading } = useOrder(orderId);

  const order = orderData?.data.order;

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (order) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 12,
          stiffness: 150,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            damping: 15,
            stiffness: 120,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [order, scaleAnim, fadeAnim, slideAnim]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF7622" />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-text-gray font-sen text-base text-center">
            Order not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* Success Header */}
        <View className="items-center pt-10 pb-8 px-6">
          <Animated.View
            style={{
              transform: [{ scale: scaleAnim }],
            }}
          >
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-6"
              style={{
                backgroundColor: "#FFF5EE",
                shadowColor: "#FF7622",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <CheckCircle color="#FF7622" size={48} />
            </View>
          </Animated.View>

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              alignItems: "center",
            }}
          >
            <Text className="text-2xl font-sen-extra-bold text-secondary mb-2 text-center">
              Order Confirmed!
            </Text>
            <Text className="text-text-gray font-sen text-center text-sm mb-6">
              Your order is being prepared with care
            </Text>

            {/* Order Number Badge */}
            <View
              className="rounded-2xl px-8 py-4"
              style={{
                backgroundColor: "#FFF5EE",
                borderWidth: 1.5,
                borderColor: "#FFD4B8",
              }}
            >
              <Text className="text-[10px] text-text-gray font-sen text-center mb-1 tracking-widest uppercase">
                ORDER NUMBER
              </Text>
              <Text className="text-xl font-sen-extra-bold text-primary text-center tracking-wider">
                {order.orderNumber}
              </Text>
            </View>
          </Animated.View>
        </View>

        {/* Order Details */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            paddingHorizontal: 24,
          }}
        >
          {/* Restaurant & Delivery Info */}
          <View className="mb-4">
            <View
              className="bg-[#F0F5FA] rounded-2xl p-4 mb-3 flex-row items-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 4,
                elevation: 1,
              }}
            >
              <View className="w-10 h-10 bg-white rounded-xl items-center justify-center mr-3">
                <Package color="#FF7622" size={20} />
              </View>
              <View className="flex-1">
                <Text className="text-[10px] text-text-gray font-sen uppercase tracking-wider mb-0.5">
                  FROM
                </Text>
                <Text className="font-sen-bold text-secondary text-sm">
                  {order.restaurantId.name}
                </Text>
              </View>
            </View>

            <View
              className="bg-[#F0F5FA] rounded-2xl p-4 mb-3 flex-row items-start"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 4,
                elevation: 1,
              }}
            >
              <View className="w-10 h-10 bg-white rounded-xl items-center justify-center mr-3">
                <MapPin color="#2D8EFF" size={20} />
              </View>
              <View className="flex-1">
                <Text className="text-[10px] text-text-gray font-sen uppercase tracking-wider mb-0.5">
                  DELIVERING TO
                </Text>
                <Text className="font-sen-bold text-secondary text-sm">
                  {order.deliveryAddress.street}
                </Text>
                <Text className="font-sen text-text-gray text-xs mt-0.5">
                  {order.deliveryAddress.city}, {order.deliveryAddress.state}
                </Text>
              </View>
            </View>

            <View
              className="bg-[#F0F5FA] rounded-2xl p-4 flex-row items-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 4,
                elevation: 1,
              }}
            >
              <View className="w-10 h-10 bg-white rounded-xl items-center justify-center mr-3">
                <CreditCard color="#646982" size={20} />
              </View>
              <View className="flex-1">
                <Text className="text-[10px] text-text-gray font-sen uppercase tracking-wider mb-0.5">
                  PAYMENT
                </Text>
                <Text className="font-sen-bold text-secondary text-sm">
                  {order.paymentMethod === "cash"
                    ? "Cash on Delivery"
                    : `Card Payment`}
                </Text>
              </View>
              <View
                className={`px-3 py-1 rounded-full ${
                  order.paymentStatus === "paid"
                    ? "bg-green-100"
                    : "bg-yellow-100"
                }`}
              >
                <Text
                  className={`text-[10px] font-sen-bold uppercase ${
                    order.paymentStatus === "paid"
                      ? "text-green-700"
                      : "text-yellow-700"
                  }`}
                >
                  {order.paymentStatus}
                </Text>
              </View>
            </View>
          </View>

          {/* Items */}
          <View className="mb-6">
            <Text className="text-xs text-text-gray font-sen uppercase mb-2 tracking-wide">
              ITEMS ({order.items.length})
            </Text>
            <View
              className="bg-[#F0F5FA] rounded-2xl p-4"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 4,
                elevation: 1,
              }}
            >
              {order.items.map((item, index) => (
                <View
                  key={item.foodItemId}
                  className={`flex-row justify-between items-center py-3 ${
                    index < order.items.length - 1
                      ? "border-b border-[#E8ECF0]"
                      : ""
                  }`}
                >
                  <View className="flex-row items-center flex-1 mr-3">
                    <View className="w-7 h-7 bg-white rounded-lg items-center justify-center mr-3">
                      <Text className="text-xs font-sen-bold text-primary">
                        {item.quantity}x
                      </Text>
                    </View>
                    <Text
                      className="font-sen text-secondary text-sm flex-1"
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                  </View>
                  <Text className="font-sen-bold text-secondary text-sm">
                    ₦{item.subtotal.toLocaleString()}
                  </Text>
                </View>
              ))}

              {/* Totals */}
              <View className="border-t border-[#D9DEE5] pt-4 mt-2">
                <View className="flex-row justify-between mb-2.5">
                  <Text className="font-sen text-text-gray text-sm">
                    Subtotal
                  </Text>
                  <Text className="font-sen-bold text-secondary text-sm">
                    ₦{order.subtotal.toLocaleString()}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-row items-center">
                    <Truck color="#646982" size={14} />
                    <Text className="font-sen text-text-gray text-sm ml-1.5">
                      Delivery
                    </Text>
                  </View>
                  <Text className="font-sen-bold text-secondary text-sm">
                    ₦{order.deliveryFee.toLocaleString()}
                  </Text>
                </View>
                <View className="bg-white rounded-xl p-3 flex-row justify-between items-center">
                  <Text className="font-sen-bold text-secondary text-base">
                    Total
                  </Text>
                  <Text className="font-sen-extra-bold text-primary text-xl">
                    ₦{order.total.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Actions */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white px-6 pt-4 pb-6"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <Button
          onPress={() => router.push("/profile/orders" as any)}
          className="h-[56px] bg-primary mb-3"
        >
          <Text className="text-white font-sen-bold text-[14px] uppercase tracking-wider">
            TRACK ORDER
          </Text>
        </Button>
        <Pressable
          onPress={() => router.push("/(app)")}
          className="h-[48px] items-center justify-center bg-[#F0F5FA] rounded-2xl"
        >
          <Text className="text-secondary font-sen-bold text-[13px] uppercase tracking-wider">
            CONTINUE SHOPPING
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
