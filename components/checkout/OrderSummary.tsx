import { CartItem } from "@/store/cartStore";
import { Package, Truck } from "lucide-react-native";
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
      <View className="mt-6 mb-5">
        <Text className="text-xs text-text-gray font-sen uppercase mb-2 tracking-wide">
          ORDERING FROM
        </Text>
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
            <Package color="#FF7622" size={20} />
          </View>
          <Text className="font-sen-bold text-secondary text-base flex-1">
            {restaurantName}
          </Text>
        </View>
      </View>

      {/* Order Items */}
      <View className="mb-5">
        <Text className="text-xs text-text-gray font-sen uppercase mb-2 tracking-wide">
          ORDER SUMMARY ({items.length} {items.length === 1 ? "ITEM" : "ITEMS"})
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
          {items.map((item, index) => (
            <View
              key={item.foodItem._id}
              className={`flex-row justify-between items-center py-3 ${
                index < items.length - 1 ? "border-b border-[#E8ECF0]" : ""
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
                  {item.foodItem.name}
                </Text>
              </View>
              <Text className="font-sen-bold text-secondary text-sm">
                ₦{(item.foodItem.price * item.quantity).toLocaleString()}
              </Text>
            </View>
          ))}

          {/* Totals */}
          <View className="border-t border-[#D9DEE5] pt-4 mt-2">
            <View className="flex-row justify-between mb-2.5">
              <Text className="font-sen text-text-gray text-sm">Subtotal</Text>
              <Text className="font-sen-bold text-secondary text-sm">
                ₦{subtotal.toLocaleString()}
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
                {deliveryFee === 0 ? (
                  <Text className="text-green-600">Free</Text>
                ) : (
                  `₦${deliveryFee.toLocaleString()}`
                )}
              </Text>
            </View>

            <View className="bg-white rounded-xl p-3 flex-row justify-between items-center">
              <Text className="font-sen-bold text-secondary text-base">
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
