import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
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
    <section className="border-y border-stroke bg-white py-20">
      <Container>
        <SectionHeader
          label="Authorized distributor"
          title="The brands tradespeople trust"
          subtitle="Authentic inventory straight from the source — no gray market, no guesswork."
          align="center"
          tone="light"
          className="mb-14"
        />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {FEATURED_BRANDS.map((brand) => (
            <Link
              href={`/brands/${brand.slug}`}
              key={brand.slug}
              className="group flex flex-col items-center justify-center gap-4 rounded-2xl border border-stroke bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-yellow/40 hover:shadow-md sm:p-8"
            >
              <div className="w-28 h-14 relative sm:w-32 sm:h-16">
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

        <div className="mt-10 flex items-center justify-center">
          <Link
            href="/brands"
            className="inline-flex items-center gap-2 rounded-full border border-stroke bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-ink transition-colors hover:border-yellow hover:bg-panel"
          >
            View all brands
            <ArrowRight size={14} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
