import { IconButton } from "@/components/ui/icon-button";
import { useProfileStore } from "@/store/profileStore";
import {
  ArrowRight01Icon,
  CreditCardIcon,
  HeartIcon,
  InformationCircleIcon,
  Location01Icon,
  Notification02Icon,
  UserCircle02Icon,
  UserEdit01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCENT = "#E0533A";

export default function Profile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const name = useProfileStore((state) => state.name);
  const avatarUri = useProfileStore((state) => state.avatarUri);
  const bio = useProfileStore((state) => state.bio);

  const [aboutModalVisible, setAboutModalVisible] = useState(false);

  const menuSections = [
    {
      title: "Account",
      items: [
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
      ],
    },
    {
      title: "Preferences & Info",
      items: [
        {
          icon: Notification02Icon,
          label: "Notifications",
          onPress: () => {},
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 32,
        }}
      >
        {/* Profile Header */}
        <View className="flex-row items-center justify-between mb-8 pt-2">
          <View className="flex-row items-center flex-1 mr-3">
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={{ width: 68, height: 68, borderRadius: 34 }}
                contentFit="cover"
              />
            ) : (
              <View className="w-[68px] h-[68px] rounded-full bg-surface-muted items-center justify-center">
                <HugeiconsIcon
                  icon={UserCircle02Icon}
                  size={42}
                  color={ACCENT}
                />
              </View>
            )}

            <View className="ml-4 flex-1">
              <Text
                numberOfLines={1}
                className="text-2xl font-sen-extra-bold text-secondary"
              >
                {name || "Foodie"}
              </Text>
              <Text
                numberOfLines={1}
                className="text-xs font-sen text-text-gray mt-0.5"
              >
                {bio || "Dfood Explorer"}
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

        {/* Menu Groups */}
        {menuSections.map((section, idx) => (
          <View key={idx} className="mb-6">
            <Text className="text-[11px] font-sen-bold uppercase tracking-wider text-text-gray px-1 mb-2.5">
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
                      <Text className="text-[15px] font-sen-medium text-secondary">
                        {item.label}
                      </Text>
                    </View>
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={16}
                      color="#646982"
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        {/* App Version Footer */}
        <View className="items-center py-4">
          <Text className="text-xs font-sen text-text-gray">
            Dfood Application v1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* About & Attribution Modal */}
      <Modal
        visible={aboutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAboutModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center px-6">
          <View className="bg-white rounded-[24px] p-6">
            <Text className="text-xl font-sen-bold text-secondary mb-2">
              About Dfood
            </Text>
            <Text className="text-xs font-sen text-text-gray mb-4 leading-5">
              Dfood is an on-demand food delivery discovery experience built with React Native and Expo.
            </Text>

            <View className="p-4 bg-surface-muted rounded-2xl mb-5 gap-3">
              <Text className="text-xs font-sen-bold text-secondary">
                Data & Media Attributions:
              </Text>
              <Text className="text-xs font-sen text-text-gray leading-5">
                • Map & Restaurant coordinates: © OpenStreetMap contributors
              </Text>
              <Text className="text-xs font-sen text-text-gray leading-5">
                • Recipe data & Dish imagery: TheMealDB free recipe database
              </Text>
            </View>

            <Pressable
              onPress={() => setAboutModalVisible(false)}
              className="w-full h-12 bg-secondary rounded-full items-center justify-center"
            >
              <Text className="text-white font-sen-bold text-sm">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
