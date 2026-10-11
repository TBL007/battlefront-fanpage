"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "@/lib/authClient";

type Faction = "republic" | "empire";

interface FactionValue {
  /** Which side the viewer has picked. */
  allegiance: boolean;
  faction: Faction;
  /** Flips the server-side allegiance. No-op for signed-out visitors. */
  toggleAllegiance: () => Promise<void>;
  pending: boolean;
}

const FactionContext = createContext<FactionValue | null>(null);

/**
 * Owns the `data-faction` attribute on <html> so the header, the body copy and
 * the bottom nav all pick up the same palette, and so the switch in the drawer
 * updates every one of them at once.
 *
 * `initialAllegiance` comes from the server-rendered layout, which already
 * resolved the session. Seeding from it (instead of defaulting to Republic)
 * means a refresh never flashes the wrong colours while the client session is
 * still loading.
 */
export default function FactionProvider({
  children,
  initialAllegiance,
}: {
  children: ReactNode;
  initialAllegiance: boolean;
}) {
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const userId = user?.id;

  // While the client session is still resolving, trust what the server sent.
  const serverValue =
    isPending || user?.allegiance === undefined
      ? initialAllegiance
      : Boolean(user.allegiance);

  const [local, setLocal] = useState(serverValue);
  const [syncedTo, setSyncedTo] = useState(serverValue);
  const [pending, setPending] = useState(false);
  // Mirrors `pending` so the callback never has to re-create itself mid-flight.
  const pendingRef = useRef(false);

  // Adopt the server value if it changed underneath us (login, sign out, or a
  // switch made in another tab). Adjusting state during render is the pattern
  // React recommends for "reset state when a prop changes" — an effect here
  // would cause an extra render pass.
  if (serverValue !== syncedTo) {
    setSyncedTo(serverValue);
    setLocal(serverValue);
  }

  const allegiance = local;
  const faction: Faction = allegiance ? "republic" : "empire";

  useEffect(() => {
    document.documentElement.dataset.faction = faction;
  }, [faction]);

  const toggleAllegiance = useCallback(async () => {
    if (!userId || pendingRef.current) return;

    pendingRef.current = true;
    setPending(true);
    const previous = allegiance;
    setLocal(!previous); // optimistic

    try {
      const res = await fetch(`/api/users/${userId}/allegiance`, {
        method: "POST",
      });

      if (!res.ok) {
        setLocal(previous); // roll back
        const { error } = await res
          .json()
          .catch(() => ({ error: "Request failed" }));
        console.error(error);
      }
    } catch (err) {
      setLocal(previous);
      console.error(err);
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }, [allegiance, userId]);

  const value = useMemo(
    () => ({ allegiance, faction, toggleAllegiance, pending }),
    [allegiance, faction, pending, toggleAllegiance],
  );

  return (
    <FactionContext.Provider value={value}>{children}</FactionContext.Provider>
  );
}

export function useFaction(): FactionValue {
  const ctx = useContext(FactionContext);
  if (!ctx) {
    throw new Error("useFaction must be used inside <FactionProvider>");
  }
  return ctx;
}