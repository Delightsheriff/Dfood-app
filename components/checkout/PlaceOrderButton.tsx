import { Button } from "@/components/ui/button";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

interface PlaceOrderButtonProps {
  onPress: () => void;
  disabled: boolean;
  isPending: boolean;
  total: number;
}

export function PlaceOrderButton({
  onPress,
  disabled,
  isPending,
  total,
}: PlaceOrderButtonProps) {
  return (
    <View className="px-6 py-4 border-t border-[#F0F5FA] bg-white">
      <Button
        onPress={onPress}
        disabled={disabled}
        className="h-[62px] bg-primary"
      >
        {isPending ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-sen-bold text-[15px] uppercase tracking-wider">
            PLACE ORDER • ₦{total.toLocaleString()}
          </Text>
        )}
      </Button>
    </View>
  );
}
