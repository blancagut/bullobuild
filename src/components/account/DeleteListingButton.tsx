"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export function DeleteListingButton({ listingId }: { listingId: string }) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("listings").delete().eq("id", listingId);
      if (error) throw error;
      toast.success("Listing deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete listing");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-gray-600 hover:text-red-400 transition-colors disabled:opacity-40"
      title="Delete listing"
    >
      <Trash2 size={14} />
    </button>
  );
}
