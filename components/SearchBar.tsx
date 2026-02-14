import { Search } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

interface SearchBarProps {
  onPress: () => void;
}

export default function SearchBar({ onPress }: SearchBarProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} className="mb-6">
      <View
        className="flex-row items-center bg-[#F0F5FA] rounded-2xl px-5 h-[52px]"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 6,
          elevation: 1,
        }}
      >
        <View className="w-8 h-8 bg-white rounded-xl items-center justify-center mr-3">
          <Search color="#FF7622" size={16} />
        </View>
        <Text className="flex-1 font-sen text-sm text-[#A0A5BA]">
          Search dishes, restaurants
        </Text>
      </View>
    </TouchableOpacity>
  );
}
