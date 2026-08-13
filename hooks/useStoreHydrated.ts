import { useEffect, useState } from "react";

type PersistApi = {
  hasHydrated: () => boolean;
  onFinishHydration: (listener: () => void) => () => void;
};

/**
 * Tracks whether a zustand `persist` store has finished reading its
 * AsyncStorage snapshot. Rehydration is async, so code that reads
 * `store.getState()` (or renders) before this resolves true silently sees
 * the store's empty default instead of the persisted data.
 */
export function useStoreHydrated(persistApi: PersistApi): boolean {
  const [hydrated, setHydrated] = useState(() => persistApi.hasHydrated());

  useEffect(() => {
    if (persistApi.hasHydrated()) {
      return;
    }
    return persistApi.onFinishHydration(() => setHydrated(true));
  }, [persistApi]);

  return hydrated;
}
