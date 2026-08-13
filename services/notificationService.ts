import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
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

  setupListeners(router: any) {
    const foregroundSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("📬 Notification received (foreground):", notification);
      });

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("👆 Notification tapped:", response);
        const data = response.notification.request.content.data;
        if (data?.type === "order_update" && data?.orderNumber) {
          router.push({
            pathname: "/(app)/profile/order-details",
            params: { orderId: data.orderNumber },
          } as any);
        }
      });

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }

  async handleInitialNotification(router: any) {
    const response = await Notifications.getLastNotificationResponse();
    if (response) {
      const data = response.notification.request.content.data;
      if (data?.type === "order_update" && data?.orderNumber) {
        setTimeout(() => {
          router.push({
            pathname: "/(app)/profile/order-details",
            params: { orderId: data.orderNumber },
          } as any);
        }, 1000);
      }
    }
  }
}

export const notificationService = new NotificationService();
