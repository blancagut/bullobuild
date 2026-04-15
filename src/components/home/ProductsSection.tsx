import Link from "next/link";
import { ArrowRight, ShoppingCart, Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";

const newProducts = [
  {
    id: "1",
    name: "DeWalt 20V MAX Drill/Driver Kit",
    model: "DCD777C2",
    brand: "DeWalt",
    price: 159.0,
    originalPrice: 199.0,
    rating: 4.9,
    reviews: 2341,
    badge: "Best Seller",
  },
  {
    id: "2",
    name: "Milwaukee M18 FUEL Circular Saw",
    model: "2730-20",
    brand: "Milwaukee",
    price: 249.0,
    originalPrice: null,
    rating: 4.8,
    reviews: 1876,
    badge: "New",
  },
  {
    id: "3",
    name: "DeWalt Atomic 20V Impact Driver",
    model: "DCF850B",
    brand: "DeWalt",
    price: 129.0,
    originalPrice: 149.0,
    rating: 4.9,
    reviews: 3102,
    badge: "Deal",
  },
  {
    id: "4",
    name: "Snap-on 1/2\" Torque Wrench",
    model: "QJDN200",
    brand: "Snap-on",
    price: 389.0,
    originalPrice: null,
    rating: 5.0,
    reviews: 589,
    badge: "Pro",
  },
];

const preOwnedProducts = [
  {
    id: "5",
    name: "DeWalt 20V Reciprocating Saw",
    brand: "DeWalt",
    price: 79.0,
    originalPrice: 149.0,
    condition: "Excellent",
    seller: "ToolPro_TX",
  },
  {
    id: "6",
    name: "Milwaukee M12 Multi-Tool",
    brand: "Milwaukee",
    price: 55.0,
    originalPrice: 119.0,
    condition: "Good",
    seller: "FixItRight",
  },
  {
    id: "7",
    name: "Mac Tools Socket Set 124pc",
    brand: "Mac Tools",
    price: 220.0,
    originalPrice: 450.0,
    condition: "Like New",
    seller: "GarageKing",
  },
];

function ProductCard({ p }: { p: (typeof newProducts)[0] }) {
  const discount = p.originalPrice
    ? Math.round((1 - p.price / p.originalPrice) * 100)
    : null;

  return (
    <div className="group bg-[#0f1b2e] border border-white/5 hover:border-[#f2b705]/30 transition-all duration-200 flex flex-col">
      {/* Image area */}
      <div className="relative h-52 bg-[#0b1f3a] flex items-center justify-center overflow-hidden">
        <span
          className="font-black text-7xl text-white/[0.04] uppercase select-none"
          style={{ fontFamily: "var(--font-barlow), system-ui" }}
        >
          {p.brand.split(/[\s+]/)[0]}
        </span>
        {p.badge && (
          <span className="absolute top-3 left-3 bg-[#f2b705] text-[#0b1f3a] text-[10px] font-black uppercase px-2 py-1 tracking-wider">
            {p.badge}
          </span>
        )}
        {discount && (
          <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-black uppercase px-2 py-1">
            -{discount}%
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <p className="text-[#f2b705] text-[10px] font-bold uppercase tracking-widest mb-1">
          {p.brand}
        </p>
        <h3 className="font-semibold text-white text-sm leading-tight mb-1 flex-1">
          {p.name}
        </h3>
        <p className="text-gray-600 text-xs mb-3">{p.model}</p>
        <div className="flex items-center gap-1.5 mb-4">
          <Star size={11} className="fill-[#f2b705] text-[#f2b705]" />
          <span className="text-xs text-gray-500">
            {p.rating} ({p.reviews.toLocaleString()})
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-black text-xl text-white">
              ${p.price.toFixed(2)}
            </span>
            {p.originalPrice && (
              <span className="text-xs text-gray-600 line-through">
                ${p.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <button
            className="bg-[#f2b705] hover:bg-[#d9a204] text-[#0b1f3a] p-2.5 transition-colors"
            aria-label={`Add ${p.name} to cart`}
          >
            <ShoppingCart size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function PreOwnedCard({ p }: { p: (typeof preOwnedProducts)[0] }) {
  const savings = Math.round(
    ((p.originalPrice - p.price) / p.originalPrice) * 100
  );
  const conditionVariant =
    p.condition === "Like New"
      ? "success"
      : p.condition === "Excellent"
        ? "dark"
        : "warning";

  return (
    <div className="group bg-[#0f1b2e] border border-white/5 hover:border-[#f2b705]/20 transition-all duration-200 flex gap-4 p-4">
      <div className="w-20 h-20 bg-[#0b1f3a] shrink-0 flex items-center justify-center">
        <span
          className="font-black text-2xl text-white/10 uppercase"
          style={{ fontFamily: "var(--font-barlow), system-ui" }}
        >
          {p.brand[0]}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-[#f2b705] text-[10px] font-bold uppercase tracking-widest">
            {p.brand}
          </p>
          <Badge variant={conditionVariant as "success" | "dark" | "warning"}>
            {p.condition}
          </Badge>
        </div>
        <p className="font-semibold text-white text-sm leading-tight mb-1 truncate">
          {p.name}
        </p>
        <p className="text-gray-600 text-xs mb-3">Sold by: {p.seller}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-black text-lg text-white">
              ${p.price.toFixed(2)}
            </span>
            <span className="text-xs text-gray-600 line-through">
              ${p.originalPrice.toFixed(2)}
            </span>
            <span className="text-xs text-emerald-400 font-bold">
              -{savings}%
            </span>
          </div>
          <Link
            href={`/marketplace/${p.id}`}
            className="text-[10px] bg-white/8 hover:bg-[#f2b705] hover:text-[#0b1f3a] text-gray-400 font-black uppercase px-3 py-1.5 transition-colors tracking-widest"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ProductsSection() {
  return (
    <section className="py-24 bg-[#070f1c]">
      <Container>
        {/* New Tools */}
        <div className="mb-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[#f2b705] text-[11px] font-bold uppercase tracking-[0.3em] mb-2">
                Brand New · Factory Sealed
              </p>
              <h2
                className="font-black text-4xl lg:text-5xl uppercase text-white"
                style={{ fontFamily: "var(--font-barlow), system-ui" }}
              >
                New Tools
              </h2>
            </div>
            <Link
              href="/shop"
              className="hidden sm:flex items-center gap-2 text-xs font-black text-[#f2b705] uppercase tracking-widest hover:gap-3 transition-all"
            >
              View All <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5">
            {newProducts.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </div>

        {/* Pre-Owned */}
        <div>
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-gray-500 text-[11px] font-bold uppercase tracking-[0.3em] mb-2">
                Verified · Marketplace
              </p>
              <h2
                className="font-black text-4xl lg:text-5xl uppercase text-white"
                style={{ fontFamily: "var(--font-barlow), system-ui" }}
              >
                Pre-Owned Deals
              </h2>
            </div>
            <Link
              href="/marketplace"
              className="hidden sm:flex items-center gap-2 text-xs font-black text-gray-500 uppercase tracking-widest hover:text-white hover:gap-3 transition-all"
            >
              View All <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
            {preOwnedProducts.map((p) => (
              <PreOwnedCard key={p.id} p={p} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
