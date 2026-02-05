/* eslint-disable import/no-unresolved */
import { useRouter } from "expo-router";
import { ChevronDown, Menu, ShoppingBag } from "lucide-react-native";
import { useState } from "react";
import {
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CategoryItem from "@/components/CategoryItem";
import RestaurantCard from "@/components/RestaurantCard";
import SearchBar from "@/components/SearchBar";
import { CATEGORIES, RESTAURANTS } from "@/constants/mocks";

export default function Home() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("1");

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerClassName="px-6 pb-6"
      >
        {/* Header */}
        <View className="flex-row justify-between items-center pt-4 pb-6">
          <TouchableOpacity
            onPress={() => router.push("/profile")}
            className="w-12 h-12 bg-[#ECF0F4] rounded-full items-center justify-center"
          >
            <Menu color="#181C2E" size={24} />
          </TouchableOpacity>

          <View className="flex-1 mx-4">
            <Text className="font-sen-bold text-primary text-xs uppercase tracking-wide mb-1">
              DELIVER TO
            </Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="font-sen text-secondary text-sm mr-1">
                Halal Lab office
              </Text>
              <ChevronDown color="#181C2E" size={16} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/cart")}
            className="w-12 h-12 bg-secondary rounded-full items-center justify-center relative"
          >
            <ShoppingBag color="white" size={22} />
            <View className="absolute -top-1 -right-1 bg-primary w-5 h-5 rounded-full items-center justify-center border-2 border-white">
              <Text className="text-white text-[10px] font-sen-bold">2</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View className="mb-6">
          <Text className="font-sen text-secondary text-base">
            Hey Halal, <Text className="font-sen-bold">Good Afternoon!</Text>
          </Text>
        </View>

        {/* Search Bar */}
        <SearchBar onPress={() => router.push("/search")} />

        {/* All Categories Section */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-sen-extra-bold text-secondary">
              All Categories
            </Text>
            <TouchableOpacity onPress={() => router.push("/(app)/categories")}>
              <Text className="text-secondary font-sen text-sm">
                See All {">"}
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CATEGORIES}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CategoryItem
                category={item}
                isSelected={selectedCategory === item.id}
                onPress={() => {
                  setSelectedCategory(item.id);
                  router.push({
                    pathname: "/(app)/categories/[id]",
                    params: { id: item.id },
                  });
                }}
              />
            )}
            contentContainerClassName="pb-2"
          />
        </View>

        {/* Open Restaurants Section */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-sen-extra-bold text-secondary">
              Open Restaurants
            </Text>
            <TouchableOpacity onPress={() => router.push("/(app)/restaurants")}>
              <Text className="text-secondary font-sen text-sm">
                See All {">"}
              </Text>
            </TouchableOpacity>
          </View>

          {RESTAURANTS.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onPress={() =>
                router.push({
                  pathname: "/(app)/restaurants/[id]",
                  params: { id: restaurant.id },
                })
              }
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
