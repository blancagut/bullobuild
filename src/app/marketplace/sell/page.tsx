"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { Upload, ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const CONDITIONS = [
  { value: "like_new", label: "Like New", desc: "Minimal use, looks new" },
  { value: "excellent", label: "Excellent", desc: "Light wear, fully functional" },
  { value: "good", label: "Good", desc: "Normal wear, works great" },
  { value: "fair", label: "Fair", desc: "Visible wear, still functional" },
];

const STEPS = ["Details", "Condition & Price", "Photos", "Review"];

export default function SellPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    brand_slug: "",
    condition: "",
    price: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070F1C] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-[#F2B705] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.replace("/auth/login?redirect=/marketplace/sell");
    return null;
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 6);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  }

  async function handleSubmit() {
    setSubmitting(true);
    const supabase = createClient();

    try {
      // Upload images
      const imageUrls: string[] = [];
      const userId = user!.id;
      for (const file of images) {
        const ext = file.name.split(".").pop();
        const path = `listings/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage
          .from("listing-images")
          .upload(path, file);
        if (!error) {
          const { data: urlData } = supabase.storage
            .from("listing-images")
            .getPublicUrl(path);
          imageUrls.push(urlData.publicUrl);
        }
      }

      // Resolve brand
      let brandId: string | null = null;
      if (form.brand_slug) {
        const { data: brand } = await supabase
          .from("brands")
          .select("id")
          .eq("slug", form.brand_slug)
          .single();
        brandId = brand?.id ?? null;
      }

      const { error } = await supabase.from("listings").insert({
        user_id: userId,
        title: form.title,
        description: form.description || null,
        brand_id: brandId,
        condition: form.condition,
        price: parseFloat(form.price),
        images: imageUrls,
        is_sold: false,
        is_approved: false,
      });

      if (error) throw error;

      toast.success("Listing submitted for review!");
      router.push("/account/listings");
    } catch {
      toast.error("Failed to create listing. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const canNext = [
    form.title.length >= 5 && form.description.length >= 10,
    form.condition !== "" && parseFloat(form.price) > 0,
    true,
    true,
  ][step];

  return (
    <div className="min-h-screen bg-[#070F1C] py-10">
      <Container>
        <SectionHeader
          label="Marketplace"
          title="List a Tool for Sale"
          subtitle="Fill out the details below. Listings are reviewed within 24 hours."
          className="mb-10"
        />

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-10 max-w-xl">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border-2 transition-colors",
                  i < step
                    ? "bg-[#F2B705] border-[#F2B705] text-[#070F1C]"
                    : i === step
                    ? "border-[#F2B705] text-[#F2B705]"
                    : "border-white/20 text-gray-600"
                )}
              >
                {i < step ? <CheckCircle size={14} /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-xs ml-2 font-medium",
                  i === step ? "text-white" : "text-gray-600"
                )}
              >
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px bg-white/10 mx-3" />
              )}
            </div>
          ))}
        </div>

        <div className="max-w-xl">
          {/* Step 0 — Details */}
          {step === 0 && (
            <div className="space-y-4">
              <Input
                label="Title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. DeWalt 20V MAX Drill Driver Kit"
                required
              />
              <Textarea
                label="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the tool, what's included, any defects…"
                rows={5}
                required
              />
              <Input
                label="Brand (optional)"
                name="brand_slug"
                value={form.brand_slug}
                onChange={handleChange}
                placeholder="e.g. dewalt, milwaukee, craftsman"
              />
            </div>
          )}

          {/* Step 1 — Condition & Price */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Condition
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, condition: c.value }))}
                      className={cn(
                        "p-4 border text-left transition-colors",
                        form.condition === c.value
                          ? "border-[#F2B705] bg-[#F2B705]/5"
                          : "border-white/10 hover:border-white/30"
                      )}
                    >
                      <p
                        className={cn(
                          "text-sm font-bold",
                          form.condition === c.value ? "text-[#F2B705]" : "text-white"
                        )}
                      >
                        {c.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Asking Price (USD)"
                name="price"
                type="number"
                min="1"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>
          )}

          {/* Step 2 — Photos */}
          {step === 2 && (
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Photos (up to 6)
              </label>
              <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-white/20 hover:border-[#F2B705]/50 cursor-pointer transition-colors">
                <Upload size={24} className="text-gray-500 mb-2" />
                <span className="text-sm text-gray-400">Click to upload photos</span>
                <span className="text-xs text-gray-600 mt-1">JPG, PNG, WEBP · Max 5MB each</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImages}
                />
              </label>
              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {previews.map((p, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={p}
                      alt={`Preview ${i + 1}`}
                      className="h-24 w-full object-cover"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3 — Review */}
          {step === 3 && (
            <div className="bg-[#0B1F3A] border border-white/10 p-6 space-y-4">
              <h3
                className="text-lg font-black uppercase text-white"
                style={{ fontFamily: "var(--font-barlow), system-ui" }}
              >
                Review Your Listing
              </h3>
              <dl className="space-y-3 text-sm">
                {[
                  { label: "Title", value: form.title },
                  { label: "Condition", value: CONDITIONS.find((c) => c.value === form.condition)?.label },
                  { label: "Price", value: `$${parseFloat(form.price || "0").toFixed(2)}` },
                  { label: "Photos", value: `${images.length} uploaded` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <dt className="text-gray-500">{label}</dt>
                    <dd className="text-white font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-xs text-gray-500 pt-2 border-t border-white/10">
                Your listing will be reviewed by our team within 24 hours before going live.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <Button
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
                className="flex-1"
              >
                <ChevronLeft size={16} className="mr-1" />
                Back
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext}
                className="flex-1"
              >
                Next
                <ChevronRight size={16} className="ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? "Submitting…" : "Submit Listing"}
              </Button>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
