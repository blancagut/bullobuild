"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";

// Platform settings are stored in localStorage for this POC
// In production these would be persisted in a settings table

export default function SuperAdminSettingsPage() {
  const [siteName, setSiteName] = useState("ProTool Market");
  const [commission, setCommission] = useState("10");
  const [maintenance, setMaintenance] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    // Simulate save — in production, persist to a settings table
    await new Promise((r) => setTimeout(r, 500));
    toast.success("Settings saved");
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <SectionHeader label="Super Admin" title="Platform Settings" />

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-[#0B1F3A] border border-white/8 p-6 space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">General</h3>
          <Input
            label="Site Name"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Marketplace Commission (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              className="w-full bg-[#070f1c] border border-white/10 text-white text-sm px-4 py-3 outline-none focus:border-[#F2B705]"
            />
            <p className="text-xs text-gray-600">
              Applied to each marketplace sale. Currently: {commission}%
            </p>
          </div>
        </div>

        <div className="bg-[#0B1F3A] border border-white/8 p-6 space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Maintenance</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setMaintenance((v) => !v)}
              className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${maintenance ? "bg-red-600" : "bg-white/10"}`}
            >
              <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${maintenance ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
            <div>
              <p className="text-sm text-white font-medium">Maintenance Mode</p>
              <p className="text-xs text-gray-500">Shows maintenance banner to all non-admin users</p>
            </div>
          </label>
          {maintenance && (
            <div className="bg-red-900/20 border border-red-800/50 px-4 py-3">
              <p className="text-xs text-red-400 font-bold uppercase tracking-wider">
                ⚠ Maintenance mode is ON — users will see a maintenance notice
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
