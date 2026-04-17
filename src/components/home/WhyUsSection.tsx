import { ShieldCheck, Truck, RotateCcw, BadgeCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";

const reasons = [
  {
    icon: ShieldCheck,
    title: "100% Authentic",
    description: "Factory-sealed inventory from authorized distributors. Zero counterfeit risk.",
  },
  {
    icon: Truck,
    title: "Ships in 24 Hours",
    description: "Stocked orders leave our warehouse the next business day.",
  },
  {
    icon: RotateCcw,
    title: "30-Day Returns",
    description: "Unopened items come back for a full refund. No restocking fees.",
  },
  {
    icon: BadgeCheck,
    title: "Verified Sellers",
    description: "Every pre-owned listing is screened before it goes live.",
  },
];

export function WhyUsSection() {
  return (
    <section className="border-y border-stroke bg-canvas py-14 lg:py-16">
      <Container>
        <SectionHeader
          label="Why trades buy here"
          title="Built for working crews"
          subtitle="Authentic tools, fast shipping, and a return policy that respects your time."
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
                className="group flex flex-col gap-4 rounded-2xl border border-stroke bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-yellow/40 hover:bg-white"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-panel transition-colors group-hover:bg-yellow/15">
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
