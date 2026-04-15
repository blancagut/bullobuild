import Link from "next/link";
import { PlusCircle, Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { BRANDS, LISTING_CONDITIONS } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";

const listings = Array.from({ length: 9 }, (_, i) => ({
  id: `l${i + 1}`,
  title: [
    "DeWalt 20V Drill Kit – Like New",
    "Milwaukee M12 Tool Set",
    "Snap-on Socket Set 70pc",
    "Mac Tools 3/8 Ratchet",
    "DeWalt Table Saw DWE7491RS",
    "Kobalt 24V Circular Saw",
    "Stanley FatMax Tape Measure 3-pack",
    "Black+Decker 20V Jigsaw",
    "Craftsman Mechanics Set 230pc",
  ][i],
  brand: [
    "DeWalt",
    "Milwaukee",
    "Snap-on",
    "Mac Tools",
    "DeWalt",
    "Kobalt",
    "Stanley",
    "Black+Decker",
    "Craftsman",
  ][i],
  price: [119, 89, 280, 145, 420, 159, 45, 55, 175][i],
  originalPrice: [199, 159, 450, 220, 649, 279, 79, 89, 299][i],
  condition: ["like_new", "excellent", "good", "like_new", "excellent", "good", "excellent", "fair", "good"][i] as
    | "like_new"
    | "excellent"
    | "good"
    | "fair",
  seller: [
    "ToolPro_TX",
    "FixItRight",
    "GarageKing",
    "MechPro",
    "ConstructorDan",
    "PowerToolsUSA",
    "HandymanHQ",
    "DIYmaster",
    "ContractorPlus",
  ][i],
  rating: [4.9, 4.7, 4.8, 5.0, 4.6, 4.8, 4.5, 4.3, 4.7][i],
}));

const conditionLabel: Record<string, string> = {
  like_new: "Like New",
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
};
const conditionVariant: Record<string, "success" | "dark" | "warning" | "danger"> = {
  like_new: "success",
  excellent: "dark",
  good: "warning",
  fair: "danger",
};

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-[#070f1c]">
      {/* Header */}
      <div className="bg-[#0b1f3a] border-b border-white/5 py-10">
        <Container>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-gray-500 text-[11px] font-bold uppercase tracking-[0.35em] mb-2">
                Community Marketplace
              </p>
              <h1
                className="font-black text-4xl lg:text-5xl uppercase text-white"
                style={{ fontFamily: "var(--font-barlow), system-ui" }}
              >
                Pre-Owned Tools
              </h1>
            </div>
            <Link
              href="/marketplace/sell"
              className="inline-flex items-center gap-2 bg-[#f2b705] hover:bg-[#d9a204] text-[#0b1f3a] font-black text-xs uppercase tracking-widest px-6 py-3 transition-colors shrink-0"
            >
              <PlusCircle size={14} />
              List a Tool
            </Link>
          </div>
        </Container>
      </div>

      <Container className="py-12">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8 pb-6 border-b border-white/5">
          <select className="bg-[#0b1f3a] border border-white/10 text-xs text-gray-400 px-3 py-2 uppercase tracking-wider">
            <option>All Brands</option>
            {BRANDS.map((b) => (
              <option key={b.slug}>{b.name}</option>
            ))}
          </select>

          <select className="bg-[#0b1f3a] border border-white/10 text-xs text-gray-400 px-3 py-2 uppercase tracking-wider">
            <option>All Conditions</option>
            {LISTING_CONDITIONS.map((c) => (
              <option key={c.value}>{c.label}</option>
            ))}
          </select>

          <select className="bg-[#0b1f3a] border border-white/10 text-xs text-gray-400 px-3 py-2 uppercase tracking-wider">
            <option>Any Price</option>
            <option>Under $50</option>
            <option>$50 – $150</option>
            <option>$150 – $300</option>
            <option>$300+</option>
          </select>

          <div className="ml-auto">
            <select className="bg-[#0b1f3a] border border-white/10 text-xs text-gray-400 px-3 py-2 uppercase tracking-wider">
              <option>Sort: Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Best Rated</option>
            </select>
          </div>
        </div>

        {/* Listings grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
          {listings.map((l) => {
            const savings = Math.round(
              ((l.originalPrice - l.price) / l.originalPrice) * 100
            );
            return (
              <Link
                key={l.id}
                href={`/marketplace/${l.id}`}
                className="group bg-[#0f1b2e] hover:bg-[#0b1f3a] border border-transparent hover:border-[#f2b705]/20 transition-all p-5 flex gap-4"
              >
                {/* Image */}
                <div className="w-24 h-24 bg-[#0b1f3a] shrink-0 flex items-center justify-center">
                  <span
                    className="font-black text-3xl text-white/[0.06] uppercase"
                    style={{ fontFamily: "var(--font-barlow), system-ui" }}
                  >
                    {l.brand[0]}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-[#f2b705] text-[10px] font-bold uppercase tracking-widest">
                      {l.brand}
                    </p>
                    <Badge variant={conditionVariant[l.condition]}>
                      {conditionLabel[l.condition]}
                    </Badge>
                  </div>
                  <p className="text-white font-semibold text-sm leading-tight mb-2 line-clamp-2">
                    {l.title}
                  </p>
                  <div className="flex items-center gap-1 mb-3">
                    <Star size={11} className="fill-[#f2b705] text-[#f2b705]" />
                    <span className="text-xs text-gray-500">
                      {l.rating} · {l.seller}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-black text-lg text-white">
                      ${l.price}
                    </span>
                    <span className="text-xs text-gray-600 line-through">
                      ${l.originalPrice}
                    </span>
                    <span className="text-xs text-emerald-400 font-bold">
                      -{savings}%
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
