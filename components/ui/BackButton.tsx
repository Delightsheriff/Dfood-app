import { IconButton } from "@/components/ui/icon-button";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { useRouter } from "expo-router";
import React from "react";

interface BackButtonProps {
  onPress?: () => void;
  className?: string;
  variant?: "light" | "dark";
}

export default function BackButton({
  onPress,
  className = "",
  variant = "light",
}: BackButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <IconButton
      icon={ArrowLeft01Icon}
      accessibilityLabel="Go back"
      onPress={handlePress}
      className={className}
      color={variant === "light" ? "#FFFFFF" : "#262B33"}
    />
  );
}
