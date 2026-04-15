import Link from "next/link";
import { Filter, SlidersHorizontal } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { BRANDS } from "@/lib/constants";

const categories = [
  "All",
  "Drills & Drivers",
  "Saws",
  "Impact Wrenches",
  "Grinders",
  "Measuring",
  "Hand Tools",
  "Air Tools",
  "Combo Kits",
];

// Placeholder products for the shop page
const products = Array.from({ length: 12 }, (_, i) => ({
  id: `p${i + 1}`,
  name: [
    "20V MAX Drill/Driver Kit",
    "M18 FUEL Circular Saw",
    "Atomic Impact Driver",
    "1/2\" Torque Wrench",
    "M12 Multi-Tool",
    "24V Reciprocating Saw",
    "7-Tool Combo Kit",
    "Mechanics Tool Set 270pc",
    "6-1/2\" Circular Saw",
    "Brad Nailer",
    "Random Orbital Sander",
    "Cordless Jigsaw",
  ][i],
  brand: BRANDS[i % BRANDS.length].name,
  price: [159, 249, 129, 389, 99, 179, 499, 149, 89, 139, 79, 109][i],
  originalPrice: [199, null, 149, null, 129, 219, 899, 249, null, 179, null, 139][i],
}));

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-[#070f1c]">
      {/* Page header */}
      <div className="bg-[#0b1f3a] border-b border-white/5 py-10">
        <Container>
          <p className="text-[#f2b705] text-[11px] font-bold uppercase tracking-[0.35em] mb-2">
            ProTool Market
          </p>
          <h1
            className="font-black text-4xl lg:text-5xl uppercase text-white"
            style={{ fontFamily: "var(--font-barlow), system-ui" }}
          >
            Shop New Tools
          </h1>
        </Container>
      </div>

      <Container className="py-12">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-56 shrink-0 hidden lg:block">
            {/* Brands filter */}
            <div className="mb-8">
              <h3
                className="font-bold text-xs uppercase tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-2"
                style={{ fontFamily: "var(--font-barlow), system-ui" }}
              >
                <Filter size={12} /> Brands
              </h3>
              <ul className="flex flex-col gap-2">
                {["All Brands", ...BRANDS.map((b) => b.name)].map((b) => (
                  <li key={b}>
                    <button className="text-sm text-gray-500 hover:text-white transition-colors text-left w-full py-1">
                      {b}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price filter */}
            <div className="mb-8">
              <h3
                className="font-bold text-xs uppercase tracking-[0.2em] text-gray-400 mb-4"
                style={{ fontFamily: "var(--font-barlow), system-ui" }}
              >
                Price Range
              </h3>
              <div className="flex flex-col gap-2">
                {[
                  "Under $50",
                  "$50 – $150",
                  "$150 – $300",
                  "$300 – $500",
                  "$500+",
                ].map((r) => (
                  <label key={r} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-3.5 h-3.5 accent-[#f2b705]"
                    />
                    <span className="text-sm text-gray-500 group-hover:text-gray-300 transition-colors">
                      {r}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Category tabs */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 border transition-colors ${
                    cat === "All"
                      ? "border-[#f2b705] text-[#f2b705]"
                      : "border-white/10 text-gray-500 hover:border-white/30 hover:text-gray-300"
                  }`}
                >
                  {cat}
                </button>
              ))}

              <div className="ml-auto flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-gray-500 lg:hidden" />
                <select className="bg-[#0b1f3a] border border-white/10 text-xs text-gray-400 px-3 py-1.5 uppercase tracking-wider">
                  <option>Sort: Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest</option>
                  <option>Best Selling</option>
                </select>
              </div>
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-px bg-white/5">
              {products.map((p) => {
                const discount = p.originalPrice
                  ? Math.round((1 - p.price / p.originalPrice) * 100)
                  : null;
                return (
                  <div
                    key={p.id}
                    className="bg-[#0f1b2e] hover:bg-[#0b1f3a] border border-transparent hover:border-[#f2b705]/20 transition-all flex flex-col"
                  >
                    <div className="relative h-44 bg-[#0b1f3a] flex items-center justify-center">
                      <span
                        className="font-black text-5xl text-white/[0.04] uppercase"
                        style={{ fontFamily: "var(--font-barlow), system-ui" }}
                      >
                        {p.brand.split(/[\s+]/)[0]}
                      </span>
                      {discount && (
                        <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5">
                          -{discount}%
                        </span>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <p className="text-[#f2b705] text-[10px] font-bold uppercase tracking-widest mb-1">
                        {p.brand}
                      </p>
                      <p className="text-white text-sm font-semibold leading-tight flex-1 mb-3">
                        {p.name}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-white font-black text-lg">
                            ${p.price}
                          </span>
                          {p.originalPrice && (
                            <span className="text-gray-600 text-xs line-through">
                              ${p.originalPrice}
                            </span>
                          )}
                        </div>
                        <button className="bg-[#f2b705] hover:bg-[#d9a204] text-[#0b1f3a] text-[10px] font-black uppercase px-3 py-2 tracking-widest transition-colors">
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="mt-10 flex items-center justify-center gap-2">
              {[1, 2, 3, "...", 8].map((page, i) => (
                <button
                  key={i}
                  className={`w-9 h-9 text-sm font-bold transition-colors ${
                    page === 1
                      ? "bg-[#f2b705] text-[#0b1f3a]"
                      : "border border-white/10 text-gray-500 hover:border-white/30 hover:text-gray-300"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
