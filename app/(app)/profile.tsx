import { useRouter } from "expo-router";
import {
  Bell,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  Heart,
  HelpCircle,
  LogOut,
  MapPin,
  MoreHorizontal,
  Settings,
  ShoppingBag,
  Star,
  User,
} from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// TODO: address should link to map view, orders should link to order history, personal info should link to editable personal info page, etc. Also add profile picture and other details, implement favourites

export default function Profile() {
  const router = useRouter();

  const MenuItem = ({
    icon: Icon,
    label,
    onPress,
    color = "#181C2E",
    bg = "white",
  }: any) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between bg-[#F6F8FA] p-4 rounded-[16px] mb-4"
    >
      <View className="flex-row items-center">
        <View className="w-[40px] h-[40px] rounded-full items-center justify-center bg-white mr-4">
          <Icon color={color} size={20} />
        </View>
        <Text className="text-[16px] font-sen text-[#181C2E]">{label}</Text>
      </View>
      <ChevronRight color="#181C2E" size={20} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white px-6 pt-2">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center justify-between mb-8">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-[45px] h-[45px] bg-[#ECF0F4] rounded-full items-center justify-center"
        >
          <ChevronLeft color="#181C2E" size={24} />
        </TouchableOpacity>
        <Text className="text-[17px] font-sen-bold text-[#181C2E]">
          Profile
        </Text>
        <TouchableOpacity className="w-[45px] h-[45px] bg-[#ECF0F4] rounded-full items-center justify-center">
          <MoreHorizontal color="#181C2E" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View className="flex-row items-center mb-8">
          <View className="w-[80px] h-[80px] bg-[#FFD7C5] rounded-full items-center justify-center mr-6">
            {/* Placeholder avatar */}
          </View>
          <View>
            <Text className="text-[20px] font-sen-bold text-[#181C2E] mb-2">
              Vishal Khadok
            </Text>
            <Text className="text-[#A0A5BA] font-sen text-[14px]">
              I love fast food
            </Text>
          </View>
        </View>

        {/* Menu Groups */}
        <View className="mb-6">
          <MenuItem
            icon={User}
            label="Personal Info"
            color="#FF7622"
            onPress={() => router.push("/profile/personal-info")}
          />
          <MenuItem
            icon={MapPin}
            label="Addresses"
            color="#2D8EFF"
            onPress={() => router.push("/profile/addresses")}
          />
        </View>

        <View className="mb-6">
          <MenuItem
            icon={ShoppingBag}
            label="Cart"
            color="#2D8EFF"
            onPress={() => router.push("/cart")}
          />
          <MenuItem
            icon={FileText}
            label="My Orders"
            color="#FF7622"
            onPress={() => router.push("/orders")}
          />
          <MenuItem icon={Heart} label="Favourite" color="#FF4B4B" />
          <MenuItem icon={Bell} label="Notifications" color="#FF7622" />
          <MenuItem icon={CreditCard} label="Payment Method" color="#2D8EFF" />
        </View>

        <View className="mb-6">
          <MenuItem icon={HelpCircle} label="FAQs" color="#FF7622" />
          <MenuItem icon={Star} label="User Reviews" color="#2D8EFF" />
          <MenuItem icon={Settings} label="Settings" color="#7E8CA0" />
          <MenuItem
            icon={ChefHat}
            label="Switch to Chef View"
            color="#FF7622"
            onPress={() => router.push("/chef")}
          />
        </View>

        <TouchableOpacity className="flex-row items-center justify-between bg-[#F6F8FA] p-4 rounded-[16px] mb-10">
          <View className="flex-row items-center">
            <View className="w-[40px] h-[40px] rounded-full items-center justify-center bg-white mr-4">
              <LogOut color="#FF4B4B" size={20} />
            </View>
            <Text className="text-[16px] font-sen text-[#181C2E]">Log Out</Text>
          </View>
          <ChevronRight color="#181C2E" size={20} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
