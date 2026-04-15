import Link from "next/link";
import { ArrowRight, Clock, Zap } from "lucide-react";
import { Container } from "@/components/ui/Container";

const deals = [
  {
    id: "d1",
    name: "DeWalt 20V MAX 7-Tool Combo Kit",
    model: "DCK721D2",
    brand: "DeWalt",
    price: 499.0,
    originalPrice: 899.0,
    stock: 12,
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
    hot: false,
  },
  {
    id: "d3",
    name: "Craftsman Mechanics Tool Set 270pc",
    model: "CMMT12024",
    brand: "Craftsman",
    price: 149.0,
    originalPrice: 249.0,
    stock: 23,
    hot: false,
  },
];

export function DealsSection() {
  return (
    <section className="py-24 bg-[#0b1f3a] relative overflow-hidden">
      {/* Right accent */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[#f2b705]/[0.025]" aria-hidden="true" />
      <div className="absolute top-0 right-0 w-1 h-full bg-[#f2b705]" aria-hidden="true" />

      <Container className="relative z-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="bg-[#f2b705] p-3">
              <Zap size={20} className="text-[#0b1f3a]" />
            </div>
            <div>
              <p className="text-[#f2b705] text-[11px] font-bold uppercase tracking-[0.3em] mb-1">
                Limited Time
              </p>
              <h2
                className="font-black text-4xl lg:text-5xl uppercase text-white"
                style={{ fontFamily: "var(--font-barlow), system-ui" }}
              >
                Weekly Deals
              </h2>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-gray-600">
            <Clock size={13} />
            <span className="text-xs uppercase tracking-widest">
              Refreshed every Monday
            </span>
          </div>
        </div>

        {/* Deal cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#f2b705]/10">
          {deals.map((deal) => {
            const discount = Math.round(
              (1 - deal.price / deal.originalPrice) * 100
            );
            return (
              <div
                key={deal.id}
                className={`relative bg-[#0b1f3a] p-8 flex flex-col ${deal.hot ? "border-t-2 border-[#f2b705]" : ""}`}
              >
                {deal.hot && (
                  <span className="absolute top-4 right-4 bg-[#f2b705] text-[#0b1f3a] text-[10px] font-black uppercase px-2 py-1 tracking-wider">
                    Hot Deal
                  </span>
                )}

                {/* Discount box */}
                <div className="w-16 h-16 bg-[#f2b705]/10 border border-[#f2b705]/30 flex items-center justify-center mb-6">
                  <span
                    className="font-black text-2xl text-[#f2b705]"
                    style={{ fontFamily: "var(--font-barlow), system-ui" }}
                  >
                    -{discount}%
                  </span>
                </div>

                <p className="text-[#f2b705] text-[10px] font-bold uppercase tracking-widest mb-2">
                  {deal.brand}
                </p>
                <h3 className="font-bold text-white text-base leading-tight mb-1 flex-1">
                  {deal.name}
                </h3>
                <p className="text-gray-600 text-xs mb-5">{deal.model}</p>

                {/* Stock bar */}
                <div className="mb-5">
                  <div className="flex justify-between text-[10px] mb-1.5">
                    <span className="text-gray-600 uppercase tracking-wider">
                      Stock
                    </span>
                    <span
                      className={
                        deal.stock < 10
                          ? "text-red-400 font-bold"
                          : "text-gray-500"
                      }
                    >
                      {deal.stock} left
                    </span>
                  </div>
                  <div className="h-px bg-white/10">
                    <div
                      className="h-full bg-[#f2b705]"
                      style={{
                        width: `${Math.min((deal.stock / 30) * 100, 100)}%`,
                      }}
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

        <div className="mt-8 text-center">
          <Link
            href="/deals"
            className="inline-flex items-center gap-2 text-xs font-black text-[#f2b705] uppercase tracking-widest hover:gap-4 transition-all"
          >
            See All Weekly Deals <ArrowRight size={15} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
