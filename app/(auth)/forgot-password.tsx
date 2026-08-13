import { ButtonText } from "@/components/ui/button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { useAuthStore } from "@/store/authStore";
import { Mail01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ForgotPassword() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { resetPassword, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState("");

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert("Email Required", "Please enter your email address.");
      return;
    }

    clearError();
    const success = await resetPassword(email.trim());
    if (success) {
      Alert.alert(
        "Email Sent",
        "A password reset link has been sent to your email address.",
        [{ text: "Back to Sign In", onPress: () => router.back() }],
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View className="flex-1 bg-white">
        <ScreenHeader title="Reset Password" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: insets.bottom + 32,
          }}
        >
          {/* Headline */}
          <View className="mb-8">
            <Text className="text-[28px] font-display text-secondary leading-9">
              Forgot Password?
            </Text>
            <Text className="text-sm font-body text-text-gray mt-1 leading-5">
              Enter your registered email address and we&apos;ll send you instructions to reset your password.
            </Text>
          </View>

          {error && (
            <View className="p-3.5 bg-red-50 border border-red-200 rounded-2xl mb-5">
              <Text className="text-xs font-body text-red-600 leading-4">
                {error}
              </Text>
            </View>
          )}

          {/* Form */}
          <View className="mb-6">
            <Text className="text-xs font-label uppercase tracking-wider text-text-gray mb-2">
              Email Address
            </Text>
            <View
              className="flex-row items-center bg-surface-muted rounded-2xl px-4 h-13 border border-transparent focus:border-primary"
              style={{ borderCurve: "continuous" }}
            >
              <HugeiconsIcon icon={Mail01Icon} size={20} color="#646982" />
              <TextInput
                placeholder="name@example.com"
                placeholderTextColor="#A0A5BA"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                className="flex-1 ml-3 font-body text-[15px] text-secondary"
              />
            </View>
          </View>

          {/* Submit button */}
          <Pressable
            onPress={handleReset}
            disabled={isLoading}
            className="w-full h-14 rounded-full bg-secondary items-center justify-center mb-6"
            style={{
              borderCurve: "continuous",
              boxShadow: "0px 4px 12px rgba(38,43,51,0.2)",
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ButtonText className="text-white text-base">Send Reset Link</ButtonText>
            )}
          </Pressable>

          {/* Footer Link */}
          <View className="flex-row justify-center items-center gap-1.5 py-4">
            <Pressable onPress={() => router.back()}>
              <Text className="text-xs font-title text-primary">
                Return to Sign In
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
