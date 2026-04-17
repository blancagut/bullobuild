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

  let professionCategoryIds: string[] = [];
  if (professionConfig?.categorySlugs.length) {
    const { data: professionCategories } = await supabase
      .from("categories")
      .select("id")
      .in("slug", professionConfig.categorySlugs);
    professionCategoryIds = (professionCategories ?? []).map((item) => item.id);
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
  if (professionConfig) {
    const professionOr = professionConfig.searchTerms
      .flatMap((term) => [
        `name.ilike.%${term}%`,
        `model.ilike.%${term}%`,
        `description.ilike.%${term}%`,
      ])
      .join(",");

    if (professionOr) {
      dbQuery = dbQuery.or(professionOr);
    }

    if (professionCategoryIds.length > 0) {
      dbQuery = dbQuery.in("category_id", professionCategoryIds);
    }
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
    <div className="min-h-screen bg-[#070F1C] py-10">
      <Container>
        <div className="mb-8">
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
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
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <Search size={48} className="text-gray-600" />
            <p className="text-white font-semibold text-lg">No products found</p>
            <p className="text-gray-400 text-sm">
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
