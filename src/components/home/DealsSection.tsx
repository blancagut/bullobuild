import Link from "next/link";
import { ArrowRight, Clock, Zap } from "lucide-react";
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
    <section id="deals" className="relative overflow-hidden border-y border-stroke bg-paper py-20 lg:py-24">
      <div className="absolute inset-y-0 right-0 w-1/3 bg-yellow/10" aria-hidden="true" />
      <div className="absolute right-0 top-0 h-full w-1 bg-yellow-dark" aria-hidden="true" />

      <Container className="relative z-10">
        <div className="mb-8 flex items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-navy p-3 text-white">
              <Zap size={20} />
            </div>
            <SectionHeader
              label="Live deals"
              title="Price drops worth buying now"
              subtitle="Discounted products pulled from the catalog with current stock and direct add-to-cart."
              tone="light"
            />
          </div>
          <div className="hidden items-center gap-2 text-ink-muted md:flex">
            <Clock size={13} />
            <span className="text-xs uppercase tracking-widest">
              Deal shelf pulled from live inventory
            </span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {products.map((product, index) => (
            <div key={product.id} className="space-y-3">
              <div className="flex items-center justify-between rounded-[1.25rem] border border-yellow/30 bg-yellow/10 px-4 py-3">
                <span className="text-[11px] font-black uppercase tracking-[0.18em] text-yellow-dark">
                  {index === 0 ? "Hot deal" : "Price drop"}
                </span>
                <span className={`text-[11px] font-bold uppercase tracking-[0.18em] ${product.stock <= 5 ? "text-red-400" : "text-emerald-400"}`}>
                  {product.stock <= 5 ? `${product.stock} left` : `${product.stock} in stock`}
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
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-navy transition-all hover:gap-4"
          >
            Browse more discounted inventory <ArrowRight size={15} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
