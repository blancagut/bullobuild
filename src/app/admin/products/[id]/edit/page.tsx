"use client";

import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { slugify } from "@/lib/utils";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { use } from "react";

interface Brand { id: string; name: string }
interface Category { id: string; name: string }

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: "", slug: "", model: "", brand_id: "", category_id: "",
    price: "", original_price: "", stock: "0", description: "",
    is_featured: false, is_deal: false,
  });
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from("brands").select("id, name").order("name"),
      supabase.from("categories").select("id, name").order("name"),
      supabase.from("products").select("*").eq("id", id).single(),
    ]).then(([{ data: b }, { data: c }, { data: p }]) => {
      setBrands(b ?? []);
      setCategories(c ?? []);
      if (p) {
        setForm({
          name: p.name,
          slug: p.slug,
          model: p.model ?? "",
          brand_id: p.brand_id,
          category_id: p.category_id ?? "",
          price: String(p.price),
          original_price: p.original_price ? String(p.original_price) : "",
          stock: String(p.stock),
          description: p.description ?? "",
          is_featured: p.is_featured,
          is_deal: p.is_deal,
        });
        setExistingImages(p.images ?? []);
      }
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onDrop = useCallback((accepted: File[]) => {
    const total = existingImages.length + newFiles.length;
    const toAdd = accepted.slice(0, 8 - total);
    setNewFiles((p) => [...p, ...toAdd]);
    setNewPreviews((p) => [...p, ...toAdd.map((f) => URL.createObjectURL(f))]);
  }, [existingImages.length, newFiles.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "image/*": [] }, disabled: existingImages.length + newFiles.length >= 8,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "name" ? { slug: slugify(value) } : {}),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const uploaded: string[] = [];
      for (const file of newFiles) {
        const path = `products/${Date.now()}-${file.name}`;
        await supabase.storage.from("product-images").upload(path, file);
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      const { error } = await supabase.from("products").update({
        name: form.name, slug: form.slug, model: form.model || null,
        brand_id: form.brand_id, category_id: form.category_id || null,
        price: parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        stock: parseInt(form.stock),
        description: form.description || null,
        images: [...existingImages, ...uploaded],
        is_featured: form.is_featured, is_deal: form.is_deal,
      }).eq("id", id);
      if (error) throw error;
      toast.success("Product updated!");
      router.push("/admin/products");
    } catch {
      toast.error("Failed to update product");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-24"><div className="h-8 w-8 border-2 border-[#F2B705] border-t-transparent rounded-full animate-spin" /></div>;
  }

  const totalImages = existingImages.length + newFiles.length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SectionHeader label="Admin" title="Edit Product" />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[#0B1F3A] border border-white/8 p-6 space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Basic Info</h3>
          <Input label="Product Name *" name="name" value={form.name} onChange={handleChange} required />
          <Input label="Slug *" name="slug" value={form.slug} onChange={handleChange} required />
          <Input label="Model Number" name="model" value={form.model} onChange={handleChange} />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Brand *</label>
              <select name="brand_id" value={form.brand_id} onChange={handleChange} required className="w-full bg-[#070f1c] border border-white/10 text-white text-sm px-4 py-3 outline-none focus:border-[#f2b705]">
                <option value="">Select brand</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Category</label>
              <select name="category_id" value={form.category_id} onChange={handleChange} className="w-full bg-[#070f1c] border border-white/10 text-white text-sm px-4 py-3 outline-none focus:border-[#f2b705]">
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Price *" name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required />
            <Input label="Original Price" name="original_price" type="number" min="0" step="0.01" value={form.original_price} onChange={handleChange} />
            <Input label="Stock" name="stock" type="number" min="0" value={form.stock} onChange={handleChange} />
          </div>
          <Textarea label="Description" name="description" value={form.description} onChange={handleChange} rows={4} />
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} className="accent-[#F2B705]" />
              <span className="text-sm text-gray-300">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="is_deal" checked={form.is_deal} onChange={handleChange} className="accent-[#F2B705]" />
              <span className="text-sm text-gray-300">Weekly Deal</span>
            </label>
          </div>
        </div>

        <div className="bg-[#0B1F3A] border border-white/8 p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Images ({totalImages}/8)</h3>
          <div className="grid grid-cols-4 gap-3">
            {existingImages.map((url, idx) => (
              <div key={url} className="relative aspect-square bg-white/5 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                  <button type="button" onClick={() => setExistingImages((p) => p.filter((_, i) => i !== idx))} className="h-7 w-7 bg-red-600 text-white flex items-center justify-center"><X size={14} /></button>
                </div>
              </div>
            ))}
            {newPreviews.map((src, idx) => (
              <div key={src} className="relative aspect-square bg-white/5 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                  <button type="button" onClick={() => { URL.revokeObjectURL(newPreviews[idx]); setNewFiles((p) => p.filter((_, i) => i !== idx)); setNewPreviews((p) => p.filter((_, i) => i !== idx)); }} className="h-7 w-7 bg-red-600 text-white flex items-center justify-center"><X size={14} /></button>
                </div>
              </div>
            ))}
          </div>
          {totalImages < 8 && (
            <div {...getRootProps()} className={cn("border-2 border-dashed p-6 text-center cursor-pointer", isDragActive ? "border-[#F2B705]" : "border-white/10 hover:border-white/30")}>
              <input {...getInputProps()} />
              <Upload size={20} className="mx-auto mb-2 text-gray-500" />
              <p className="text-sm text-gray-400">Add more images</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" href="/admin/products">Cancel</Button>
          <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save Changes"}</Button>
        </div>
      </form>
    </div>
  );
}
