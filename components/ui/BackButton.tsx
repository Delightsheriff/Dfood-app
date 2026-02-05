import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { TouchableOpacity } from "react-native";

interface BackButtonProps {
  onPress?: () => void;
  className?: string; // Allow valid className prop
}

export default function BackButton({
  onPress,
  className = "",
}: BackButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      if (router.canGoBack()) {
        router.back();
      }
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={`w-[45px] h-[45px] bg-white rounded-full items-center justify-center ${className}`}
    >
      <ChevronLeft color="#181C2E" size={24} />
    </TouchableOpacity>
  );
}
