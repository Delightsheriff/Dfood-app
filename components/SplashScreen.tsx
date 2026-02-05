import { useEffect } from "react";
import { Image, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import Ellipse1 from "../assets/images/Ellipse 1005.svg";
import Ellipse2 from "../assets/images/Ellipse 1006.svg";

export default function SplashScreen({ onFinish }: { onFinish?: () => void }) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 1000 });
    scale.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.back(1.5)),
    });

    const timeout = setTimeout(() => {
      if (onFinish) onFinish();
    }, 3000);

    return () => clearTimeout(timeout);
  }, [onFinish, opacity, scale]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View className="flex-1 bg-white items-center justify-center relative">
      <View className="absolute top-0 left-0">
        <Ellipse1
          width={300}
          height={300}
          style={{ transform: [{ translateX: -80 }, { translateY: -80 }] }}
        />
      </View>

      <Animated.View style={[logoStyle, { zIndex: 10 }]}>
        <Image
          source={require("../assets/images/splash-icon.png")}
          style={{ width: 220, height: 110, resizeMode: "contain" }}
        />
      </Animated.View>

      <View className="absolute bottom-0 right-0">
        <Ellipse2
          width={350}
          height={350}
          style={{ transform: [{ translateX: 80 }, { translateY: 80 }] }}
        />
      </View>
    </View>
  );
}
