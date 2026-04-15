"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

export function AdminListingActions({ listingId, isApproved }: { listingId: string; isApproved: boolean }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function approve() {
    setBusy(true);
    const supabase = createClient();
    await supabase.from("listings").update({ is_approved: true }).eq("id", listingId);
    toast.success("Listing approved");
    router.refresh();
    setBusy(false);
  }

  async function reject() {
    if (!confirm("Delete this listing?")) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("listings").delete().eq("id", listingId);
    if (error) toast.error("Failed");
    else { toast.success("Listing removed"); router.refresh(); }
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-2">
      {!isApproved && (
        <button onClick={approve} disabled={busy} className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 font-bold uppercase transition-colors">
          <CheckCircle size={13} /> Approve
        </button>
      )}
      <button onClick={reject} disabled={busy} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-bold uppercase transition-colors">
        <XCircle size={13} /> Remove
      </button>
    </div>
  );
}
