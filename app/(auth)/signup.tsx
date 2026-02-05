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

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    retypePassword: z.string(),
  })
  .refine((data) => data.password === data.retypePassword, {
    message: "Passwords don't match",
    path: ["retypePassword"],
  });

type SignUpFormData = z.infer<typeof signupSchema>;

export default function SignUp() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);

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
      retypePassword: "",
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    console.log("Signup form submitted:", data);
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push({
        pathname: "/(auth)/verification",
        params: { email: data.email },
      });
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign Up"
      subtitle="Please sign up to get started"
      showBackButton={false}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
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
                placeholder="John Doe"
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
                  className={`h-[62px] !bg-[#F0F5FA] text-text-gray-dark border-0 ${errors.password ? "border border-red-500" : ""}`}
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

        <View className="mb-6">
          <Label
            nativeID="retypePassword"
            className="text-[#32343E] font-sen-bold text-[13px] mb-2 uppercase tracking-wide"
          >
            RE-TYPE PASSWORD
          </Label>
          <Controller
            control={control}
            name="retypePassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="relative">
                <Input
                  placeholder="* * * * * * * * * *"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry={!showRetypePassword}
                  aria-labelledby="retypePassword"
                  className={`h-[62px] !bg-[#F0F5FA] text-text-gray-dark border-0 ${errors.retypePassword ? "border border-red-500" : ""}`}
                  placeholderTextColor="#B4B9CA"
                />
                <TouchableOpacity
                  onPress={() => setShowRetypePassword(!showRetypePassword)}
                  className="absolute right-5 top-0 h-[62px] justify-center"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showRetypePassword ? (
                    <EyeOff size={20} color="#A0A5BA" />
                  ) : (
                    <Eye size={20} color="#A0A5BA" />
                  )}
                </TouchableOpacity>
              </View>
            )}
          />
          {errors.retypePassword && (
            <Text className="text-red-500 text-[12px] font-sen mt-1.5 ml-1">
              {errors.retypePassword.message}
            </Text>
          )}
        </View>

        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
          className="h-[62px] bg-primary mt-4"
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white text-[14px] font-sen-bold uppercase tracking-wider">
              SIGN UP
            </Text>
          )}
        </Button>

        <Text className="text-center text-[#646982] font-sen my-6">Or</Text>

        {/* <View className="flex-row justify-center space-x-6 mb-6">
          <SocialButton
            provider="google"
            onPress={() => handleSocialSignup("Google")}
          />
          <SocialButton
            provider="facebook"
            onPress={() => handleSocialSignup("Facebook")}
          />
          <SocialButton
            provider="apple"
            onPress={() => handleSocialSignup("Apple")}
          />
        </View> */}

        <View className="flex-row items-center justify-center mb-8">
          <Text className="text-[#646982] font-sen mr-1">
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
