import { Category } from "@/types/api";
import { Image } from "expo-image";
import { Text, TouchableOpacity, View } from "react-native";

interface CategoryItemProps {
  category: Category | { _id: string; name: string; image: string };
  onPress: () => void;
}

export default function CategoryItem({ category, onPress }: CategoryItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center rounded-full px-1 py-1 pr-5 mr-3 bg-primary shadow-sm"
      style={{ height: 48 }}
    >
      <View className="w-10 h-10 bg-white rounded-full items-center justify-center mr-2 shadow-sm">
        <Image
          source={{ uri: category.image }}
          style={{ width: 28, height: 28, borderRadius: 14 }}
          contentFit="cover"
          transition={200}
        />
      </View>
      <Text className="font-sen-bold text-sm text-white" numberOfLines={1}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}
