import { useCategories } from "@/hooks/useDataQueries";
import { useRouter } from "expo-router";
import { ChevronLeft, SlidersHorizontal } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import FilterDialog, { FilterOptions } from "./FilterDialog";

const iconButtonShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 4,
  elevation: 2,
} as const;

const CategoryBackButton = ({ categoryId }: { categoryId: string }) => {
  const router = useRouter();
  const [filterOpen, setFilterOpen] = useState(false);
  const { data: categoriesData, isLoading } = useCategories();

  const handleApplyFilters = (filters: FilterOptions) => {
    console.log("Applied filters:", filters);
    // TODO: Implement filter logic
  };

  const category = categoriesData?.data.categories.find(
    (cat) => cat._id === categoryId,
  );

  return (
    <>
      <View className="px-6 py-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Pressable
              onPress={() => router.back()}
              className="w-11 h-11 bg-[#F0F5FA] rounded-2xl items-center justify-center mr-3"
              style={({ pressed }) => [
                iconButtonShadow,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <ChevronLeft color="#181C2E" size={22} />
            </Pressable>

            <View className="flex-row items-center flex-1">
              {isLoading ? (
                <ActivityIndicator size="small" color="#FF7622" />
              ) : (
                <Text className="text-lg font-sen-bold text-secondary">
                  {category?.name || "Category"}
                </Text>
              )}
            </View>
          </View>

          <Pressable
            onPress={() => setFilterOpen(true)}
            className="w-11 h-11 bg-[#F0F5FA] rounded-2xl items-center justify-center ml-2"
            style={({ pressed }) => [
              iconButtonShadow,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <SlidersHorizontal color="#181C2E" size={18} />
          </Pressable>
        </View>
      </View>

      <FilterDialog
        open={filterOpen}
        onOpenChange={setFilterOpen}
        onApplyFilters={handleApplyFilters}
      />
    </>
  );
};

export default CategoryBackButton;
