"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const ROLES = ["user", "seller", "admin"];

export function AdminUserRoleSelect({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [role, setRole] = useState(currentRole);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  // Prevent changing super_admin role from here
  if (currentRole === "super_admin") {
    return <span className="text-xs text-gray-600 italic">Protected</span>;
  }

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
      className="bg-[#070f1c] border border-white/10 text-white text-xs px-3 py-1.5 outline-none focus:border-[#F2B705] disabled:opacity-50"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
      ))}
    </select>
  );
}
