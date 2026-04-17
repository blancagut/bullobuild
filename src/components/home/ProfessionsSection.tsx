import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { professionConfigs } from "@/lib/professions";

export function ProfessionsSection() {
  return (
    <section className="border-b border-stroke bg-[linear-gradient(180deg,#f8f5ee_0%,#f2efe6_100%)] py-16 lg:py-20">
      <Container>
        <SectionHeader
          label="Shop by profession"
          title="Open the catalog by the work people actually do"
          subtitle="Give mechanics, carpenters, electricians, and plumbers a faster first click. Each route is curated around the job instead of forcing everyone through the same shelf."
          className="mb-8"
          action={
            <Button
              href="/search"
              variant="outline"
              size="sm"
              className="rounded-full border-stroke bg-white text-ink hover:border-yellow hover:bg-panel"
            >
              Browse All Roles
            </Button>
          }
        />

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {professionConfigs.map((profession) => (
            <Link
              key={profession.slug}
              href={profession.href}
              className="group relative flex min-h-[480px] flex-col overflow-hidden rounded-[2rem] border border-stroke bg-[#111827] shadow-[0_20px_50px_rgba(15,23,42,0.16)] transition-all hover:-translate-y-1 hover:border-yellow/40 hover:shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
            >
              <div className="absolute inset-0">
                <Image
                  src={profession.heroImage}
                  alt={profession.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                />
                <div className={`absolute inset-0 bg-gradient-to-b ${profession.accent}`} />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,15,28,0.12)_0%,rgba(7,15,28,0.68)_58%,rgba(7,15,28,0.92)_100%)]" />
              </div>

              <div className="relative z-10 flex h-full flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#f6d671] backdrop-blur-sm">
                    Crew route
                  </div>
                  <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/85 backdrop-blur-sm">
                    {profession.brand}
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="font-display text-4xl font-black uppercase leading-[0.9] text-white">
                    {profession.title}
                  </h3>
                  <p className="mt-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#f6d671]">
                    {profession.subtitle}
                  </p>
                  <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/82">
                    {profession.description}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {profession.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/80 backdrop-blur-sm"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>

                <div className="mt-auto rounded-[1.5rem] border border-white/10 bg-white/92 p-4 text-ink shadow-[0_18px_40px_rgba(15,23,42,0.18)] backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-panel">
                      <Image
                        src={profession.productImage}
                        alt={profession.productName}
                        fill
                        className="object-contain p-2"
                        sizes="80px"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-yellow-dark">
                        Featured gear
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
                        {profession.brand}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-ink">
                        {profession.productName}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-stroke pt-4 text-xs font-black uppercase tracking-[0.16em] text-ink">
                    <span>Shop this role</span>
                    <span className="inline-flex items-center gap-2 text-yellow-dark transition-all group-hover:gap-3">
                      Enter
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}