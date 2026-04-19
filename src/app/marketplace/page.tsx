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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-stroke bg-canvas py-8 lg:py-10">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.28em] text-ink-muted">
                Community Marketplace
              </p>
              <h1 className="font-display text-[2.35rem] font-black uppercase leading-[0.92] text-ink sm:text-4xl lg:text-5xl">
                Pre-Owned Tools
              </h1>
            </div>
            <Link
              href="/marketplace/sell"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-yellow px-6 text-[11px] font-black uppercase tracking-[0.16em] text-ink transition-colors hover:bg-yellow-dark sm:w-auto"
            >
              <PlusCircle size={14} />
              List a Tool
            </Link>
          </div>
        </Container>
      </div>

      <Container className="py-6 lg:py-8">
        {/* Filters */}
        <div className="mb-8 grid gap-3 border-b border-stroke pb-6 sm:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,1fr))_220px]">
          <select aria-label="Filter listings by brand" className="h-12 rounded-xl border border-stroke bg-white px-4 text-sm text-ink outline-none transition-colors focus:border-yellow focus:ring-2 focus:ring-yellow/20">
            <option>All Brands</option>
            {BRANDS.map((b) => (
              <option key={b.slug}>{b.name}</option>
            ))}
          </select>

          <select aria-label="Filter listings by condition" className="h-12 rounded-xl border border-stroke bg-white px-4 text-sm text-ink outline-none transition-colors focus:border-yellow focus:ring-2 focus:ring-yellow/20">
            <option>All Conditions</option>
            {LISTING_CONDITIONS.map((c) => (
              <option key={c.value}>{c.label}</option>
            ))}
          </select>

          <select aria-label="Filter listings by price" className="h-12 rounded-xl border border-stroke bg-white px-4 text-sm text-ink outline-none transition-colors focus:border-yellow focus:ring-2 focus:ring-yellow/20">
            <option>Any Price</option>
            <option>Under $50</option>
            <option>$50 – $150</option>
            <option>$150 – $300</option>
            <option>$300+</option>
          </select>

          <div>
            <select aria-label="Sort marketplace listings" className="h-12 w-full rounded-xl border border-stroke bg-white px-4 text-sm text-ink outline-none transition-colors focus:border-yellow focus:ring-2 focus:ring-yellow/20">
              <option>Newest first</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Best Rated</option>
            </select>
          </div>
        </div>

        {/* Listings grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {listings.map((l) => {
            const savings = Math.round(
              ((l.originalPrice - l.price) / l.originalPrice) * 100
            );
            return (
              <Link
                key={l.id}
                href={`/marketplace/${l.id}`}
                className="group flex h-full flex-col gap-4 rounded-2xl border border-stroke bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-yellow/30 hover:shadow-md sm:p-5"
              >
                {/* Image */}
                <div className="flex gap-4 sm:flex-1 sm:flex-row">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border border-stroke bg-panel">
                    <span className="font-display text-3xl font-black uppercase text-ink/10">
                    {l.brand[0]}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-yellow-dark">
                        {l.brand}
                      </p>
                      <Badge variant={conditionVariant[l.condition]}>
                        {conditionLabel[l.condition]}
                      </Badge>
                    </div>
                    <p className="mb-2 line-clamp-2 text-sm font-semibold leading-tight text-ink transition-colors group-hover:text-yellow-dark">
                      {l.title}
                    </p>
                    <div className="mb-3 flex items-center gap-1 text-xs text-ink-muted">
                      <Star size={11} className="fill-yellow text-yellow" />
                      <span>
                        {l.rating} · {l.seller}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <span className="font-display text-[1.45rem] font-black leading-none text-ink">
                        ${l.price}
                      </span>
                      <span className="text-xs text-ink-muted line-through">
                        ${l.originalPrice}
                      </span>
                      <span className="text-xs font-bold text-emerald-600">
                        -{savings}%
                      </span>
                    </div>
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
