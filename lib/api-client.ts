import { ErrorResponse } from "@/types/auth";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// API URL configuration
const API_URL = __DEV__
  ? (process.env.EXPO_PUBLIC_API_URL ??
    (Platform.OS === "android"
      ? "http://10.0.2.2:3000"
      : "http://localhost:3000"))
  : (process.env.EXPO_PUBLIC_API_URL ?? "https://your-production-api.com");

export const SECURE_STORE_KEYS = {
  AUTH_TOKEN: "auth_token",
} as const;

// In-memory token cache with promise deduplication
let inMemoryToken: string | null = null;
let tokenPromise: Promise<string | null> | null = null;

// Axios instance
export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token storage utilities
export const tokenStorage = {
  async save(token: string): Promise<void> {
    inMemoryToken = token;
    await SecureStore.setItemAsync(SECURE_STORE_KEYS.AUTH_TOKEN, token);
  },

  async get(): Promise<string | null> {
    // Return cached token if available
    if (inMemoryToken) return inMemoryToken;

    // Deduplicate concurrent SecureStore reads
    if (!tokenPromise) {
      tokenPromise = SecureStore.getItemAsync(SECURE_STORE_KEYS.AUTH_TOKEN)
        .then((token) => {
          inMemoryToken = token;
          tokenPromise = null;
          return token;
        })
        .catch((err) => {
          tokenPromise = null;
          throw err;
        });
    }

    return tokenPromise;
  },

  async remove(): Promise<void> {
    inMemoryToken = null;
    tokenPromise = null;
    await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.AUTH_TOKEN);
  },
};

// Request interceptor - inject JWT token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenStorage.get();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle 401s globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear all token storage
      await tokenStorage.remove();
      // Auth state updates handled by React Query mutation callbacks
    }

    return Promise.reject(error);
  },
);
