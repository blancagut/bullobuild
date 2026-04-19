import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { professionConfigs } from "@/lib/professions";

export function ProfessionsSection() {
  return (
    <section className="border-y border-stroke bg-canvas py-14 lg:py-20">
      <Container>
        <SectionHeader
          label="Shop by profession"
          title="Shop by your trade"
          subtitle="Jump straight into tools curated for the job you actually do."
          className="mb-7 md:mb-8"
          action={
            <Button
              href="/search"
              variant="outline"
              size="sm"
              className="w-full rounded-full border-stroke bg-white text-ink hover:border-yellow hover:bg-panel sm:w-auto"
            >
              Browse all
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {professionConfigs.map((profession) => {
            return (
              <Link
                key={profession.slug}
                href={profession.href}
                className="group flex flex-col overflow-hidden rounded-2xl border border-stroke bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-yellow/50 hover:shadow-md"
              >
                <div className="relative aspect-video overflow-hidden bg-ink">
                  <Image
                    src={profession.image}
                    alt={`${profession.title} at work`}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-black/10" />
                  <span className="absolute left-4 top-4 rounded-full bg-yellow px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-ink">
                    {profession.label}
                  </span>
                  <h3 className="absolute bottom-3 left-4 right-4 font-display text-2xl font-black uppercase leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                    {profession.title}
                  </h3>
                </div>

                <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
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

                  <div className="mt-auto flex items-center justify-between border-t border-stroke pt-4 text-[11px] font-black uppercase tracking-[0.16em] text-ink sm:text-xs">
                    <span>Shop this trade</span>
                    <span className="inline-flex items-center gap-1.5 text-yellow-dark transition-all group-hover:gap-2.5">
                      Enter
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
