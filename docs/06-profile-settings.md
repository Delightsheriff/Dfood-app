# Section 06: Profile, Addresses & Payment Methods Plan

> **Files Involved:**
> - [`app/(app)/profile/index.tsx`](file:///Users/MAC/Documents/Dfood-app/app/(app)/profile/index.tsx)
> - [`app/(app)/profile/personal-info.tsx`](file:///Users/MAC/Documents/Dfood-app/app/(app)/profile/personal-info.tsx)
> - [`app/(app)/profile/addresses.tsx`](file:///Users/MAC/Documents/Dfood-app/app/(app)/profile/addresses.tsx)
> - [`app/(app)/profile/add-address.tsx`](file:///Users/MAC/Documents/Dfood-app/app/(app)/profile/add-address.tsx)
> - [`app/(app)/profile/edit-address.tsx`](file:///Users/MAC/Documents/Dfood-app/app/(app)/profile/edit-address.tsx)
> - [`app/(app)/profile/payment-methods.tsx`](file:///Users/MAC/Documents/Dfood-app/app/(app)/profile/payment-methods.tsx)
> - [`app/(app)/profile/add-card.tsx`](file:///Users/MAC/Documents/Dfood-app/app/(app)/profile/add-card.tsx)

---

## 🔍 Codebase Audit & "Slop" Analysis

### 1. `FormData` Image Payload Construction Issues (`personal-info.tsx`)
```typescript
// ❌ SLOP PATTERN: Unsafe FormData casting for React Native image uploads
formData.append("image", {
  uri: asset.uri,
  type: asset.mimeType || "image/jpeg",
  name: asset.fileName || "profile.jpg",
} as any);
```
- **Why it's Slop:** React Native requires specific URI formatting (handling `file://` scheme on iOS vs Android) and `as any` masks potential runtime payload rejections on different OS engines.
- **Fix:** Abstract image payload preparation into a typed helper with `Platform.OS` normalization.

### 2. Unrestricted Geolocation Permissions & Missing Fallbacks (`add-address.tsx`)
- **Issue:** Uses `expo-location` without handling user denial gracefully or offering manual search fallback.
- **Fix:** Wrap location requests in standard permission state handler with auto-fill fallback.

### 3. Missing Address Lat/Lng Coordinates Validation
- **Issue:** Address creation sends `latitude` and `longitude` numbers, but form inputs allow manual text entry without coordinate validation.
- **Fix:** Implement Zod bounds checking (`z.number().min(-90).max(90)`) or automatic reverse-geocoding via `expo-location`.

---

## 🚀 Expo & React Native Best Practice Upgrades

### A. Typed Image Upload Utility (`lib/upload-utils.ts`)
```typescript
import { Platform } from "react-native";
import { ImagePickerAsset } from "expo-image-picker";

export function createBinaryFormData(asset: ImagePickerAsset, fieldName = "image"): FormData {
  const formData = new FormData();
  const uri = Platform.OS === "ios" ? asset.uri.replace("file://", "") : asset.uri;
  
  const file = {
    uri,
    type: asset.mimeType || "image/jpeg",
    name: asset.fileName || `upload_${Date.now()}.jpg`,
  };

  formData.append(fieldName, file as unknown as Blob);
  return formData;
}
```

### B. Geolocation Helper with Fallback (`hooks/useUserLocation.ts`)
```typescript
import { useState } from "react";
import * as Location from "expo-location";
import { Alert } from "react-native";

export function useUserLocation() {
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Permission to access location was denied. Please enter address manually."
        );
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const [geocoded] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      return {
        coords: location.coords,
        address: geocoded,
      };
    } catch (error) {
      console.error("Location error:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { getCurrentLocation, loading };
}
```

---

## ✅ Verification & Test Plan

1. **Avatar Upload Verification:** Select photo from camera roll, upload via `updateProfileImage`; verify avatar updates in `AuthContext` and home screen menu.
2. **Address Default Toggle:** Set secondary address to Default; verify prior default address loses default tag and backend state updates.
3. **Card Removal Test:** Delete default payment method; verify app prompts user to select a replacement default card or Cash option.
