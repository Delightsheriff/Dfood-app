import { Search } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

const searchBarShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.04,
  shadowRadius: 6,
  elevation: 1,
} as const;

interface SearchBarProps {
  onPress: () => void;
}

export default function SearchBar({ onPress }: SearchBarProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      className="mb-6"
    >
      <View
        className="flex-row items-center bg-[#F0F5FA] rounded-2xl px-5 h-[52px]"
        style={searchBarShadow}
      >
        <View className="w-8 h-8 bg-white rounded-xl items-center justify-center mr-3">
          <Search color="#FF7622" size={16} />
        </View>
        <Text className="flex-1 font-sen text-sm text-[#A0A5BA]">
          Search dishes, restaurants
        </Text>
      </View>
    </Pressable>
  );
}
