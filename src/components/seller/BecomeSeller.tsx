"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Store } from "lucide-react";
import toast from "react-hot-toast";

export function BecomeSeller({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleApply() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ role: "seller" })
        .eq("id", userId);
      if (error) throw error;
      toast.success("You are now a seller!");
      router.refresh();
    } catch {
      toast.error("Failed to apply. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center px-4">
      <div className="h-16 w-16 rounded-full bg-[#F2B705]/10 flex items-center justify-center">
        <Store size={28} className="text-[#F2B705]" />
      </div>
      <div>
        <h1
          className="text-3xl font-black uppercase text-white tracking-tight"
          style={{ fontFamily: "var(--font-barlow), system-ui" }}
        >
          Become a Seller
        </h1>
        <p className="text-gray-400 text-sm mt-2 max-w-sm">
          Upgrade your account to sell tools on BULLOBUILD and access the full seller dashboard.
        </p>
      </div>
      <Button onClick={handleApply} disabled={loading}>
        {loading ? "Applying..." : "Apply as Seller"}
      </Button>
    </div>
  );
}
