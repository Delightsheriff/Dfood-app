import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignUp } from "@/hooks/useAuthMutations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react-native";
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

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignUpFormData = z.infer<typeof signupSchema>;

export default function SignUp() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const signUpMutation = useSignUp();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    signUpMutation.mutate(data, {
      onError: (error: any) => {
        const message =
          error.response?.data?.message || "Sign up failed. Please try again.";
        const errors = error.response?.data?.errors;

        if (errors && errors.length > 0) {
          Alert.alert("Validation Error", errors.join("\n"));
        } else {
          Alert.alert("Sign Up Failed", message);
        }
      },
    });
  };

  return (
    <AuthLayout
      title="Sign Up"
      subtitle="Please sign up to get started"
      showBackButton={false}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Name */}
        <View className="mb-5">
          <Label
            nativeID="name"
            className="text-text-gray font-sen text-xs mb-2 uppercase tracking-widest"
          >
            NAME
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
                  placeholder="John Doe"
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
                  aria-labelledby="password"
                  className="flex-1 h-full !bg-transparent text-secondary font-sen border-0 p-0"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
          {errors.password && (
            <Text className="text-red-500 text-[11px] font-sen mt-1.5 ml-1">
              {errors.password.message}
            </Text>
          )}
        </View>

        {/* Sign Up Button */}
        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={signUpMutation.isPending}
          className="h-[56px] bg-primary mt-2 rounded-2xl"
          style={{
            shadowColor: "#FF7622",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          {signUpMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white text-sm font-sen-bold uppercase tracking-wider">
              SIGN UP
            </Text>
          )}
        </Button>

        {/* Divider */}
        <View className="flex-row items-center my-6">
          <View className="flex-1 h-px bg-[#F0F0F0]" />
          <Text className="text-text-gray font-sen mx-4 text-xs">OR</Text>
          <View className="flex-1 h-px bg-[#F0F0F0]" />
        </View>

        {/* Login Link */}
        <View className="flex-row items-center justify-center mb-8">
          <Text className="text-text-gray font-sen mr-1">
            Already have an account?
          </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/signin")}>
            <Text className="text-primary font-sen-bold">LOG IN</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </AuthLayout>
  );
}
