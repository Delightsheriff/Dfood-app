import { AuthSheet } from "@/components/auth/auth-sheet";
import { IconButton } from "@/components/ui/icon-button";
import { ScreenHeader } from "@/components/ui/screen-header";
import {
  useProgressiveBlurHeaderHeight,
  useProgressiveBlurScroll,
} from "@/components/ui/progressive-blur";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { Host, Switch } from "@expo/ui";
import {
  ArrowRight01Icon,
  CloudSavingDone01Icon,
  CreditCardIcon,
  HeartIcon,
  InformationCircleIcon,
  Location01Icon,
  Login01Icon,
  Logout01Icon,
  Notification02Icon,
  RepeatIcon,
  UserCircle02Icon,
  UserEdit01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCENT = "#E0533A";

export default function Profile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { scrollY, onScroll } = useProgressiveBlurScroll();
  const headerHeight = useProgressiveBlurHeaderHeight(52);

  const name = useProfileStore((state) => state.name);
  const avatarUri = useProfileStore((state) => state.avatarUri);
  const bio = useProfileStore((state) => state.bio);

  const { user, syncStatus, signOut, syncNow } = useAuthStore();
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [authSheetVisible, setAuthSheetVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const accountItems = [
    {
      icon: UserEdit01Icon,
      label: "Personal Information",
      onPress: () => router.push("/profile/personal-info" as any),
    },
    {
      icon: Location01Icon,
      label: "Delivery Addresses",
      onPress: () => router.push("/profile/addresses" as any),
    },
    {
      icon: CreditCardIcon,
      label: "Payment Methods",
      onPress: () => router.push("/profile/payment-methods" as any),
    },
    {
      icon: HeartIcon,
      label: "Saved Favourites",
      onPress: () => router.push("/profile/favourites" as any),
    },
    ...(user
      ? [
          {
            icon: Logout01Icon,
            label: "Sign Out",
            onPress: handleSignOut,
          },
        ]
      : []),
  ];

  const menuSections = [
    {
      title: "Account",
      items: accountItems,
    },
    {
      title: "Preferences & Info",
      items: [
        {
          icon: Notification02Icon,
          label: "Order & Deal Alerts",
          // @expo/ui's Universal components render nothing (and throw at
          // runtime, not at bundle time) unless wrapped in a Host — the
          // bundle looks clean and the crash only appears when this row
          // actually mounts. matchContents keeps the wrapper sized to the
          // switch instead of stretching to fill the row.
          rightElement: (
            <Host matchContents>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              />
            </Host>
          ),
          onPress: () => setNotificationsEnabled((prev) => !prev),
        },
        {
          icon: InformationCircleIcon,
          label: "About Dfood & Attributions",
          onPress: () => setAboutModalVisible(true),
        },
      ],
    },
  ];

  return (
    <View className="flex-1 bg-white">
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: headerHeight + 16,
          paddingBottom: insets.bottom + 32,
        }}
      >
        {/* Profile Info Banner Card */}
        <View className="flex-row items-center justify-between mb-4 p-4 bg-surface-muted rounded-[24px]">
          <View className="flex-row items-center flex-1 mr-3">
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={{ width: 64, height: 64, borderRadius: 32 }}
                contentFit="cover"
              />
            ) : (
              <View className="w-16 h-16 rounded-full bg-white items-center justify-center">
                <HugeiconsIcon
                  icon={UserCircle02Icon}
                  size={38}
                  color={ACCENT}
                />
              </View>
            )}

            <View className="ml-3.5 flex-1">
              <Text
                numberOfLines={1}
                className="text-xl font-display text-secondary"
              >
                {name || (user ? user.displayName || "Foodie" : "Foodie")}
              </Text>
              <Text
                numberOfLines={1}
                className="text-xs font-body text-text-gray mt-0.5"
              >
                {bio || (user?.email ? user.email : "Dfood Explorer")}
              </Text>
            </View>
          </View>

          <IconButton
            icon={UserEdit01Icon}
            accessibilityLabel="Edit profile"
            size={18}
            onPress={() => router.push("/profile/personal-info" as any)}
          />
        </View>

        {/* Cloud Sync & Account Banner */}
        <View
          className="p-4 mb-6 rounded-[20px] bg-[#FFF8F6] border border-[#FFE8E4] flex-row items-center justify-between"
          style={{ borderCurve: "continuous" }}
        >
          {user ? (
            <View className="flex-row items-center flex-1 mr-3">
              <View className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3">
                <HugeiconsIcon
                  icon={syncStatus === "syncing" ? RepeatIcon : CloudSavingDone01Icon}
                  size={20}
                  color={ACCENT}
                />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-xs font-title text-secondary">
                    Cloud Synced
                  </Text>
                  <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </View>
                <Text
                  numberOfLines={1}
                  className="text-[11px] font-body text-text-gray mt-0.5"
                >
                  {user.email}
                </Text>
              </View>
            </View>
          ) : (
            <View className="flex-row items-center flex-1 mr-3">
              <View className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3">
                <HugeiconsIcon icon={Login01Icon} size={20} color={ACCENT} />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-title text-secondary">
                  Guest Mode
                </Text>
                <Text className="text-[11px] font-body text-text-gray mt-0.5">
                  Sign in to back up your data to the cloud.
                </Text>
              </View>
            </View>
          )}

          {user ? (
            <Pressable
              onPress={syncNow}
              className="px-3.5 py-2 rounded-full bg-white border border-gray-200"
              style={{ borderCurve: "continuous" }}
            >
              <Text className="text-xs font-label text-secondary">
                {syncStatus === "syncing" ? "Syncing…" : "Sync Now"}
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => setAuthSheetVisible(true)}
              className="px-4 py-2 rounded-full bg-secondary"
              style={{ borderCurve: "continuous" }}
            >
              <Text className="text-xs font-label text-white">Sign In</Text>
            </Pressable>
          )}
        </View>

        {/* Menu Groups */}
        {menuSections.map((section, idx) => (
          <View key={idx} className="mb-6">
            <Text className="text-[11px] font-caption uppercase tracking-wider text-text-gray px-1 mb-2.5">
              {section.title}
            </Text>

            <View
              className="bg-surface-muted rounded-[20px] overflow-hidden"
              style={{ borderCurve: "continuous" }}
            >
              {section.items.map((item, itemIdx) => {
                const isLast = itemIdx === section.items.length - 1;
                return (
                  <Pressable
                    key={itemIdx}
                    onPress={item.onPress}
                    accessibilityRole="button"
                    accessibilityLabel={item.label}
                    className={`flex-row items-center justify-between p-4 ${
                      !isLast ? "border-b border-gray-200/50" : ""
                    }`}
                  >
                    <View className="flex-row items-center gap-3.5">
                      <View className="w-9 h-9 rounded-full bg-white items-center justify-center">
                        <HugeiconsIcon
                          icon={item.icon}
                          size={18}
                          color="#262B33"
                        />
                      </View>
                      <Text className="text-[15px] font-label text-secondary">
                        {item.label}
                      </Text>
                    </View>
                    {(item as any).rightElement ? (
                      (item as any).rightElement
                    ) : (
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        size={16}
                        color="#646982"
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        {/* App Version Footer */}
        <View className="items-center py-4">
          <Text className="text-xs font-body text-text-gray">
            Dfood Application v1.0.0
          </Text>
        </View>
      </Animated.ScrollView>

      {/* About & Attribution Modal */}
      <Modal
        visible={aboutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAboutModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center px-6">
          <View className="bg-white rounded-[24px] p-6">
            <Text className="text-xl font-title text-secondary mb-2">
              About Dfood
            </Text>
            <Text className="text-xs font-body text-text-gray mb-4 leading-5">
              Dfood is an on-demand food delivery discovery experience built with React Native and Expo.
            </Text>

            <View className="p-4 bg-surface-muted rounded-2xl mb-5 gap-3">
              <Text className="text-xs font-title text-secondary">
                Data & Media Attributions:
              </Text>
              <Text className="text-xs font-body text-text-gray leading-5">
                • Map & Restaurant coordinates: © OpenStreetMap contributors
              </Text>
              <Text className="text-xs font-body text-text-gray leading-5">
                • Recipe data & Dish imagery: TheMealDB free recipe database
              </Text>
            </View>

            <Pressable
              onPress={() => setAboutModalVisible(false)}
              className="w-full h-12 bg-secondary rounded-full items-center justify-center"
            >
              <Text className="text-white font-label text-sm">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Google / Apple Auth Sheet */}
      <AuthSheet
        visible={authSheetVisible}
        onClose={() => setAuthSheetVisible(false)}
      />

      {/* Large Header with Progressive Blur */}
      <ScreenHeader
        variant="large"
        scrollY={scrollY}
        barHeight={52}
        title="Profile"
      />
    </View>
  );
}
