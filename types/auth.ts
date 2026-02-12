export enum UserRole {
  CUSTOMER = "customer",
  VENDOR = "vendor",
  ADMIN = "admin",
}

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  googleId?: string;
  profileImage?: string;
  phone?: string;
};

export type AuthTokens = {
  token: string;
};

export type SignUpRequest = {
  name: string;
  email: string;
  password: string;
};

export type SignInRequest = {
  email: string;
  password: string;
};

export type AuthResponse = {
  success: true;
  data: {
    user: User;
    token: string;
  };
};

export type ErrorResponse = {
  success: false;
  message: string;
  errors?: string[];
};

export type ForgotPasswordRequest = {
  email: string;
};

export type VerifyOTPRequest = {
  email: string;
  otp: string;
};

export type ResetPasswordRequest = {
  newPassword: string;
};

export type SessionResponse = {
  success: true;
  data: {
    user: User;
  };
};
