import { Text } from "@/components/ui/text";
import { Image, useWindowDimensions, View } from "react-native";

interface OnboardingItemProps {
  item: {
    id: string;
    title: string;
    description: string;
    image: any;
  };
}

export default function OnboardingItem({ item }: OnboardingItemProps) {
  const { width } = useWindowDimensions();

  return (
    <View style={{ width }} className="items-center">
      <View className="flex-1 justify-center items-center w-full pt-10">
        <View
          className="bg-transparent rounded-[30px] overflow-hidden"
          style={{ width: width * 0.8, height: width * 0.8 }}
        >
          <Image
            source={item.image}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        </View>
      </View>

      <View className="items-center px-8 pb-10">
        <Text className="text-[30px] text-secondary text-center mb-4 uppercase font-sen-extra-bold">
          {item.title}
        </Text>
        <Text className="text-base text-muted-foreground text-center leading-6 font-sen">
          {item.description}
        </Text>
      </View>
    </View>
  );
}
