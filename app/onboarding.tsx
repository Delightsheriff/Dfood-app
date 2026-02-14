import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { useCallback, useRef, useState } from "react";
import { FlatList, View } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import OnboardingItem from "../components/OnboardingItem";
import OnboardingPaginator from "../components/OnboardingPaginator";

const slides = [
  {
    id: "1",
    title: "All your favorites",
    description:
      "Get all your loved foods in one place, you just place the order we do the rest",
    image: require("../assets/images/onboarding_1.png"),
  },
  {
    id: "2",
    title: "Order from chosen chef",
    description:
      "Get all your loved foods in one place, you just place the order we do the rest",
    image: require("../assets/images/onboarding_2.png"),
  },
  {
    id: "3",
    title: "Free delivery offers",
    description:
      "Get all your loved foods in one place, you just place the order we do the rest",
    image: require("../assets/images/onboarding_3.png"),
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { completeOnboarding } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleComplete = async () => {
    try {
      await completeOnboarding();
      router.replace("/(auth)/signin");
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    }
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const isLast = currentIndex === slides.length - 1;
  const buttonText = isLast ? "Get Started" : "Next";

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Skip Button */}
      <View className="flex-row justify-end px-6 pt-2">
        <Button
          variant="ghost"
          onPress={handleSkip}
          className="px-4 py-2 rounded-xl bg-[#F6F8FA]"
          style={{ borderWidth: 1, borderColor: "#F0F0F0" }}
        >
          <Text className="text-text-gray font-sen-bold text-xs">Skip</Text>
        </Button>
      </View>

      {/* Slides */}
      <View className="flex-1">
        <Animated.FlatList
          ref={flatListRef}
          data={slides}
          renderItem={({ item }) => <OnboardingItem item={item} />}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewConfig}
        />
      </View>

      {/* Bottom Controls */}
      <View className="px-6 pb-8">
        <OnboardingPaginator data={slides} scrollX={scrollX} />

        <Button
          onPress={handleNext}
          className="h-[56px] bg-primary rounded-2xl flex-row items-center justify-center"
          style={{
            shadowColor: "#FF7622",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Text className="font-sen-bold uppercase tracking-wider text-white mr-2">
            {buttonText}
          </Text>
          <ArrowRight color="white" size={18} />
        </Button>
      </View>
    </SafeAreaView>
  );
}
