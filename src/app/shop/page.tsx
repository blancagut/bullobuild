import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/Container";
import { StoreProductCard } from "@/components/home/StoreProductCard";
import { Pagination } from "@/components/ui/Pagination";

interface Props {
  searchParams: Promise<{
    q?: string;
    page?: string;
    brand?: string;
    category?: string;
    sort?: string;
    price?: string;
    stock?: string;
    deal?: string;
  }>;
}

type BrandRow = {
  id: string;
  name: string;
  slug: string;
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
};

type BrandGroup = {
  name: string;
  slug: string;
  ids: string[];
  sourceSlugs: string[];
};

const PAGE_SIZE = 24;

const SORT_OPTIONS = [
  { value: "featured", label: "Featured first" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
] as const;

const PRICE_FILTERS = [
  { value: "under-50", label: "Under $50", min: null, max: 50 },
  { value: "50-150", label: "$50 to $150", min: 50, max: 150 },
  { value: "150-300", label: "$150 to $300", min: 150, max: 300 },
  { value: "300-500", label: "$300 to $500", min: 300, max: 500 },
  { value: "500-plus", label: "$500+", min: 500, max: null },
] as const;

function normalizeFilterSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[+&]/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function sanitizeSearchTerm(value: string) {
  return value.replace(/[,%()]/g, " ").replace(/\s+/g, " ").trim();
}

function buildShopUrl(
  currentParams: Record<string, string>,
  updates: Record<string, string | null | undefined>
) {
  const nextParams = new URLSearchParams(currentParams);
  nextParams.delete("page");

  for (const [key, value] of Object.entries(updates)) {
    if (!value) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
  }

  const query = nextParams.toString();
  return query ? `/shop?${query}` : "/shop";
}

function toSingleRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function groupBrands(rows: BrandRow[]) {
  const groups = new Map<string, BrandGroup>();

  for (const row of rows) {
    const key = normalizeFilterSlug(row.name) || row.slug;
    const existing = groups.get(key);

    if (existing) {
      existing.ids.push(row.id);
      if (!existing.sourceSlugs.includes(row.slug)) {
        existing.sourceSlugs.push(row.slug);
      }
      continue;
    }

    groups.set(key, {
      name: row.name,
      slug: key,
      ids: [row.id],
      sourceSlugs: [row.slug],
    });
  }

  return Array.from(groups.values()).sort((left, right) =>
    left.name.localeCompare(right.name)
  );
}

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams;
  const queryText = params.q?.trim() ?? "";
  const brandParam = params.brand?.trim() ?? "";
  const categoryParam = params.category?.trim() ?? "";
  const requestedPage = Number.parseInt(params.page ?? "1", 10);
  const currentPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const sort =
    SORT_OPTIONS.find((option) => option.value === params.sort)?.value ?? "featured";
  const price = PRICE_FILTERS.find((option) => option.value === params.price)?.value ?? "";
  const availability: "all" | "in-stock" = params.stock === "all" ? "all" : "in-stock";
  const dealsOnly = params.deal === "1";

  const currentParams: Record<string, string> = {};
  if (queryText) currentParams.q = queryText;
  if (brandParam) currentParams.brand = brandParam;
  if (categoryParam) currentParams.category = categoryParam;
  if (sort !== "featured") currentParams.sort = sort;
  if (price) currentParams.price = price;
  if (availability === "all") currentParams.stock = availability;
  if (dealsOnly) currentParams.deal = "1";

  const supabase = await createClient();
  const [{ data: brandRows }, { data: categoryRows }] = await Promise.all([
    supabase.from("brands").select("id, name, slug").order("name"),
    supabase.from("categories").select("id, name, slug").order("name"),
  ]);

  const brandGroups = groupBrands((brandRows ?? []) as BrandRow[]);
  const categories = (categoryRows ?? []) as CategoryRow[];
  const selectedBrand = brandParam
    ? brandGroups.find(
        (group) => group.slug === brandParam || group.sourceSlugs.includes(brandParam)
      ) ?? null
    : null;
  const selectedCategory = categoryParam
    ? categories.find((category) => category.slug === categoryParam) ?? null
    : null;

  const invalidBrandFilter = Boolean(brandParam && !selectedBrand);
  const invalidCategoryFilter = Boolean(categoryParam && !selectedCategory);
  const selectedPrice = PRICE_FILTERS.find((option) => option.value === price) ?? null;

  let totalCount = 0;
  let products: Array<{
    id: string;
    slug: string;
    name: string;
    brand: string;
    price: number;
    originalPrice: number | null;
    image: string | null;
    stock: number;
    badge?: string;
  }> = [];

  if (!invalidBrandFilter && !invalidCategoryFilter) {
    let productsQuery = supabase
      .from("products")
      .select(
        "id, slug, name, price, original_price, images, stock, is_featured, is_deal, brands(name)",
        { count: "exact" }
      );

    const safeSearchTerm = sanitizeSearchTerm(queryText);
    if (safeSearchTerm) {
      productsQuery = productsQuery.or(
        `name.ilike.%${safeSearchTerm}%,model.ilike.%${safeSearchTerm}%,description.ilike.%${safeSearchTerm}%`
      );
    }

    if (selectedBrand) {
      productsQuery = productsQuery.in("brand_id", selectedBrand.ids);
    }

    if (selectedCategory) {
      productsQuery = productsQuery.eq("category_id", selectedCategory.id);
    }

    if (selectedPrice?.min !== null && selectedPrice?.min !== undefined) {
      productsQuery = productsQuery.gte("price", selectedPrice.min);
    }

    if (selectedPrice?.max !== null && selectedPrice?.max !== undefined) {
      productsQuery = productsQuery.lte("price", selectedPrice.max);
    }

    if (availability !== "all") {
      productsQuery = productsQuery.gt("stock", 0);
    }

    if (dealsOnly) {
      productsQuery = productsQuery.eq("is_deal", true);
    }

    switch (sort) {
      case "newest":
        productsQuery = productsQuery.order("created_at", { ascending: false });
        break;
      case "price-asc":
        productsQuery = productsQuery
          .order("price", { ascending: true })
          .order("created_at", { ascending: false });
        break;
      case "price-desc":
        productsQuery = productsQuery
          .order("price", { ascending: false })
          .order("created_at", { ascending: false });
        break;
      case "name-asc":
        productsQuery = productsQuery.order("name", { ascending: true });
        break;
      default:
        productsQuery = productsQuery
          .order("is_featured", { ascending: false })
          .order("is_deal", { ascending: false })
          .order("created_at", { ascending: false });
        break;
    }

    const rangeStart = (currentPage - 1) * PAGE_SIZE;
    const rangeEnd = rangeStart + PAGE_SIZE - 1;
    const { data: productRows, count } = await productsQuery.range(rangeStart, rangeEnd);

    totalCount = count ?? 0;
    products = (productRows ?? []).map((product) => {
      const brand = toSingleRelation<{ name?: string | null }>(product.brands);
      const images = Array.isArray(product.images) ? product.images : [];

      return {
        id: String(product.id),
        slug: String(product.slug),
        name: String(product.name),
        brand: brand?.name ?? "Unknown brand",
        price: Number(product.price ?? 0),
        originalPrice:
          product.original_price === null || product.original_price === undefined
            ? null
            : Number(product.original_price),
        image: images[0] ?? null,
        stock: Number(product.stock ?? 0),
        badge: product.is_deal ? "Deal" : product.is_featured ? "Featured" : undefined,
      };
    });
  }

  const totalPages = totalCount > 0 ? Math.ceil(totalCount / PAGE_SIZE) : 0;
  const startResult = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endResult = totalCount === 0 ? 0 : Math.min(currentPage * PAGE_SIZE, totalCount);
  const activeFilters = [
    queryText
      ? { label: `Search: ${queryText}`, href: buildShopUrl(currentParams, { q: null }) }
      : null,
    selectedBrand
      ? { label: `Brand: ${selectedBrand.name}`, href: buildShopUrl(currentParams, { brand: null }) }
      : null,
    selectedCategory
      ? {
          label: `Category: ${selectedCategory.name}`,
          href: buildShopUrl(currentParams, { category: null }),
        }
      : null,
    selectedPrice
      ? { label: selectedPrice.label, href: buildShopUrl(currentParams, { price: null }) }
      : null,
    dealsOnly
      ? { label: "Deals only", href: buildShopUrl(currentParams, { deal: null }) }
      : null,
    sort !== "featured"
      ? {
          label: SORT_OPTIONS.find((option) => option.value === sort)?.label ?? "Custom sort",
          href: buildShopUrl(currentParams, { sort: null }),
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; href: string }>;

  const facetLinkClass = (active: boolean) =>
    active
      ? "border-yellow bg-yellow/10 text-yellow-dark"
      : "border-stroke bg-white text-ink-soft hover:border-ink-muted hover:text-ink";

  const fieldLabelClass =
    "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft";
  const fieldControlClass =
    "h-12 w-full rounded-xl border border-stroke bg-white px-4 text-sm text-ink outline-none transition-colors focus:border-yellow focus:ring-2 focus:ring-yellow/20";

  return (
    <div className="min-h-screen bg-white">
      <Container className="py-6 lg:py-8">
        <form
          action="/shop"
          className="rounded-xl border border-stroke bg-white p-4 shadow-sm lg:p-5"
        >
          <div className="grid gap-3 lg:grid-cols-[2fr_repeat(4,minmax(0,1fr))] lg:items-end">
            <div>
              <label htmlFor="shop-q" className={fieldLabelClass}>
                Search
              </label>
              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
                />
                <input
                  id="shop-q"
                  name="q"
                  defaultValue={queryText}
                  placeholder="Search tools, models, brands…"
                  className="h-12 w-full rounded-xl border border-stroke bg-white pl-10 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-yellow focus:ring-2 focus:ring-yellow/20"
                />
              </div>
            </div>

            <div>
              <label htmlFor="shop-brand" className={fieldLabelClass}>
                Brand
              </label>
              <select
                id="shop-brand"
                name="brand"
                defaultValue={selectedBrand?.slug ?? ""}
                className={fieldControlClass}
              >
                <option value="">All brands</option>
                {brandGroups.map((brand) => (
                  <option key={brand.slug} value={brand.slug}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="shop-category" className={fieldLabelClass}>
                Category
              </label>
              <select
                id="shop-category"
                name="category"
                defaultValue={selectedCategory?.slug ?? ""}
                className={fieldControlClass}
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="shop-price" className={fieldLabelClass}>
                Price
              </label>
              <select
                id="shop-price"
                name="price"
                defaultValue={price}
                className={fieldControlClass}
              >
                <option value="">Any price</option>
                {PRICE_FILTERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="shop-sort" className={fieldLabelClass}>
                Sort
              </label>
              <select
                id="shop-sort"
                name="sort"
                defaultValue={sort}
                className={fieldControlClass}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <label className="inline-flex items-center gap-2 rounded-lg border border-stroke bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
              <input
                type="checkbox"
                name="deal"
                value="1"
                defaultChecked={dealsOnly}
                className="h-4 w-4 accent-yellow"
              />
              Deals only
            </label>

            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-full bg-yellow px-6 text-sm font-black uppercase tracking-[0.16em] text-ink transition-colors hover:bg-yellow-dark sm:h-11"
            >
              Apply filters
            </button>

            <Link
              href="/shop"
              className="inline-flex h-12 items-center justify-center rounded-full border border-stroke bg-white px-5 text-sm font-bold uppercase tracking-[0.16em] text-ink-soft transition-colors hover:border-ink-muted hover:text-ink sm:h-11"
            >
              Clear all
            </Link>
          </div>
        </form>

        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-5">
              <section className="rounded-xl border border-stroke bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-ink-soft">
                  <SlidersHorizontal size={14} />
                  Brands
                </div>
                <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
                  <Link
                    href={buildShopUrl(currentParams, { brand: null })}
                    className={`block rounded-md border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${facetLinkClass(!selectedBrand)}`}
                  >
                    All brands
                  </Link>
                  {brandGroups.map((brand) => {
                    const isActive = selectedBrand?.slug === brand.slug;
                    return (
                      <Link
                        key={brand.slug}
                        href={buildShopUrl(currentParams, { brand: isActive ? null : brand.slug })}
                        className={`block rounded-md border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${facetLinkClass(isActive)}`}
                      >
                        {brand.name}
                      </Link>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-xl border border-stroke bg-white p-4 shadow-sm">
                <p className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-ink-soft">
                  Categories
                </p>
                <div className="max-h-80 space-y-1.5 overflow-y-auto pr-1">
                  <Link
                    href={buildShopUrl(currentParams, { category: null })}
                    className={`block rounded-md border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${facetLinkClass(!selectedCategory)}`}
                  >
                    All categories
                  </Link>
                  {categories.map((category) => {
                    const isActive = selectedCategory?.slug === category.slug;
                    return (
                      <Link
                        key={category.slug}
                        href={buildShopUrl(currentParams, { category: isActive ? null : category.slug })}
                        className={`block rounded-md border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${facetLinkClass(isActive)}`}
                      >
                        {category.name}
                      </Link>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-xl border border-stroke bg-white p-4 shadow-sm">
                <p className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-ink-soft">
                  Price
                </p>
                <div className="space-y-1.5">
                  <Link
                    href={buildShopUrl(currentParams, { price: null })}
                    className={`block rounded-md border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${facetLinkClass(!selectedPrice)}`}
                  >
                    Any price
                  </Link>
                  {PRICE_FILTERS.map((option) => {
                    const isActive = selectedPrice?.value === option.value;
                    return (
                      <Link
                        key={option.value}
                        href={buildShopUrl(currentParams, { price: isActive ? null : option.value })}
                        className={`block rounded-md border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${facetLinkClass(isActive)}`}
                      >
                        {option.label}
                      </Link>
                    );
                  })}
                </div>
              </section>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="font-display text-[1.7rem] font-black uppercase leading-[0.92] tracking-tight text-ink sm:text-2xl">
                  {selectedCategory
                    ? selectedCategory.name
                    : selectedBrand
                      ? selectedBrand.name
                      : queryText
                        ? `Results for "${queryText}"`
                        : "All products"}
                </h1>
                <p className="mt-1 text-sm text-ink-soft">
                  {totalCount > 0
                    ? `${startResult.toLocaleString()}–${endResult.toLocaleString()} of ${totalCount.toLocaleString()} results`
                    : "No products matched the current filters."}
                </p>
              </div>

              {activeFilters.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {activeFilters.map((filter) => (
                    <Link
                      key={filter.label}
                      href={filter.href}
                      className="inline-flex items-center gap-1.5 rounded-full border border-yellow/40 bg-yellow/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-yellow-dark transition-colors hover:bg-yellow/20"
                    >
                      {filter.label}
                      <X size={12} />
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>

            {invalidBrandFilter || invalidCategoryFilter ? (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                One of the selected filters no longer exists. Clear filters and try again.
              </div>
            ) : null}

            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                  {products.map((product, index) => (
                    <StoreProductCard
                      key={product.id}
                      id={product.id}
                      slug={product.slug}
                      name={product.name}
                      brand={product.brand}
                      price={product.price}
                      originalPrice={product.originalPrice}
                      image={product.image}
                      stock={product.stock}
                      badge={product.badge}
                      priority={index < 4}
                    />
                  ))}
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  basePath="/shop"
                  searchParams={currentParams}
                  className="mt-10"
                />
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-stroke bg-white px-6 py-16 text-center shadow-sm">
                <p className="text-lg font-semibold text-ink">No products found</p>
                <p className="mt-2 text-sm text-ink-soft">
                  Try a different search, loosen the price range, or clear the current filters.
                </p>
                <div className="mt-6">
                  <Link
                    href="/shop"
                    className="inline-flex h-12 items-center justify-center rounded-full bg-yellow px-5 text-sm font-black uppercase tracking-[0.16em] text-ink transition-colors hover:bg-yellow-dark"
                  >
                    Reset catalog
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
