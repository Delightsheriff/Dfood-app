import { Search } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

interface SearchBarProps {
  onPress: () => void;
}

export default function SearchBar({ onPress }: SearchBarProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} className="mb-6">
      <View className="flex-row items-center bg-[#F6F6F6] rounded-xl px-4 h-[52px]">
        <Search color="#A0A5BA" size={20} />
        <Text className="flex-1 ml-3 font-sen text-sm text-[#A0A5BA]">
          Search dishes, restaurants
        </Text>
      </View>
    </TouchableOpacity>
  );
}
