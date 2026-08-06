import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

export const ONBOARDING_KEY = "@onboarding_completed";

export function useOnboarding() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadOnboardingStatus() {
      try {
        const onboardingFlag = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (mounted) {
          setHasCompletedOnboarding(onboardingFlag === "true");
        }
      } catch (error) {
        console.error("Failed to load onboarding status:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadOnboardingStatus();

    return () => {
      mounted = false;
    };
  }, []);

  const completeOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    setHasCompletedOnboarding(true);
  }, []);

  return { hasCompletedOnboarding, isLoading, completeOnboarding };
}
