import { apiClient } from "@/lib/api-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Router } from "expo-router";
import { Platform } from "react-native";

const TOKEN_STORAGE_KEY = "@food_expo_push_token";

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
  private tokenRefreshSubscription: Notifications.EventSubscription | null =
    null;

  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log("⚠️ Push notifications only work on physical devices");
      return false;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
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

  async getExpoPushToken(): Promise<string | null> {
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      if (!projectId) {
        throw new Error("EAS projectId not found in app config");
      }

      const { data: token } = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      console.log("📱 Expo Push Token:", token);
      return token;
    } catch (error) {
      console.error("Error getting Expo push token:", error);
      return null;
    }
  }

  async registerToken(): Promise<boolean> {
    try {
      const newToken = await this.getExpoPushToken();
      if (!newToken) {
        console.log("⚠️ No push token available");
        return false;
      }

      const cachedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
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
        console.log("✅ Expo push token registered with backend");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Failed to register device token:", error);
      return false;
    }
  }

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

  // Call this once after successful login — listens for token rotation
  // FCM can invalidate tokens after reinstalls or long inactivity
  startTokenRefreshListener(): void {
    this.tokenRefreshSubscription = Notifications.addPushTokenListener(
      async () => {
        console.log("🔄 Push token rotated — re-registering");
        await AsyncStorage.removeItem(TOKEN_STORAGE_KEY); // invalidate cache
        await this.registerToken();
      },
    );
  }

  stopTokenRefreshListener(): void {
    this.tokenRefreshSubscription?.remove();
    this.tokenRefreshSubscription = null;
  }

  setupListeners(router: Router) {
    const foregroundSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("📬 Notification received (foreground):", notification);
      });

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

  async handleInitialNotification(router: Router) {
    const response = await Notifications.getLastNotificationResponseAsync();
    if (response) {
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
