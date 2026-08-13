import { FilterVerticalIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";

interface SearchBarProps {
  onPress: () => void;
  placeholder?: string;
}

function SearchBar({
  onPress,
  placeholder = 'Search "Pizza", "Jollof", "Burgers"...',
}: SearchBarProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Search restaurants and dishes"
      className="w-full"
    >
      <View
        className="flex-row items-center bg-surface-muted rounded-2xl px-4 h-12"
        style={{
          borderCurve: "continuous",
        }}
      >
        <HugeiconsIcon icon={Search01Icon} size={18} color="#646982" />
        <Text
          numberOfLines={1}
          className="flex-1 font-body text-[14px] text-text-gray ml-2.5"
        >
          {placeholder}
        </Text>
        <View className="w-8 h-8 rounded-xl bg-white items-center justify-center">
          <HugeiconsIcon icon={FilterVerticalIcon} size={16} color="#262B33" />
        </View>
      </View>
    </Pressable>
  );
}

export default memo(SearchBar);
