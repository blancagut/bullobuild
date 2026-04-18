import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle, RotateCcw, Shield, Truck, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StoreProductCard } from "@/components/home/StoreProductCard";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ImageGallery } from "@/components/ui/ImageGallery";
import { Pagination } from "@/components/ui/Pagination";
import { PriceTag } from "@/components/ui/PriceTag";
import { ProductCard } from "@/components/ui/ProductCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { buildContactHref, getProductPricingMode } from "@/lib/pricing";

interface RouteParams {
  slug: string;
}

interface SearchParams {
  page?: string;
}

interface Props {
  params: Promise<RouteParams>;
  searchParams: Promise<SearchParams>;
}

const BRAND_PAGE_SIZE = 24;

function parsePage(value?: string) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
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

export default async function ShopSlugPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const currentPage = parsePage(query.page);
  const supabase = await createClient();

  const { data: brand } = await supabase
    .from("brands")
    .select("id, name, slug, logo_url, is_authorized")
    .eq("slug", slug)
    .maybeSingle();

  if (brand) {
    const rangeStart = (currentPage - 1) * BRAND_PAGE_SIZE;
    const rangeEnd = rangeStart + BRAND_PAGE_SIZE - 1;

    const { data: brandProducts, count } = await supabase
      .from("products")
      .select(
        "id, slug, name, price, original_price, images, stock, is_featured, is_deal, brands(name)",
        { count: "exact" }
      )
      .eq("brand_id", brand.id)
      .gt("stock", 0)
      .order("is_featured", { ascending: false })
      .order("is_deal", { ascending: false })
      .order("created_at", { ascending: false })
      .range(rangeStart, rangeEnd);

    const totalCount = count ?? 0;
    const totalPages = totalCount > 0 ? Math.ceil(totalCount / BRAND_PAGE_SIZE) : 0;
    const startResult = totalCount === 0 ? 0 : rangeStart + 1;
    const endResult = totalCount === 0 ? 0 : Math.min(rangeEnd + 1, totalCount);

    return (
      <div className="min-h-screen bg-white">
        <Container className="py-6 lg:py-8">
          <Breadcrumb
            items={[
              { label: "Shop", href: "/shop" },
              { label: brand.name },
            ]}
            className="mb-6"
          />

          <section className="rounded-2xl border border-stroke bg-white p-6 shadow-sm lg:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-stroke bg-panel">
                  {brand.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={brand.logo_url}
                      alt={brand.name}
                      className="h-12 w-12 object-contain"
                    />
                  ) : (
                    <span className="font-display text-xl font-black uppercase tracking-tight text-ink-muted">
                      {brand.name.slice(0, 2)}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                      Brand storefront
                    </span>
                    {brand.is_authorized ? (
                      <Badge variant="success">
                        <CheckCircle size={12} className="mr-1" />
                        Authorized dealer
                      </Badge>
                    ) : null}
                  </div>

                  <h1 className="font-display text-3xl font-black uppercase tracking-tight text-ink sm:text-4xl">
                    {brand.name}
                  </h1>

                  <p className="mt-2 text-sm text-ink-soft">
                    {totalCount.toLocaleString()} in-stock products
                    {totalPages > 1 ? ` across ${totalPages.toLocaleString()} pages` : ""}.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button href="/shop" variant="outline" size="sm">
                  All products
                </Button>
                <Button href="/brands" variant="ghost" size="sm">
                  All brands
                </Button>
              </div>
            </div>
          </section>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                /shop/{brand.slug}
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                {totalCount > 0
                  ? `${startResult.toLocaleString()}–${endResult.toLocaleString()} of ${totalCount.toLocaleString()} results`
                  : `No in-stock products are listed for ${brand.name} yet.`}
              </p>
            </div>

            {totalPages > 1 ? (
              <span className="inline-flex w-fit items-center rounded-full border border-stroke bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">
                Page {currentPage.toLocaleString()} of {totalPages.toLocaleString()}
              </span>
            ) : null}
          </div>

          {brandProducts && brandProducts.length > 0 ? (
            <>
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {brandProducts.map((product, index) => {
                  const productBrand = toSingleRelation<{ name?: string | null }>(product.brands);
                  const productImages = Array.isArray(product.images) ? product.images : [];

                  return (
                    <StoreProductCard
                      key={product.id}
                      id={String(product.id)}
                      slug={String(product.slug)}
                      name={String(product.name)}
                      brand={productBrand?.name ?? brand.name}
                      price={Number(product.price ?? 0)}
                      originalPrice={
                        product.original_price === null || product.original_price === undefined
                          ? null
                          : Number(product.original_price)
                      }
                      image={productImages[0] ?? null}
                      stock={Number(product.stock ?? 0)}
                      badge={
                        product.is_deal
                          ? "Deal"
                          : product.is_featured
                            ? "Featured"
                            : undefined
                      }
                      priority={index < 4}
                    />
                  );
                })}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                basePath={`/shop/${brand.slug}`}
                className="mt-10"
              />
            </>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-stroke bg-white px-6 py-16 text-center shadow-sm">
              <p className="text-lg font-semibold text-ink">No products found</p>
              <p className="mt-2 text-sm text-ink-soft">
                Check back later or browse the full catalog while we add more {brand.name} inventory.
              </p>
              <div className="mt-6">
                <Button href="/shop" size="sm">
                  Browse all products
                </Button>
              </div>
            </div>
          )}
        </Container>
      </div>
    );
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
      ? [{ label: productBrand.name ?? "Brand", href: `/shop/${productBrand.slug}` }]
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
    <div className="min-h-screen bg-[#070F1C] py-8">
      <Container>
        <Breadcrumb items={breadcrumbs} className="mb-8" />

        <div className="mb-16 grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <ImageGallery images={product.images ?? []} alt={product.name} />
          </div>

          <div className="flex flex-col gap-5">
            {productBrand?.name ? (
              <span className="text-sm font-bold uppercase tracking-widest text-yellow">
                {productBrand.name}
              </span>
            ) : null}

            <div>
              <h1 className="font-display text-3xl font-black uppercase leading-tight tracking-tight text-white md:text-4xl">
                {product.name}
              </h1>
              {product.model ? (
                <p className="mt-1 text-sm text-gray-500">Model: {product.model}</p>
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
                <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow">
                  Contact us for pricing
                </p>
                <p className="mt-2 text-sm text-gray-300">
                  This brand is sold by quote. Contact our sales team for current availability,
                  freight, and fleet pricing.
                </p>
              </div>
            ) : isCatalogOnly ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow">
                  Pricing coming soon
                </p>
                <p className="mt-2 text-sm text-gray-300">
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
              <p className="border-t border-white/10 pt-5 text-sm leading-relaxed text-gray-400">
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

            <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
              {[
                { icon: Shield, text: "Authorized Retailer" },
                { icon: Truck, text: "Free shipping over $99" },
                { icon: RotateCcw, text: "30-day returns" },
                { icon: Zap, text: "In-stock ships today" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs text-gray-400">
                  <Icon size={14} className="shrink-0 text-yellow" />
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
                  <Button href={`/shop/${productBrand.slug}`} variant="outline" size="sm">
                    View All
                  </Button>
                ) : undefined
              }
            />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
