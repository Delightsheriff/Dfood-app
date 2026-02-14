import { AlertTriangle, Check, ShoppingCart, X } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import { BaseToastProps } from "react-native-toast-message";

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
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 1,
        damping: 15,
        stiffness: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          {
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-20, 0],
            }),
          },
        ],
        width: "90%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderLeftWidth: 4,
          borderLeftColor: accentColor,
        }}
      >
        {/* Icon */}
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            backgroundColor: iconBgColor,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          {icon}
        </View>

        {/* Text */}
        <View style={{ flex: 1 }}>
          {text1 ? (
            <Text
              style={{
                fontFamily: "Sen-Bold",
                fontSize: 14,
                color: "#32343E",
                marginBottom: text2 ? 2 : 0,
              }}
              numberOfLines={1}
            >
              {text1}
            </Text>
          ) : null}
          {text2 ? (
            <Text
              style={{
                fontFamily: "Sen",
                fontSize: 12,
                color: "#646982",
              }}
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
      icon={<Check color="#FFFFFF" size={18} strokeWidth={3} />}
      iconBgColor="#FF7622"
      accentColor="#FF7622"
      text1={text1}
      text2={text2}
    />
  ),

  cart: ({ text1, text2 }: BaseToastProps) => (
    <ToastBase
      icon={<ShoppingCart color="#FFFFFF" size={18} />}
      iconBgColor="#FF7622"
      accentColor="#FF7622"
      text1={text1}
      text2={text2}
    />
  ),

  error: ({ text1, text2 }: BaseToastProps) => (
    <ToastBase
      icon={<X color="#FFFFFF" size={18} strokeWidth={3} />}
      iconBgColor="#EF4444"
      accentColor="#EF4444"
      text1={text1}
      text2={text2}
    />
  ),

  warning: ({ text1, text2 }: BaseToastProps) => (
    <ToastBase
      icon={<AlertTriangle color="#FFFFFF" size={18} />}
      iconBgColor="#F59E0B"
      accentColor="#F59E0B"
      text1={text1}
      text2={text2}
    />
  ),
};
