import { useCartStore } from "@/store/cartStore";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  X,
} from "lucide-react-native";
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
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <SafeAreaView className="flex-1 bg-[#181C2E]" edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#181C2E" />

      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-11 h-11 bg-white/10 rounded-2xl items-center justify-center mr-4"
          >
            <ChevronLeft color="white" size={22} />
          </TouchableOpacity>
          <View>
            <Text className="text-lg font-sen-bold text-white">Cart</Text>
            {items.length > 0 && (
              <Text className="text-white/50 font-sen text-xs">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </Text>
            )}
          </View>
        </View>
        {items.length > 0 && (
          <TouchableOpacity
            onPress={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-xl ${isEditing ? "bg-primary" : "bg-white/10"}`}
          >
            <Text
              className={`font-sen-bold text-xs uppercase tracking-wide ${isEditing ? "text-white" : "text-primary"}`}
            >
              {isEditing ? "DONE" : "EDIT"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Restaurant Badge */}
      {restaurantName && (
        <View className="px-6 mb-4">
          <View className="self-start bg-white/8 rounded-xl px-4 py-2.5 flex-row items-center border border-white/10">
            <View className="w-6 h-6 bg-primary/20 rounded-lg items-center justify-center mr-2.5">
              <Package color="#FF7622" size={12} />
            </View>
            <Text className="text-white/80 font-sen text-sm">
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
          marginTop: 8,
        }}
      >
        {items.map((item) => (
          <View
            key={item.foodItem._id}
            className="mb-4 bg-white/5 rounded-2xl p-3 relative border border-white/5"
          >
            <View className="flex-row">
              {/* Food Image */}
              <View className="w-[100px] h-[100px] rounded-2xl overflow-hidden">
                <Image
                  source={{ uri: item.foodItem.images[0] }}
                  className="w-full h-full"
                  contentFit="cover"
                  transition={200}
                  style={{ width: "100%", height: "100%" }}
                />
              </View>

              {/* Food Details */}
              <View className="flex-1 ml-3.5 justify-between py-0.5">
                <View>
                  <Text
                    className="text-white text-[15px] font-sen-bold mb-1.5"
                    numberOfLines={2}
                  >
                    {item.foodItem.name}
                  </Text>
                  <Text className="text-primary text-lg font-sen-extra-bold">
                    ₦{(item.foodItem.price * item.quantity).toLocaleString()}
                  </Text>
                </View>

                {/* Quantity Controls */}
                <View className="flex-row items-center self-end">
                  <TouchableOpacity
                    onPress={() => decrementItem(item.foodItem._id)}
                    className="w-9 h-9 bg-white/10 rounded-xl items-center justify-center"
                  >
                    <Minus color="white" size={14} strokeWidth={2.5} />
                  </TouchableOpacity>

                  <Text className="text-white font-sen-bold text-base mx-4 min-w-[20px] text-center">
                    {item.quantity}
                  </Text>

                  <TouchableOpacity
                    onPress={() => incrementItem(item.foodItem._id)}
                    className="w-9 h-9 bg-primary rounded-xl items-center justify-center"
                  >
                    <Plus color="white" size={14} strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Remove Button */}
            {isEditing && (
              <TouchableOpacity
                onPress={() => removeItem(item.foodItem._id)}
                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-xl items-center justify-center"
                style={{
                  shadowColor: "#EF4444",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                <X color="white" size={16} strokeWidth={3} />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* Empty State */}
        {items.length === 0 && (
          <View className="items-center justify-center py-24">
            <View className="w-20 h-20 bg-white/5 rounded-3xl items-center justify-center mb-5">
              <ShoppingBag color="#646982" size={32} />
            </View>
            <Text className="text-white/70 font-sen-bold text-lg mb-1">
              Your cart is empty
            </Text>
            <Text className="text-white/40 font-sen text-sm">
              Add items to get started
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Sheet */}
      <View
        className="bg-white rounded-t-3xl px-6 pt-6 pb-8"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 10,
        }}
      >
        {/* Summary Row */}
        <View className="flex-row justify-between items-center mb-5">
          <View>
            <Text className="text-[#A0A5BA] font-sen text-[11px] uppercase tracking-widest mb-1">
              TOTAL
            </Text>
            <Text className="text-[28px] font-sen-extra-bold text-[#181C2E]">
              ₦{getTotalPrice.toLocaleString()}
            </Text>
          </View>
          {items.length > 0 && (
            <View className="bg-[#F0F5FA] px-3 py-1.5 rounded-lg">
              <Text className="text-text-gray font-sen text-xs">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </Text>
            </View>
          )}
        </View>

        {/* Checkout Button */}
        <TouchableOpacity
          onPress={() => router.push("/(app)/checkout")}
          className="w-full bg-primary h-[56px] rounded-2xl items-center justify-center flex-row"
          disabled={items.length === 0}
          style={{
            opacity: items.length === 0 ? 0.5 : 1,
            shadowColor: "#FF7622",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: items.length === 0 ? 0 : 0.3,
            shadowRadius: 8,
            elevation: items.length === 0 ? 0 : 6,
          }}
        >
          <Text className="text-white font-sen-bold text-[14px] uppercase tracking-wider">
            PROCEED TO CHECKOUT
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
