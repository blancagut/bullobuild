"use client";

import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProductCard } from "@/components/ui/ProductCard";
import { Heart } from "lucide-react";
import type { Product } from "@/types";

export default function SavedPage() {
  const [saved, setSaved] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("bullobuild-saved");
      if (raw) setSaved(JSON.parse(raw));
    } catch {
      setSaved([]);
    }
    setLoaded(true);
  }, []);

  function removeSaved(id: string) {
    const next = saved.filter((p) => p.id !== id);
    setSaved(next);
    localStorage.setItem("bullobuild-saved", JSON.stringify(next));
  }

  return (
    <div className="space-y-6">
      <SectionHeader label="Account" title="Saved Items" subtitle={saved.length > 0 ? `${saved.length} item(s) saved` : undefined} />

      {!loaded ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 border-2 border-[#F2B705] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : saved.length === 0 ? (
        <div className="bg-[#0B1F3A] border border-white/8 py-20 flex flex-col items-center gap-3 text-center">
          <Heart size={32} className="text-gray-700" />
          <p className="text-sm font-bold uppercase tracking-wide text-gray-500">No saved items</p>
          <p className="text-xs text-gray-600">Save products while browsing to find them here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {saved.map((product) => (
            <div key={product.id} className="relative">
              <ProductCard
                id={product.id}
                slug={product.slug}
                name={product.name}
                brand={product.brand?.name ?? ""}
                price={product.price}
                originalPrice={product.original_price ?? undefined}
                image={product.images?.[0]}
                inStock={product.stock > 0}
              />
              <button
                onClick={() => removeSaved(product.id)}
                className="absolute top-3 right-3 h-7 w-7 bg-red-900/80 hover:bg-red-700 text-white flex items-center justify-center transition-colors"
                title="Remove from saved"
              >
                <Heart size={13} fill="currentColor" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
