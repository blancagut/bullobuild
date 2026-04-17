import Link from "next/link";
import { ArrowRight, Flame, Zap } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StoreProductCard } from "@/components/home/StoreProductCard";

interface DealsSectionProps {
  products: Array<{
    id: string;
    slug: string;
    name: string;
    price: number;
    original_price: number | null;
    images: string[];
    stock: number;
    brands: {
      name: string;
    } | null;
  }>;
}

export function DealsSection({ products }: DealsSectionProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section id="deals" className="relative overflow-hidden border-y border-stroke bg-white py-20 lg:py-24">
      <div className="absolute inset-y-0 right-0 w-1/3 bg-yellow/10" aria-hidden="true" />
      <div className="absolute right-0 top-0 h-full w-1 bg-yellow-dark" aria-hidden="true" />

      <Container className="relative z-10">
        <div className="mb-8 flex items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-yellow p-3 text-ink">
              <Zap size={20} />
            </div>
            <SectionHeader
              label="Deals"
              title="Pro tools on sale right now"
              subtitle="Price drops on authentic, in-stock inventory. Add to cart in one tap."
              tone="light"
            />
          </div>
          <Link
            href="/deals"
            className="hidden items-center gap-2 rounded-full border border-stroke bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-ink transition-colors hover:border-yellow hover:bg-panel md:inline-flex"
          >
            View all deals
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {products.map((product) => {
            const savings =
              product.original_price && product.original_price > product.price
                ? product.original_price - product.price
                : null;
            const percent =
              product.original_price && product.original_price > product.price
                ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
                : null;
            return (
              <div key={product.id} className="space-y-3">
                <div className="flex items-center justify-between rounded-[1.25rem] border border-yellow/30 bg-yellow/10 px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-yellow-dark">
                    <Flame size={13} />
                    {savings ? `Save $${savings.toFixed(0)}` : "Deal"}
                    {percent ? ` · −${percent}%` : ""}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] ${
                      product.stock <= 5
                        ? "bg-white text-red-600 ring-1 ring-red-200"
                        : "bg-white text-emerald-700 ring-1 ring-emerald-200"
                    }`}
                  >
                    {product.stock <= 5 ? `Only ${product.stock} left` : "In stock"}
                  </span>
                </div>
                <StoreProductCard
                  id={product.id}
                  slug={product.slug}
                  name={product.name}
                  brand={product.brands?.name ?? "Unknown brand"}
                  price={product.price}
                  originalPrice={product.original_price}
                  image={product.images?.[0]}
                  stock={product.stock}
                  badge="Deal"
                />
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/deals"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-yellow-dark transition-all hover:gap-4"
          >
            See every active deal <ArrowRight size={15} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
