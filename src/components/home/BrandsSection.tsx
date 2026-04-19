import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";

const FEATURED_BRANDS = [
  { name: "Milwaukee", slug: "milwaukee", logo: "milwaukee" },
  { name: "DeWalt", slug: "dewalt", logo: "dewalt" },
  { name: "Snap-on", slug: "snap-on", logo: "snapon" },
  { name: "Mac Tools", slug: "mac-tools", logo: "mactools" },
  { name: "Stanley", slug: "stanley", logo: "stanley" },
  { name: "Craftsman", slug: "craftsman", logo: "craftsman" },
  { name: "Black+Decker", slug: "black-decker", logo: "blackdecker" },
  { name: "SKIL", slug: "skil", logo: "skil" },
  { name: "Proto", slug: "proto", logo: "proto" },
  { name: "Kobalt", slug: "kobalt", logo: "kobalt" },
];

export function BrandsSection() {
  return (
    <section className="border-y border-stroke bg-white py-14 lg:py-18">
      <Container>
        <SectionHeader
          label="Authorized brands"
          title="Shop by brand"
          subtitle="Browse live inventory from the top names in professional tools."
          align="center"
          tone="light"
          className="mb-8 md:mb-10"
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-5">
          {FEATURED_BRANDS.map((brand) => (
            <Link
              href={`/brands/${brand.slug}`}
              key={brand.slug}
              className="group flex flex-col items-center justify-center gap-4 rounded-2xl border border-stroke bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-yellow/40 hover:shadow-md sm:p-6"
            >
              <div className="relative h-14 w-28 sm:h-16 sm:w-32">
                <Image
                  src={`/brands/${brand.logo}.svg`}
                  alt={`${brand.name} logo`}
                  fill
                  className="object-contain"
                  sizes="128px"
                />
              </div>

              <span className="font-display text-xs font-bold uppercase tracking-tight text-ink-soft transition-colors group-hover:text-ink">
                {brand.name}
              </span>

              <div className="h-px w-6 bg-yellow-dark opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-4 sm:mt-10">
          <div className="h-px flex-1 max-w-24 bg-stroke" />
          <p className="text-center text-[10px] uppercase tracking-widest text-ink-muted">
            open a brand page, then drop directly into live product inventory
          </p>
          <div className="h-px flex-1 max-w-24 bg-stroke" />
        </div>
      </Container>
    </section>
  );
}
