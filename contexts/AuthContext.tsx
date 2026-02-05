import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export const ONBOARDING_KEY = "@onboarding_completed";

type AuthState = {
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
};

type AuthContextType = AuthState & {
  completeOnboarding: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    hasCompletedOnboarding: false,
  });

  useEffect(() => {
    bootstrapAuth();
  }, []);

  async function bootstrapAuth() {
    try {
      const onboardingFlag = await AsyncStorage.getItem(ONBOARDING_KEY);
      setState({
        isLoading: false,
        hasCompletedOnboarding: onboardingFlag === "true",
      });
    } catch (error) {
      console.error("Failed to load onboarding status:", error);
      setState({
        isLoading: false,
        hasCompletedOnboarding: false,
      });
    }
  }

  async function completeOnboarding() {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    setState((prev) => ({
      ...prev,
      hasCompletedOnboarding: true,
    }));
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
