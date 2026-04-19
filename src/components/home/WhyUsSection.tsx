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
    <section className="border-y border-stroke bg-canvas py-14 lg:py-18">
      <Container>
        <SectionHeader
          label="Trust layer"
          title="Support the sale, don't interrupt it"
          subtitle="Keep the confidence signals visible while the catalog does the heavy lifting."
          align="center"
          tone="light"
          className="mb-8 md:mb-10"
        />

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {reasons.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group flex flex-col gap-4 rounded-2xl border border-stroke bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-yellow/40 hover:bg-white sm:p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-panel transition-colors group-hover:bg-yellow/15 sm:h-11 sm:w-11">
                  <Icon size={20} className="text-yellow-dark" />
                </div>
                <h3 className="font-display text-sm font-black uppercase tracking-[0.12em] text-ink">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-ink-soft">{item.description}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
