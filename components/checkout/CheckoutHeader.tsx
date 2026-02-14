import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface CheckoutHeaderProps {
  onBack: () => void;
}

export function CheckoutHeader({ onBack }: CheckoutHeaderProps) {
  return (
    <View className="flex-row items-center px-6 py-4 border-b border-[#F0F5FA]">
      <TouchableOpacity
        onPress={onBack}
        className="w-11 h-11 bg-[#ECF0F4] rounded-full items-center justify-center mr-3"
      >
        <ChevronLeft color="#181C2E" size={22} />
      </TouchableOpacity>
      <Text className="text-lg font-sen-bold text-secondary flex-1">
        Checkout
      </Text>
    </View>
  );
}
