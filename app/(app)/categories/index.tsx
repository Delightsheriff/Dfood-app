import CategoryItem from "@/components/CategoryItem";
import { useCategories } from "@/hooks/useDataQueries";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AllCategories() {
  const router = useRouter();
  const { data: categoriesData, isLoading } = useCategories();

  const categories = categoriesData?.data.categories || [];

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

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF7622" />
        </View>
      ) : categories.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-text-gray font-sen text-base text-center">
            No categories available
          </Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item._id}
          numColumns={2}
          renderItem={({ item }) => (
            <View className="flex-1 max-w-[50%] p-2">
              <CategoryItem
                category={item}
                onPress={() =>
                  router.push({
                    pathname: "/(app)/categories/[id]",
                    params: { id: item._id },
                  })
                }
              />
            </View>
          )}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 24,
          }}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{ gap: 0 }}
        />
      )}
    </SafeAreaView>
  );
}
