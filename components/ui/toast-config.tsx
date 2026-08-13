import {
  Alert02Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  ShoppingBag01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import React from "react";
import { Text, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { BaseToastProps } from "react-native-toast-message";

const ACCENT = "#E0533A";

function ToastBase({
  icon,
  iconBgColor,
  text1,
  text2,
  accentColor,
}: {
  icon: React.ReactNode;
  iconBgColor: string;
  text1?: string;
  text2?: string;
  accentColor: string;
}) {
  return (
    <Animated.View
      entering={FadeInUp.duration(200)}
      exiting={FadeOutUp.duration(150)}
      style={{
        width: "90%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      <View
        className="flex-row items-center bg-white rounded-[18px] p-3.5 border-l-4"
        style={{
          borderLeftColor: accentColor,
          borderCurve: "continuous",
        }}
      >
        {/* Icon container */}
        <View
          className="w-9 h-9 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: iconBgColor }}
        >
          {icon}
        </View>

        {/* Text */}
        <View className="flex-1">
          {text1 ? (
            <Text
              className="font-sen-bold text-sm text-secondary"
              numberOfLines={1}
            >
              {text1}
            </Text>
          ) : null}
          {text2 ? (
            <Text
              className="font-sen text-xs text-text-gray mt-0.5"
              numberOfLines={1}
            >
              {text2}
            </Text>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}

export const toastConfig = {
  success: ({ text1, text2 }: BaseToastProps) => (
    <ToastBase
      icon={
        <HugeiconsIcon
          icon={CheckmarkCircle02Icon}
          size={18}
          color="#FFFFFF"
        />
      }
      iconBgColor={ACCENT}
      accentColor={ACCENT}
      text1={text1}
      text2={text2}
    />
  ),

  cart: ({ text1, text2 }: BaseToastProps) => (
    <ToastBase
      icon={
        <HugeiconsIcon
          icon={ShoppingBag01Icon}
          size={18}
          color="#FFFFFF"
        />
      }
      iconBgColor={ACCENT}
      accentColor={ACCENT}
      text1={text1}
      text2={text2}
    />
  ),

  error: ({ text1, text2 }: BaseToastProps) => (
    <ToastBase
      icon={
        <HugeiconsIcon icon={Cancel01Icon} size={18} color="#FFFFFF" />
      }
      iconBgColor="#EF4444"
      accentColor="#EF4444"
      text1={text1}
      text2={text2}
    />
  ),

  warning: ({ text1, text2 }: BaseToastProps) => (
    <ToastBase
      icon={<HugeiconsIcon icon={Alert02Icon} size={18} color="#FFFFFF" />}
      iconBgColor="#F59E0B"
      accentColor="#F59E0B"
      text1={text1}
      text2={text2}
    />
  ),
};
