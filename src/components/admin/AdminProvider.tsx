"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import { clientAuth, googleProvider, firebaseEnabled } from "@/lib/firebase/client";

type Status = "loading" | "signed-out" | "not-admin" | "admin" | "no-backend";

type Ctx = {
  status: Status;
  user: User | null;
  email: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  authedFetch: (path: string, init?: RequestInit) => Promise<Response>;
};

const AdminCtx = createContext<Ctx | null>(null);

export function useAdmin() {
  const ctx = useContext(AdminCtx);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
}

export default function AdminProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>(firebaseEnabled ? "loading" : "no-backend");
  const [user, setUser] = useState<User | null>(null);

  const check = useCallback(async (u: User | null) => {
    if (!u) {
      setStatus("signed-out");
      return;
    }
    try {
      const token = await u.getIdToken();
      const res = await fetch("/api/admin/me", { headers: { authorization: "Bearer " + token } });
      const data = await res.json();
      setStatus(data.admin ? "admin" : "not-admin");
    } catch {
      setStatus("not-admin");
    }
  }, []);

  useEffect(() => {
    const auth = clientAuth();
    if (!auth) {
      setStatus("no-backend");
      return;
    }
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      check(u);
    });
  }, [check]);

  const signIn = useCallback(async () => {
    const auth = clientAuth();
    if (!auth) return;
    await signInWithPopup(auth, googleProvider);
  }, []);

  const signOut = useCallback(async () => {
    const auth = clientAuth();
    if (auth) await fbSignOut(auth);
    setStatus("signed-out");
  }, []);

  const authedFetch = useCallback(
    async (path: string, init: RequestInit = {}) => {
      const auth = clientAuth();
      const u = auth?.currentUser;
      const token = u ? await u.getIdToken() : "";
      const headers = new Headers(init.headers);
      headers.set("authorization", "Bearer " + token);
      // Let the browser set the multipart boundary for FormData bodies.
      if (init.body && !(init.body instanceof FormData) && !headers.has("content-type")) {
        headers.set("content-type", "application/json");
      }
      return fetch(path, { ...init, headers });
    },
    []
  );

  return (
    <AdminCtx.Provider value={{ status, user, email: user?.email ?? null, signIn, signOut, authedFetch }}>
      {children}
    </AdminCtx.Provider>
  );
}
