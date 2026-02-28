import { Text } from "@/components/ui/text";
import { Image } from "expo-image";
import { useWindowDimensions, View } from "react-native";

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
      <View className="flex-1 justify-center items-center w-full pt-8">
        {/* Image Container with subtle decorative bg */}
        <View
          className="rounded-3xl overflow-hidden"
          style={{
            width: width * 0.82,
            height: width * 0.82,
            shadowColor: "#FF7622",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.08,
            shadowRadius: 20,
            elevation: 4,
          }}
        >
          <Image
            source={item.image}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        </View>
      </View>

      <View className="items-center px-8 pb-8">
        <Text className="text-[28px] text-secondary text-center mb-3 uppercase font-sen-extra-bold leading-9">
          {item.title}
        </Text>
        <Text className="text-[15px] text-text-gray text-center leading-6 font-sen">
          {item.description}
        </Text>
      </View>
    </View>
  );
}
