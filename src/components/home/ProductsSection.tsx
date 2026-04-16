import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { StoreProductCard } from "@/components/home/StoreProductCard";

interface ProductsSectionProps {
  products: Array<{
    id: string;
    slug: string;
    name: string;
    price: number;
    original_price: number | null;
    images: string[];
    stock: number;
    is_featured: boolean;
    is_deal: boolean;
    brands: {
      name: string;
    } | null;
  }>;
  categories: Array<{
    name: string;
    slug: string;
  }>;
}

export function ProductsSection({ products, categories }: ProductsSectionProps) {
  return (
    <section className="bg-navy-dark py-20 lg:py-24">
      <Container>
        <SectionHeader
          label="Live inventory"
          title="Featured tools ready to move"
          subtitle="Real products from the catalog, selected from live inventory instead of static promo content."
          className="mb-8"
          action={
            <Button href="/search" variant="outline" size="sm">
              Browse Full Catalog
            </Button>
          }
        />

        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-300 transition-colors hover:border-yellow/40 hover:text-white"
            >
              {category.name}
            </Link>
          ))}
          <Link
            href="/search"
            className="inline-flex items-center gap-2 border border-yellow/30 bg-yellow/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-yellow transition-colors hover:bg-yellow/15"
          >
            View all
            <ArrowRight size={13} />
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => (
              <StoreProductCard
                key={product.id}
                id={product.id}
                slug={product.slug}
                name={product.name}
                brand={product.brands?.name ?? "Unknown brand"}
                price={product.price}
                originalPrice={product.original_price}
                image={product.images?.[0]}
                stock={product.stock}
                badge={product.is_deal ? "Deal" : product.is_featured ? "Featured" : undefined}
                priority={index < 4}
              />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-white/10 bg-white/5 px-6 py-14 text-center text-sm text-gray-500">
            No featured inventory is available yet.
          </div>
        )}
      </Container>
    </section>
  );
}
