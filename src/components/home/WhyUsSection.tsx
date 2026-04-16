import { BadgeCheck, DollarSign, Users, Zap } from "lucide-react";
import { Container } from "@/components/ui/Container";

const reasons = [
  {
    icon: BadgeCheck,
    title: "100% Authentic Tools",
    description:
      "Every product is sourced directly from authorized manufacturers. Zero counterfeits, zero compromise.",
  },
  {
    icon: DollarSign,
    title: "Competitive Pricing",
    description:
      "As an authorized distributor, we offer factory-direct pricing with exclusive deals you won't find elsewhere.",
  },
  {
    icon: Users,
    title: "Verified Sellers",
    description:
      "Every marketplace seller is background-checked and rated. Buy pre-owned with full confidence.",
  },
  {
    icon: Zap,
    title: "Fast US Delivery",
    description:
      "Warehouse in the US. Most orders ship within 24 hours with 2-day delivery available nationwide.",
  },
];

export function WhyUsSection() {
  return (
    <section className="py-24 bg-[#070f1c]">
      <Container>
        <div className="text-center mb-16">
          <p className="text-[#f2b705] text-[11px] font-bold uppercase tracking-[0.35em] mb-3">
            Why BULLOBUILD
          </p>
          <h2
            className="font-black text-4xl lg:text-5xl uppercase text-white"
            style={{ fontFamily: "var(--font-barlow), system-ui" }}
          >
            The Right Choice For Professionals
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5">
          {reasons.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group bg-[#070f1c] hover:bg-[#0b1f3a] p-10 flex flex-col gap-5 transition-colors border-t-2 border-transparent hover:border-[#f2b705]"
              >
                <div className="w-12 h-12 bg-[#f2b705]/8 group-hover:bg-[#f2b705]/15 flex items-center justify-center transition-colors">
                  <Icon size={22} className="text-[#f2b705]" />
                </div>
                <h3
                  className="font-bold text-base uppercase tracking-wide text-white"
                  style={{ fontFamily: "var(--font-barlow), system-ui" }}
                >
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
