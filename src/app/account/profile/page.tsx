"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { useUser } from "@/hooks/useUser";
import { useProfile } from "@/hooks/useProfile";
import { Upload } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user } = useUser();
  const { profile, loading } = useProfile();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(data.publicUrl + `?t=${Date.now()}`);
      toast.success("Avatar uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName, avatar_url: avatarUrl })
        .eq("id", user.id);
      if (error) throw error;
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 border-2 border-[#F2B705] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader label="Account" title="Edit Profile" />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar */}
        <div className="bg-[#0B1F3A] border border-white/8 p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-5">Profile Photo</h3>
          <div className="flex items-center gap-5">
            <Avatar src={avatarUrl} fallback={fullName || user?.email || "U"} size="xl" />
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                <Upload size={14} />
                {uploading ? "Uploading..." : "Change Photo"}
              </Button>
              <p className="text-xs text-gray-600 mt-2">JPG, PNG or WebP · Max 2MB</p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-[#0B1F3A] border border-white/8 p-6 space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Personal Info</h3>
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email</label>
            <div className="w-full bg-[#070f1c] border border-white/5 text-gray-600 text-sm px-4 py-3 cursor-not-allowed">
              {user?.email}
            </div>
            <p className="text-xs text-gray-700">Email cannot be changed here.</p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
