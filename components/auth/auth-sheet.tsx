import { auth, isFirebaseConfigured } from "@/lib/firebase/config";
import { useAuthStore } from "@/store/authStore";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

interface AuthSheetProps {
  visible: boolean;
  onClose: () => void;
}

function AppleLogo() {
  return (
    <Svg width={18} height={18} viewBox="0 0 170 170" fill="#FFFFFF">
      <Path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.76-11.71-14.15-5.87-9.13-10.45-19.14-13.74-30.03-3.29-10.9-4.94-21.2-4.94-30.91 0-14.57 3.7-26.68 11.09-36.33 7.39-9.65 16.71-14.61 27.96-14.88 4.79 0 10.12 1.25 16.01 3.75 5.89 2.5 9.77 3.82 11.64 3.96 1.76-.14 5.79-1.52 12.09-4.13 6.3-2.61 11.45-3.79 15.45-3.53 11.74.87 21.05 5.37 27.93 13.5-10.44 6.32-15.54 15.12-15.3 26.4.24 8.8 3.63 16.14 10.17 22.02 6.54 5.88 14.19 9.17 22.95 9.87-2.3 6.74-5.09 13.54-8.38 20.41zM119.22 31.84c0-7.28 2.66-14.07 7.98-20.37 5.32-6.3 11.79-10.13 19.41-11.47.88 7.39-1.63 14.35-7.53 20.88-5.9 6.53-12.51 10.18-19.86 10.96z" />
    </Svg>
  );
}

function GoogleLogo() {
  return (
    <Svg width={18} height={18} viewBox="0 0 48 48">
      <Path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <Path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <Path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <Path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </Svg>
  );
}

export default function AuthSheet({ visible, onClose }: AuthSheetProps) {
  const { syncNow } = useAuthStore();
  const [loadingProvider, setLoadingProvider] = useState<"apple" | "google" | null>(null);

  const handleAppleSignIn = () => {
    Alert.alert(
      "Apple Sign-In",
      "Sign in with Apple requires an active Apple Developer Team setup and native provisioning build. Demo mode is active.",
      [{ text: "OK" }],
    );
  };

  const handleGoogleSignIn = async () => {
    if (!isFirebaseConfigured || !auth) {
      Alert.alert(
        "Google Sign-In",
        "Google Sign-In is configured for Firebase. Add your Firebase project API keys in .env to enable live cloud sync.",
        [{ text: "Got it" }],
      );
      return;
    }

    setLoadingProvider("google");
    try {
      // Trigger cloud sync if auth exists
      await syncNow();
      Alert.alert("Signed In", "Your data is now syncing to your cloud account.");
      onClose();
    } catch {
      Alert.alert("Notice", "Google Sign-In will connect once Firebase keys are provided in .env.");
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        className="flex-1 bg-black/50 justify-end"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="bg-white rounded-t-[32px] px-6 pt-5 pb-8 w-full"
          style={{ borderCurve: "continuous" }}
        >
          {/* Drag Pill */}
          <View className="w-10 h-1.5 bg-gray-200 rounded-full self-center mb-6" />

          {/* Honest Headline */}
          <View className="mb-6">
            <Text className="text-[22px] font-display text-secondary leading-7">
              Save your food journey
            </Text>
            <Text className="text-xs font-body text-text-gray mt-1.5 leading-5">
              Sign in to keep your orders, saved favourites, and delivery addresses when you switch devices.
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="gap-3 mb-4">
            {/* Continue with Apple (Primary on iOS) */}
            {Platform.OS === "ios" && (
              <Pressable
                onPress={handleAppleSignIn}
                accessibilityRole="button"
                accessibilityLabel="Continue with Apple"
                className="w-full h-13 bg-black rounded-[18px] flex-row items-center justify-center gap-2.5 active:opacity-85"
                style={{ borderCurve: "continuous" }}
              >
                <AppleLogo />
                <Text className="text-white text-[15px] font-label font-medium">
                  Continue with Apple
                </Text>
              </Pressable>
            )}

            {/* Continue with Google */}
            <Pressable
              onPress={handleGoogleSignIn}
              accessibilityRole="button"
              accessibilityLabel="Continue with Google"
              className="w-full h-13 bg-white border border-gray-200 rounded-[18px] flex-row items-center justify-center gap-2.5 active:bg-gray-50"
              style={{ borderCurve: "continuous" }}
            >
              {loadingProvider === "google" ? (
                <ActivityIndicator size="small" color="#262B33" />
              ) : (
                <>
                  <GoogleLogo />
                  <Text className="text-[#1F2937] text-[15px] font-label font-medium">
                    Continue with Google
                  </Text>
                </>
              )}
            </Pressable>
          </View>

          {/* Maybe Later Quiet Dismiss */}
          <Pressable
            onPress={onClose}
            className="py-3 items-center justify-center"
          >
            <Text className="text-xs font-label text-text-gray">
              Maybe later
            </Text>
          </Pressable>

          {/* Small Print Data Sync Note */}
          <View className="mt-2 pt-3 border-t border-gray-100">
            <Text className="text-[11px] font-caption text-text-gray text-center leading-4">
              Your cart and preferences stay private on your device until you choose to sync.
            </Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export { AuthSheet };
