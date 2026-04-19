import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/Container";
import { groupBrandRecords, type BrandRecord } from "@/lib/brands";

type ProductBrandRow = { brand_id: string | null };

export default async function BrandsPage() {
  const supabase = await createClient();
  const { data: brands } = await supabase
    .from("brands")
    .select("id, name, slug, is_authorized, logo_url")
    .order("name");

  const brandGroups = groupBrandRecords((brands ?? []) as BrandRecord[]);
  const brandIds = brandGroups.flatMap((brand) => brand.ids);

  const { data: productBrandRows } = brandIds.length
    ? await supabase.from("products").select("brand_id").in("brand_id", brandIds)
    : { data: [] as ProductBrandRow[] };

  const productCounts = new Map<string, number>();
  for (const row of (productBrandRows ?? []) as ProductBrandRow[]) {
    if (!row.brand_id) continue;
    productCounts.set(row.brand_id, (productCounts.get(row.brand_id) ?? 0) + 1);
  }

  const authorizedCount = brandGroups.filter((brand) => brand.isAuthorized).length;

  return (
    <div className="min-h-screen bg-[#070f1c]">
      <div className="border-b border-white/5 bg-[#0b1f3a] py-16">
        <Container className="text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.35em] text-yellow">
            Official Authorized Distributor
          </p>
          <h1 className="font-display mb-4 text-4xl font-black uppercase text-white lg:text-6xl">
            Shop by Brand
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-gray-400">
            Each brand below opens its own dedicated brand page, separate from the main shop
            catalog. The directory currently exposes {brandGroups.length.toLocaleString()} brand
            pages and {authorizedCount.toLocaleString()} authorized brands.
          </p>
        </Container>
      </div>

      <Container className="py-16">
        <div className="mb-6 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.16em] text-gray-500">
          <span>{brandGroups.length.toLocaleString()} brand pages</span>
          <span className="h-1 w-1 rounded-full bg-gray-700" />
          <span>{authorizedCount.toLocaleString()} authorized brands</span>
        </div>

        <div className="grid grid-cols-1 gap-px bg-white/5 md:grid-cols-2">
          {brandGroups.map((brand) => {
            const productCount = brand.ids.reduce(
              (total, brandId) => total + (productCounts.get(brandId) ?? 0),
              0
            );

            return (
              <Link
                key={brand.slug}
                href={`/brands/${brand.slug}`}
                className="group flex items-center gap-6 border-l-2 border-transparent bg-[#0f1b2e] p-8 transition-all hover:border-yellow hover:bg-[#0b1f3a]"
              >
                <div className="flex h-20 w-20 shrink-0 items-center justify-center bg-[#0b1f3a] transition-colors group-hover:bg-[#112645]">
                  <span className="font-display px-1 text-center text-xs font-black uppercase tracking-wider text-gray-500 transition-colors group-hover:text-white">
                    {brand.name}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-xl font-black uppercase tracking-tight text-white">
                      {brand.name}
                    </h2>
                    {brand.isAuthorized ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em] text-yellow">
                        <CheckCircle size={11} />
                        Authorized
                      </span>
                    ) : null}
                  </div>

                  <p className="mb-3 text-xs text-gray-500">bullobuild.com/brands/{brand.slug}</p>

                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>{productCount.toLocaleString()} catalog products</span>
                    <span className="h-1 w-1 rounded-full bg-gray-700" />
                    <span className="uppercase tracking-[0.16em]">Dedicated brand page</span>
                  </div>
                </div>

                <ArrowRight
                  size={18}
                  className="shrink-0 text-gray-700 transition-all group-hover:translate-x-1 group-hover:text-yellow"
                />
              </Link>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
