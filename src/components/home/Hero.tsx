import Link from "next/link";
import { ArrowRight, Search, ShieldCheck, Tag, Truck } from "lucide-react";
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
  const highlightedCategories = categories.slice(0, 8);

  const stats = [
    { value: productCount.toLocaleString(), label: "In stock now" },
    { value: brandCount.toLocaleString(), label: "Authorized brands" },
    { value: categoryCount.toLocaleString(), label: "Tool categories" },
    { value: "24h", label: "Ships from warehouse" },
  ];

  return (
    <section className="relative overflow-hidden border-b border-stroke bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(242,183,5,0.12),transparent_24%),radial-gradient(circle_at_88%_16%,rgba(0,0,0,0.03),transparent_28%)]" aria-hidden="true" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-size-[42px_42px]" aria-hidden="true" />

      <Container className="relative z-10 py-12 md:py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.8fr)] lg:items-start">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-yellow/30 bg-yellow/15 px-4 py-2">
              <ShieldCheck size={14} className="text-yellow-dark" />
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-ink">
                Authorized distributor
              </span>
            </div>

            <h1 className="font-display max-w-5xl text-[2.75rem] font-black uppercase leading-[0.92] tracking-tight text-ink sm:text-6xl lg:text-7xl xl:text-[5.25rem]">
              Pro tools.
              <br />
              Real stock.
              <br />
              <span className="text-yellow-dark">Fast shipping.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
              Authentic power tools and hand tools from Milwaukee, Makita, DeWalt, Mac Tools and more — stocked, shipped, and ready for the job.
            </p>

            <form action="/search" className="mt-8 flex flex-col gap-3 rounded-2xl border border-stroke bg-white p-3 shadow-sm sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[1.25rem] border border-stroke bg-card px-4 py-4">
                <Search size={18} className="shrink-0 text-ink-muted" />
                <input
                  type="search"
                  name="q"
                  aria-label="Search tools"
                  placeholder="Search tools, brands, or model numbers"
                  className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-yellow px-6 text-sm font-black uppercase tracking-[0.18em] text-ink transition-colors hover:bg-yellow-dark"
              >
                Search
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="-mx-4 mt-5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:overflow-visible sm:px-0">
              <div className="flex gap-2 whitespace-nowrap sm:flex-wrap sm:whitespace-normal">
                {highlightedCategories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/categories/${category.slug}`}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-stroke bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-soft transition-colors hover:border-yellow/40 hover:text-ink"
                  >
                    <Tag size={12} className="text-yellow-dark" />
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/deals" size="lg" className="group rounded-full bg-yellow text-ink hover:bg-yellow-dark">
                Shop Today&apos;s Deals
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Button>
              <Button href="/shop" variant="secondary" size="lg" className="rounded-full">
                Browse All Tools
              </Button>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 border-t border-stroke pt-8 md:grid-cols-4">
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
                  <Truck size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-yellow-dark">
                    Fast fulfillment
                  </p>
                  <p className="font-display text-2xl font-black uppercase text-ink">
                    Same-day pick, next-day ship
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-ink-soft">
                Stocked orders are picked the same business day and leave our warehouse within 24 hours — so the tool you need tomorrow is already on its way.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div className="rounded-2xl border border-stroke bg-white p-5 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink-muted">
                  In stock right now
                </p>
                <p className="mt-2 font-display text-4xl font-black uppercase text-ink">
                  {productCount.toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-ink-soft">
                  Cordless, hand tools, storage, measuring, and more — all live inventory.
                </p>
              </div>
              <div className="rounded-2xl border border-stroke bg-white p-5 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink-muted">
                  Quick routes
                </p>
                <div className="mt-3 flex flex-col gap-2 text-sm text-ink">
                  <Link href="/deals" className="transition-colors hover:text-yellow-dark">
                    Today&apos;s deals
                  </Link>
                  <Link href="/shop" className="transition-colors hover:text-yellow-dark">
                    Full catalog
                  </Link>
                  <Link href="/marketplace" className="transition-colors hover:text-yellow-dark">
                    Pre-owned tools
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
