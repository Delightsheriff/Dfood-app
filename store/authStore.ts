import { auth } from "@/lib/firebase/config";
import {
  pullRemoteStateFromFirestore,
  pushLocalStateToFirestore,
  SyncStatus,
} from "@/lib/firebase/sync";
import { useProfileStore } from "@/store/profileStore";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  User,
} from "firebase/auth";
import { create } from "zustand";

interface AuthState {
  user: User | null;
  isInitialized: boolean;
  isLoading: boolean;
  syncStatus: SyncStatus;
  error: string | null;

  // Actions
  signIn: (email: string, pass: string) => Promise<boolean>;
  signUp: (email: string, pass: string, name: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  syncNow: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Listen to auth state if Firebase is available
  if (auth) {
    onAuthStateChanged(auth, async (currentUser) => {
      set({ user: currentUser, isInitialized: true, isLoading: false });

      if (currentUser) {
        set({ syncStatus: "syncing" });
        const ok = await pullRemoteStateFromFirestore(currentUser.uid);
        set({ syncStatus: ok ? "synced" : "error" });
      } else {
        set({ syncStatus: "idle" });
      }
    });
  } else {
    // If not configured, initialize immediately as guest
    setTimeout(() => {
      set({ isInitialized: true, isLoading: false, syncStatus: "idle" });
    }, 0);
  }

  return {
    user: null,
    isInitialized: false,
    isLoading: false,
    syncStatus: "idle",
    error: null,

    clearError: () => set({ error: null }),

    signIn: async (email, password) => {
      if (!auth) {
        set({ error: "Firebase Authentication is not configured yet." });
        return false;
      }

      set({ isLoading: true, error: null });
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        set({ user: userCredential.user, isLoading: false });

        // Pull remote state
        set({ syncStatus: "syncing" });
        const ok = await pullRemoteStateFromFirestore(userCredential.user.uid);
        set({ syncStatus: ok ? "synced" : "error" });
        return true;
      } catch (err: any) {
        const message = err.message || "Failed to sign in. Please check your credentials.";
        set({ isLoading: false, error: message });
        return false;
      }
    },

    signUp: async (email, password, displayName) => {
      if (!auth) {
        set({ error: "Firebase Authentication is not configured yet." });
        return false;
      }

      set({ isLoading: true, error: null });
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
          await updateProfile(userCredential.user, { displayName });
          useProfileStore.getState().setName(displayName);
        }

        set({ user: userCredential.user, isLoading: false });

        // Initial push of any local guest data into the user's cloud document
        set({ syncStatus: "syncing" });
        const ok = await pushLocalStateToFirestore(userCredential.user.uid);
        set({ syncStatus: ok ? "synced" : "error" });
        return true;
      } catch (err: any) {
        const message = err.message || "Failed to create account. Please try again.";
        set({ isLoading: false, error: message });
        return false;
      }
    },

    signOut: async () => {
      if (auth) {
        try {
          await firebaseSignOut(auth);
        } catch (err) {
          console.warn("Sign out error:", err);
        }
      }
      set({ user: null, syncStatus: "idle", error: null });
    },

    resetPassword: async (email) => {
      if (!auth) {
        set({ error: "Firebase Authentication is not configured yet." });
        return false;
      }

      set({ isLoading: true, error: null });
      try {
        await sendPasswordResetEmail(auth, email);
        set({ isLoading: false });
        return true;
      } catch (err: any) {
        set({ isLoading: false, error: err.message || "Failed to send reset email." });
        return false;
      }
    },

    syncNow: async () => {
      const user = get().user;
      if (!user) return;

      set({ syncStatus: "syncing" });
      const ok = await pushLocalStateToFirestore(user.uid);
      set({ syncStatus: ok ? "synced" : "error" });
    },
  };
});
