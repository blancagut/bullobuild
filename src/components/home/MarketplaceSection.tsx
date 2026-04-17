import Link from "next/link";
import { ArrowRight, PlusCircle, Recycle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { ListingCard } from "@/components/ui/ListingCard";

interface MarketplaceSectionProps {
  listings: Array<{
    id: string;
    title: string;
    price: number;
    condition: "like_new" | "excellent" | "good" | "fair";
    images: string[];
    created_at: string;
    brands: {
      name: string;
    } | null;
    profiles: {
      full_name: string | null;
    } | null;
  }>;
}

export function MarketplaceSection({ listings }: MarketplaceSectionProps) {
  return (
    <section className="border-t border-stroke bg-white py-16 lg:py-20">
      <Container>
        <div className="mb-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-stroke bg-card px-4 py-2">
              <Recycle size={13} className="text-yellow-dark" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-ink-soft">
                Pre-owned marketplace
              </span>
            </div>
            <SectionHeader
              title="Pre-owned pro tools, verified"
              subtitle="Save up to 40% on tools from other tradespeople. Every listing is screened before it goes live."
              tone="light"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/marketplace" variant="outline" size="lg" className="rounded-full border-stroke bg-white text-ink hover:border-yellow hover:bg-panel">
              Browse Used Tools
            </Button>
            <Button href="/marketplace/sell" variant="secondary" size="lg" className="gap-2 rounded-full bg-yellow text-ink hover:bg-yellow-dark">
              <PlusCircle size={16} />
              Sell Your Tools
            </Button>
          </div>
        </div>

        {listings.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                title={listing.title}
                brand={listing.brands?.name ?? "Used tools"}
                price={listing.price}
                condition={listing.condition}
                image={listing.images?.[0]}
                createdAt={listing.created_at}
                sellerName={listing.profiles?.full_name ?? "Verified seller"}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-stroke bg-card px-6 py-14 text-center">
            <p className="font-display text-2xl font-black uppercase text-ink">
              Be the first seller on the board
            </p>
            <p className="mx-auto mt-3 max-w-lg text-sm text-ink-soft">
              List your spare tools and reach tradespeople shopping right now. Keep the bulk of the sale — we handle the rest.
            </p>
            <Link
              href="/marketplace/sell"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-yellow px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-ink transition-colors hover:bg-yellow-dark"
            >
              <PlusCircle size={14} />
              List a tool
            </Link>
          </div>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-stroke pt-8 text-sm text-ink-muted">
          <p>
            Every used listing is inspected and verified before it reaches the marketplace.
          </p>
          <Link href="/marketplace" className="inline-flex items-center gap-2 font-black uppercase tracking-[0.16em] text-yellow-dark transition-colors hover:text-ink">
            Explore marketplace
            <ArrowRight size={14} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
