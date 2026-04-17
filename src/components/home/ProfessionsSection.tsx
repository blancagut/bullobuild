import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { professionConfigs } from "@/lib/professions";

export function ProfessionsSection() {
  return (
    <section className="border-y border-stroke bg-canvas py-16 lg:py-20">
      <Container>
        <SectionHeader
          label="Shop by profession"
          title="Shop by your trade"
          subtitle="Jump straight into tools curated for the job you actually do."
          className="mb-8"
          action={
            <Button
              href="/search"
              variant="outline"
              size="sm"
              className="rounded-full border-stroke bg-white text-ink hover:border-yellow hover:bg-panel"
            >
              Browse all
            </Button>
          }
        />

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {professionConfigs.map((profession) => (
            <Link
              key={profession.slug}
              href={profession.href}
              className="group flex flex-col overflow-hidden rounded-2xl border border-stroke bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-yellow/50 hover:shadow-md"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-panel">
                <Image
                  src={profession.heroImage}
                  alt={profession.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full bg-yellow px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-ink">
                  {profession.label}
                </span>
                <h3 className="absolute bottom-3 left-4 right-4 font-display text-2xl font-black uppercase leading-tight text-white">
                  {profession.title}
                </h3>
              </div>

              <div className="flex flex-1 flex-col gap-4 p-5">
                <p className="text-sm leading-relaxed text-ink-soft">
                  {profession.description}
                </p>

                <ul className="flex flex-wrap gap-1.5">
                  {profession.specialties.map((specialty) => (
                    <li
                      key={specialty}
                      className="rounded-full border border-stroke bg-panel px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-soft"
                    >
                      {specialty}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex items-center justify-between border-t border-stroke pt-4 text-xs font-black uppercase tracking-[0.16em] text-ink">
                  <span>Shop this trade</span>
                  <span className="inline-flex items-center gap-1.5 text-yellow-dark transition-all group-hover:gap-2.5">
                    Enter
                    <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
