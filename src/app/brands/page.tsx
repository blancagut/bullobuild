import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { BRANDS } from "@/lib/constants";

const brandDetails: Record<string, { founded: string; specialty: string; color: string }> = {
  dewalt: { founded: "1923", specialty: "Power Tools & Accessories", color: "#FFD700" },
  milwaukee: { founded: "1924", specialty: "Heavy-Duty Power Tools", color: "#CC0000" },
  craftsman: { founded: "1927", specialty: "Hand & Power Tools", color: "#CC2200" },
  stanley: { founded: "1843", specialty: "Hand Tools & Storage", color: "#FFD700" },
  "black-decker": { founded: "1910", specialty: "Consumer Power Tools", color: "#FF8C00" },
  "snap-on": { founded: "1920", specialty: "Professional Mechanics Tools", color: "#CC0000" },
  "mac-tools": { founded: "1938", specialty: "Automotive Tools", color: "#003087" },
  kobalt: { founded: "1998", specialty: "Cordless Power Tools", color: "#005CB9" },
  skil: { founded: "1924", specialty: "Woodworking & DIY Tools", color: "#007A33" },
  proto: { founded: "1907", specialty: "Industrial Hand Tools", color: "#CC0000" },
};

export default function BrandsPage() {
  return (
    <div className="min-h-screen bg-[#070f1c]">
      {/* Header */}
      <div className="bg-[#0b1f3a] border-b border-white/5 py-16">
        <Container className="text-center">
          <p className="text-[#f2b705] text-[11px] font-bold uppercase tracking-[0.35em] mb-3">
            Official Authorized Distributor
          </p>
          <h1
            className="font-black text-4xl lg:text-6xl uppercase text-white mb-4"
            style={{ fontFamily: "var(--font-barlow), system-ui" }}
          >
            Trusted Brands
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
            We are an authorized distributor for all brands below. Every product
            is 100% authentic, factory-sealed, and covered by manufacturer
            warranty.
          </p>
        </Container>
      </div>

      <Container className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5">
          {BRANDS.map((brand) => {
            const detail = brandDetails[brand.slug] || {
              founded: "—",
              specialty: "Professional Tools",
              color: "#f2b705",
            };
            return (
              <Link
                key={brand.slug}
                href={`/shop?brand=${brand.slug}`}
                className="group bg-[#0f1b2e] hover:bg-[#0b1f3a] transition-all flex gap-6 p-8 items-center border-l-2 border-transparent hover:border-[#f2b705]"
              >
                {/* Brand box */}
                <div className="w-20 h-20 bg-[#0b1f3a] group-hover:bg-[#112645] shrink-0 flex items-center justify-center transition-colors">
                  <span
                    className="font-black text-xs text-gray-500 group-hover:text-white uppercase tracking-wider transition-colors text-center px-1"
                    style={{ fontFamily: "var(--font-barlow), system-ui" }}
                  >
                    {brand.name}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <h2
                    className="font-black text-xl uppercase text-white mb-1 tracking-tight"
                    style={{ fontFamily: "var(--font-barlow), system-ui" }}
                  >
                    {brand.name}
                  </h2>
                  <p className="text-gray-500 text-xs mb-3">{detail.specialty}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>Est. {detail.founded}</span>
                    <span className="w-1 h-1 bg-gray-700 rounded-full" />
                    <span className="text-[#f2b705] font-bold">Authorized</span>
                  </div>
                </div>

                <ArrowRight
                  size={18}
                  className="text-gray-700 group-hover:text-[#f2b705] group-hover:translate-x-1 transition-all shrink-0"
                />
              </Link>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
