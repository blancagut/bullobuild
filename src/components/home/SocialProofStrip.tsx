import { ShieldCheck, Truck, RotateCcw, Wrench } from "lucide-react";
import { Container } from "@/components/ui/Container";

const items = [
  {
    icon: ShieldCheck,
    title: "Authorized distributor",
    description: "Authentic, factory-sealed inventory",
  },
  {
    icon: Truck,
    title: "Ships in 24 hours",
    description: "From a US warehouse",
  },
  {
    icon: RotateCcw,
    title: "30-day returns",
    description: "On unopened items, full refund",
  },
  {
    icon: Wrench,
    title: "Built for pros",
    description: "Trusted by contractors & mechanics",
  },
];

export function SocialProofStrip() {
  return (
    <section className="border-b border-stroke bg-canvas py-6">
      <Container>
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.title} className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow/15 text-yellow-dark">
                  <Icon size={18} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-black uppercase tracking-[0.16em] text-ink">
                    {item.title}
                  </p>
                  <p className="truncate text-xs text-ink-soft">{item.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
