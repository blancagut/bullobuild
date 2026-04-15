"use client";

import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { BRANDS, LISTING_CONDITIONS } from "@/lib/constants";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";
import toast from "react-hot-toast";
import { use } from "react";

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useUser();
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({ title: "", description: "", condition: "", price: "" });
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (!data) { setNotFoundState(true); return; }
        setForm({
          title: data.title,
          description: data.description ?? "",
          condition: data.condition,
          price: String(data.price),
        });
        setExistingImages(data.images ?? []);
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id]);

  const onDrop = useCallback((accepted: File[]) => {
    const total = existingImages.length + newFiles.length;
    const toAdd = accepted.slice(0, 6 - total);
    setNewFiles((p) => [...p, ...toAdd]);
    setNewPreviews((p) => [...p, ...toAdd.map((f) => URL.createObjectURL(f))]);
  }, [existingImages.length, newFiles.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    disabled: existingImages.length + newFiles.length >= 6,
  });

  function removeExisting(idx: number) {
    setExistingImages((p) => p.filter((_, i) => i !== idx));
  }
  function removeNew(idx: number) {
    URL.revokeObjectURL(newPreviews[idx]);
    setNewFiles((p) => p.filter((_, i) => i !== idx));
    setNewPreviews((p) => p.filter((_, i) => i !== idx));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      const uploaded: string[] = [];
      for (const file of newFiles) {
        const path = `listings/${user.id}/${Date.now()}-${file.name}`;
        await supabase.storage.from("listing-images").upload(path, file);
        const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }

      const { error } = await supabase
        .from("listings")
        .update({
          title: form.title,
          description: form.description || null,
          condition: form.condition,
          price: parseFloat(form.price),
          images: [...existingImages, ...uploaded],
        })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Listing updated!");
      router.push("/seller/listings");
    } catch {
      toast.error("Failed to update listing");
    } finally {
      setSubmitting(false);
    }
  }

  if (notFoundState) notFound();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 border-2 border-[#F2B705] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalImages = existingImages.length + newFiles.length;

  return (
    <div className="space-y-6">
      <SectionHeader label="Seller" title="Edit Listing" />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[#0B1F3A] border border-white/8 p-6 space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Details</h3>
          <Input label="Title *" name="title" value={form.title} onChange={handleChange} required />
          <Textarea label="Description" name="description" value={form.description} onChange={handleChange} rows={4} />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Condition *</label>
              <select name="condition" value={form.condition} onChange={handleChange} required
                className="w-full bg-[#070f1c] border border-white/10 text-white text-sm px-4 py-3 outline-none focus:border-[#f2b705] transition-colors">
                {LISTING_CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <Input label="Price (USD) *" name="price" type="number" min="1" step="0.01" value={form.price} onChange={handleChange} required />
          </div>
        </div>

        <div className="bg-[#0B1F3A] border border-white/8 p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Photos ({totalImages}/6)</h3>

          <div className="grid grid-cols-3 gap-3">
            {existingImages.map((url, idx) => (
              <div key={url} className="relative aspect-square bg-white/5 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button type="button" onClick={() => removeExisting(idx)} className="h-7 w-7 bg-red-600 text-white flex items-center justify-center">
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
            {newPreviews.map((src, idx) => (
              <div key={src} className="relative aspect-square bg-white/5 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button type="button" onClick={() => removeNew(idx)} className="h-7 w-7 bg-red-600 text-white flex items-center justify-center">
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalImages < 6 && (
            <div {...getRootProps()} className={cn("border-2 border-dashed p-6 text-center cursor-pointer transition-colors", isDragActive ? "border-[#F2B705] bg-[#F2B705]/5" : "border-white/10 hover:border-white/30")}>
              <input {...getInputProps()} />
              <Upload size={20} className="mx-auto mb-2 text-gray-500" />
              <p className="text-sm text-gray-400">Add more photos</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" href="/seller/listings">Cancel</Button>
          <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save Changes"}</Button>
        </div>
      </form>
    </div>
  );
}
