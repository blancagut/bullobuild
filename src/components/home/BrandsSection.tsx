import { Container } from "@/components/ui/Container";

const brands = [
  { name: "DeWalt", abbr: "DW" },
  { name: "Milwaukee", abbr: "MWK" },
  { name: "Craftsman", abbr: "CFT" },
  { name: "Stanley", abbr: "STN" },
  { name: "Black+Decker", abbr: "B+D" },
  { name: "Snap-on", abbr: "SNP" },
  { name: "Mac Tools", abbr: "MAC" },
  { name: "Kobalt", abbr: "KBT" },
  { name: "Skil", abbr: "SKL" },
  { name: "Proto", abbr: "PRT" },
];

export function BrandsSection() {
  return (
    <section className="py-20 bg-[#0b1f3a] border-y border-white/5">
      <Container>
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-[#f2b705] text-[11px] font-bold uppercase tracking-[0.35em] mb-3">
            Official Distributor
          </p>
          <h2
            className="font-black text-4xl lg:text-5xl uppercase text-white"
            style={{ fontFamily: "var(--font-barlow), system-ui" }}
          >
            Trusted Brands We Distribute
          </h2>
        </div>

        {/* Brand grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-px bg-white/5">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="group bg-[#0b1f3a] hover:bg-[#112645] transition-colors flex flex-col items-center justify-center p-8 gap-4 cursor-pointer"
            >
              {/* Brand abbreviation box */}
              <div className="w-14 h-14 bg-white/5 group-hover:bg-[#f2b705]/10 border border-white/5 group-hover:border-[#f2b705]/20 flex items-center justify-center transition-all">
                <span
                  className="font-black text-sm text-gray-500 group-hover:text-[#f2b705] transition-colors tracking-wider"
                  style={{ fontFamily: "var(--font-barlow), system-ui" }}
                >
                  {brand.abbr}
                </span>
              </div>

              <span
                className="font-bold text-sm uppercase tracking-tight text-gray-400 group-hover:text-white transition-colors text-center whitespace-nowrap"
                style={{ fontFamily: "var(--font-barlow), system-ui" }}
              >
                {brand.name}
              </span>

              {/* Accent line */}
              <div className="w-6 h-px bg-[#f2b705] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>

        {/* Trust line */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <div className="h-px flex-1 max-w-24 bg-white/8" />
          <p className="text-[10px] text-gray-600 uppercase tracking-widest text-center">
            100% authentic · sourced directly from manufacturers
          </p>
          <div className="h-px flex-1 max-w-24 bg-white/8" />
        </div>
      </Container>
    </section>
  );
}
