import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignUp } from "@/hooks/useAuthMutations";
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

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
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

        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={signUpMutation.isPending}
          className="h-[62px] bg-primary mt-4"
        >
          {signUpMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white text-[14px] font-sen-bold uppercase tracking-wider">
              SIGN UP
            </Text>
          )}
        </Button>

        <Text className="text-center text-[#646982] font-sen my-6">Or</Text>

        {/* Social login buttons - implement later */}

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
