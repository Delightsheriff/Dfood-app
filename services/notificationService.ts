// services/notificationService.ts
import { apiClient } from "@/lib/api-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Router } from "expo-router";
import { Platform } from "react-native";

const TOKEN_STORAGE_KEY = "@food_fcm_token";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log("⚠️ Push notifications only work on physical devices");
      return false;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("❌ Notification permission denied");
      return false;
    }

    console.log("✅ Notification permission granted");
    return true;
  }

  /**
   * Get native device push token (FCM on Android, APNs on iOS)
   */
  async getDevicePushToken(): Promise<string | null> {
    try {
      const token = await Notifications.getDevicePushTokenAsync();
      console.log("📱 FCM Device Token:", token.data);
      return token.data as string;
    } catch (error) {
      console.error("Error getting device push token:", error);
      return null;
    }
  }

  /**
   * Register device token with backend
   */
  async registerToken(): Promise<boolean> {
    try {
      const cachedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      const newToken = await this.getDevicePushToken();

      if (!newToken) {
        console.log("⚠️ No push token available");
        return false;
      }

      if (cachedToken === newToken) {
        console.log("✅ Token already registered");
        return true;
      }

      const response = await apiClient.post("/device-tokens/register", {
        token: newToken,
        platform: Platform.OS === "ios" ? "ios" : "android",
      });

      if (response.data.success) {
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, newToken);
        console.log("✅ Device token registered with backend");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Failed to register device token:", error);
      return false;
    }
  }

  /**
   * Unregister device token
   */
  async unregisterToken(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      if (!token) return;

      await apiClient.post("/device-tokens/unregister", { token });
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      console.log("✅ Device token unregistered");
    } catch (error) {
      console.error("Failed to unregister token:", error);
    }
  }

  /**
   * Setup notification listeners
   */
  setupListeners(router: Router) {
    // Foreground notifications
    const foregroundSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("📬 Notification received (foreground):", notification);
      });

    // Notification taps
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("👆 Notification tapped:", response);

        const data = response.notification.request.content.data;

        if (data.type === "order_update" && data.orderNumber) {
          router.push(`/(app)/orders/${data.orderNumber}` as any);
        }
      });

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }

  /**
   * Handle initial notification
   */
  async handleInitialNotification(router: Router) {
    const response = await Notifications.getLastNotificationResponseAsync();

    if (response) {
      console.log("🚀 App opened from notification:", response);

      const data = response.notification.request.content.data;

      if (data.type === "order_update" && data.orderNumber) {
        setTimeout(() => {
          router.push(`/(app)/orders/${data.orderNumber}` as any);
        }, 1000);
      }
    }
  }
}

export const notificationService = new NotificationService();
