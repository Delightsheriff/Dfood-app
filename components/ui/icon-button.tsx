import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react-native";
import { cn } from "@/lib/utils";
import { StyleProp, ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

type IconButtonProps = {
  icon: IconSvgElement;
  onPress?: () => void;
  accessibilityLabel: string;
  /** Glyph size in dp. */
  size?: number;
  /** Glyph color; defaults to the ink token. */
  color?: string;
  /** Fill color used when `filled` is true. */
  fillColor?: string;
  /** Renders the glyph filled (e.g. active favorite heart). */
  filled?: boolean;
  disabled?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Floating rounded-square icon button: ~44x44dp frosted-white fill, soft
 * drop shadow, continuous corner curve, dark glyph. Press feedback is a
 * gesture-driven scale/opacity on the GPU (shared-value press state), not
 * Pressable state.
 */
export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  size = 22,
  color = "#262B33",
  fillColor,
  filled = false,
  disabled = false,
  className,
  style,
}: IconButtonProps) {
  const pressed = useSharedValue(0);

  const tap = Gesture.Tap()
    .runOnJS(true)
    .enabled(!disabled)
    .onBegin(() => {
      pressed.set(1);
    })
    .onFinalize(() => {
      pressed.set(0);
    })
    .onEnd((_event, success) => {
      if (success) {
        onPress?.();
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(pressed.get(), [0, 1], [1, 0.94]);
    const opacity = interpolate(pressed.get(), [0, 1], [1, 0.85]);
    return { transform: [{ scale }], opacity };
  });

  return (
    <GestureDetector gesture={tap}>
      <Animated.View
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        className={cn(
          "h-11 w-11 items-center justify-center rounded-[14px] bg-white/90",
          "shadow-[0_2px_10px_rgba(0,0,0,0.14)]",
          disabled && "opacity-50",
          className,
        )}
        style={[{ borderCurve: "continuous" }, animatedStyle, style]}
      >
        <HugeiconsIcon
          icon={icon}
          size={size}
          color={color}
          strokeWidth={2}
          fill={filled && fillColor ? fillColor : "transparent"}
        />
      </Animated.View>
    </GestureDetector>
  );
}
