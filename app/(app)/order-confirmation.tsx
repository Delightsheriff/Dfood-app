import { Button } from "@/components/ui/button";
import { useOrder } from "@/hooks/useDataQueries";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CheckCircle, MapPin, Package } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OrderConfirmation() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const { data: orderData, isLoading } = useOrder(orderId);

  const order = orderData?.data.order;

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
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Success Header */}
        <View className="items-center py-12 px-6">
          <View className="w-24 h-24 bg-[#E8F5E9] rounded-full items-center justify-center mb-6">
            <CheckCircle color="#4CAF50" size={48} />
          </View>
          <Text className="text-2xl font-sen-extra-bold text-secondary mb-2 text-center">
            Order Placed Successfully!
          </Text>
          <Text className="text-text-gray font-sen text-center mb-4">
            Your order has been confirmed and is being prepared
          </Text>

          {/* Order Number */}
          <View className="bg-[#FFF5EE] rounded-xl px-6 py-3 border border-primary">
            <Text className="text-xs text-text-gray font-sen text-center mb-1">
              ORDER NUMBER
            </Text>
            <Text className="text-lg font-sen-extra-bold text-primary text-center">
              {order.orderNumber}
            </Text>
          </View>
        </View>

        {/* Order Details */}
        <View className="px-6 mb-6">
          {/* Restaurant */}
          <View className="bg-[#F0F5FA] rounded-xl p-4 mb-4 flex-row items-center">
            <Package color="#FF7622" size={20} />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-text-gray font-sen mb-1">FROM</Text>
              <Text className="font-sen-bold text-secondary">
                {order.restaurantId.name}
              </Text>
            </View>
          </View>

          {/* Delivery Address */}
          <View className="bg-[#F0F5FA] rounded-xl p-4 mb-4 flex-row">
            <MapPin color="#2D8EFF" size={20} />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-text-gray font-sen mb-1">
                DELIVERY TO
              </Text>
              <Text className="font-sen-bold text-secondary">
                {order.deliveryAddress.street}
              </Text>
              <Text className="font-sen text-text-gray text-sm">
                {order.deliveryAddress.city}, {order.deliveryAddress.state}
              </Text>
            </View>
          </View>

          {/* Payment Method */}
          <View className="bg-[#F0F5FA] rounded-xl p-4 mb-4">
            <Text className="text-xs text-text-gray font-sen mb-2">
              PAYMENT METHOD
            </Text>
            <Text className="font-sen-bold text-secondary">
              {order.paymentMethod === "cash"
                ? "Cash on Delivery"
                : `Card Payment (${order.paymentStatus})`}
            </Text>
          </View>

          {/* Items */}
          <View className="bg-[#F0F5FA] rounded-xl p-4">
            <Text className="text-xs text-text-gray font-sen mb-3">
              ITEMS ({order.items.length})
            </Text>
            {order.items.map((item) => (
              <View
                key={item.foodItemId}
                className="flex-row justify-between mb-2"
              >
                <Text className="font-sen text-secondary flex-1">
                  {item.quantity}x {item.name}
                </Text>
                <Text className="font-sen-bold text-secondary">
                  ₦{item.subtotal.toLocaleString()}
                </Text>
              </View>
            ))}

            <View className="border-t border-[#E0E0E0] pt-3 mt-3">
              <View className="flex-row justify-between mb-2">
                <Text className="font-sen text-text-gray">Subtotal</Text>
                <Text className="font-sen-bold text-secondary">
                  ₦{order.subtotal.toLocaleString()}
                </Text>
              </View>
              <View className="flex-row justify-between mb-3">
                <Text className="font-sen text-text-gray">Delivery Fee</Text>
                <Text className="font-sen-bold text-secondary">
                  ₦{order.deliveryFee.toLocaleString()}
                </Text>
              </View>
              <View className="flex-row justify-between pt-3 border-t border-[#E0E0E0]">
                <Text className="font-sen-bold text-secondary text-lg">
                  Total
                </Text>
                <Text className="font-sen-extra-bold text-primary text-xl">
                  ₦{order.total.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View className="absolute bottom-0 left-0 right-0 bg-white px-6 py-4 border-t border-[#F0F5FA]">
        <Button
          onPress={() => router.push("/profile/orders" as any)}
          className="h-[62px] bg-primary mb-3"
        >
          <Text className="text-white font-sen-bold text-[15px] uppercase tracking-wider">
            TRACK ORDER
          </Text>
        </Button>
        <TouchableOpacity
          onPress={() => router.push("/(app)")}
          className="h-[62px] items-center justify-center"
        >
          <Text className="text-secondary font-sen-bold text-[15px] uppercase tracking-wider">
            CONTINUE SHOPPING
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
