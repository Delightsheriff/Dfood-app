import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/hooks/useDataQueries";
import { Image } from "expo-image";
import {
  useDeleteProfileImage,
  useUpdateProfile,
  useUpdateProfileImage,
} from "@/hooks/useProfileMutations";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  Camera,
  ChevronLeft,
  Lock,
  Mail,
  Phone,
  Shield,
  Trash2,
  User,
} from "lucide-react-native";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function PersonalInfo() {
  const router = useRouter();
  const { data: profileData, isLoading } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const updateImageMutation = useUpdateProfileImage();
  const deleteImageMutation = useDeleteProfileImage();

  const profile = profileData?.data.profile;

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || "",
      phone: profile?.phone || "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    updateProfileMutation.mutate(
      {
        name: data.name,
        phone: data.phone || undefined,
      },
      {
        onSuccess: () => {
          Alert.alert("Success", "Profile updated successfully");
          router.back();
        },
        onError: (error: any) => {
          const message =
            error.response?.data?.message ||
            "Failed to update profile. Please try again.";
          Alert.alert("Update Failed", message);
        },
      },
    );
  };

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant camera roll permissions to upload a profile picture.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];

      const formData = new FormData();
      formData.append("image", {
        uri: asset.uri,
        type: asset.mimeType || "image/jpeg",
        name: asset.fileName || "profile.jpg",
      } as any);

      updateImageMutation.mutate(formData, {
        onSuccess: () => {
          Alert.alert("Success", "Profile picture updated successfully");
        },
        onError: (error: any) => {
          const message =
            error.response?.data?.message ||
            "Failed to update profile picture. Please try again.";
          Alert.alert("Upload Failed", message);
        },
      });
    }
  };

  const handleDeleteImage = () => {
    Alert.alert(
      "Delete Profile Picture",
      "Are you sure you want to remove your profile picture?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteImageMutation.mutate(undefined, {
              onSuccess: () => {
                Alert.alert("Success", "Profile picture removed");
              },
              onError: (error: any) => {
                const message =
                  error.response?.data?.message ||
                  "Failed to remove profile picture.";
                Alert.alert("Error", message);
              },
            });
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF7622" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1 bg-[#F6F8FA]" edges={["top"]}>
        {/* Header */}
        <View className="flex-row items-center px-6 py-4 bg-[#F6F8FA]">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-11 h-11 bg-white rounded-2xl items-center justify-center mr-3"
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
            Personal Info
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {/* ── Hero Avatar Section ── */}
          <View
            className="mx-6 mt-2 mb-6 rounded-3xl overflow-hidden"
            style={{
              shadowColor: "#FF7622",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.12,
              shadowRadius: 16,
              elevation: 6,
            }}
          >
            {/* Gradient-like warm header */}
            <View className="bg-[#FF7622] pt-8 pb-14 items-center relative">
              <View className="absolute top-0 left-0 right-0 bottom-0 opacity-20">
                <View className="absolute top-2 left-8 w-16 h-16 bg-white rounded-full" />
                <View className="absolute top-6 right-12 w-8 h-8 bg-white rounded-full" />
                <View className="absolute bottom-4 left-1/2 w-12 h-12 bg-white rounded-full" />
              </View>

              <Text className="text-white/70 font-sen text-xs uppercase tracking-widest mb-1">
                YOUR PROFILE
              </Text>
              <Text className="text-white font-sen-bold text-lg">
                {profile?.name || "Guest"}
              </Text>
            </View>

            {/* Avatar overlapping the sections */}
            <View className="bg-white px-6 pt-16 pb-5 items-center">
              <View className="absolute -top-12 self-center">
                <View
                  className="w-24 h-24 bg-[#FFD7C5] rounded-2xl items-center justify-center overflow-hidden border-4 border-white"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  {profile?.profileImage ? (
                    <Image
                      source={{ uri: profile.profileImage }}
                      className="w-full h-full"
                      contentFit="cover"
                    />
                  ) : (
                    <Text className="text-[36px] font-sen-bold text-primary">
                      {profile?.name?.charAt(0).toUpperCase() || "U"}
                    </Text>
                  )}
                </View>

                {/* Camera Button */}
                <TouchableOpacity
                  onPress={handleImagePick}
                  disabled={updateImageMutation.isPending}
                  className="absolute -bottom-1 -right-1 w-9 h-9 bg-primary rounded-xl items-center justify-center border-[3px] border-white"
                  style={{
                    shadowColor: "#FF7622",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 4,
                  }}
                >
                  {updateImageMutation.isPending ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Camera color="white" size={16} />
                  )}
                </TouchableOpacity>

                {/* Delete Button */}
                {profile?.profileImage && (
                  <TouchableOpacity
                    onPress={handleDeleteImage}
                    disabled={deleteImageMutation.isPending}
                    className="absolute -bottom-1 -left-1 w-9 h-9 bg-red-500 rounded-xl items-center justify-center border-[3px] border-white"
                    style={{
                      shadowColor: "#FF4B4B",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 4,
                    }}
                  >
                    {deleteImageMutation.isPending ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Trash2 color="white" size={16} />
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {/* Role & Email under avatar */}
              <View
                className="flex-row items-center bg-[#FFF5EE] px-3 py-1.5 rounded-lg mb-2"
                style={{ borderWidth: 1, borderColor: "#FFE5D3" }}
              >
                <Shield color="#FF7622" size={12} />
                <Text className="text-primary font-sen-bold text-xs uppercase ml-1.5">
                  {profile?.role || "Customer"}
                </Text>
              </View>
              <Text className="text-text-gray font-sen text-xs">
                {profile?.email}
              </Text>
            </View>
          </View>

          {/* ── Form Section ── */}
          <View
            className="mx-6 bg-white rounded-3xl p-6"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 10,
              elevation: 3,
            }}
          >
            {/* Section Title */}
            <View className="flex-row items-center mb-5">
              <View className="w-8 h-8 bg-[#FFF5EE] rounded-xl items-center justify-center mr-2.5">
                <User color="#FF7622" size={16} />
              </View>
              <Text className="text-base font-sen-bold text-secondary">
                Edit Profile
              </Text>
            </View>

            {/* Name Field */}
            <View className="mb-5">
              <Label
                nativeID="name"
                className="text-text-gray font-sen text-xs mb-2 uppercase tracking-widest"
              >
                FULL NAME
              </Label>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    className={`flex-row items-center bg-[#F6F8FA] rounded-2xl h-[56px] px-4 ${errors.name ? "border border-red-500" : ""}`}
                  >
                    <View className="w-8 h-8 bg-white rounded-xl items-center justify-center mr-3">
                      <User color="#A0A5BA" size={16} />
                    </View>
                    <Input
                      placeholder="Your name"
                      placeholderTextColor="#B4B9CA"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      aria-labelledby="name"
                      className="flex-1 h-full !bg-transparent text-secondary font-sen border-0 p-0"
                    />
                  </View>
                )}
              />
              {errors.name && (
                <Text className="text-red-500 text-[11px] font-sen mt-1.5 ml-1">
                  {errors.name.message}
                </Text>
              )}
            </View>

            {/* Email Field (Read-only) */}
            <View className="mb-5">
              <Label
                nativeID="email"
                className="text-text-gray font-sen text-xs mb-2 uppercase tracking-widest"
              >
                EMAIL ADDRESS
              </Label>
              <View className="flex-row items-center bg-[#F6F8FA] rounded-2xl h-[56px] px-4 opacity-50">
                <View className="w-8 h-8 bg-white rounded-xl items-center justify-center mr-3">
                  <Mail color="#A0A5BA" size={16} />
                </View>
                <Input
                  value={profile?.email || ""}
                  editable={false}
                  aria-labelledby="email"
                  className="flex-1 h-full !bg-transparent text-secondary font-sen border-0 p-0"
                />
                <Lock color="#A0A5BA" size={14} />
              </View>
              <Text className="text-text-gray text-[11px] font-sen mt-1.5 ml-1">
                Email cannot be changed
              </Text>
            </View>

            {/* Phone Field */}
            <View className="mb-2">
              <Label
                nativeID="phone"
                className="text-text-gray font-sen text-xs mb-2 uppercase tracking-widest"
              >
                PHONE NUMBER
              </Label>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    className={`flex-row items-center bg-[#F6F8FA] rounded-2xl h-[56px] px-4 ${errors.phone ? "border border-red-500" : ""}`}
                  >
                    <View className="w-8 h-8 bg-white rounded-xl items-center justify-center mr-3">
                      <Phone color="#A0A5BA" size={16} />
                    </View>
                    <Input
                      placeholder="+234 800 000 0000"
                      placeholderTextColor="#B4B9CA"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="phone-pad"
                      aria-labelledby="phone"
                      className="flex-1 h-full !bg-transparent text-secondary font-sen border-0 p-0"
                    />
                  </View>
                )}
              />
              {errors.phone && (
                <Text className="text-red-500 text-[11px] font-sen mt-1.5 ml-1">
                  {errors.phone.message}
                </Text>
              )}
            </View>
          </View>

          {/* ── Save Button ── */}
          <View className="mx-6 mt-6">
            <Button
              onPress={handleSubmit(onSubmit)}
              disabled={!isDirty || updateProfileMutation.isPending}
              className="h-[56px] bg-primary rounded-2xl"
              style={{
                shadowColor: "#FF7622",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDirty ? 0.35 : 0,
                shadowRadius: 10,
                elevation: isDirty ? 8 : 0,
              }}
            >
              {updateProfileMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white text-sm font-sen-bold uppercase tracking-wider">
                  SAVE CHANGES
                </Text>
              )}
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
