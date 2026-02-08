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
import { useEffect, useRef, useState } from "react";
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
  const [showContent, setShowContent] = useState(false);
  const segments = useSegments();
  const router = useRouter();
  const hasNavigated = useRef(false);

  // Handle initial navigation once
  useEffect(() => {
    if (isLoading || hasNavigated.current) return;

    const inOnboarding = segments[0] === "onboarding";
    const inAuth = segments[0] === "(auth)";
    const inApp = segments[0] === "(app)";

    // Determine correct route
    let targetRoute: string | null = null;

    if (!hasCompletedOnboarding && !inOnboarding) {
      targetRoute = "/onboarding";
    } else if (hasCompletedOnboarding && !isAuthenticated && !inAuth) {
      targetRoute = "/(auth)/signin";
    } else if (isAuthenticated && !inApp) {
      targetRoute = "/(app)";
    }

    // Navigate if needed
    if (targetRoute) {
      hasNavigated.current = true;
      router.replace(targetRoute as any);
    }

    // Show content after navigation decision
    setShowContent(true);
  }, [isLoading, hasCompletedOnboarding, isAuthenticated, segments, router]);

  // Show splash until ready
  if (isLoading || !showContent) {
    return <CustomSplashScreen onFinish={() => {}} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(app)" />
      <Stack.Screen name="(auth)" />
    </Stack>
  );
}
