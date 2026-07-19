"use client";

import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { apiUrl } from "@/lib/api";
import type { UserRole } from "@/lib/types";

export interface AppUserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  language: string;
}

interface AuthUserState {
  firebaseUser: FirebaseUser | null;
  profile: AppUserProfile | null;
  loading: boolean;
  /** Convenience fetch wrapper that attaches the current Firebase ID token. */
  authedFetch: (input: string, init?: RequestInit) => Promise<Response>;
}

/**
 * Single source of truth for "who's logged in and what can they do" in
 * the admin UI. Mirrors the sync-on-login pattern already used by
 * AuthModal, but exposes the resulting role-bearing profile + a fetch
 * helper so admin pages don't each reimplement token handling.
 */
export function useAuthUser(): AuthUserState {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<AppUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (!fbUser) {
        setProfile(null);
        setLoading(false);
        return;
      }
      try {
        const idToken = await fbUser.getIdToken();
        const res = await fetch(apiUrl("/api/auth/sync"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idToken,
            name: fbUser.displayName || undefined,
            avatarUrl: fbUser.photoURL || undefined,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
        } else {
          setProfile(null);
        }
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const authedFetch = useCallback(async (input: string, init: RequestInit = {}) => {
    const idToken = await auth.currentUser?.getIdToken();
    const headers = new Headers(init.headers);
    if (idToken) headers.set("Authorization", `Bearer ${idToken}`);
    // Every call site in this app that sends a body passes a raw JSON
    // string without setting Content-Type — without it, the backend's
    // express.json() middleware won't parse the body at all, so PATCH/POST
    // requests would silently arrive as an empty req.body. Default it here
    // once instead of patching every call site.
    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return fetch(apiUrl(input), { ...init, headers });
  }, []);

  return { firebaseUser, profile, loading, authedFetch };
}
