import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Dimensions, Text, View } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface OnboardingSlide {
  id: string;
  tagline: string;
  title: string;
  description: string;
  image: any;
}

interface OnboardingItemProps {
  item: OnboardingSlide;
}

export default function OnboardingItem({ item }: OnboardingItemProps) {
  return (
    <View style={{ width: SCREEN_WIDTH }} className="flex-1 justify-between">
      {/* Photo Area (Top ~55% of screen) */}
      <View
        className="w-full relative overflow-hidden"
        style={{ height: SCREEN_HEIGHT * 0.52 }}
      >
        <Image
          source={item.image}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          transition={200}
        />
        {/* Soft bottom gradient fade into white */}
        <LinearGradient
          colors={["rgba(255,255,255,0)", "rgba(255,255,255,1)"]}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 100,
          }}
        />
      </View>

      {/* Copy Block */}
      <View className="px-8 pb-4 items-center">
        <View className="bg-[#FFF5F3] px-3.5 py-1 rounded-full mb-3 self-center">
          <Text className="text-[11px] font-sen-bold text-primary uppercase tracking-widest">
            {item.tagline}
          </Text>
        </View>
        <Text className="text-[28px] leading-8 text-secondary text-center mb-3 font-sen-extra-bold">
          {item.title}
        </Text>
        <Text className="text-[14px] leading-6 text-text-gray text-center font-sen max-w-[300px]">
          {item.description}
        </Text>
      </View>
    </View>
  );
}
