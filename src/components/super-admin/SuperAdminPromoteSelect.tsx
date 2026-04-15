"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { SUPER_ADMIN_EMAIL } from "@/lib/constants";

const ROLES = ["user", "seller", "admin", "super_admin"];

export function SuperAdminPromoteSelect({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [role, setRole] = useState(currentRole);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    if (error) { toast.error("Failed to update role"); }
    else { setRole(newRole); toast.success("Role updated"); router.refresh(); }
    setBusy(false);
  }

  return (
    <select
      value={role}
      onChange={handleChange}
      disabled={busy}
      className="bg-[#070f1c] border border-red-900/50 text-white text-xs px-3 py-1.5 outline-none focus:border-red-500 disabled:opacity-50"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>{r}</option>
      ))}
    </select>
  );
}
