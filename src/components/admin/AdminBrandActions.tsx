"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function AdminBrandActions({
  brandId,
  isAuthorized,
  logoUrl,
}: {
  brandId: string;
  isAuthorized: boolean;
  logoUrl: string;
}) {
  const [logo, setLogo] = useState(logoUrl);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function toggleAuthorized() {
    setBusy(true);
    const supabase = createClient();
    await supabase.from("brands").update({ is_authorized: !isAuthorized }).eq("id", brandId);
    toast.success("Brand updated");
    router.refresh();
    setBusy(false);
  }

  async function saveLogo() {
    setBusy(true);
    const supabase = createClient();
    await supabase.from("brands").update({ logo_url: logo || null }).eq("id", brandId);
    toast.success("Logo updated");
    setEditing(false);
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={toggleAuthorized}
        disabled={busy}
        className={`text-[10px] font-bold uppercase px-2 py-1 border transition-colors ${isAuthorized ? "border-green-700 text-green-400" : "border-white/10 text-gray-600 hover:text-white"}`}
      >
        {isAuthorized ? "Revoke" : "Authorize"}
      </button>
      {editing ? (
        <>
          <input
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            placeholder="Logo URL"
            className="bg-[#070f1c] border border-white/10 text-white text-xs px-2 py-1 outline-none focus:border-[#F2B705] w-40"
          />
          <button onClick={saveLogo} disabled={busy} className="text-xs text-[#F2B705] hover:underline font-bold">Save</button>
          <button onClick={() => setEditing(false)} className="text-xs text-gray-500 hover:text-white">Cancel</button>
        </>
      ) : (
        <button onClick={() => setEditing(true)} className="text-xs text-gray-400 hover:text-[#F2B705] transition-colors">Edit Logo</button>
      )}
    </div>
  );
}
