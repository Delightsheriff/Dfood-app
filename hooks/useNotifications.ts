// import { useEffect } from "react";
// import { useNavigation } from "@react-navigation/native";
// import { notificationService } from "@/services/notificationService";

// /**
//  * Hook to setup notification listeners
//  * Use this in your root App component
//  */
// export function useNotifications() {
//   const navigation = useNavigation();

//   useEffect(() => {
//     // Setup listeners
//     const cleanup = notificationService.setupListeners(navigation);

//     // Handle initial notification (app opened from notification)
//     notificationService.handleInitialNotification(navigation);

//     return cleanup;
//   }, [navigation]);
// }

import { notificationService } from "@/services/notificationService";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export function useNotifications() {
  const router = useRouter();

  useEffect(() => {
    // Setup listeners with Expo Router navigation
    const cleanup = notificationService.setupListeners(router);

    // Handle initial notification
    notificationService.handleInitialNotification(router);

    return cleanup;
  }, [router]);
}
