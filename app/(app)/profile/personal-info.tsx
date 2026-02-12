import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/hooks/useDataQueries";
import {
  useDeleteProfileImage,
  useUpdateProfile,
  useUpdateProfileImage,
} from "@/hooks/useProfileMutations";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Camera, ChevronLeft, Trash2 } from "lucide-react-native";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Image,
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

      // Create FormData
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
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-[#F0F5FA]">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-11 h-11 bg-[#ECF0F4] rounded-full items-center justify-center mr-3"
        >
          <ChevronLeft color="#181C2E" size={22} />
        </TouchableOpacity>
        <Text className="text-lg font-sen-bold text-secondary flex-1">
          Personal Info
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24 }}
      >
        {/* Profile Picture */}
        <View className="items-center mb-8">
          <View className="relative">
            <View className="w-[120px] h-[120px] bg-[#FFD7C5] rounded-full items-center justify-center overflow-hidden">
              {profile?.profileImage ? (
                <Image
                  source={{ uri: profile.profileImage }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-[48px] font-sen-bold text-[#FF7622]">
                  {profile?.name?.charAt(0).toUpperCase() || "U"}
                </Text>
              )}
            </View>

            {/* Camera Button */}
            <TouchableOpacity
              onPress={handleImagePick}
              disabled={updateImageMutation.isPending}
              className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full items-center justify-center border-4 border-white"
            >
              {updateImageMutation.isPending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Camera color="white" size={18} />
              )}
            </TouchableOpacity>

            {/* Delete Button */}
            {profile?.profileImage && (
              <TouchableOpacity
                onPress={handleDeleteImage}
                disabled={deleteImageMutation.isPending}
                className="absolute bottom-0 left-0 w-10 h-10 bg-red-500 rounded-full items-center justify-center border-4 border-white"
              >
                {deleteImageMutation.isPending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Trash2 color="white" size={18} />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Name Field */}
        <View className="mb-6">
          <Label
            nativeID="name"
            className="text-[#32343E] font-sen-bold text-[13px] mb-2 uppercase tracking-wide"
          >
            NAME
          </Label>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Your name"
                placeholderTextColor="#B4B9CA"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                aria-labelledby="name"
                className={`h-[62px] !bg-[#F0F5FA] text-text-gray-dark border-0 ${errors.name ? "border border-red-500" : ""}`}
              />
            )}
          />
          {errors.name && (
            <Text className="text-red-500 text-[12px] font-sen mt-1.5 ml-1">
              {errors.name.message}
            </Text>
          )}
        </View>

        {/* Email Field (Read-only) */}
        <View className="mb-6">
          <Label
            nativeID="email"
            className="text-[#32343E] font-sen-bold text-[13px] mb-2 uppercase tracking-wide"
          >
            EMAIL
          </Label>
          <Input
            value={profile?.email || ""}
            editable={false}
            aria-labelledby="email"
            className="h-[62px] !bg-[#F0F5FA] text-text-gray-dark border-0 opacity-60"
          />
          <Text className="text-[#A0A5BA] text-[12px] font-sen mt-1.5 ml-1">
            Email cannot be changed
          </Text>
        </View>

        {/* Phone Field */}
        <View className="mb-6">
          <Label
            nativeID="phone"
            className="text-[#32343E] font-sen-bold text-[13px] mb-2 uppercase tracking-wide"
          >
            PHONE NUMBER
          </Label>
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="+234 800 000 0000"
                placeholderTextColor="#B4B9CA"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="phone-pad"
                aria-labelledby="phone"
                className={`h-[62px] !bg-[#F0F5FA] text-text-gray-dark border-0 ${errors.phone ? "border border-red-500" : ""}`}
              />
            )}
          />
          {errors.phone && (
            <Text className="text-red-500 text-[12px] font-sen mt-1.5 ml-1">
              {errors.phone.message}
            </Text>
          )}
        </View>

        {/* Role Badge */}
        <View className="mb-8">
          <Label className="text-[#32343E] font-sen-bold text-[13px] mb-2 uppercase tracking-wide">
            ACCOUNT TYPE
          </Label>
          <View className="bg-[#FFF5EE] rounded-xl px-4 py-3 self-start">
            <Text className="text-primary font-sen-bold text-sm uppercase">
              {profile?.role || "Customer"}
            </Text>
          </View>
        </View>

        {/* Save Button */}
        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={!isDirty || updateProfileMutation.isPending}
          className="h-[62px] bg-primary mb-8"
        >
          {updateProfileMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white text-[14px] font-sen-bold uppercase tracking-wider">
              SAVE CHANGES
            </Text>
          )}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
