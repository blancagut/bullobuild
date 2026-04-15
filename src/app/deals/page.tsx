import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Zap, ArrowRight, Clock } from "lucide-react";

const deals = [
  {
    id: "d1",
    name: "DeWalt 20V MAX 7-Tool Combo Kit",
    model: "DCK721D2",
    brand: "DeWalt",
    price: 499.0,
    originalPrice: 899.0,
    stock: 12,
    category: "Combo Kits",
    hot: true,
  },
  {
    id: "d2",
    name: "Milwaukee M18 FUEL 3-Tool Combo",
    model: "2997-23",
    brand: "Milwaukee",
    price: 399.0,
    originalPrice: 629.0,
    stock: 7,
    category: "Combo Kits",
    hot: true,
  },
  {
    id: "d3",
    name: "Craftsman Mechanics Tool Set 270pc",
    model: "CMMT12024",
    brand: "Craftsman",
    price: 149.0,
    originalPrice: 249.0,
    stock: 23,
    category: "Hand Tools",
    hot: false,
  },
  {
    id: "d4",
    name: "DeWalt 12V Oscillating Multi-Tool",
    model: "DCS354B",
    brand: "DeWalt",
    price: 89.0,
    originalPrice: 139.0,
    stock: 18,
    category: "Multi-Tools",
    hot: false,
  },
  {
    id: "d5",
    name: "Kobalt 24V 6-Tool Combo",
    model: "KCB246-06",
    brand: "Kobalt",
    price: 329.0,
    originalPrice: 549.0,
    stock: 5,
    category: "Combo Kits",
    hot: false,
  },
  {
    id: "d6",
    name: "Stanley FatMax Tool Bag Set",
    model: "FMST60103",
    brand: "Stanley",
    price: 65.0,
    originalPrice: 99.0,
    stock: 31,
    category: "Storage",
    hot: false,
  },
];

export default function DealsPage() {
  return (
    <div className="min-h-screen bg-[#070f1c]">
      {/* Header */}
      <div className="bg-[#0b1f3a] border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1 h-full bg-[#f2b705]" />
        <Container className="py-12">
          <div className="flex items-center gap-4 mb-3">
            <div className="bg-[#f2b705] p-2">
              <Zap size={18} className="text-[#0b1f3a]" />
            </div>
            <p className="text-[#f2b705] text-[11px] font-bold uppercase tracking-[0.35em]">
              Limited Time · Refreshes Every Monday
            </p>
          </div>
          <h1
            className="font-black text-4xl lg:text-6xl uppercase text-white"
            style={{ fontFamily: "var(--font-barlow), system-ui" }}
          >
            Weekly Deals
          </h1>
        </Container>
      </div>

      <Container className="py-12">
        {/* Hot deals banner */}
        <div className="bg-[#f2b705]/10 border border-[#f2b705]/30 p-4 mb-10 flex items-center gap-3">
          <Clock size={16} className="text-[#f2b705] shrink-0" />
          <p className="text-sm text-gray-300">
            <span className="font-bold text-[#f2b705]">Flash Sale:</span> Deals
            expire Sunday midnight. Stock not guaranteed — first come, first
            served.
          </p>
        </div>

        {/* Deals grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
          {deals.map((deal) => {
            const discount = Math.round(
              (1 - deal.price / deal.originalPrice) * 100
            );
            return (
              <div
                key={deal.id}
                className={`relative bg-[#0f1b2e] hover:bg-[#0b1f3a] transition-all flex flex-col p-6 ${deal.hot ? "border-t-2 border-[#f2b705]" : ""}`}
              >
                {deal.hot && (
                  <span className="absolute top-4 right-4 bg-[#f2b705] text-[#0b1f3a] text-[10px] font-black uppercase px-2 py-1">
                    Hot Deal
                  </span>
                )}

                {/* Discount badge */}
                <div className="mb-5">
                  <span
                    className="font-black text-4xl text-[#f2b705]"
                    style={{ fontFamily: "var(--font-barlow), system-ui" }}
                  >
                    -{discount}%
                  </span>
                  <span className="text-gray-600 text-sm ml-2">off retail</span>
                </div>

                {/* Image placeholder */}
                <div className="h-36 bg-[#0b1f3a] flex items-center justify-center mb-5">
                  <span
                    className="font-black text-5xl text-white/[0.04] uppercase"
                    style={{ fontFamily: "var(--font-barlow), system-ui" }}
                  >
                    {deal.brand.split(/[\s+]/)[0]}
                  </span>
                </div>

                <p className="text-[#f2b705] text-[10px] font-bold uppercase tracking-widest mb-1">
                  {deal.brand} · {deal.category}
                </p>
                <h3 className="font-bold text-white text-sm leading-tight mb-1 flex-1">
                  {deal.name}
                </h3>
                <p className="text-gray-600 text-xs mb-4">{deal.model}</p>

                {/* Stock */}
                <div className="mb-4">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-gray-600 uppercase tracking-wider">
                      Stock
                    </span>
                    <span
                      className={
                        deal.stock <= 7
                          ? "text-red-400 font-bold"
                          : "text-gray-500"
                      }
                    >
                      {deal.stock} left
                    </span>
                  </div>
                  <div className="h-px bg-white/8">
                    <div
                      className="h-full bg-[#f2b705]"
                      style={{ width: `${Math.min((deal.stock / 35) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-black text-2xl text-white">
                      ${deal.price.toFixed(2)}
                    </span>
                    <span className="text-gray-600 text-sm line-through ml-2">
                      ${deal.originalPrice.toFixed(2)}
                    </span>
                  </div>
                  <button className="bg-[#f2b705] hover:bg-[#d9a204] text-[#0b1f3a] text-[10px] font-black uppercase px-4 py-2.5 tracking-widest transition-colors">
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Back to shop */}
        <div className="mt-12 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors"
          >
            Browse Full Shop <ArrowRight size={14} />
          </Link>
        </div>
      </Container>
    </div>
  );
}
