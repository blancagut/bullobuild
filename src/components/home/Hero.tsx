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
    <section className="hero-dark relative overflow-hidden border-b border-[#333333]">
      {/* Background loop video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden="true"
      >
        <source src="/hero/hero-loop.mp4" type="video/mp4" />
      </video>
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/60" aria-hidden="true" />

      <Container className="relative z-10 py-12 md:py-16 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.8fr)] lg:items-start lg:gap-10">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#f2b70533] bg-[#f2b70522] px-3.5 py-2 backdrop-blur-sm">
              <ShieldCheck size={14} className="text-[#f2b705]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#ffffff]">
                Authorized inventory only
              </span>
            </div>

            <h1 className="font-display max-w-[11ch] text-[3.15rem] font-black uppercase leading-[0.88] tracking-tight text-[#ffffff] sm:max-w-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
              Shop the catalog
              <br />
              like a real
              <br />
              <span className="text-[#f2b705]">merchandise machine.</span>
            </h1>

            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[#ffffffcc] sm:text-lg">
              Browse {productCount.toLocaleString()} catalog items across {categoryCount.toLocaleString()} categories and {brandCount.toLocaleString()} active brand storefronts. The homepage now leads with departments, category shelves, and real catalog breadth instead of a single narrow product strip.
            </p>

            <form action="/search" className="mt-7 flex flex-col gap-2.5 rounded-2xl border border-[#ffffff33] bg-[#00000040] p-3 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[1.25rem] border border-[#ffffff33] bg-[#ffffffe6] px-4 py-3.5">
                <Search size={18} className="shrink-0 text-[#666666]" />
                <input
                  type="search"
                  name="q"
                  aria-label="Search tools"
                  placeholder="Search drills, impact wrenches, combo kits, brands, or model numbers"
                  className="w-full bg-transparent text-sm text-[#1a1a1a] outline-none placeholder:text-[#999999]"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#f2b705] px-6 text-sm font-black uppercase tracking-[0.16em] text-[#1a1a1a] transition-colors hover:bg-[#cf9500] sm:h-14"
              >
                Search Catalog
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
              {highlightedCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/categories/${category.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-[#ffffff33] bg-[#00000033] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#ffffffcc] backdrop-blur-sm transition-colors hover:border-[#f2b70566] hover:text-[#ffffff]"
                >
                  <Tag size={12} className="text-[#f2b705]" />
                  {category.name}
                </Link>
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <Button href="/shop" size="lg" className="group w-full rounded-full bg-[#f2b705] text-[#1a1a1a] hover:bg-[#cf9500] sm:w-auto">
                Browse All Products
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Button>
              <Button href="/brands" variant="secondary" size="lg" className="w-full rounded-full !border-[#ffffff4d] !bg-transparent !text-[#ffffff] hover:!bg-[#ffffff1a] sm:w-auto">
                Shop by Brand
              </Button>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 border-t border-[#ffffff33] pt-6 sm:gap-4 sm:pt-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-[#ffffff33] bg-[#00000033] p-4 shadow-sm backdrop-blur-sm">
                  <span className="font-display block text-[1.9rem] font-black leading-none text-[#ffffff] sm:text-3xl">
                    {stat.value}
                  </span>
                  <span className="mt-2 block text-[10px] uppercase tracking-[0.22em] text-[#ffffff99]">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:gap-4">
            <div className="rounded-2xl border border-[#ffffff33] bg-[#00000033] p-5 shadow-sm backdrop-blur-sm sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f2b705] text-[#1a1a1a]">
                  <Wrench size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#f2b705]">
                    Storefront focus
                  </p>
                  <p className="font-display text-2xl font-black uppercase text-[#ffffff]">
                    Built for wide discovery
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-[#ffffffb3]">
                This landing page is shifting away from a dark promo feel and toward a brighter, department-led catalog front door. The goal is to help people enter by task, category, and brand instead of making them hunt through a single product strip.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 xl:gap-4">
              <div className="rounded-2xl border border-[#ffffff33] bg-[#00000033] p-5 shadow-sm backdrop-blur-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#ffffff99]">
                  Catalog depth
                </p>
                <p className="mt-2 font-display text-4xl font-black uppercase text-[#ffffff]">
                  {productCount.toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-[#ffffffb3]">
                  Searchable stock across cordless, hand tools, storage, measuring, and more.
                </p>
              </div>
              <div className="rounded-2xl border border-[#ffffff33] bg-[#00000033] p-5 shadow-sm backdrop-blur-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#ffffff99]">
                  Shop routes
                </p>
                <div className="mt-3 flex flex-col gap-2 text-sm text-[#ffffffdd]">
                  <Link href="/shop" className="transition-colors hover:text-[#f2b705]">
                    Browse the live catalog
                  </Link>
                  <Link href="/#catalog-departments" className="transition-colors hover:text-[#f2b705]">
                    Explore departments on this page
                  </Link>
                  <Link href="/marketplace" className="transition-colors hover:text-[#f2b705]">
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
