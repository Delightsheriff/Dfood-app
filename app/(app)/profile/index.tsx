import { useAuth } from "@/contexts/AuthContext";
import { useSignOut } from "@/hooks/useAuthMutations";
import { useProfile } from "@/hooks/useDataQueries";
import { useRouter } from "expo-router";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  Heart,
  HelpCircle,
  LogOut,
  MapPin,
  Settings,
  ShoppingBag,
  User,
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type MenuItemType = {
  icon: any;
  label: string;
  color: string;
  onPress?: () => void;
  badge?: number;
};

type MenuSection = MenuItemType[];

export default function Profile() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: profileData, isLoading } = useProfile();
  const signOutMutation = useSignOut();

  const profile = profileData?.data.profile;

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => signOutMutation.mutate(),
      },
    ]);
  };

  const menuSections: MenuSection[] = [
    [
      {
        icon: User,
        label: "Personal Info",
        color: "#FF7622",
        onPress: () => router.push("/profile/personal-info" as any),
      },
      {
        icon: MapPin,
        label: "Addresses",
        color: "#2D8EFF",
        onPress: () => {
          Alert.alert("Coming Soon", "Address management is not yet available");
        },
      },
    ],
    [
      {
        icon: ShoppingBag,
        label: "Cart",
        color: "#2D8EFF",
        onPress: () => router.push("/cart"),
      },
      {
        icon: FileText,
        label: "My Orders",
        color: "#FF7622",
        onPress: () => {
          Alert.alert("Coming Soon", "Order history is not yet available");
        },
      },
      {
        icon: Heart,
        label: "Favourite",
        color: "#FF4B4B",
        onPress: () => {
          Alert.alert("Coming Soon", "Favourites feature is not yet available");
        },
      },
      {
        icon: Bell,
        label: "Notifications",
        color: "#FF7622",
        onPress: () => {
          Alert.alert("Coming Soon", "Notifications are not yet available");
        },
      },
      {
        icon: CreditCard,
        label: "Payment Method",
        color: "#2D8EFF",
        onPress: () => {
          Alert.alert("Coming Soon", "Payment methods are not yet available");
        },
      },
    ],
    [
      {
        icon: HelpCircle,
        label: "FAQs",
        color: "#FF7622",
        onPress: () => {
          Alert.alert("Coming Soon", "FAQs are not yet available");
        },
      },
      {
        icon: Settings,
        label: "Settings",
        color: "#7E8CA0",
        onPress: () => {
          Alert.alert("Coming Soon", "Settings are not yet available");
        },
      },
    ],
  ];

  const MenuItem = ({ icon: Icon, label, onPress, color }: MenuItemType) => (
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
        <View className="w-[45px]" />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF7622" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* User Info */}
          <TouchableOpacity
            onPress={() => router.push("/profile/personal-info" as any)}
            className="flex-row items-center mb-8"
            activeOpacity={0.7}
          >
            <View className="w-[80px] h-[80px] bg-[#FFD7C5] rounded-full items-center justify-center mr-6 overflow-hidden">
              {profile?.profileImage ? (
                <Image
                  source={{ uri: profile.profileImage }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-[32px] font-sen-bold text-[#FF7622]">
                  {profile?.name?.charAt(0).toUpperCase() ||
                    user?.name?.charAt(0).toUpperCase() ||
                    "U"}
                </Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-[20px] font-sen-bold text-[#181C2E] mb-1">
                {profile?.name || user?.name || "Guest"}
              </Text>
              <Text className="text-[#A0A5BA] font-sen text-[14px] mb-1">
                {profile?.email || user?.email}
              </Text>
              {profile?.phone && (
                <Text className="text-[#A0A5BA] font-sen text-[13px]">
                  {profile.phone}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Menu Sections */}
          {menuSections.map((section, sectionIndex) => (
            <View key={sectionIndex} className="mb-6">
              {section.map((item, itemIndex) => (
                <MenuItem key={itemIndex} {...item} />
              ))}
            </View>
          ))}

          {/* Log Out */}
          <TouchableOpacity
            onPress={handleSignOut}
            disabled={signOutMutation.isPending}
            className="flex-row items-center justify-between bg-[#F6F8FA] p-4 rounded-[16px] mb-10"
          >
            <View className="flex-row items-center">
              <View className="w-[40px] h-[40px] rounded-full items-center justify-center bg-white mr-4">
                {signOutMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FF4B4B" />
                ) : (
                  <LogOut color="#FF4B4B" size={20} />
                )}
              </View>
              <Text className="text-[16px] font-sen text-[#181C2E]">
                Log Out
              </Text>
            </View>
            <ChevronRight color="#181C2E" size={20} />
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
