"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

export function AdminOrderStatusSelect({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    if (error) { toast.error("Failed to update"); }
    else { setStatus(newStatus); toast.success("Status updated"); router.refresh(); }
    setBusy(false);
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={busy}
      className="bg-[#070f1c] border border-white/10 text-white text-xs px-3 py-1.5 outline-none focus:border-[#F2B705] disabled:opacity-50"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
      ))}
    </select>
  );
}
