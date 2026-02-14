import { CartItem } from "@/store/cartStore";
import React from "react";
import { Text, View } from "react-native";

interface OrderSummaryProps {
  restaurantName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export function OrderSummary({
  restaurantName,
  items,
  subtotal,
  deliveryFee,
  total,
}: OrderSummaryProps) {
  return (
    <>
      {/* Restaurant Info */}
      <View className="mt-6 mb-6">
        <Text className="text-xs text-text-gray font-sen uppercase mb-2">
          ORDERING FROM
        </Text>
        <View className="bg-[#F0F5FA] rounded-xl p-4">
          <Text className="font-sen-bold text-secondary text-base">
            {restaurantName}
          </Text>
        </View>
      </View>

      {/* Order Items */}
      <View className="mb-6">
        <Text className="text-xs text-text-gray font-sen uppercase mb-3">
          ORDER SUMMARY
        </Text>
        <View className="bg-[#F0F5FA] rounded-xl p-4">
          {items.map((item) => (
            <View
              key={item.foodItem._id}
              className="flex-row justify-between mb-3"
            >
              <Text className="font-sen text-secondary flex-1">
                {item.quantity}x {item.foodItem.name}
              </Text>
              <Text className="font-sen-bold text-secondary">
                ₦{(item.foodItem.price * item.quantity).toLocaleString()}
              </Text>
            </View>
          ))}

          <View className="border-t border-[#E0E0E0] pt-3 mt-3">
            <View className="flex-row justify-between mb-2">
              <Text className="font-sen text-text-gray">Subtotal</Text>
              <Text className="font-sen-bold text-secondary">
                ₦{subtotal.toLocaleString()}
              </Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text className="font-sen text-text-gray">Delivery Fee</Text>
              <Text className="font-sen-bold text-secondary">
                ₦{deliveryFee === 0 ? "Free" : deliveryFee.toLocaleString()}
              </Text>
            </View>
            <View className="flex-row justify-between pt-3 border-t border-[#E0E0E0]">
              <Text className="font-sen-bold text-secondary text-lg">
                Total
              </Text>
              <Text className="font-sen-extra-bold text-primary text-xl">
                ₦{total.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}
