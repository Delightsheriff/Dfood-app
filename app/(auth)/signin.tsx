import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignIn } from "@/hooks/useAuthMutations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
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

const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function SignIn() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const signInMutation = useSignIn();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    signInMutation.mutate(data, {
      onError: (error: any) => {
        const message =
          error.response?.data?.message || "Sign in failed. Please try again.";
        Alert.alert("Sign In Error", message);
      },
    });
  };

  return (
    <AuthLayout
      title="Log In"
      subtitle="Please sign in to your existing account"
      showBackButton={false}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
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
                editable={!signInMutation.isPending}
                aria-labelledby="email"
                className={`h-[62px] !bg-[#F0F5FA] text-text-gray-dark ${errors.email ? "border border-red-500" : "border-0"}`}
              />
            )}
          />
          {errors.email && (
            <Text className="text-red-500 text-[12px] font-sen mt-1.5 ml-1">
              {errors.email.message}
            </Text>
          )}
        </View>

        <View className="mb-6">
          <Label
            nativeID="password"
            className="text-[#32343E] font-sen-bold text-[13px] mb-2 uppercase tracking-wide"
          >
            PASSWORD
          </Label>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="relative">
                <Input
                  placeholder="* * * * * * * * * *"
                  placeholderTextColor="#B4B9CA"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry={!showPassword}
                  editable={!signInMutation.isPending}
                  aria-labelledby="password"
                  className={`h-[62px] !bg-[#F0F5FA] text-text-gray-dark ${errors.password ? "border border-red-500" : "border-0"}`}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-0 h-[62px] justify-center"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  disabled={signInMutation.isPending}
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
          {errors.password && (
            <Text className="text-red-500 text-[12px] font-sen mt-1.5 ml-1">
              {errors.password.message}
            </Text>
          )}
        </View>

        <View className="flex-row justify-end items-center mb-8">
          <TouchableOpacity
            onPress={() => router.push("/(auth)/forgot-password")}
            disabled={signInMutation.isPending}
          >
            <Text className="text-primary text-[14px] font-sen">
              Forgot Password
            </Text>
          </TouchableOpacity>
        </View>

        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={signInMutation.isPending}
          className="h-[62px] bg-primary"
        >
          {signInMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white text-[14px] font-sen-bold uppercase tracking-wider">
              LOG IN
            </Text>
          )}
        </Button>

        <View className="flex-row items-center justify-center my-6">
          <Text className="text-[#646982] font-sen mr-1">
            Don&apos;t have an account?
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(auth)/signup")}
            disabled={signInMutation.isPending}
          >
            <Text className="text-primary font-sen-bold">SIGN UP</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </AuthLayout>
  );
}
