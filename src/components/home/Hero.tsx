import Link from "next/link";
import { ArrowRight, Search, ShieldCheck, Tag, Wrench } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

interface HeroProps {
  productCount: number;
  brandCount: number;
  categoryCount: number;
  categories: Array<{
    name: string;
    slug: string;
  }>;
}

export function Hero({
  productCount,
  brandCount,
  categoryCount,
  categories,
}: HeroProps) {
  const highlightedCategories = categories.slice(0, 6);

  const stats = [
    { value: productCount.toLocaleString(), label: "Live products" },
    { value: brandCount.toLocaleString(), label: "Authorized brands" },
    { value: categoryCount.toLocaleString(), label: "Tool categories" },
    { value: "24h", label: "Dispatch on stocked orders" },
  ];

  return (
    <section className="relative overflow-hidden border-b border-stroke bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(242,183,5,0.12),transparent_24%),radial-gradient(circle_at_88%_16%,rgba(0,0,0,0.03),transparent_28%)]" aria-hidden="true" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-size-[42px_42px]" aria-hidden="true" />

      <Container className="relative z-10 py-14 md:py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.8fr)] lg:items-start">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-yellow/30 bg-yellow/15 px-4 py-2">
              <ShieldCheck size={14} className="text-yellow-dark" />
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-ink">
                Authorized inventory only
              </span>
            </div>

            <h1 className="font-display max-w-5xl text-5xl font-black uppercase leading-[0.9] tracking-tight text-ink sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
              Shop the catalog
              <br />
              like a real
              <br />
              <span className="text-yellow-dark">merchandise machine.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
              Browse {productCount.toLocaleString()} catalog items across {categoryCount.toLocaleString()} categories and {brandCount.toLocaleString()} active brand storefronts. The homepage now leads with departments, category shelves, and real catalog breadth instead of a single narrow product strip.
            </p>

            <form action="/search" className="mt-8 flex flex-col gap-3 rounded-2xl border border-stroke bg-white p-3 shadow-sm sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[1.25rem] border border-stroke bg-card px-4 py-4">
                <Search size={18} className="shrink-0 text-ink-muted" />
                <input
                  type="search"
                  name="q"
                  aria-label="Search tools"
                  placeholder="Search drills, impact wrenches, combo kits, brands, or model numbers"
                  className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-yellow px-6 text-sm font-black uppercase tracking-[0.18em] text-ink transition-colors hover:bg-yellow-dark"
              >
                Search Catalog
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="mt-5 flex flex-wrap gap-2">
              {highlightedCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/categories/${category.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-stroke bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-soft transition-colors hover:border-yellow/40 hover:text-ink"
                >
                  <Tag size={12} className="text-yellow-dark" />
                  {category.name}
                </Link>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="/shop" size="lg" className="group rounded-full bg-yellow text-ink hover:bg-yellow-dark">
                Browse All Products
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Button>
              <Button href="/brands" variant="secondary" size="lg" className="rounded-full">
                Shop by Brand
              </Button>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 border-t border-stroke pt-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-stroke bg-white p-4 shadow-sm">
                  <span className="font-display block text-3xl font-black leading-none text-ink">
                    {stat.value}
                  </span>
                  <span className="mt-2 block text-[10px] uppercase tracking-[0.22em] text-ink-muted">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl border border-stroke bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow text-ink">
                  <Wrench size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-yellow-dark">
                    Storefront focus
                  </p>
                  <p className="font-display text-2xl font-black uppercase text-ink">
                    Built for wide discovery
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-ink-soft">
                This landing page is shifting away from a dark promo feel and toward a brighter, department-led catalog front door. The goal is to help people enter by task, category, and brand instead of making them hunt through a single product strip.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div className="rounded-2xl border border-stroke bg-white p-5 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink-muted">
                  Catalog depth
                </p>
                <p className="mt-2 font-display text-4xl font-black uppercase text-ink">
                  {productCount.toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-ink-soft">
                  Searchable stock across cordless, hand tools, storage, measuring, and more.
                </p>
              </div>
              <div className="rounded-2xl border border-stroke bg-white p-5 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink-muted">
                  Shop routes
                </p>
                <div className="mt-3 flex flex-col gap-2 text-sm text-ink">
                  <Link href="/shop" className="transition-colors hover:text-yellow-dark">
                    Browse the live catalog
                  </Link>
                  <Link href="/#catalog-departments" className="transition-colors hover:text-yellow-dark">
                    Explore departments on this page
                  </Link>
                  <Link href="/marketplace" className="transition-colors hover:text-yellow-dark">
                    Used tools marketplace
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
