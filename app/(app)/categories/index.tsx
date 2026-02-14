import CategoryItem from "@/components/CategoryItem";
import { useCategories } from "@/hooks/useDataQueries";
import { useRouter } from "expo-router";
import { ChevronLeft, Grid3X3 } from "lucide-react-native";
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
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-11 h-11 bg-[#F0F5FA] rounded-2xl items-center justify-center mr-3"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <ChevronLeft color="#181C2E" size={22} />
        </TouchableOpacity>
        <Text className="text-lg font-sen-bold text-secondary flex-1">
          All Categories
        </Text>
        {categories.length > 0 && (
          <View className="bg-[#F0F5FA] px-3 py-1.5 rounded-lg">
            <Text className="text-text-gray font-sen text-xs">
              {categories.length}
            </Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF7622" />
        </View>
      ) : categories.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 bg-[#F0F5FA] rounded-3xl items-center justify-center mb-5">
            <Grid3X3 color="#A0A5BA" size={32} />
          </View>
          <Text className="text-secondary font-sen-bold text-base text-center mb-2">
            No categories available
          </Text>
          <Text className="text-text-gray font-sen text-sm text-center">
            Categories will appear here once added
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
            paddingTop: 12,
            paddingBottom: 24,
          }}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{ gap: 0 }}
        />
      )}
    </SafeAreaView>
  );
}
