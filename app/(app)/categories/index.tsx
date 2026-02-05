/* eslint-disable import/no-unresolved */
import CategoryItem from "@/components/CategoryItem";
import { CATEGORIES } from "@/constants/mocks";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AllCategories() {
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
          All Categories
        </Text>
      </View>

      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <View className="flex-1 max-w-[50%] p-2">
            <CategoryItem
              category={item}
              isSelected={false}
              onPress={() =>
                router.push({
                  pathname: "/(app)/categories/[id]",
                  params: { id: item.id },
                })
              }
            />
          </View>
        )}
        contentContainerClassName="px-4 pt-4 pb-6"
        showsVerticalScrollIndicator={false}
        columnWrapperClassName="gap-0"
      />
    </SafeAreaView>
  );
}
