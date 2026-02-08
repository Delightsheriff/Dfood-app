import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "@/hooks/useAuthMutations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Alert, Text, View } from "react-native";
import { z } from "zod";
import AuthLayout from "../../components/layout/AuthLayout";

const forgotPasswordSchema = z.object({
  email: z.email("Invalid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const router = useRouter();
  const forgotPasswordMutation = useForgotPassword();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(data, {
      onSuccess: () => {
        router.push({
          pathname: "/(auth)/verification",
          params: { email: data.email },
        });
      },
      onError: (error: any) => {
        const message =
          error.response?.data?.message ||
          "Failed to send code. Please try again.";
        Alert.alert("Error", message);
      },
    });
  };

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Please sign in to your existing account"
    >
      <View className="flex-1 pt-6">
        <Text className="text-[#32343E] font-sen text-[14px] mb-6 leading-6">
          Enter your email address and we will send you a code to reset your
          password.
        </Text>

        <View className="mb-6">
          <Label
            nativeID="email"
            className="text-[#32343E] font-sen-bold text-[13px] mb-2 uppercase tracking-wide"
          >
            EMAIL
          </Label>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="example@gmail.com"
                placeholderTextColor="#B4B9CA"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!forgotPasswordMutation.isPending}
                aria-labelledby="email"
                className={`h-[62px] !bg-[#F0F5FA] text-text-gray-dark border-0 ${errors.email ? "border border-red-500" : ""}`}
              />
            )}
          />
          {errors.email && (
            <Text className="text-red-500 text-[12px] font-sen mt-1.5 ml-1">
              {errors.email.message}
            </Text>
          )}
        </View>

        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={forgotPasswordMutation.isPending}
          className="h-[62px] bg-primary"
        >
          {forgotPasswordMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white text-[14px] font-sen-bold uppercase tracking-wider">
              SEND CODE
            </Text>
          )}
        </Button>
      </View>
    </AuthLayout>
  );
}
