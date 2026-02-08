import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPassword } from "@/hooks/useAuthMutations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
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
        <Text className="text-[#32343E] font-sen text-[14px] mb-6 leading-6">
          Please enter your new password. Make sure it&apos;s at least 8
          characters long.
        </Text>

        <View className="mb-6">
          <Label
            nativeID="password"
            className="text-[#32343E] font-sen-bold text-[13px] mb-2 uppercase tracking-wide"
          >
            NEW PASSWORD
          </Label>
          <Controller
            control={control}
            name="newPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="relative">
                <Input
                  placeholder="* * * * * * * * * *"
                  placeholderTextColor="#B4B9CA"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry={!showPassword}
                  editable={!resetPasswordMutation.isPending}
                  aria-labelledby="password"
                  className={`h-[62px] !bg-[#F0F5FA] text-text-gray-dark border-0 ${errors.newPassword ? "border border-red-500" : ""}`}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-0 h-[62px] justify-center"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  disabled={resetPasswordMutation.isPending}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#A0A5BA" />
                  ) : (
                    <Eye size={20} color="#A0A5BA" />
                  )}
                </TouchableOpacity>
              </View>
            )}
          />
          {errors.newPassword && (
            <Text className="text-red-500 text-[12px] font-sen mt-1.5 ml-1">
              {errors.newPassword.message}
            </Text>
          )}
        </View>

        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={resetPasswordMutation.isPending}
          className="h-[62px] bg-primary mt-4"
        >
          {resetPasswordMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white text-[14px] font-sen-bold uppercase tracking-wider">
              RESET PASSWORD
            </Text>
          )}
        </Button>
      </ScrollView>
    </AuthLayout>
  );
}
