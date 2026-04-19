import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { RotateCcw, Shield, Truck, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ImageGallery } from "@/components/ui/ImageGallery";
import { PriceTag } from "@/components/ui/PriceTag";
import { ProductCard } from "@/components/ui/ProductCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getCanonicalBrandSlug } from "@/lib/brands";
import { buildContactHref, getProductPricingMode } from "@/lib/pricing";

interface RouteParams {
  slug: string;
}

interface Props {
  params: Promise<RouteParams>;
}

function toSingleRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export async function generateMetadata({ params }: { params: Promise<RouteParams> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: brand } = await supabase
    .from("brands")
    .select("name")
    .eq("slug", slug)
    .maybeSingle();

  if (brand) {
    return {
      title: `${brand.name} Tools | BULLOBUILD`,
      description: `Shop ${brand.name} tools, equipment, and accessories at BULLOBUILD.`,
    };
  }

  const { data: product } = await supabase
    .from("products")
    .select("name, description, brands(name)")
    .eq("slug", slug)
    .maybeSingle();

  if (!product) return { title: "Not Found | BULLOBUILD" };

  const productBrand = toSingleRelation<{ name?: string | null }>(product.brands);

  return {
    title: `${product.name} | BULLOBUILD`,
    description:
      product.description ??
      `Buy ${product.name} from ${productBrand?.name ?? "BULLOBUILD"}.`,
  };
}

export default async function ShopSlugPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: brand } = await supabase
    .from("brands")
    .select("name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (brand) {
    redirect(`/brands/${getCanonicalBrandSlug(brand.name, brand.slug)}`);
  }

  const { data: product } = await supabase
    .from("products")
    .select("*, brands(*), categories(*)")
    .eq("slug", slug)
    .maybeSingle();

  if (!product) notFound();

  const productBrand = toSingleRelation<{ name?: string | null; slug?: string | null }>(
    product.brands
  );

  const { data: relatedProducts } = await supabase
    .from("products")
    .select("*, brands(*)")
    .eq("brand_id", product.brand_id)
    .neq("id", product.id)
    .limit(4);

  const breadcrumbs = [
    { label: "Shop", href: "/shop" },
    ...(productBrand?.slug
      ? [
          {
            label: productBrand.name ?? "Brand",
            href: `/brands/${getCanonicalBrandSlug(
              productBrand.name ?? "",
              productBrand.slug
            )}`,
          },
        ]
      : []),
    { label: product.name },
  ];

  const discount =
    product.original_price && product.original_price > product.price
      ? Math.round(
          ((product.original_price - product.price) / product.original_price) * 100
        )
      : null;
  const pricingMode = getProductPricingMode({
    brand: productBrand?.name,
    price: Number(product.price ?? 0),
    originalPrice: product.original_price ?? null,
  });
  const isContactOnly = pricingMode === "contact";
  const isCatalogOnly = pricingMode === "catalog";
  const contactHref = buildContactHref({
    brand: productBrand?.name,
    productName: product.name,
    productSlug: product.slug,
  });

  return (
    <div className="min-h-screen bg-white">
      <Container className="py-6 lg:py-8">
        <Breadcrumb items={breadcrumbs} className="mb-6" />

        <div className="mb-14 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-10">
          <div>
            <ImageGallery images={product.images ?? []} alt={product.name} />
          </div>

          <div className="flex flex-col gap-5">
            {productBrand?.name ? (
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-yellow-dark sm:text-xs">
                {productBrand.name}
              </span>
            ) : null}

            <div>
              <h1 className="font-display text-[2.35rem] font-black uppercase leading-[0.94] tracking-tight text-ink md:text-4xl">
                {product.name}
              </h1>
              {product.model ? (
                <p className="mt-1 text-sm text-ink-muted">Model: {product.model}</p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {product.is_deal ? <Badge variant="yellow">Deal</Badge> : null}
              {discount ? <Badge variant="danger">-{discount}%</Badge> : null}
              <Badge variant={product.stock > 0 ? "success" : "danger"}>
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </Badge>
            </div>

            {isContactOnly ? (
              <div className="rounded-2xl border border-yellow/30 bg-yellow/10 px-5 py-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-dark">
                  Contact us for pricing
                </p>
                <p className="mt-2 text-sm text-ink-soft">
                  This brand is sold by quote. Contact our sales team for current availability,
                  freight, and fleet pricing.
                </p>
              </div>
            ) : isCatalogOnly ? (
              <div className="rounded-2xl border border-stroke bg-panel px-5 py-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-dark">
                  Pricing coming soon
                </p>
                <p className="mt-2 text-sm text-ink-soft">
                  Product details are live, but pricing has not been published yet.
                </p>
              </div>
            ) : (
              <PriceTag
                price={product.price}
                originalPrice={product.original_price ?? undefined}
                size="xl"
              />
            )}

            {product.description ? (
              <p className="border-t border-stroke pt-5 text-sm leading-relaxed text-ink-soft">
                {product.description}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 pt-2">
              {isContactOnly ? (
                <>
                  <Button href={contactHref} size="lg">
                    Contact Us
                  </Button>
                  <Button href="/contact" variant="outline" size="lg">
                    Request Fleet Quote
                  </Button>
                </>
              ) : isCatalogOnly ? (
                <>
                  <Button href={contactHref} size="lg">
                    Contact Us
                  </Button>
                  <Button href="/shop" variant="outline" size="lg">
                    Browse More Products
                  </Button>
                </>
              ) : (
                <>
                  <AddToCartButton product={product} disabled={product.stock === 0} />
                  <Button href="/checkout" variant="outline" size="lg">
                    Buy Now
                  </Button>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-stroke pt-4">
              {[
                { icon: Shield, text: "Authorized Retailer" },
                { icon: Truck, text: "Free shipping over $99" },
                { icon: RotateCcw, text: "30-day returns" },
                { icon: Zap, text: "In-stock ships today" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs text-ink-soft">
                  <Icon size={14} className="shrink-0 text-yellow-dark" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {relatedProducts && relatedProducts.length > 0 ? (
          <div>
            <SectionHeader
              label="More from this brand"
              title="Related Products"
              className="mb-6"
              action={
                productBrand?.slug ? (
                  <Button
                    href={`/brands/${getCanonicalBrandSlug(
                      productBrand.name ?? "",
                      productBrand.slug
                    )}`}
                    variant="outline"
                    size="sm"
                  >
                    View All
                  </Button>
                ) : undefined
              }
            />
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              {relatedProducts.map((relatedProduct) => {
                const relatedBrand = toSingleRelation<{ name?: string | null }>(
                  relatedProduct.brands
                );
                const relatedImages = Array.isArray(relatedProduct.images)
                  ? relatedProduct.images
                  : [];

                return (
                  <ProductCard
                    key={relatedProduct.id}
                    id={relatedProduct.id}
                    slug={relatedProduct.slug}
                    name={relatedProduct.name}
                    brand={relatedBrand?.name ?? ""}
                    price={relatedProduct.price}
                    originalPrice={relatedProduct.original_price ?? undefined}
                    image={relatedImages[0]}
                    inStock={relatedProduct.stock > 0}
                  />
                );
              })}
            </div>
          </div>
        ) : null}
      </Container>
    </div>
  );
}
