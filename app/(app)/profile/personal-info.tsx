import { ButtonText } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { useProfileStore } from "@/store/profileStore";
import {
  ArrowLeft01Icon,
  Camera01Icon,
  Delete02Icon,
  UserCircle02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCENT = "#E0533A";

export default function PersonalInfo() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const storedName = useProfileStore((state) => state.name);
  const storedAvatarUri = useProfileStore((state) => state.avatarUri);
  const storedBio = useProfileStore((state) => state.bio);

  const setName = useProfileStore((state) => state.setName);
  const setAvatarUri = useProfileStore((state) => state.setAvatarUri);
  const setBio = useProfileStore((state) => state.setBio);

  const [nameInput, setNameInput] = useState(storedName);
  const [bioInput, setBioInput] = useState(storedBio);
  const [avatarUri, setLocalAvatarUri] = useState<string | null>(storedAvatarUri);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library to pick an avatar.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setLocalAvatarUri(result.assets[0].uri);
    }
  };

  const handleRemoveImage = () => {
    setLocalAvatarUri(null);
  };

  const handleSave = () => {
    if (!nameInput.trim()) {
      Alert.alert("Name Required", "Please enter your name.");
      return;
    }

    setName(nameInput.trim());
    setBio(bioInput.trim());
    setAvatarUri(avatarUri);

    Alert.alert("Profile Saved", "Your profile details have been updated.");
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View
          className="px-5 pt-3 pb-3 border-b border-gray-100 flex-row items-center justify-between"
          style={{ paddingTop: insets.top + 4 }}
        >
          <IconButton
            icon={ArrowLeft01Icon}
            accessibilityLabel="Go back"
            onPress={() => router.back()}
          />
          <Text className="text-[17px] font-title text-secondary">
            Personal Information
          </Text>
          <View className="w-11" />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 24,
            paddingBottom: insets.bottom + 40,
          }}
        >
          {/* Avatar Section */}
          <View className="items-center mb-8">
            <View className="relative">
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={{ width: 100, height: 100, borderRadius: 50 }}
                  contentFit="cover"
                />
              ) : (
                <View className="w-[100px] h-[100px] rounded-full bg-surface-muted items-center justify-center">
                  <HugeiconsIcon
                    icon={UserCircle02Icon}
                    size={60}
                    color={ACCENT}
                  />
                </View>
              )}

              {/* Camera Picker button */}
              <Pressable
                onPress={handlePickImage}
                className="absolute bottom-0 right-0 w-9 h-9 bg-secondary rounded-full items-center justify-center"
                style={{
                  boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
                }}
              >
                <HugeiconsIcon
                  icon={Camera01Icon}
                  size={18}
                  color="#FFFFFF"
                />
              </Pressable>
            </View>

            {avatarUri && (
              <Pressable
                onPress={handleRemoveImage}
                className="mt-3 flex-row items-center gap-1.5"
              >
                <HugeiconsIcon icon={Delete02Icon} size={14} color="#EF4444" />
                <Text className="text-xs font-label text-red-500">
                  Remove photo
                </Text>
              </Pressable>
            )}
          </View>

          {/* Form Fields */}
          <View className="gap-5 mb-8">
            <View>
              <Text className="text-[11px] font-caption uppercase tracking-wider text-text-gray mb-2">
                Full Name
              </Text>
              <TextInput
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Enter your name"
                placeholderTextColor="#A0A5BA"
                className="p-4 bg-surface-muted rounded-[18px] font-body text-sm text-secondary"
                style={{ borderCurve: "continuous" }}
              />
            </View>

            <View>
              <Text className="text-[11px] font-caption uppercase tracking-wider text-text-gray mb-2">
                Bio / Status
              </Text>
              <TextInput
                value={bioInput}
                onChangeText={setBioInput}
                placeholder="e.g. Food explorer & pizza enthusiast"
                placeholderTextColor="#A0A5BA"
                className="p-4 bg-surface-muted rounded-[18px] font-body text-sm text-secondary"
                style={{ borderCurve: "continuous" }}
              />
            </View>
          </View>

          {/* Save Action Button */}
          <Pressable
            onPress={handleSave}
            className="w-full h-14 bg-secondary rounded-full items-center justify-center"
            style={{
              borderCurve: "continuous",
              boxShadow: "0px 4px 12px rgba(38,43,51,0.2)",
            }}
          >
            <ButtonText className="font-label text-base text-white">
              Save Profile
            </ButtonText>
          </Pressable>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
