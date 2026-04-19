import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StoreProductCard } from "@/components/home/StoreProductCard";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Pagination } from "@/components/ui/Pagination";
import {
  findBrandGroupBySlug,
  groupBrandRecords,
  type BrandRecord,
} from "@/lib/brands";

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

const PAGE_SIZE = 24;

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
  const { data: brandRows } = await supabase
    .from("brands")
    .select("id, name, slug")
    .order("name");

  const brandGroups = groupBrandRecords((brandRows ?? []) as BrandRecord[]);
  const brand = findBrandGroupBySlug(brandGroups, slug);

  if (!brand) {
    return { title: "Brand Not Found | BULLOBUILD" };
  }

  return {
    title: `${brand.name} | Shop by Brand | BULLOBUILD`,
    description: `Browse ${brand.name} inventory on BULLOBUILD's dedicated brand page.`,
  };
}

export default async function BrandPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const currentPage = parsePage(query.page);
  const supabase = await createClient();

  const { data: brandRows } = await supabase
    .from("brands")
    .select("id, name, slug, logo_url, is_authorized")
    .order("name");

  const brandGroups = groupBrandRecords((brandRows ?? []) as BrandRecord[]);
  const brand = findBrandGroupBySlug(brandGroups, slug);

  if (!brand) notFound();
  if (slug !== brand.slug) {
    redirect(`/brands/${brand.slug}`);
  }

  const rangeStart = (currentPage - 1) * PAGE_SIZE;
  const rangeEnd = rangeStart + PAGE_SIZE - 1;

  const { data: products, count } = await supabase
    .from("products")
    .select(
      "id, slug, name, price, original_price, images, stock, is_featured, is_deal, brands(name)",
      { count: "exact" }
    )
    .in("brand_id", brand.ids)
    .gt("stock", 0)
    .order("is_featured", { ascending: false })
    .order("is_deal", { ascending: false })
    .order("created_at", { ascending: false })
    .range(rangeStart, rangeEnd);

  const totalCount = count ?? 0;
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / PAGE_SIZE) : 0;
  const startResult = totalCount === 0 ? 0 : rangeStart + 1;
  const endResult = totalCount === 0 ? 0 : Math.min(rangeEnd + 1, totalCount);

  return (
    <div className="min-h-screen bg-white">
      <Container className="py-6 lg:py-8">
        <Breadcrumb
          items={[
            { label: "Brands", href: "/brands" },
            { label: brand.name },
          ]}
          className="mb-6"
        />

        <section className="rounded-2xl border border-stroke bg-white p-6 shadow-sm lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-stroke bg-panel">
                {brand.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={brand.logoUrl}
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
                    Shop by brand
                  </span>
                  {brand.isAuthorized ? (
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
                  {totalCount.toLocaleString()} in-stock products on this brand page
                  {totalPages > 1 ? ` across ${totalPages.toLocaleString()} pages` : ""}.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button href="/brands" variant="outline" size="sm">
                All brand pages
              </Button>
              <Button href="/shop" variant="ghost" size="sm">
                Main shop
              </Button>
            </div>
          </div>
        </section>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
              /brands/{brand.slug}
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

        {products && products.length > 0 ? (
          <>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product, index) => {
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
              basePath={`/brands/${brand.slug}`}
              className="mt-10"
            />
          </>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-stroke bg-white px-6 py-16 text-center shadow-sm">
            <p className="text-lg font-semibold text-ink">No products found</p>
            <p className="mt-2 text-sm text-ink-soft">
              Check back later or browse the main shop while we add more {brand.name} inventory.
            </p>
            <div className="mt-6">
              <Button href="/shop" size="sm">
                Browse main shop
              </Button>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
