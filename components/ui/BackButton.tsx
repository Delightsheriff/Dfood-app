import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable } from "react-native";

const backButtonShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.08,
  shadowRadius: 4,
  elevation: 2,
} as const;

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
    } else {
      if (router.canGoBack()) {
        router.back();
      }
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      className={`w-11 h-11 rounded-2xl items-center justify-center ${
        variant === "light" ? "bg-white/20" : "bg-[#F0F5FA]"
      } ${className}`}
      style={({ pressed }) => [
        backButtonShadow,
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <ChevronLeft
        color={variant === "light" ? "#FFFFFF" : "#181C2E"}
        size={22}
      />
    </Pressable>
  );
}
