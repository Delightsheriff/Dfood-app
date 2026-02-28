import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignIn } from "@/hooks/useAuthMutations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  Pressable,
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
        {/* Email */}
        <View className="mb-5">
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
                  editable={!signInMutation.isPending}
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

        {/* Password */}
        <View className="mb-5">
          <Label
            nativeID="password"
            className="text-text-gray font-sen text-xs mb-2 uppercase tracking-widest"
          >
            PASSWORD
          </Label>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View
                className={`flex-row items-center bg-[#F6F8FA] rounded-2xl h-[56px] px-4 ${errors.password ? "border border-red-500" : ""}`}
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
                  editable={!signInMutation.isPending}
                  aria-labelledby="password"
                  className="flex-1 h-full !bg-transparent text-secondary font-sen border-0 p-0"
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  disabled={signInMutation.isPending}
                >
                  {showPassword ? (
                    <EyeOff size={18} color="#A0A5BA" />
                  ) : (
                    <Eye size={18} color="#A0A5BA" />
                  )}
                </Pressable>
              </View>
            )}
          />
          {errors.password && (
            <Text className="text-red-500 text-[11px] font-sen mt-1.5 ml-1">
              {errors.password.message}
            </Text>
          )}
        </View>

        {/* Forgot Password */}
        <View className="flex-row justify-end items-center mb-8">
          <Pressable
            onPress={() => router.push("/(auth)/forgot-password")}
            disabled={signInMutation.isPending}
          >
            <Text className="text-primary text-sm font-sen-bold">
              Forgot Password?
            </Text>
          </Pressable>
        </View>

        {/* Login Button */}
        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={signInMutation.isPending}
          className="h-[56px] bg-primary rounded-2xl"
          style={{
            shadowColor: "#FF7622",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          {signInMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white text-sm font-sen-bold uppercase tracking-wider">
              LOG IN
            </Text>
          )}
        </Button>

        {/* Sign Up Link */}
        <View className="flex-row items-center justify-center my-6">
          <Text className="text-text-gray font-sen mr-1">
            Don&apos;t have an account?
          </Text>
          <Pressable
            onPress={() => router.push("/(auth)/signup")}
            disabled={signInMutation.isPending}
          >
            <Text className="text-primary font-sen-bold">SIGN UP</Text>
          </Pressable>
        </View>
      </ScrollView>
    </AuthLayout>
  );
}
