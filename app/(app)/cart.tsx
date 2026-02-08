import { useRouter } from "expo-router";
import { ChevronLeft, Minus, Plus, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FOOD_ITEMS } from "../../constants/mocks";

const DELIVERY_ADDRESS = "2118 Thornridge Cir. Syracuse";

export default function Cart() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const [cartItems, setCartItems] = useState([
    { ...FOOD_ITEMS[0], quantity: 2, selectedSize: '14"' },
    { ...FOOD_ITEMS[1], quantity: 1, selectedSize: '14"' },
  ]);

  const updateQuantity = (index: number, delta: number) => {
    const newItems = [...cartItems];
    newItems[index].quantity = Math.max(1, newItems[index].quantity + delta);
    setCartItems(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = cartItems.filter((_, i) => i !== index);
    setCartItems(newItems);
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

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

        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Text className="text-primary font-sen-bold text-[13px] uppercase tracking-wide">
            {isEditing ? "DONE" : "EDIT ITEMS"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Cart Items */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-6 pb-4 mt-4"
      >
        {cartItems.map((item, index) => (
          <View key={index} className="mb-5 relative">
            <View className="flex-row">
              {/* Food Image */}
              <View className="w-[120px] h-[120px] bg-[#2D3142] rounded-[20px] overflow-hidden">
                <Image
                  source={{ uri: item.image }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>

              {/* Food Details */}
              <View className="flex-1 ml-4 justify-between py-1">
                <View>
                  <Text
                    className="text-white text-[17px] font-sen-bold mb-1"
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>
                  <Text className="text-white text-[20px] font-sen-bold">
                    ${item.price * item.quantity}
                  </Text>
                </View>

                {/* Size and Quantity */}
                <View className="flex-row items-center justify-between">
                  <Text className="text-white/40 text-[15px] font-sen">
                    {item.selectedSize}
                  </Text>

                  {/* Quantity Controls */}
                  <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                      onPress={() => updateQuantity(index, -1)}
                      className="w-8 h-8 bg-[#2D3142] rounded-full items-center justify-center"
                    >
                      <Minus color="white" size={16} strokeWidth={2.5} />
                    </TouchableOpacity>

                    <Text className="text-white font-sen-bold text-[16px] min-w-[20px] text-center">
                      {item.quantity}
                    </Text>

                    <TouchableOpacity
                      onPress={() => updateQuantity(index, 1)}
                      className="w-8 h-8 bg-[#2D3142] rounded-full items-center justify-center"
                    >
                      <Plus color="white" size={16} strokeWidth={2.5} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* Remove Button (only visible in edit mode) */}
            {isEditing && (
              <TouchableOpacity
                onPress={() => removeItem(index)}
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
        {cartItems.length === 0 && (
          <View className="items-center justify-center py-20">
            <Text className="text-white/60 font-sen text-[16px]">
              Your cart is empty
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Sheet */}
      <View className="bg-white rounded-t-[30px] px-6 pt-6 pb-8">
        {/* Delivery Address Section */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-[#A0A5BA] font-sen text-[12px] uppercase tracking-wide">
              DELIVERY ADDRESS
            </Text>
            <TouchableOpacity>
              <Text className="text-primary font-sen-bold text-[13px]">
                EDIT
              </Text>
            </TouchableOpacity>
          </View>

          <View className="bg-[#F6F8FA] rounded-[12px] px-4 py-3.5">
            <Text className="text-[#181C2E] font-sen text-[15px]">
              {DELIVERY_ADDRESS}
            </Text>
          </View>
        </View>

        {/* Total Section */}
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-baseline">
            <Text className="text-[#A0A5BA] font-sen text-[13px] uppercase tracking-wide mr-2">
              TOTAL:
            </Text>
            <Text className="text-[32px] font-sen-extra-bold text-[#181C2E]">
              ${total}
            </Text>
          </View>

          <TouchableOpacity>
            <Text className="text-primary font-sen text-[14px]">
              Breakdown →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Place Order Button */}
        <TouchableOpacity
          onPress={() => router.push("/(app)/checkout")}
          className="w-full bg-primary h-[62px] rounded-[12px] items-center justify-center"
          disabled={cartItems.length === 0}
          style={{
            opacity: cartItems.length === 0 ? 0.5 : 1,
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
