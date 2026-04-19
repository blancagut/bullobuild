import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/ui/ProductCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Pagination } from "@/components/ui/Pagination";
import { Search } from "lucide-react";
import type { Metadata } from "next";
import { professionConfigBySlug } from "@/lib/professions";

interface Props {
  searchParams: Promise<{ q?: string; page?: string; brand?: string; category?: string; profession?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q, profession } = await searchParams;
  const professionConfig = profession ? professionConfigBySlug[profession] : undefined;
  return {
    title: professionConfig
      ? `${professionConfig.title} — Shop by Profession | BULLOBUILD`
      : q
        ? `"${q}" — Search | BULLOBUILD`
        : "Search | BULLOBUILD",
  };
}

const PAGE_SIZE = 24;

export default async function SearchPage({ searchParams }: Props) {
  const { q, page, brand, category, profession } = await searchParams;
  const pageNum = Math.max(1, parseInt(page ?? "1"));
  const query = q?.trim() ?? "";
  const professionConfig = profession ? professionConfigBySlug[profession] : undefined;

  const supabase = await createClient();

  // Resolve profession category slugs into ids, including any direct children.
  // This ensures clicking "Mechanic" only returns products from mechanic-
  // related categories (and their subcategories), not unrelated items that
  // happened to match a loose keyword.
  let professionCategoryIds: string[] = [];
  if (professionConfig?.categorySlugs.length) {
    const { data: directCategories } = await supabase
      .from("categories")
      .select("id")
      .in("slug", professionConfig.categorySlugs);
    const directIds = (directCategories ?? []).map((item) => item.id);

    let childIds: string[] = [];
    if (directIds.length > 0) {
      const { data: childCategories } = await supabase
        .from("categories")
        .select("id")
        .in("parent_id", directIds);
      childIds = (childCategories ?? []).map((item) => item.id);
    }

    professionCategoryIds = Array.from(new Set([...directIds, ...childIds]));
  }

  let dbQuery = supabase
    .from("products")
    .select("*, brands(*)", { count: "exact" })
    .range((pageNum - 1) * PAGE_SIZE, pageNum * PAGE_SIZE - 1)
    .order("is_featured", { ascending: false });

  if (query) {
    dbQuery = dbQuery.or(
      `name.ilike.%${query}%,model.ilike.%${query}%,description.ilike.%${query}%`
    );
  }
  if (professionConfig && professionCategoryIds.length > 0) {
    dbQuery = dbQuery.in("category_id", professionCategoryIds);
  }
  if (brand) {
    const { data: b } = await supabase
      .from("brands")
      .select("id")
      .eq("slug", brand)
      .single();
    if (b) dbQuery = dbQuery.eq("brand_id", b.id);
  }
  if (category) {
    const { data: c } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", category)
      .single();
    if (c) dbQuery = dbQuery.eq("category_id", c.id);
  }

  const { data: products, count } = await dbQuery;
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  const paginationParams: Record<string, string> = {};
  if (query) paginationParams.q = query;
  if (brand) paginationParams.brand = brand;
  if (category) paginationParams.category = category;
  if (profession) paginationParams.profession = profession;

  return (
    <div className="min-h-screen bg-white">
      <Container className="py-6 lg:py-8">
        <div className="mb-7 md:mb-8">
          {professionConfig ? (
            <SectionHeader
              label="Shop by profession"
              title={professionConfig.title}
              subtitle={professionConfig.description}
            />
          ) : query ? (
            <SectionHeader
              label={`${count ?? 0} results`}
              title={`Search: "${query}"`}
            />
          ) : (
            <SectionHeader label="Catalog" title="All Products" />
          )}
        </div>

        {products && products.length > 0 ? (
          <>
            <div className="mb-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
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
                  badge={p.is_deal ? "Deal" : undefined}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={pageNum}
                totalPages={totalPages}
                basePath="/search"
                searchParams={paginationParams}
              />
            )}
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-stroke bg-white px-6 py-16 text-center shadow-sm">
            <Search size={44} className="mx-auto text-ink-muted" />
            <p className="mt-4 text-lg font-semibold text-ink">No products found</p>
            <p className="mt-2 text-sm text-ink-soft">
              {query
                ? `No results for "${query}". Try different keywords.`
                : "No products available right now."}
            </p>
          </div>
        )}
      </Container>
    </div>
  );
}
