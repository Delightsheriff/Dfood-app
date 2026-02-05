import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { z } from "zod";
import AuthLayout from "../../components/layout/AuthLayout";
// import SocialButton from "../../components/ui/SocialButton";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    console.log("Login form submitted:", data);
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.replace("/(app)");
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  // const handleSocialLogin = (provider: string) => {
  //   console.log(`${provider} login initiated`);
  // };

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
                aria-labelledby="email"
                className={`h-[62px] !bg-[#F0F5FA] text-text-gray-dark  ${errors.email ? "border border-red-500" : "border-0"}`}
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
                  aria-labelledby="password"
                  className={`h-[62px] !bg-[#F0F5FA] text-text-gray-dark ${errors.password ? "border border-red-500" : "border-0"}`}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-0 h-[62px] justify-center"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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

        <View className="flex-row justify-between items-center mb-8">
          <TouchableOpacity
            onPress={() => setRememberMe(!rememberMe)}
            className="flex-row items-center"
          >
            <View
              className={`w-5 h-5 border rounded-[5px] mr-2 justify-center items-center ${
                rememberMe ? "bg-primary border-primary" : "border-[#E3EBF2]"
              }`}
            >
              {rememberMe && (
                <View className="w-2.5 h-2.5 bg-white rounded-[2px]" />
              )}
            </View>
            <Text className="text-[#7E8A97] text-[13px] font-sen">
              Remember me
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(auth)/forgot-password")}
          >
            <Text className="text-primary text-[14px] font-sen">
              Forgot Password
            </Text>
          </TouchableOpacity>
        </View>

        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
          className="h-[62px] bg-primary"
        >
          {loading ? (
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
          <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
            <Text className="text-primary font-sen-bold">SIGN UP</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-center text-[#646982] font-sen mb-6">Or</Text>

        {/* <View className="flex-row justify-center space-x-6 mb-8">
          <SocialButton
            provider="google"
            onPress={() => handleSocialLogin("Google")}
          />
          <SocialButton
            provider="facebook"
            onPress={() => handleSocialLogin("Facebook")}
          />
          <SocialButton
            provider="apple"
            onPress={() => handleSocialLogin("Apple")}
          />
        </View> */}
      </ScrollView>
    </AuthLayout>
  );
}
