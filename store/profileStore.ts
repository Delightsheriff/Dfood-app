import { UserProfile, UserRole } from "@/types/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ProfileState {
  name: string;
  avatarUri: string | null;
  bio: string;
  setName: (name: string) => void;
  setAvatarUri: (uri: string | null) => void;
  setBio: (bio: string) => void;
  getProfile: () => UserProfile;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      name: "Delight Sheriff",
      avatarUri: null,
      bio: "Food lover & culinary explorer",

      setName: (name: string) => set({ name: name.trim() }),
      setAvatarUri: (uri: string | null) => set({ avatarUri: uri }),
      setBio: (bio: string) => set({ bio: bio.trim() }),

      getProfile: (): UserProfile => ({
        id: "local-user",
        name: get().name || "Foodie",
        email: "delight@dfood.app",
        role: UserRole.CUSTOMER,
        profileImage: get().avatarUri || undefined,
      }),
    }),
    {
      name: "dfood-profile-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
