import { useCartStore } from "@/store/cartStore";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ChevronLeft, Minus, Plus, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Cart() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const items = useCartStore((state) => state.items);
  const incrementItem = useCartStore((state) => state.incrementItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice());

  const restaurantName = items.length > 0 ? items[0].restaurantName : "";

  return (
    <SafeAreaView className="flex-1 bg-[#1E1E2E]" edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1E2E" />

      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-11 h-11 bg-[#2D3142] rounded-full items-center justify-center mr-4"
          >
            <ChevronLeft color="white" size={22} />
          </TouchableOpacity>
          <Text className="text-[18px] font-sen-bold text-white">Cart</Text>
        </View>
        {items.length > 0 && (
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <Text className="text-primary font-sen-bold text-[13px] uppercase tracking-wide">
              {isEditing ? "DONE" : "EDIT ITEMS"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Restaurant Name Badge */}
      {restaurantName && (
        <View className="px-6 mb-4">
          <View className="self-start bg-[#2D3142] rounded-full px-4 py-2 flex-row items-center">
            <View className="w-2 h-2 bg-primary rounded-full mr-2" />
            <Text className="text-white font-sen text-sm">
              {restaurantName}
            </Text>
          </View>
        </View>
      )}

      {/* Cart Items */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 16,
          marginTop: 16,
        }}
      >
        {items.map((item) => (
          <View key={item.foodItem._id} className="mb-5 relative">
            <View className="flex-row">
              {/* Food Image */}
              <View className="w-[120px] h-[120px] bg-[#2D3142] rounded-[20px] overflow-hidden">
                <Image
                  source={{ uri: item.foodItem.images[0] }}
                  className="w-full h-full"
                  contentFit="cover"
                  transition={200}
                  style={{ width: "100%", height: "100%" }}
                />
              </View>

              {/* Food Details */}
              <View className="flex-1 ml-4 justify-between py-1">
                <View>
                  <Text
                    className="text-white text-[17px] font-sen-bold mb-1"
                    numberOfLines={2}
                  >
                    {item.foodItem.name}
                  </Text>
                  <Text className="text-white text-[20px] font-sen-bold">
                    ₦{(item.foodItem.price * item.quantity).toLocaleString()}
                  </Text>
                </View>

                {/* Quantity Controls */}
                <View className="flex-row items-center justify-end gap-3">
                  <TouchableOpacity
                    onPress={() => decrementItem(item.foodItem._id)}
                    className="w-8 h-8 bg-[#2D3142] rounded-full items-center justify-center"
                  >
                    <Minus color="white" size={16} strokeWidth={2.5} />
                  </TouchableOpacity>

                  <Text className="text-white font-sen-bold text-[16px] min-w-[20px] text-center">
                    {item.quantity}
                  </Text>

                  <TouchableOpacity
                    onPress={() => incrementItem(item.foodItem._id)}
                    className="w-8 h-8 bg-[#2D3142] rounded-full items-center justify-center"
                  >
                    <Plus color="white" size={16} strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Remove Button (only visible in edit mode) */}
            {isEditing && (
              <TouchableOpacity
                onPress={() => removeItem(item.foodItem._id)}
                className="absolute -top-2 -right-2 w-9 h-9 bg-[#FF4B4B] rounded-full items-center justify-center"
                style={{
                  shadowColor: "#FF4B4B",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                <X color="white" size={18} strokeWidth={3} />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* Empty State */}
        {items.length === 0 && (
          <View className="items-center justify-center py-20">
            <Text className="text-white/60 font-sen text-[16px]">
              Your cart is empty
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Sheet */}
      <View className="bg-white rounded-t-[30px] px-6 pt-6 pb-8">
        {/* Total Section */}
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-baseline">
            <Text className="text-[#A0A5BA] font-sen text-[13px] uppercase tracking-wide mr-2">
              TOTAL:
            </Text>
            <Text className="text-[32px] font-sen-extra-bold text-[#181C2E]">
              ₦{getTotalPrice.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Place Order Button */}
        <TouchableOpacity
          onPress={() => router.push("/(app)/checkout")}
          className="w-full bg-primary h-[62px] rounded-[12px] items-center justify-center"
          disabled={items.length === 0}
          style={{
            opacity: items.length === 0 ? 0.5 : 1,
          }}
        >
          <Text className="text-white font-sen-bold text-[15px] uppercase tracking-wider">
            PLACE ORDER
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
