import { ErrorResponse } from "@/types/api";
import axios, { AxiosError } from "axios";
import { Platform } from "react-native";

// API URL configuration
const API_URL = __DEV__
  ? (process.env.EXPO_PUBLIC_API_URL ??
    (Platform.OS === "android"
      ? "http://10.0.2.2:3000"
      : "http://localhost:3000"))
  : (process.env.EXPO_PUBLIC_API_URL ?? "https://your-production-api.com");

// Axios instance
export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    return Promise.reject(error);
  },
);
