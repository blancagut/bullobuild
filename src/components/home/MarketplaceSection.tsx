import Link from "next/link";
import { ArrowRight, PlusCircle, TrendingUp } from "lucide-react";
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
    <section className="border-t border-stroke bg-white py-14 lg:py-20">
      <Container>
        <div className="mb-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-8 lg:mb-10">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-stroke bg-card px-4 py-2">
              <TrendingUp size={13} className="text-ink-muted" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-ink-muted">
                Secondary market
              </span>
            </div>
            <SectionHeader
              title="Verified used tools stay visible, but secondary"
              subtitle="The homepage still leads with new inventory. This block exists for shoppers who also want vetted pre-owned deals from the community."
              tone="light"
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button href="/marketplace" variant="outline" size="sm" className="w-full rounded-full border-stroke bg-white text-ink hover:border-yellow hover:bg-panel sm:w-auto">
              Browse Listings
            </Button>
            <Button href="/marketplace/sell" variant="secondary" size="sm" className="w-full gap-2 rounded-full bg-yellow text-ink hover:bg-yellow-dark sm:w-auto">
              <PlusCircle size={14} />
              List a Tool
            </Button>
          </div>
        </div>

        {listings.length > 0 ? (
          <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
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
          <div className="border border-dashed border-stroke bg-card px-6 py-14 text-center text-sm text-ink-muted">
            No approved marketplace listings are visible yet.
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 border-t border-stroke pt-6 text-sm text-ink-muted sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pt-8">
          <p>
            New tools remain the primary storefront. Marketplace stays here as a supporting route for extra value.
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
