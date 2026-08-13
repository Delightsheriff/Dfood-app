import { IconButton } from "@/components/ui/icon-button";
import { SortOption, useSearchStore } from "@/store/searchStore";
import { Cancel01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCENT = "#E0533A";

interface SearchFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  resultCount?: number;
}

export default function SearchFilterSheet({
  visible,
  onClose,
  resultCount,
}: SearchFilterSheetProps) {
  const insets = useSafeAreaInsets();
  const filters = useSearchStore((state) => state.filters);
  const setFilter = useSearchStore((state) => state.setFilter);
  const resetFilters = useSearchStore((state) => state.resetFilters);
  const activeCount = useSearchStore((state) => state.getActiveFilterCount());

  const sortOptions: { id: SortOption; label: string }[] = [
    { id: "relevance", label: "Relevance" },
    { id: "rating", label: "Rating: High to Low" },
    { id: "delivery_time", label: "Fastest Delivery" },
    { id: "price", label: "Cost: Low to High" },
  ];

  const priceTiers = ["$", "$$", "$$$", "$$$$"];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        {/* Backdrop dismiss */}
        <Pressable className="flex-1" onPress={onClose} />

        {/* Sheet Content */}
        <View
          className="bg-white rounded-t-[28px] max-h-[85%] overflow-hidden"
          style={{
            borderCurve: "continuous",
            paddingBottom: insets.bottom + 16,
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
            <View>
              <Text className="text-xl font-sen-bold text-secondary">
                Filter & Sort
              </Text>
              {activeCount > 0 && (
                <Text className="text-xs font-sen text-primary mt-0.5">
                  {activeCount} {activeCount === 1 ? "filter" : "filters"} applied
                </Text>
              )}
            </View>

            <View className="flex-row items-center gap-3">
              {activeCount > 0 && (
                <Pressable onPress={resetFilters}>
                  <Text className="text-xs font-sen-bold text-text-gray uppercase tracking-wider">
                    Clear all
                  </Text>
                </Pressable>
              )}
              <IconButton
                icon={Cancel01Icon}
                accessibilityLabel="Close filter sheet"
                size={18}
                className="w-9 h-9"
                onPress={onClose}
              />
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            className="px-6 py-4"
          >
            {/* Sort Options */}
            <View className="mb-6">
              <Text className="text-[11px] font-sen-bold uppercase tracking-wider text-text-gray mb-3">
                Sort By
              </Text>
              <View className="gap-2">
                {sortOptions.map((option) => {
                  const isSelected = filters.sortBy === option.id;
                  return (
                    <Pressable
                      key={option.id}
                      onPress={() => setFilter("sortBy", option.id)}
                      className={`flex-row items-center justify-between p-3.5 rounded-2xl border ${
                        isSelected
                          ? "bg-[#FFF5F3] border-primary"
                          : "bg-surface-muted border-transparent"
                      }`}
                      style={{ borderCurve: "continuous" }}
                    >
                      <Text
                        className={`text-sm ${
                          isSelected
                            ? "font-sen-bold text-primary"
                            : "font-sen text-secondary"
                        }`}
                      >
                        {option.label}
                      </Text>
                      {isSelected && (
                        <HugeiconsIcon
                          icon={CheckmarkCircle02Icon}
                          size={18}
                          color={ACCENT}
                        />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Quick Filters */}
            <View className="mb-6">
              <Text className="text-[11px] font-sen-bold uppercase tracking-wider text-text-gray mb-3">
                Quick Options
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {[
                  {
                    key: "openNow" as const,
                    label: "Open now",
                    active: filters.openNow,
                  },
                  {
                    key: "freeDelivery" as const,
                    label: "Free delivery",
                    active: filters.freeDelivery,
                  },
                  {
                    key: "topRated" as const,
                    label: "Top rated (4.5+)",
                    active: filters.topRated,
                  },
                  {
                    key: "under30Min" as const,
                    label: "Under 30 mins",
                    active: filters.under30Min,
                  },
                ].map((item) => (
                  <Pressable
                    key={item.key}
                    onPress={() => setFilter(item.key, !item.active)}
                    className={`px-4 py-2.5 rounded-full border ${
                      item.active
                        ? "bg-secondary border-secondary"
                        : "bg-surface-muted border-transparent"
                    }`}
                    style={{ borderCurve: "continuous" }}
                  >
                    <Text
                      className={`text-xs ${
                        item.active
                          ? "font-sen-bold text-white"
                          : "font-sen-medium text-secondary"
                      }`}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Price Level */}
            <View className="mb-8">
              <Text className="text-[11px] font-sen-bold uppercase tracking-wider text-text-gray mb-3">
                Price Level
              </Text>
              <View className="flex-row gap-2.5">
                {priceTiers.map((tier) => {
                  const isSelected = filters.priceLevel === tier;
                  return (
                    <Pressable
                      key={tier}
                      onPress={() =>
                        setFilter("priceLevel", isSelected ? null : tier)
                      }
                      className={`flex-1 py-3 items-center justify-center rounded-2xl border ${
                        isSelected
                          ? "bg-primary border-primary"
                          : "bg-surface-muted border-transparent"
                      }`}
                      style={{ borderCurve: "continuous" }}
                    >
                      <Text
                        className={`text-sm ${
                          isSelected
                            ? "font-sen-bold text-white"
                            : "font-sen-medium text-secondary"
                        }`}
                      >
                        {tier}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer CTA */}
          <View className="px-6 pt-3">
            <Pressable
              onPress={onClose}
              className="w-full h-14 bg-secondary rounded-full items-center justify-center"
              style={{
                borderCurve: "continuous",
                boxShadow: "0px 4px 12px rgba(38,43,51,0.25)",
              }}
            >
              <Text className="text-white font-sen-bold text-base">
                {resultCount !== undefined
                  ? `Show ${resultCount} Results`
                  : "Apply Filters"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
