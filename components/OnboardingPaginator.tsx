import React from "react";
import { useWindowDimensions, View } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

interface PaginatorProps {
  data: any[];
  scrollX: SharedValue<number>;
}

interface DotProps {
  index: number;
  width: number;
  scrollX: SharedValue<number>;
}

function Dot({ index, width, scrollX }: DotProps) {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(scrollX.value, inputRange, [
      "#E3E8EF",
      "#262B33",
      "#E3E8EF",
    ]);

    const dotWidth = interpolate(scrollX.value, inputRange, [8, 28, 8], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    const opacity = interpolate(scrollX.value, inputRange, [0.5, 1, 0.5], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    return { backgroundColor, width: dotWidth, opacity };
  });

  return (
    <Animated.View
      className="h-2 rounded-full mx-1"
      style={animatedStyle}
    />
  );
}

export default function OnboardingPaginator({ data, scrollX }: PaginatorProps) {
  const { width } = useWindowDimensions();

  return (
    <View className="flex-row justify-center items-center mb-6">
      {data.map((_, i) => (
        <Dot key={i.toString()} index={i} width={width} scrollX={scrollX} />
      ))}
    </View>
  );
}
