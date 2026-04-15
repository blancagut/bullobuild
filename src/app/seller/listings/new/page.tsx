"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { BRANDS, LISTING_CONDITIONS } from "@/lib/constants";
import { Upload, X, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function NewListingPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    title: "",
    description: "",
    brand_slug: "",
    condition: "",
    price: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const newFiles = accepted.slice(0, 6 - images.length);
    setImages((prev) => [...prev, ...newFiles]);
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  }, [images.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 6,
    disabled: images.length >= 6,
  });

  function removeImage(idx: number) {
    URL.revokeObjectURL(previews[idx]);
    setImages((p) => p.filter((_, i) => i !== idx));
    setPreviews((p) => p.filter((_, i) => i !== idx));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!form.title || !form.condition || !form.price) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      // Upload images
      const imageUrls: string[] = [];
      for (const file of images) {
        const path = `listings/${user.id}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from("listing-images").upload(path, file);
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
        imageUrls.push(data.publicUrl);
      }

      // Get brand_id
      let brandId: string | null = null;
      if (form.brand_slug) {
        const { data: brand } = await supabase.from("brands").select("id").eq("slug", form.brand_slug).single();
        brandId = brand?.id ?? null;
      }

      const { error } = await supabase.from("listings").insert({
        user_id: user.id,
        title: form.title,
        description: form.description || null,
        price: parseFloat(form.price),
        condition: form.condition,
        brand_id: brandId,
        images: imageUrls,
        is_approved: false,
        is_sold: false,
      });

      if (error) throw error;
      toast.success("Listing submitted for review!");
      router.push("/seller/listings");
    } catch (err) {
      toast.error("Failed to create listing");
      console.error(err);
    } finally {
      setSubmitting(false);
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
      <SectionHeader label="Seller" title="New Listing" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[#0B1F3A] border border-white/8 p-6 space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Details</h3>
          <Input label="Title *" name="title" value={form.title} onChange={handleChange} placeholder="e.g. DeWalt 20V Drill Kit" required />
          <Textarea label="Description" name="description" value={form.description} onChange={handleChange} placeholder="Describe the tool, included accessories, any issues..." rows={4} />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Brand</label>
              <select
                name="brand_slug"
                value={form.brand_slug}
                onChange={handleChange}
                className="w-full bg-[#070f1c] border border-white/10 text-white text-sm px-4 py-3 outline-none focus:border-[#f2b705] transition-colors"
              >
                <option value="">Select brand</option>
                {BRANDS.map((b) => (
                  <option key={b.slug} value={b.slug}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Condition *</label>
              <select
                name="condition"
                value={form.condition}
                onChange={handleChange}
                required
                className="w-full bg-[#070f1c] border border-white/10 text-white text-sm px-4 py-3 outline-none focus:border-[#f2b705] transition-colors"
              >
                <option value="">Select condition</option>
                {LISTING_CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <Input label="Price (USD) *" name="price" type="number" min="1" step="0.01" value={form.price} onChange={handleChange} placeholder="0.00" required />
        </div>

        {/* Image upload */}
        <div className="bg-[#0B1F3A] border border-white/8 p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Photos (up to 6)</h3>

          {images.length < 6 && (
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed p-8 text-center cursor-pointer transition-colors",
                isDragActive ? "border-[#F2B705] bg-[#F2B705]/5" : "border-white/10 hover:border-white/30"
              )}
            >
              <input {...getInputProps()} />
              <Upload size={24} className="mx-auto mb-3 text-gray-500" />
              <p className="text-sm text-gray-400">Drop images here or click to browse</p>
              <p className="text-xs text-gray-600 mt-1">{images.length}/6 added</p>
            </div>
          )}

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {previews.map((src, idx) => (
                <div key={idx} className="relative aspect-square bg-white/5 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="h-7 w-7 bg-red-600 text-white flex items-center justify-center"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  {idx === 0 && (
                    <div className="absolute bottom-1 left-1 bg-[#F2B705] text-[#0B1F3A] text-[9px] font-black px-1.5 py-0.5 uppercase">
                      Cover
                    </div>
                  )}
                  <div className="absolute top-1 right-1 text-gray-400 opacity-0 group-hover:opacity-100 cursor-grab">
                    <GripVertical size={14} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" href="/seller/listings">Cancel</Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit for Review"}
          </Button>
        </div>
      </form>
    </div>
  );
}
