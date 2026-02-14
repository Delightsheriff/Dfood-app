import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "@/hooks/useAuthMutations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Mail } from "lucide-react-native";
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
      <View className="flex-1 pt-4">
        <View
          className="bg-[#F6F8FA] rounded-2xl p-4 mb-6"
          style={{ borderWidth: 1, borderColor: "#F0F0F0" }}
        >
          <Text className="text-secondary font-sen text-sm leading-5">
            Enter your email address and we&apos;ll send you a code to reset
            your password.
          </Text>
        </View>

        {/* Email */}
        <View className="mb-6">
          <Label
            nativeID="email"
            className="text-text-gray font-sen text-xs mb-2 uppercase tracking-widest"
          >
            EMAIL
          </Label>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <View
                className={`flex-row items-center bg-[#F6F8FA] rounded-2xl h-[56px] px-4 ${errors.email ? "border border-red-500" : ""}`}
              >
                <View className="w-8 h-8 bg-white rounded-xl items-center justify-center mr-3">
                  <Mail color="#A0A5BA" size={16} />
                </View>
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
                  className="flex-1 h-full !bg-transparent text-secondary font-sen border-0 p-0"
                />
              </View>
            )}
          />
          {errors.email && (
            <Text className="text-red-500 text-[11px] font-sen mt-1.5 ml-1">
              {errors.email.message}
            </Text>
          )}
        </View>

        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={forgotPasswordMutation.isPending}
          className="h-[56px] bg-primary rounded-2xl"
          style={{
            shadowColor: "#FF7622",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          {forgotPasswordMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white text-sm font-sen-bold uppercase tracking-wider">
              SEND CODE
            </Text>
          )}
        </Button>
      </View>
    </AuthLayout>
  );
}
