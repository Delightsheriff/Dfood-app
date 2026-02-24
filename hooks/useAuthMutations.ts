import { useAuth } from "@/contexts/AuthContext";
import { tokenStorage } from "@/lib/api-client";
import { authService } from "@/services/auth.service";
import { notificationService } from "@/services/notificationService";
import {
  ErrorResponse,
  ForgotPasswordRequest,
  SignInRequest,
  SignUpRequest,
  VerifyOTPRequest,
} from "@/types/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "expo-router";

export function useSignUp() {
  const { setUser } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SignUpRequest) => authService.signUp(data),
    onSuccess: async (response) => {
      // Save token and update user state
      await tokenStorage.save(response.data.token);
      setUser(response.data.user);

      // Update session cache
      queryClient.setQueryData(["session"], {
        success: true,
        data: { user: response.data.user },
      });

      // Navigate to app
      router.replace("/(app)");
      // useSignUp onSuccess — ADD the same block after router.replace("/(app)"):
      const hasPermission = await notificationService.requestPermissions();
      if (hasPermission) {
        await notificationService.registerToken();
        notificationService.startTokenRefreshListener();
      }
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error("Signup failed:", error.response?.data);
    },
  });
}

export function useSignIn() {
  const { setUser } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SignInRequest) => authService.signIn(data),
    onSuccess: async (response) => {
      // Save token and update user state
      await tokenStorage.save(response.data.token);
      setUser(response.data.user);

      // Update session cache
      queryClient.setQueryData(["session"], {
        success: true,
        data: { user: response.data.user },
      });

      // inside useSignIn onSuccess — replace the notification block:
      const hasPermission = await notificationService.requestPermissions();
      if (hasPermission) {
        await notificationService.registerToken();
        notificationService.startTokenRefreshListener(); // ADD THIS
      }

      // Navigate to app
      router.replace("/(app)");
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error("Signin failed:", error.response?.data);
    },
  });
}

export function useSignOut() {
  const { signOut } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Unregister push token BEFORE clearing auth token
      notificationService.stopTokenRefreshListener();
      await notificationService.unregisterToken();

      // Now clear the auth token
      await authService.signOut();
    },
    onSuccess: async () => {
      // Clear session cache
      queryClient.setQueryData(["session"], null);
      queryClient.clear();

      // Sign out updates user state
      await signOut();

      // Navigate to signin
      router.replace("/(auth)/signin");
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error("Signout failed:", error.response?.data);
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) =>
      authService.forgotPassword(data),
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error("Forgot password failed:", error.response?.data);
    },
  });
}

export function useVerifyOTP() {
  return useMutation({
    mutationFn: (data: VerifyOTPRequest) => authService.verifyOTP(data),
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error("OTP verification failed:", error.response?.data);
    },
  });
}

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      resetToken,
      newPassword,
    }: {
      resetToken: string;
      newPassword: string;
    }) => authService.resetPassword(resetToken, { newPassword }),
    onSuccess: () => {
      // Navigate to signin after successful password reset
      router.replace("/(auth)/signin");
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error("Password reset failed:", error.response?.data);
    },
  });
}
