import { useAuth } from "@/contexts/AuthContext";
import { useSignOut } from "@/hooks/useAuthMutations";
import { useProfile } from "@/hooks/useDataQueries";
import { Image } from "expo-image";
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
  bgColor: string;
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
        bgColor: "#FFF5EE",
        onPress: () => router.push("/profile/personal-info" as any),
      },
      {
        icon: MapPin,
        label: "Addresses",
        color: "#2D8EFF",
        bgColor: "#EBF4FF",
        onPress: () => router.push("/profile/addresses" as any),
      },
    ],
    [
      {
        icon: ShoppingBag,
        label: "Cart",
        color: "#2D8EFF",
        bgColor: "#EBF4FF",
        onPress: () => router.push("/cart"),
      },
      {
        icon: FileText,
        label: "My Orders",
        color: "#FF7622",
        bgColor: "#FFF5EE",
        onPress: () => {
          router.push("/profile/orders" as any);
        },
      },
      {
        icon: Heart,
        label: "Favourite",
        color: "#FF4B4B",
        bgColor: "#FFF0F0",
        onPress: () => {
          router.push("/profile/favourites");
        },
      },

      {
        icon: Bell,
        label: "Notifications",
        color: "#FF7622",
        bgColor: "#FFF5EE",
        onPress: () => {
          Alert.alert("Coming Soon", "Notifications are not yet available");
        },
      },
      {
        icon: CreditCard,
        label: "Payment Method",
        color: "#2D8EFF",
        bgColor: "#EBF4FF",
        onPress: () => router.push("/profile/payment-methods" as any),
      },
    ],
    [
      {
        icon: HelpCircle,
        label: "FAQs",
        color: "#FF7622",
        bgColor: "#FFF5EE",
        onPress: () => {
          Alert.alert("Coming Soon", "FAQs are not yet available");
        },
      },
      {
        icon: Settings,
        label: "Settings",
        color: "#7E8CA0",
        bgColor: "#F0F5FA",
        onPress: () => {
          Alert.alert("Coming Soon", "Settings are not yet available");
        },
      },
    ],
  ];

  const MenuItem = ({
    icon: Icon,
    label,
    onPress,
    color,
    bgColor,
  }: MenuItemType) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between bg-[#F6F8FA] p-4 rounded-2xl mb-3"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
      }}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mr-4"
          style={{ backgroundColor: bgColor }}
        >
          <Icon color={color} size={20} />
        </View>
        <Text className="text-base font-sen text-secondary">{label}</Text>
      </View>
      <ChevronRight color="#A0A5BA" size={18} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar barStyle="dark-content" />

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
          Profile
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF7622" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
        >
          {/* User Info Card */}
          <TouchableOpacity
            onPress={() => router.push("/profile/personal-info" as any)}
            className="flex-row items-center mb-8 p-4 bg-[#F6F8FA] rounded-2xl"
            activeOpacity={0.7}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View
              className="w-[72px] h-[72px] bg-[#FFD7C5] rounded-2xl items-center justify-center mr-4 overflow-hidden"
              style={{
                shadowColor: "#FF7622",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              {profile?.profileImage ? (
                <Image
                  source={{ uri: profile.profileImage }}
                  className="w-full h-full"
                  contentFit="cover"
                />
              ) : (
                <Text className="text-[28px] font-sen-bold text-primary">
                  {profile?.name?.charAt(0).toUpperCase() ||
                    user?.name?.charAt(0).toUpperCase() ||
                    "U"}
                </Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-lg font-sen-bold text-secondary mb-0.5">
                {profile?.name || user?.name || "Guest"}
              </Text>
              <Text className="text-text-gray font-sen text-sm mb-0.5">
                {profile?.email || user?.email}
              </Text>
              {profile?.phone && (
                <Text className="text-text-gray font-sen text-xs">
                  {profile.phone}
                </Text>
              )}
            </View>
            <ChevronRight color="#A0A5BA" size={18} />
          </TouchableOpacity>

          {/* Menu Sections */}
          {menuSections.map((section, sectionIndex) => (
            <View key={sectionIndex} className="mb-5">
              {section.map((item, itemIndex) => (
                <MenuItem key={itemIndex} {...item} />
              ))}
            </View>
          ))}

          {/* Log Out */}
          <TouchableOpacity
            onPress={handleSignOut}
            disabled={signOutMutation.isPending}
            className="flex-row items-center justify-between bg-[#FFF0F0] p-4 rounded-2xl mb-6"
            style={{
              borderWidth: 1,
              borderColor: "#FECACA",
              shadowColor: "#FF4B4B",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 4,
              elevation: 1,
            }}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-white rounded-xl items-center justify-center mr-4">
                {signOutMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FF4B4B" />
                ) : (
                  <LogOut color="#FF4B4B" size={20} />
                )}
              </View>
              <Text className="text-base font-sen text-red-600">Log Out</Text>
            </View>
            <ChevronRight color="#FF4B4B" size={18} />
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
