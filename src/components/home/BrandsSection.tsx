import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";

const logoSlugMap: Record<string, string> = {
  "black-decker": "blackdecker",
  "snap-on": "snapon",
  "mac-tools": "mactools",
};

interface BrandsSectionProps {
  brands: Array<{
    name: string;
    slug: string;
  }>;
}

function getLogoSlug(slug: string) {
  return logoSlugMap[slug] ?? slug;
}

export function BrandsSection({ brands }: BrandsSectionProps) {
  return (
    <section className="border-y border-stroke bg-white py-20">
      <Container>
        <SectionHeader
          label="Authorized brands"
          title="Jump straight into brand storefronts"
          subtitle="Every logo below routes into a live brand page, not a dead promo block."
          align="center"
          tone="light"
          className="mb-14"
        />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {brands.map((brand) => (
            <Link
              href={`/brands/${brand.slug}`}
              key={brand.slug}
              className="group flex flex-col items-center justify-center gap-4 rounded-2xl border border-stroke bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-yellow/40 hover:shadow-md"
            >
              <div className="w-32 h-16 relative">
                <Image
                  src={`/brands/${getLogoSlug(brand.slug)}.svg`}
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

        <div className="mt-10 flex items-center justify-center gap-4">
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
