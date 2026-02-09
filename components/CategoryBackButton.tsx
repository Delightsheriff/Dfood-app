import { useCategories } from "@/hooks/useDataQueries";
import { useRouter } from "expo-router";
import { ChevronLeft, SlidersHorizontal } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import FilterDialog, { FilterOptions } from "./FilterDialog";

const CategoryBackButton = ({ categoryId }: { categoryId: string }) => {
  const router = useRouter();
  const [filterOpen, setFilterOpen] = useState(false);
  const { data: categoriesData, isLoading } = useCategories();

  const handleApplyFilters = (filters: FilterOptions) => {
    console.log("Applied filters:", filters);
    // TODO: Implement filter logic
  };

  // Find category by ID
  const category = categoriesData?.data.categories.find(
    (cat) => cat._id === categoryId,
  );

  return (
    <>
      <View className="px-6 py-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-11 h-11 bg-[#ECF0F4] rounded-full items-center justify-center mr-3"
            >
              <ChevronLeft color="#181C2E" size={22} />
            </TouchableOpacity>

            <View className="flex-row items-center flex-1">
              {isLoading ? (
                <ActivityIndicator size="small" color="#FF7622" />
              ) : (
                <Text className="text-secondary font-sen-bold text-sm uppercase mr-2">
                  {category?.name || "Category"}
                </Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setFilterOpen(true)}
            className="w-11 h-11 bg-[#ECF0F4] rounded-full items-center justify-center ml-2"
          >
            <SlidersHorizontal color="#181C2E" size={20} />
          </TouchableOpacity>
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
