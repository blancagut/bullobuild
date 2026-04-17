import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { StoreProductCard } from "@/components/home/StoreProductCard";

interface ProductsSectionProps {
  departments: Array<{
    name: string;
    slug: string;
    count: number;
    image: string | null;
  }>;
  shelves: Array<{
    name: string;
    slug: string;
    count: number;
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
  }>;
}

const departmentCopy: Record<string, string> = {
  "drills-drivers": "Cordless drills and drivers for everyday jobsite work.",
  "impact-drivers": "High-torque impact drivers for installers and crews.",
  saws: "Circular, reciprocating, and specialty saws for any cut.",
  "wrenches-sockets": "Mechanic-grade wrenches and sockets for auto and industrial.",
  "tool-boxes": "Storage and rolling organization for working crews.",
  "vacuums-cleaning": "Dust control, shop vacs, and handheld cleanup.",
};

export function ProductsSection({ departments, shelves }: ProductsSectionProps) {
  return (
    <section id="catalog-departments" className="bg-canvas py-20 lg:py-24">
      <Container>
        <SectionHeader
          label="Shop by department"
          title="Every tool, organized the way you work"
          subtitle="Cordless, hand tools, storage, cleanup — jump straight into the department you need."
          tone="light"
          className="mb-8"
          action={
            <Button href="/shop" variant="outline" size="sm" className="rounded-full border-stroke bg-white text-ink hover:border-yellow hover:bg-panel">
              Browse Full Catalog
            </Button>
          }
        />

        {departments.length > 0 ? (
          <div className="mb-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {departments.map((department) => (
              <Link
                key={department.slug}
                href={`/categories/${department.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-stroke bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-yellow/40 hover:shadow-md sm:flex-row sm:items-stretch"
              >
                <div className="relative aspect-4/3 w-full shrink-0 overflow-hidden bg-panel sm:aspect-auto sm:w-[42%]">
                  {department.image ? (
                    <Image
                      src={department.image}
                      alt={department.name}
                      fill
                      className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 40vw, 18vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="font-display text-3xl font-black uppercase tracking-tight text-ink-muted/30">
                        {department.name.split(/\s|&/)[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div className="relative z-10 flex flex-1 flex-col p-6">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-yellow-dark">
                    Department
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-black uppercase leading-none text-ink">
                    {department.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                    {departmentCopy[department.slug] ?? "Shop the full range directly from the catalog."}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                    <div>
                      <p className="font-display text-xl font-black text-ink">
                        {department.count.toLocaleString()}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                        items in stock
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-yellow-dark transition-all group-hover:gap-3">
                      Shop
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : null}

        {shelves.length > 0 ? (
          <div className="space-y-8">
            {shelves.map((shelf) => (
              <div key={shelf.slug} className="rounded-2xl border border-stroke bg-white p-5 shadow-sm lg:p-6">
                <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)] xl:items-start">
                  <div className="rounded-[1.75rem] bg-panel p-6">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-yellow-dark">
                      Top sellers
                    </p>
                    <h3 className="mt-3 font-display text-4xl font-black uppercase leading-none text-ink">
                      {shelf.name}
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                      {departmentCopy[shelf.slug] ?? "Popular picks from the full department."}
                    </p>
                    <div className="mt-6 border-t border-stroke pt-5">
                      <p className="font-display text-3xl font-black text-ink">
                        {shelf.count.toLocaleString()}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                        items in stock
                      </p>
                    </div>
                    <Link
                      href={`/categories/${shelf.slug}`}
                      className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-yellow-dark transition-all hover:gap-3"
                    >
                      Shop all {shelf.name}
                      <ArrowRight size={14} />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {shelf.products.map((product, index) => (
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
                        priority={index < 2}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-stroke bg-card px-6 py-14 text-center text-sm text-ink-muted">
            New shelves are being stocked. Browse the full catalog in the meantime.
          </div>
        )}

        <div className="mt-10 flex flex-wrap gap-2">
          {departments.map((department) => (
            <Link
              key={department.slug}
              href={`/categories/${department.slug}`}
              className="rounded-full border border-stroke bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-soft transition-colors hover:border-yellow/40 hover:text-ink"
            >
              {department.name}
            </Link>
          ))}
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full border border-yellow/30 bg-yellow/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-yellow-dark transition-colors hover:border-yellow hover:bg-yellow/20"
          >
            View all departments
            <ArrowRight size={13} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
