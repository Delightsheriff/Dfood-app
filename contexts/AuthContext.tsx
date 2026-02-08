import { tokenStorage } from "@/lib/api-client";
import { authService } from "@/services/auth.service";
import { User } from "@/types/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export const ONBOARDING_KEY = "@onboarding_completed";

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
};

type AuthContextType = AuthState & {
  setUser: (user: User | null) => void;
  completeOnboarding: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  // Fetch user session if token exists
  const {
    data: sessionData,
    isLoading: isSessionLoading,
    isError,
  } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const token = await tokenStorage.get();
      if (!token) return null;
      return authService.getSession();
    },
    enabled: !isBootstrapping, // Only run after bootstrap
    retry: false,
  });

  // Bootstrap: check onboarding status and load token
  useEffect(() => {
    async function bootstrap() {
      try {
        const onboardingFlag = await AsyncStorage.getItem(ONBOARDING_KEY);
        setHasCompletedOnboarding(onboardingFlag === "true");
      } catch (error) {
        console.error("Failed to load onboarding status:", error);
      } finally {
        setIsBootstrapping(false);
      }
    }

    bootstrap();
  }, []);

  // Update user when session data changes
  useEffect(() => {
    if (sessionData?.data?.user) {
      setUser(sessionData.data.user);
    } else if (isError) {
      // Session fetch failed (likely 401) - clear user
      setUser(null);
    }
  }, [sessionData, isError]);

  async function completeOnboarding() {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    setHasCompletedOnboarding(true);
  }

  async function signOut() {
    await authService.signOut();
    setUser(null);
  }

  const isLoading = isBootstrapping || isSessionLoading;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        hasCompletedOnboarding,
        setUser,
        completeOnboarding,
        signOut,
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
