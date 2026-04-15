import Link from "next/link";
import { ArrowRight, PlusCircle, Search, TrendingUp } from "lucide-react";
import { Container } from "@/components/ui/Container";

const stats = [
  { value: "2,400+", label: "Active Listings", sub: "Updated daily" },
  { value: "$0", label: "Listing Fee", sub: "Free for all sellers" },
  { value: "4.8★", label: "Seller Rating", sub: "Average across platform" },
  { value: "24h", label: "Avg Sale Time", sub: "For popular brands" },
];

export function MarketplaceSection() {
  return (
    <section className="py-24 bg-[#0b1f3a] border-t border-white/5">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 mb-6">
              <TrendingUp size={13} className="text-gray-500" />
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                Mini Marketplace
              </span>
            </div>
            <h2
              className="font-black text-4xl lg:text-5xl uppercase text-white mb-5 leading-tight"
              style={{ fontFamily: "var(--font-barlow), system-ui" }}
            >
              Buy &amp; Sell
              <br />
              <span className="text-gray-500">Used Tools</span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-md">
              Our secondary marketplace lets verified users list and sell their
              professional tools. Great deals on quality pre-owned equipment,
              directly from the community.
            </p>

            <ul className="flex flex-col gap-3 mb-10">
              {[
                "Free to list for registered users",
                "Seller verification required",
                "Secure checkout via Stripe",
                "Buyer protection on every transaction",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-gray-400">
                  <div className="w-1.5 h-1.5 bg-[#f2b705] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 border border-white/20 hover:border-white text-white font-bold text-xs uppercase tracking-widest px-6 py-3 transition-colors"
              >
                <Search size={14} />
                Browse Listings
              </Link>
              <Link
                href="/marketplace/sell"
                className="inline-flex items-center gap-2 bg-[#f2b705]/10 border border-[#f2b705]/30 hover:bg-[#f2b705]/20 text-[#f2b705] font-bold text-xs uppercase tracking-widest px-6 py-3 transition-colors"
              >
                <PlusCircle size={14} />
                List Your Tool
              </Link>
            </div>
          </div>

          {/* Right: stats grid */}
          <div className="grid grid-cols-2 gap-px bg-white/5">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-[#0b1f3a] hover:bg-[#112645] transition-colors p-8 flex flex-col gap-2"
              >
                <span
                  className="font-black text-4xl text-white leading-none"
                  style={{ fontFamily: "var(--font-barlow), system-ui" }}
                >
                  {stat.value}
                </span>
                <span className="font-bold text-sm text-gray-400 uppercase tracking-wide">
                  {stat.label}
                </span>
                <span className="text-xs text-gray-600">{stat.sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 pt-10 border-t border-white/5 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-gray-600 text-sm">
            This is our secondary business.{" "}
            <Link href="/shop" className="text-[#f2b705] underline underline-offset-2">
              New tools
            </Link>{" "}
            remain our primary focus.
          </p>
          <Link
            href="/marketplace"
            className="flex items-center gap-2 text-xs font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors"
          >
            Explore marketplace <ArrowRight size={14} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
