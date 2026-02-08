import { apiClient, tokenStorage } from "@/lib/api-client";
import {
  AuthResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  SessionResponse,
  SignInRequest,
  SignUpRequest,
  VerifyOTPRequest,
} from "@/types/auth";
import { AxiosResponse } from "axios";

export const authService = {
  /**
   * Register new user
   * POST /auth/signup
   */
  async signUp(data: SignUpRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await apiClient.post(
      "/auth/signup",
      data,
    );
    return response.data;
  },

  /**
   * Sign in existing user
   * POST /auth/signin
   */
  async signIn(data: SignInRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await apiClient.post(
      "/auth/signin",
      data,
    );
    return response.data;
  },

  /**
   * Get current user session
   * GET /auth/session
   * Requires JWT token in headers (handled by interceptor)
   */
  async getSession(): Promise<SessionResponse> {
    const response: AxiosResponse<SessionResponse> =
      await apiClient.get("/auth/session");
    return response.data;
  },

  /**
   * Request password reset OTP
   * POST /auth/forgot-password
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await apiClient.post("/auth/forgot-password", data);
  },

  /**
   * Verify OTP and get reset token
   * POST /auth/verify-otp
   */
  async verifyOTP(
    data: VerifyOTPRequest,
  ): Promise<{ success: true; data: { resetToken: string } }> {
    const response = await apiClient.post("/auth/verify-otp", data);
    return response.data;
  },

  /**
   * Reset password using reset token
   * POST /auth/reset-password
   * Requires resetToken in Authorization header
   */
  async resetPassword(
    resetToken: string,
    data: ResetPasswordRequest,
  ): Promise<void> {
    await apiClient.post("/auth/reset-password", data, {
      headers: {
        Authorization: `Bearer ${resetToken}`,
      },
    });
  },

  /**
   * Sign out - clear local token
   * No backend endpoint, just local cleanup
   */
  async signOut(): Promise<void> {
    await tokenStorage.remove();
  },
};
