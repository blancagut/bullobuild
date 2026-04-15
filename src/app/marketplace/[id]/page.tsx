import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { ImageGallery } from "@/components/ui/ImageGallery";
import { AddListingToCartButton } from "@/components/marketplace/AddListingToCartButton";
import { formatPrice } from "@/lib/utils";
import { Shield, MapPin, Calendar } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("title, price")
    .eq("id", id)
    .single();
  return {
    title: data ? `${data.title} — ${formatPrice(data.price)} | ProTool Market Marketplace` : "Listing Not Found",
  };
}

const conditionLabels: Record<string, string> = {
  like_new: "Like New",
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
};

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: listing } = await supabase
    .from("listings")
    .select("*, brands(*), profiles(full_name, avatar_url, created_at)")
    .eq("id", id)
    .eq("is_approved", true)
    .single();

  if (!listing) notFound();

  const memberSince = listing.profiles?.created_at
    ? new Date(listing.profiles.created_at).getFullYear()
    : null;

  return (
    <div className="min-h-screen bg-[#070F1C] py-8">
      <Container>
        <Breadcrumb
          items={[
            { label: "Marketplace", href: "/marketplace" },
            { label: listing.title },
          ]}
          className="mb-8"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Gallery */}
          <ImageGallery images={listing.images ?? []} alt={listing.title} />

          {/* Info */}
          <div className="flex flex-col gap-5">
            {listing.brands && (
              <span className="text-sm font-bold text-[#F2B705] uppercase tracking-widest">
                {listing.brands.name}
              </span>
            )}

            <h1
              className="text-3xl md:text-4xl font-black uppercase text-white leading-tight tracking-tight"
              style={{ fontFamily: "var(--font-barlow), system-ui" }}
            >
              {listing.title}
            </h1>

            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="outline">
                {conditionLabels[listing.condition] ?? listing.condition}
              </Badge>
              {listing.is_sold && <Badge variant="danger">Sold</Badge>}
            </div>

            <p
              className="text-3xl font-black text-white"
              style={{ fontFamily: "var(--font-barlow), system-ui" }}
            >
              {formatPrice(listing.price)}
            </p>

            {listing.description && (
              <p className="text-gray-400 text-sm leading-relaxed border-t border-white/10 pt-5">
                {listing.description}
              </p>
            )}

            {!listing.is_sold && (
              <div className="flex flex-col gap-3 pt-2">
                <AddListingToCartButton listing={listing} />
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-500 pt-4 border-t border-white/10">
              <Shield size={12} className="text-[#F2B705]" />
              Buyer protection applies to all marketplace purchases
            </div>
          </div>
        </div>

        {/* Seller info */}
        {listing.profiles && (
          <div className="bg-[#0B1F3A] border border-white/10 p-6 max-w-md">
            <h2
              className="text-sm font-black uppercase text-white mb-4"
              style={{ fontFamily: "var(--font-barlow), system-ui" }}
            >
              About the Seller
            </h2>
            <div className="flex items-center gap-3">
              <Avatar
                src={listing.profiles.avatar_url}
                fallback={listing.profiles.full_name ?? "Seller"}
                size="lg"
              />
              <div>
                <p className="text-white font-semibold">
                  {listing.profiles.full_name ?? "Anonymous Seller"}
                </p>
                {memberSince && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Calendar size={10} />
                    Member since {memberSince}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
