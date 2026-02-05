import RestaurantCard from "@/components/RestaurantCard";
import { RESTAURANTS } from "@/constants/mocks";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AllRestaurants() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-row items-center px-6 py-4 border-b border-[#F0F5FA]">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-11 h-11 bg-[#ECF0F4] rounded-full items-center justify-center mr-3"
        >
          <ChevronLeft color="#181C2E" size={22} />
        </TouchableOpacity>
        <Text className="text-lg font-sen-bold text-secondary flex-1">
          All Restaurants
        </Text>
      </View>

      <FlatList
        data={RESTAURANTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RestaurantCard
            restaurant={item}
            onPress={() => router.push(`/restaurant/${item.id}`)}
          />
        )}
        contentContainerClassName="px-6 pt-4 pb-6"
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View className="h-4" />}
      />
    </SafeAreaView>
  );
}
