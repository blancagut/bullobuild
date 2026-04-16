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
    <section className="border-y border-white/5 bg-navy py-20">
      <Container>
        <SectionHeader
          label="Authorized brands"
          title="Jump straight into brand storefronts"
          subtitle="Every logo below routes into a live brand page, not a dead promo block."
          align="center"
          className="mb-14"
        />

        <div className="grid grid-cols-2 gap-px bg-white/5 sm:grid-cols-3 md:grid-cols-5">
          {brands.map((brand) => (
            <Link
              href={`/brands/${brand.slug}`}
              key={brand.slug}
              className="group flex flex-col items-center justify-center gap-4 bg-navy p-8 transition-colors hover:bg-navy-light"
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

              <span className="font-display text-xs font-bold uppercase tracking-tight text-gray-500 transition-colors group-hover:text-white">
                {brand.name}
              </span>

              <div className="h-px w-6 bg-yellow opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-center gap-4">
          <div className="h-px flex-1 max-w-24 bg-white/8" />
          <p className="text-[10px] text-gray-600 uppercase tracking-widest text-center">
            open a brand page, then drop directly into live product inventory
          </p>
          <div className="h-px flex-1 max-w-24 bg-white/8" />
        </div>
      </Container>
    </section>
  );
}
