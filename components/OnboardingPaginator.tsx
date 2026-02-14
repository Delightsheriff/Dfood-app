import { View, useWindowDimensions } from "react-native";
import Animated, {
  SharedValue,
  interpolate,
  interpolateColor,
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
      "#FFE1CE",
      "#FF7622",
      "#FFE1CE",
    ]);

    const dotWidth = interpolate(scrollX.value, inputRange, [10, 28, 10], {
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
      className="h-2.5 rounded-full mx-1.5"
      style={animatedStyle}
    />
  );
}

export default function OnboardingPaginator({ data, scrollX }: PaginatorProps) {
  const { width } = useWindowDimensions();

  return (
    <View className="flex-row justify-center items-center mb-8">
      {data.map((_, i) => (
        <Dot key={i.toString()} index={i} width={width} scrollX={scrollX} />
      ))}
    </View>
  );
}
