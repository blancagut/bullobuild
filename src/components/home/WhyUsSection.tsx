import { BadgeCheck, DollarSign, Users, Zap } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";

const reasons = [
  {
    icon: BadgeCheck,
    title: "Factory-sealed inventory",
    description: "Authorized supply only. No gray market stock.",
  },
  {
    icon: DollarSign,
    title: "Direct checkout",
    description: "Real add-to-cart and live product routes from the homepage.",
  },
  {
    icon: Users,
    title: "Verified marketplace",
    description: "Pre-owned listings stay screened and secondary to retail.",
  },
  {
    icon: Zap,
    title: "Fast dispatch",
    description: "Stocked orders can move quickly across the US.",
  },
];

export function WhyUsSection() {
  return (
    <section className="border-y border-white/5 bg-navy-dark py-14 lg:py-16">
      <Container>
        <SectionHeader
          label="Trust layer"
          title="Support the sale, don't interrupt it"
          subtitle="Keep the confidence signals visible while the catalog does the heavy lifting."
          align="center"
          className="mb-10"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group flex flex-col gap-4 border border-white/8 bg-white/5 p-6 transition-colors hover:border-yellow/30 hover:bg-navy"
              >
                <div className="flex h-11 w-11 items-center justify-center bg-yellow/10 transition-colors group-hover:bg-yellow/15">
                  <Icon size={20} className="text-yellow" />
                </div>
                <h3 className="font-display text-sm font-black uppercase tracking-[0.12em] text-white">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-400">{item.description}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
