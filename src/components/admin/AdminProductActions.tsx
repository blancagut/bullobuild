"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export function AdminProductActions({
  productId,
  isFeatured,
  isDeal,
}: {
  productId: string;
  isFeatured: boolean;
  isDeal: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function toggle(field: "is_featured" | "is_deal", current: boolean) {
    setBusy(true);
    const supabase = createClient();
    await supabase.from("products").update({ [field]: !current }).eq("id", productId);
    router.refresh();
    setBusy(false);
  }

  async function deleteProduct() {
    if (!confirm("Delete this product permanently?")) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) toast.error("Failed to delete");
    else { toast.success("Deleted"); router.refresh(); }
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => toggle("is_featured", isFeatured)}
        disabled={busy}
        className={`text-[10px] font-bold uppercase px-2 py-1 border transition-colors ${isFeatured ? "border-[#F2B705] text-[#F2B705]" : "border-white/10 text-gray-600 hover:text-white"}`}
      >
        {isFeatured ? "★ Feat" : "☆ Feat"}
      </button>
      <button
        onClick={() => toggle("is_deal", isDeal)}
        disabled={busy}
        className={`text-[10px] font-bold uppercase px-2 py-1 border transition-colors ${isDeal ? "border-amber-400 text-amber-400" : "border-white/10 text-gray-600 hover:text-white"}`}
      >
        Deal
      </button>
      <button onClick={deleteProduct} disabled={busy} className="text-gray-600 hover:text-red-400 transition-colors">
        <Trash2 size={14} />
      </button>
    </div>
  );
}
