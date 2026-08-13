import { useAddressStore } from "@/store/addressStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useOrderStore } from "@/store/orderStore";
import { useProfileStore } from "@/store/profileStore";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./config";

export type SyncStatus = "idle" | "syncing" | "synced" | "offline" | "error";

/**
 * Uploads all local state to Firestore under `users/{uid}`.
 */
export async function pushLocalStateToFirestore(userId: string): Promise<boolean> {
  if (!db || !userId) return false;

  try {
    const profile = {
      name: useProfileStore.getState().name,
      bio: useProfileStore.getState().bio,
      avatarUri: useProfileStore.getState().avatarUri,
    };

    const favorites = useFavoritesStore.getState().favorites;
    const addresses = useAddressStore.getState().addresses;
    const orders = useOrderStore.getState().orders;

    const userDocRef = doc(db, "users", userId);
    await setDoc(
      userDocRef,
      {
        profile,
        favorites,
        addresses,
        orders,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    return true;
  } catch (error) {
    console.warn("Error pushing local state to Firestore:", error);
    return false;
  }
}

/**
 * Pulls remote state from Firestore and merges into local Zustand stores.
 */
export async function pullRemoteStateFromFirestore(userId: string): Promise<boolean> {
  if (!db || !userId) return false;

  try {
    const userDocRef = doc(db, "users", userId);
    const snap = await getDoc(userDocRef);

    if (!snap.exists()) {
      // First-time user or empty cloud record: push local items
      await pushLocalStateToFirestore(userId);
      return true;
    }

    const data = snap.data();

    // 1. Sync Profile
    if (data.profile) {
      if (data.profile.name) useProfileStore.getState().setName(data.profile.name);
      if (data.profile.bio) useProfileStore.getState().setBio(data.profile.bio);
      if (data.profile.avatarUri) useProfileStore.getState().setAvatarUri(data.profile.avatarUri);
    }

    // 2. Sync Favorites (merge without duplicate food item IDs)
    if (Array.isArray(data.favorites) && data.favorites.length > 0) {
      const localFavorites = useFavoritesStore.getState().favorites;
      const mergedFavorites = [...localFavorites];

      for (const remoteFav of data.favorites) {
        if (!mergedFavorites.some((f) => f.foodItem._id === remoteFav.foodItem?._id)) {
          mergedFavorites.push(remoteFav);
        }
      }

      useFavoritesStore.setState({ favorites: mergedFavorites });
    }

    // 3. Sync Addresses
    if (Array.isArray(data.addresses) && data.addresses.length > 0) {
      const localAddresses = useAddressStore.getState().addresses;
      const mergedAddresses = [...localAddresses];

      for (const remoteAddr of data.addresses) {
        if (!mergedAddresses.some((a) => a._id === remoteAddr._id)) {
          mergedAddresses.push(remoteAddr);
        }
      }

      useAddressStore.setState({
        addresses: mergedAddresses,
      });
    }

    // 4. Sync Orders
    if (Array.isArray(data.orders) && data.orders.length > 0) {
      const localOrders = useOrderStore.getState().orders;
      const mergedOrders = [...localOrders];

      for (const remoteOrder of data.orders) {
        if (!mergedOrders.some((o) => o._id === remoteOrder._id)) {
          mergedOrders.push(remoteOrder);
        }
      }

      useOrderStore.setState({ orders: mergedOrders });
    }

    return true;
  } catch (error) {
    console.warn("Error pulling remote state from Firestore:", error);
    return false;
  }
}
