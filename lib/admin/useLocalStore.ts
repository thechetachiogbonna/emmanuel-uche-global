"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Generic localStorage-backed state.
 *
 * Always initializes to `seed` on first render (server AND client) to avoid
 * hydration mismatches, then swaps in whatever's saved in localStorage
 * right after mount. This is a stand-in for a real database — before this
 * goes to production, swap these hooks for real API calls, and note that
 * admin edits here do NOT change what the public site renders (it still
 * reads statically from lib/data.ts).
 */
export function useLocalStore<T>(key: string, seed: T) {
  const [value, setValue] = useState<T>(seed);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from storage on mount, not a cascading update
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      // ignore malformed storage, fall back to seed
    }
    setHydrated(true);
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // storage full or unavailable — state still updates in memory
        }
        return resolved;
      });
    },
    [key]
  );

  const reset = useCallback(() => {
    update(seed);
  }, [update, seed]);

  return { value, setValue: update, reset, hydrated };
}
