import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import {
    Sen_400Regular,
    Sen_500Medium,
    Sen_700Bold,
    Sen_800ExtraBold,
    useFonts,
} from "@expo-google-fonts/sen";
import { PortalHost } from "@rn-primitives/portal";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import CustomSplashScreen from "../components/SplashScreen";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Sen: Sen_400Regular,
    "Sen-Bold": Sen_700Bold,
    "Sen-Medium": Sen_500Medium,
    "Sen-ExtraBold": Sen_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <RootNavigator />
      <StatusBar style="auto" />
      <PortalHost />
    </AuthProvider>
  );
}

function RootNavigator() {
  const { hasCompletedOnboarding, isLoading } = useAuth();
  const [isSplashFinished, setIsSplashFinished] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inOnboardingGroup = segments[0] === "onboarding";

    if (!hasCompletedOnboarding && !inOnboardingGroup) {
      router.replace("/onboarding");
    } else if (hasCompletedOnboarding && inOnboardingGroup) {
      router.replace("/(app)");
    }
  }, [isLoading, hasCompletedOnboarding, segments]);

  if (isLoading || !isSplashFinished) {
    return <CustomSplashScreen onFinish={() => setIsSplashFinished(true)} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}
