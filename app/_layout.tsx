// app/_layout.tsx
import { toastConfig } from "@/components/ui/toast-config";
import { useOnboarding } from "@/hooks/useOnboarding";
import { QueryProvider } from "@/providers/QueryProvider";
import {
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from "@expo-google-fonts/bricolage-grotesque";
import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
  useFonts,
} from "@expo-google-fonts/geist";
import { PortalHost } from "@rn-primitives/portal";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import Toast from "react-native-toast-message";

import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Bricolage-SemiBold": BricolageGrotesque_600SemiBold,
    "Bricolage-Bold": BricolageGrotesque_700Bold,
    "Bricolage-ExtraBold": BricolageGrotesque_800ExtraBold,
    Geist: Geist_400Regular,
    "Geist-Medium": Geist_500Medium,
    "Geist-SemiBold": Geist_600SemiBold,
    "Geist-Bold": Geist_700Bold,
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <RootNavigator />
        <StatusBar style="auto" />
        <PortalHost />
        <Toast config={toastConfig} position="top" topOffset={60} />
      </QueryProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const { hasCompletedOnboarding, isLoading } = useOnboarding();
  const segments = useSegments();
  const router = useRouter();
  const hasNavigated = useRef(false);

  // Reset navigation guard when onboarding state changes
  useEffect(() => {
    hasNavigated.current = false;
  }, [hasCompletedOnboarding]);

  useEffect(() => {
    if (isLoading || hasNavigated.current) return;

    const inOnboarding = segments[0] === "onboarding";
    const inApp = segments[0] === "(app)";

    let targetRoute: string | null = null;

    if (!hasCompletedOnboarding && !inOnboarding) {
      targetRoute = "/onboarding";
    } else if (hasCompletedOnboarding && !inApp) {
      targetRoute = "/(app)";
    }

    if (targetRoute) {
      hasNavigated.current = true;
      router.replace(targetRoute as any);
    }
  }, [isLoading, hasCompletedOnboarding, segments, router]);

  if (isLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}
