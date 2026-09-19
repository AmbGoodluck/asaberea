"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/AdminProvider";

type Added = { id: string; email: string; role?: string; addedBy?: string; createdAt?: number };

export default function AdminsPage() {
  const { authedFetch } = useAdmin();
  const [owners, setOwners] = useState<string[]>([]);
  const [admins, setAdmins] = useState<Added[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await authedFetch("/api/admin/admins");
      if (res.ok) {
        const data = await res.json();
        setOwners(data.owners || []);
        setAdmins(data.admins || []);
      }
    } finally {
      setLoading(false);
    }
  }, [authedFetch]);

  useEffect(() => {
    load();
  }, [load]);

  async function add(e: React.õ‹õQ]ô[ù
H