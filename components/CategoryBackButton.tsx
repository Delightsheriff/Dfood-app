// components/CategoryBackButton.tsx
import { useRouter } from "expo-router";
import { ChevronLeft, SlidersHorizontal } from "lucide-react-native";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import FilterDialog, { FilterOptions } from "./FilterDialog";

const CategoryBackButton = ({ category }: { category: { name: string } }) => {
  const router = useRouter();
  const [filterOpen, setFilterOpen] = useState(false);

  const handleApplyFilters = (filters: FilterOptions) => {
    console.log("Applied filters:", filters);
    // TODO: Implement filter logic
  };

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

            <TouchableOpacity className="flex-row items-center flex-1">
              <Text className="text-secondary font-sen-bold text-sm uppercase mr-2">
                {category.name}
              </Text>
            </TouchableOpacity>
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
