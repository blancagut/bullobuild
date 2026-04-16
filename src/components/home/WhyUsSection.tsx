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
    <section className="border-y border-stroke bg-canvas py-14 lg:py-16">
      <Container>
        <SectionHeader
          label="Trust layer"
          title="Support the sale, don't interrupt it"
          subtitle="Keep the confidence signals visible while the catalog does the heavy lifting."
          align="center"
          tone="light"
          className="mb-10"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group flex flex-col gap-4 rounded-[1.75rem] border border-stroke bg-card p-6 shadow-[0_12px_24px_rgba(26,35,51,0.04)] transition-all hover:-translate-y-1 hover:border-navy/20 hover:bg-paper"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-panel transition-colors group-hover:bg-yellow/15">
                  <Icon size={20} className="text-navy" />
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
