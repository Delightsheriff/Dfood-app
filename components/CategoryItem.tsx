// components/ui/CategoryItem.tsx
import { Image, Text, TouchableOpacity, View } from "react-native";

interface Category {
  id: string;
  name: string;
  image: string;
}

interface CategoryItemProps {
  category: Category;
  isSelected: boolean;
  onPress: () => void;
}

export default function CategoryItem({
  category,
  isSelected,
  onPress,
}: CategoryItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center rounded-full px-1 py-1 pr-5 mr-3 ${
        isSelected ? "bg-primary shadow-sm" : "bg-white border border-[#EDEDED]"
      }`}
      style={{ height: 48 }}
    >
      <View className="w-10 h-10 bg-white rounded-full items-center justify-center mr-2 shadow-sm">
        <Image
          source={{ uri: category.image }}
          style={{ width: 28, height: 28 }}
          resizeMode="contain"
        />
      </View>
      <Text
        className={`font-sen-bold text-sm ${
          isSelected ? "text-white" : "text-secondary"
        }`}
        numberOfLines={1}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}
