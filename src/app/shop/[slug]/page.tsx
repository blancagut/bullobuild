import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PriceTag } from "@/components/ui/PriceTag";
import { StarRating } from "@/components/ui/StarRating";
import { ProductCard } from "@/components/ui/ProductCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ImageGallery } from "@/components/ui/ImageGallery";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { Shield, Truck, RotateCcw, Zap } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("name, description, brands(name)")
    .eq("slug", slug)
    .single();

  if (!data) return { title: "Product Not Found" };

  return {
    title: `${data.name} | ProTool Market`,
    description: data.description ?? `Buy ${data.name} — authorized distributor.`,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, brands(*), categories(*)")
    .eq("slug", slug)
    .single();

  if (!product) notFound();

  const { data: relatedProducts } = await supabase
    .from("products")
    .select("*, brands(*)")
    .eq("brand_id", product.brand_id)
    .neq("id", product.id)
    .limit(4);

  const breadcrumbs = [
    { label: "Shop", href: "/shop" },
    ...(product.brands
      ? [{ label: product.brands.name, href: `/brands/${product.brands.slug}` }]
      : []),
    { label: product.name },
  ];

  const discount =
    product.original_price && product.original_price > product.price
      ? Math.round(
          ((product.original_price - product.price) / product.original_price) * 100
        )
      : null;

  return (
    <div className="min-h-screen bg-[#070F1C] py-8">
      <Container>
        <Breadcrumb items={breadcrumbs} className="mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Gallery */}
          <div>
            <ImageGallery images={product.images ?? []} alt={product.name} />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-5">
            {product.brands && (
              <span className="text-sm font-bold text-[#F2B705] uppercase tracking-widest">
                {product.brands.name}
              </span>
            )}

            <div>
              <h1
                className="text-3xl md:text-4xl font-black uppercase text-white leading-tight tracking-tight"
                style={{ fontFamily: "var(--font-barlow), system-ui" }}
              >
                {product.name}
              </h1>
              {product.model && (
                <p className="text-sm text-gray-500 mt-1">Model: {product.model}</p>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {product.is_deal && <Badge variant="yellow">Deal</Badge>}
              {discount && <Badge variant="danger">-{discount}%</Badge>}
              <Badge variant={product.stock > 0 ? "success" : "danger"}>
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </Badge>
            </div>

            <PriceTag
              price={product.price}
              originalPrice={product.original_price ?? undefined}
              size="xl"
            />

            {product.description && (
              <p className="text-gray-400 text-sm leading-relaxed border-t border-white/10 pt-5">
                {product.description}
              </p>
            )}

            <div className="flex flex-col gap-3 pt-2">
              <AddToCartButton product={product} disabled={product.stock === 0} />
              <Button href="/checkout" variant="outline" size="lg">
                Buy Now
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
              {[
                { icon: Shield, text: "Authorized Retailer" },
                { icon: Truck, text: "Free shipping over $99" },
                { icon: RotateCcw, text: "30-day returns" },
                { icon: Zap, text: "In-stock ships today" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs text-gray-400">
                  <Icon size={14} className="text-[#F2B705] shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div>
            <SectionHeader
              label="More from this brand"
              title="Related Products"
              className="mb-6"
              action={
                <Button href={`/brands/${product.brands?.slug}`} variant="outline" size="sm">
                  View All
                </Button>
              }
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  slug={p.slug}
                  name={p.name}
                  brand={p.brands?.name ?? ""}
                  price={p.price}
                  originalPrice={p.original_price ?? undefined}
                  image={p.images?.[0]}
                  inStock={p.stock > 0}
                />
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
