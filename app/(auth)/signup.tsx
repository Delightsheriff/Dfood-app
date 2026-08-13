import { ButtonText } from "@/components/ui/button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { useAuthStore } from "@/store/authStore";
import {
  LockKeyIcon,
  Mail01Icon,
  UserIcon,
  ViewIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";
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

export default function SignUp() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signUp, isLoading, error, clearError } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async () => {
    if (!name.trim()) {
      Alert.alert("Name Required", "Please enter your full name.");
      return;
    }
    if (!email.trim() || !password) {
      Alert.alert("Missing Fields", "Please enter your email and password.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters.");
      return;
    }

    clearError();
    const success = await signUp(email.trim(), password, name.trim());
    if (success) {
      Alert.alert("Account Created", "Welcome to Dfood! Your data will now sync across devices.", [
        { text: "Continue", onPress: () => router.replace("/(app)/(tabs)/profile" as any) },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View className="flex-1 bg-white">
        <ScreenHeader title="Create Account" />

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
              Join Dfood
            </Text>
            <Text className="text-sm font-body text-text-gray mt-1 leading-5">
              Create an account to save your favorite dishes, delivery addresses, and order history.
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
          <View className="gap-4 mb-6">
            {/* Full Name */}
            <View>
              <Text className="text-xs font-label uppercase tracking-wider text-text-gray mb-2">
                Full Name
              </Text>
              <View
                className="flex-row items-center bg-surface-muted rounded-2xl px-4 h-13 border border-transparent focus:border-primary"
                style={{ borderCurve: "continuous" }}
              >
                <HugeiconsIcon icon={UserIcon} size={20} color="#646982" />
                <TextInput
                  placeholder="e.g. Alex Johnson"
                  placeholderTextColor="#A0A5BA"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  className="flex-1 ml-3 font-body text-[15px] text-secondary"
                />
              </View>
            </View>

            {/* Email */}
            <View>
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

            {/* Password */}
            <View>
              <Text className="text-xs font-label uppercase tracking-wider text-text-gray mb-2">
                Password
              </Text>
              <View
                className="flex-row items-center bg-surface-muted rounded-2xl px-4 h-13 border border-transparent focus:border-primary"
                style={{ borderCurve: "continuous" }}
              >
                <HugeiconsIcon icon={LockKeyIcon} size={20} color="#646982" />
                <TextInput
                  placeholder="At least 6 characters"
                  placeholderTextColor="#A0A5BA"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  className="flex-1 ml-3 font-body text-[15px] text-secondary"
                />
                <Pressable
                  onPress={() => setShowPassword((p) => !p)}
                  hitSlop={8}
                >
                  <HugeiconsIcon
                    icon={showPassword ? ViewOffIcon : ViewIcon}
                    size={20}
                    color="#646982"
                  />
                </Pressable>
              </View>
            </View>
          </View>

          {/* Submit button */}
          <Pressable
            onPress={handleSignUp}
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
              <ButtonText className="text-white text-base">Create Account</ButtonText>
            )}
          </Pressable>

          {/* Footer Link */}
          <View className="flex-row justify-center items-center gap-1.5 py-4">
            <Text className="text-xs font-body text-text-gray">
              Already have an account?
            </Text>
            <Pressable onPress={() => router.push("/(auth)/login" as any)}>
              <Text className="text-xs font-title text-primary">
                Sign In
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
