"use client";

import { useState, useCallback } from "react";
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
import { useEffect } from "react";

interface Brand { id: string; name: string }
interface Category { id: string; name: string }

export default function NewProductPage() {
  const router = useRouter();
  const supabase = createClient();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: "", slug: "", model: "", brand_id: "", category_id: "",
    price: "", original_price: "", stock: "0", description: "",
    is_featured: false, is_deal: false,
  });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from("brands").select("id, name").order("name"),
      supabase.from("categories").select("id, name").order("name"),
    ]).then(([{ data: b }, { data: c }]) => {
      setBrands(b ?? []);
      setCategories(c ?? []);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDrop = useCallback((accepted: File[]) => {
    const toAdd = accepted.slice(0, 8 - images.length);
    setImages((p) => [...p, ...toAdd]);
    setPreviews((p) => [...p, ...toAdd.map((f) => URL.createObjectURL(f))]);
  }, [images.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "image/*": [] }, disabled: images.length >= 8,
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

  function removeImage(idx: number) {
    URL.revokeObjectURL(previews[idx]);
    setImages((p) => p.filter((_, i) => i !== idx));
    setPreviews((p) => p.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.slug || !form.price || !form.brand_id) {
      toast.error("Fill in required fields (name, brand, price)");
      return;
    }
    setSubmitting(true);
    try {
      const imageUrls: string[] = [];
      for (const file of images) {
        const path = `products/${Date.now()}-${file.name}`;
        await supabase.storage.from("product-images").upload(path, file);
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        imageUrls.push(data.publicUrl);
      }

      const { error } = await supabase.from("products").insert({
        name: form.name,
        slug: form.slug,
        model: form.model || null,
        brand_id: form.brand_id,
        category_id: form.category_id || null,
        price: parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        stock: parseInt(form.stock),
        description: form.description || null,
        images: imageUrls,
        is_featured: form.is_featured,
        is_deal: form.is_deal,
      });
      if (error) throw error;
      toast.success("Product created!");
      router.push("/admin/products");
    } catch (err) {
      toast.error("Failed to create product");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader label="Admin" title="Add Product" />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[#0B1F3A] border border-white/8 p-6 space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Basic Info</h3>
          <Input label="Product Name *" name="name" value={form.name} onChange={handleChange} required />
          <Input label="Slug *" name="slug" value={form.slug} onChange={handleChange} required hint="Auto-generated from name" />
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
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Product Images ({images.length}/8)</h3>
          {images.length < 8 && (
            <div {...getRootProps()} className={cn("border-2 border-dashed p-8 text-center cursor-pointer transition-colors", isDragActive ? "border-[#F2B705] bg-[#F2B705]/5" : "border-white/10 hover:border-white/30")}>
              <input {...getInputProps()} />
              <Upload size={24} className="mx-auto mb-3 text-gray-500" />
              <p className="text-sm text-gray-400">Drop images or click to upload</p>
            </div>
          )}
          {previews.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {previews.map((src, idx) => (
                <div key={idx} className="relative aspect-square bg-white/5 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                    <button type="button" onClick={() => removeImage(idx)} className="h-7 w-7 bg-red-600 text-white flex items-center justify-center">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" href="/admin/products">Cancel</Button>
          <Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create Product"}</Button>
        </div>
      </form>
    </div>
  );
}
