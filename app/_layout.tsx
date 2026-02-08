import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { QueryProvider } from "@/providers/QueryProvider";
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
    <QueryProvider>
      <AuthProvider>
        <RootNavigator />
        <StatusBar style="auto" />
        <PortalHost />
      </AuthProvider>
    </QueryProvider>
  );
}

function RootNavigator() {
  const { hasCompletedOnboarding, isAuthenticated, isLoading } = useAuth();
  const [isSplashFinished, setIsSplashFinished] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth loading and splash to finish
    if (isLoading || !isSplashFinished) return;

    const inOnboarding = segments[0] === "onboarding";
    const inAuth = segments[0] === "(auth)";
    const inApp = segments[0] === "(app)";

    // Route protection logic
    if (!hasCompletedOnboarding && !inOnboarding) {
      // Show onboarding first
      router.replace("/onboarding");
    } else if (hasCompletedOnboarding && !isAuthenticated && !inAuth) {
      // Completed onboarding but not authenticated → show signin
      router.replace("/(auth)/signin");
    } else if (isAuthenticated && !inApp) {
      // Authenticated → show app
      router.replace("/(app)");
    }
  }, [
    isLoading,
    hasCompletedOnboarding,
    isAuthenticated,
    isSplashFinished,
    segments,
    router,
  ]);

  // Show splash screen while loading
  if (isLoading || !isSplashFinished) {
    return <CustomSplashScreen onFinish={() => setIsSplashFinished(true)} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(app)" />
      <Stack.Screen name="(auth)" />
    </Stack>
  );
}
