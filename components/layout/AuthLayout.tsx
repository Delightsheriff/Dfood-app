import React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Ellipse from "../../assets/images/Ellipse.svg";
import TopLeftRay from "../../assets/images/Vector 142.svg";
import BackButton from "../ui/BackButton";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  showBackButton?: boolean;
}

export default function AuthLayout({
  title,
  subtitle,
  children,
  showBackButton = true,
}: AuthLayoutProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View className="flex-1 bg-[#1E1E2E]">
        <StatusBar barStyle="light-content" backgroundColor="#1E1E2E" />

        {/* Background Elements */}
        <View className="absolute top-0 left-0" pointerEvents="none">
          <TopLeftRay width={140} height={140} style={{ opacity: 0.6 }} />
        </View>

        <View className="absolute top-[-20] right-[-20]" pointerEvents="none">
          <Ellipse width={140} height={140} />
        </View>

        {/* Decorative circles for depth */}
        <View className="absolute top-16 right-10" pointerEvents="none">
          <View className="w-3 h-3 bg-white/10 rounded-full" />
        </View>
        <View className="absolute top-28 left-14" pointerEvents="none">
          <View className="w-2 h-2 bg-white/8 rounded-full" />
        </View>

        <SafeAreaView edges={["top"]} className="flex-1">
          {/* Header Content */}
          <View
            className="px-6 pt-4 pb-8 items-center relative"
            style={{ zIndex: 20 }}
          >
            {showBackButton && (
              <View className="absolute left-6 top-4">
                <BackButton variant="light" />
              </View>
            )}

            <View className="mt-16 items-center">
              <Text className="text-[30px] text-white font-sen-bold text-center mb-2 leading-9">
                {title}
              </Text>
              <Text className="text-[16px] text-white font-sen text-center opacity-70 leading-6">
                {subtitle}
              </Text>
            </View>
          </View>

          {/* White Content Container */}
          <View
            className="flex-1 bg-white rounded-t-[30px] overflow-hidden"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View className="flex-1 px-6 pt-8">{children}</View>
            </TouchableWithoutFeedback>
          </View>
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
  );
}
