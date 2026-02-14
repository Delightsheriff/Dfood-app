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
      className="flex-row items-center rounded-full px-1.5 py-1.5 pr-5 mr-3 bg-primary"
      style={{
        height: 48,
        shadowColor: "#FF7622",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 3,
      }}
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
    </TouchableOpacity>
  );
}
