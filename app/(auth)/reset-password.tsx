import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPassword } from "@/hooks/useAuthMutations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Eye, EyeOff, Lock } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { z } from "zod";
import AuthLayout from "../../components/layout/AuthLayout";

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const router = useRouter();
  const { resetToken } = useLocalSearchParams<{ resetToken: string }>();
  const [showPassword, setShowPassword] = useState(false);
  const resetPasswordMutation = useResetPassword();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!resetToken) {
      Alert.alert("Error", "Invalid reset session. Please try again.");
      router.replace("/(auth)/forgot-password");
      return;
    }

    resetPasswordMutation.mutate(
      {
        resetToken,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          Alert.alert(
            "Success",
            "Your password has been reset successfully. Please sign in with your new password.",
            [
              {
                text: "OK",
                onPress: () => router.replace("/(auth)/signin"),
              },
            ],
          );
        },
        onError: (error: any) => {
          const message =
            error.response?.data?.message ||
            "Failed to reset password. Please try again.";
          Alert.alert("Reset Failed", message);
        },
      },
    );
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your new password"
      showBackButton={false}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          className="bg-[#F6F8FA] rounded-2xl p-4 mb-6"
          style={{ borderWidth: 1, borderColor: "#F0F0F0" }}
        >
          <Text className="text-secondary font-sen text-sm leading-5">
            Please enter your new password. Make sure it&apos;s at least 8
            characters long.
          </Text>
        </View>

        {/* New Password */}
        <View className="mb-6">
          <Label
            nativeID="password"
            className="text-text-gray font-sen text-xs mb-2 uppercase tracking-widest"
          >
            NEW PASSWORD
          </Label>
          <Controller
            control={control}
            name="newPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <View
                className={`flex-row items-center bg-[#F6F8FA] rounded-2xl h-[56px] px-4 ${errors.newPassword ? "border border-red-500" : ""}`}
              >
                <View className="w-8 h-8 bg-white rounded-xl items-center justify-center mr-3">
                  <Lock color="#A0A5BA" size={16} />
                </View>
                <Input
                  placeholder="••••••••"
                  placeholderTextColor="#B4B9CA"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry={!showPassword}
                  editable={!resetPasswordMutation.isPending}
                  aria-labelledby="password"
                  className="flex-1 h-full !bg-transparent text-secondary font-sen border-0 p-0"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  disabled={resetPasswordMutation.isPending}
                >
                  {showPassword ? (
                    <EyeOff size={18} color="#A0A5BA" />
                  ) : (
                    <Eye size={18} color="#A0A5BA" />
                  )}
                </TouchableOpacity>
              </View>
            )}
          />
          {errors.newPassword && (
            <Text className="text-red-500 text-[11px] font-sen mt-1.5 ml-1">
              {errors.newPassword.message}
            </Text>
          )}
        </View>

        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={resetPasswordMutation.isPending}
          className="h-[56px] bg-primary rounded-2xl"
          style={{
            shadowColor: "#FF7622",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          {resetPasswordMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white text-sm font-sen-bold uppercase tracking-wider">
              RESET PASSWORD
            </Text>
          )}
        </Button>
      </ScrollView>
    </AuthLayout>
  );
}
