import { Category } from "@/types/api";
import { Image } from "expo-image";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";

const pillStyle = {
  height: 48,
  shadowColor: "#FF7622",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 6,
  elevation: 3,
} as const;

interface CategoryItemProps {
  category: Category | { _id: string; name: string; image: string };
  onPress: () => void;
}

function CategoryItem({ category, onPress }: CategoryItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [pillStyle, { opacity: pressed ? 0.7 : 1 }]}
      className="flex-row items-center rounded-full px-1.5 py-1.5 pr-5 mr-3 bg-primary"
    >
      <View className="w-9 h-9 bg-white rounded-full items-center justify-center mr-2.5">
        <Image
          source={{ uri: category.image }}
          style={{ width: 24, height: 24, borderRadius: 12 }}
          contentFit="cover"
          transition={200}
        />
      </View>
      <Text className="font-sen-bold text-sm text-white" numberOfLines={1}>
        {category.name}
      </Text>
    </Pressable>
  );
}

export default memo(CategoryItem);
