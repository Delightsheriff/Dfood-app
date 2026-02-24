// hooks/useNotifications.ts
import { notificationService } from "@/services/notificationService";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export function useNotifications() {
  const router = useRouter();

  useEffect(() => {
    // Setup listeners
    const cleanup = notificationService.setupListeners(router);

    // Handle initial notification
    notificationService.handleInitialNotification(router);

    return cleanup;
  }, [router]);
}
