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
    <section className="relative overflow-hidden border-b border-white/5 bg-navy-dark">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(242,183,5,0.16),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(17,38,69,0.9),transparent_36%)]" aria-hidden="true" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[40px_40px]" aria-hidden="true" />

      <Container className="relative z-10 py-14 md:py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.8fr)] lg:items-start">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 border border-yellow/25 bg-yellow/10 px-4 py-2">
              <ShieldCheck size={14} className="text-yellow" />
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-yellow">
                Authorized inventory only
              </span>
            </div>

            <h1 className="font-display max-w-5xl text-5xl font-black uppercase leading-[0.9] tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
              Search, compare,
              <br />
              and buy pro tools
              <br />
              <span className="text-yellow">at catalog scale.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-gray-300 sm:text-lg">
              Shop live inventory across {productCount.toLocaleString()} tools from {brandCount} authorized brands.
              Fast lookup, real stock, direct checkout, and brand storefronts built to move product.
            </p>

            <form action="/search" className="mt-8 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-white/10 bg-navy px-4 py-4">
                <Search size={18} className="shrink-0 text-yellow" />
                <input
                  type="search"
                  name="q"
                  aria-label="Search tools"
                  placeholder="Search drills, impact wrenches, combo kits, brands, or model numbers"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-14 items-center justify-center gap-2 bg-yellow px-6 text-sm font-black uppercase tracking-[0.18em] text-navy transition-colors hover:bg-yellow-dark"
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
                  className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-300 transition-colors hover:border-yellow/40 hover:text-white"
                >
                  <Tag size={12} className="text-yellow" />
                  {category.name}
                </Link>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="/search" size="lg" className="group">
                Browse All Products
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Button>
              <Button href="/brands" variant="outline" size="lg">
                Shop by Brand
              </Button>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 border-t border-white/10 pt-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-xl border border-white/8 bg-white/5 p-4">
                  <span className="font-display block text-3xl font-black leading-none text-yellow">
                    {stat.value}
                  </span>
                  <span className="mt-2 block text-[10px] uppercase tracking-[0.22em] text-gray-500">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-yellow/20 bg-[linear-gradient(180deg,rgba(242,183,5,0.16),rgba(11,31,58,0.92))] p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center bg-yellow text-navy">
                  <Wrench size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-yellow">
                    Storefront focus
                  </p>
                  <p className="font-display text-2xl font-black uppercase text-white">
                    Built to sell now
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-gray-200">
                New inventory stays front and center. Marketplace exists, but the primary path is fast discovery,
                stock-backed product pages, and direct add-to-cart conversion.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">
                  Catalog depth
                </p>
                <p className="mt-2 font-display text-4xl font-black uppercase text-white">
                  {productCount.toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-gray-400">
                  Searchable stock across cordless, hand tools, storage, measuring, and more.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">
                  Shop routes
                </p>
                <div className="mt-3 flex flex-col gap-2 text-sm text-white">
                  <Link href="/search" className="hover:text-yellow">
                    Search the full catalog
                  </Link>
                  <Link href="/#deals" className="hover:text-yellow">
                    Price drops and deal items
                  </Link>
                  <Link href="/marketplace" className="hover:text-yellow">
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
