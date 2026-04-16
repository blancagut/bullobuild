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
  const [{ data: brandRows }, { data: categoryRows }, { count: inventoryCount }] = await Promise.all([
    supabase.from("brands").select("id, name, slug").order("name"),
    supabase.from("categories").select("id, name, slug").order("name"),
    supabase.from("products").select("id", { count: "exact", head: true }).gt("stock", 0),
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
    availability === "all"
      ? {
          label: "Showing all inventory",
          href: buildShopUrl(currentParams, { stock: null }),
        }
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
      ? "border-yellow/40 bg-yellow/10 text-yellow"
      : "border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:text-white";

  return (
    <div className="min-h-screen bg-navy-dark">
      <div className="border-b border-white/5 bg-navy">
        <Container className="py-10 lg:py-14">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.35em] text-yellow">
                Shop
              </p>
              <h1 className="font-display text-4xl font-black uppercase tracking-tight text-white lg:text-6xl">
                Live catalog built for real inventory
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-400">
                Browse {Number(inventoryCount ?? 0).toLocaleString()} in-stock products with
                server-side search, brand and category filters, price ranges, and stable
                pagination built for a 35k-item catalog.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-110">
              <div className="border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                  Inventory
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  {Number(inventoryCount ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                  Brands
                </p>
                <p className="mt-2 text-2xl font-black text-white">{brandGroups.length}</p>
              </div>
              <div className="border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                  Categories
                </p>
                <p className="mt-2 text-2xl font-black text-white">{categories.length}</p>
              </div>
              <div className="border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                  Per page
                </p>
                <p className="mt-2 text-2xl font-black text-white">{PAGE_SIZE}</p>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-8 lg:py-10">
        <form action="/shop" className="border border-white/10 bg-navy p-5 lg:p-6">
          <div className="grid gap-4 xl:grid-cols-[2fr_repeat(4,minmax(0,1fr))]">
            <div>
              <label
                htmlFor="shop-q"
                className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400"
              >
                Search catalog
              </label>
              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  id="shop-q"
                  name="q"
                  defaultValue={queryText}
                  placeholder="Search tools, models, or descriptions"
                  className="h-12 w-full border border-white/10 bg-navy-dark pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-yellow"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="shop-brand"
                className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400"
              >
                Brand
              </label>
              <select
                id="shop-brand"
                name="brand"
                defaultValue={selectedBrand?.slug ?? ""}
                className="h-12 w-full border border-white/10 bg-navy-dark px-4 text-sm text-white outline-none transition-colors focus:border-yellow"
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
              <label
                htmlFor="shop-category"
                className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400"
              >
                Category
              </label>
              <select
                id="shop-category"
                name="category"
                defaultValue={selectedCategory?.slug ?? ""}
                className="h-12 w-full border border-white/10 bg-navy-dark px-4 text-sm text-white outline-none transition-colors focus:border-yellow"
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
              <label
                htmlFor="shop-price"
                className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400"
              >
                Price range
              </label>
              <select
                id="shop-price"
                name="price"
                defaultValue={price}
                className="h-12 w-full border border-white/10 bg-navy-dark px-4 text-sm text-white outline-none transition-colors focus:border-yellow"
              >
                <option value="">Any price</option>
                {PRICE_FILTERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
              <div>
                <label
                  htmlFor="shop-sort"
                  className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400"
                >
                  Sort by
                </label>
                <select
                  id="shop-sort"
                  name="sort"
                  defaultValue={sort}
                  className="h-12 w-full border border-white/10 bg-navy-dark px-4 text-sm text-white outline-none transition-colors focus:border-yellow"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="shop-stock"
                  className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400"
                >
                  Availability
                </label>
                <select
                  id="shop-stock"
                  name="stock"
                  defaultValue={availability}
                  className="h-12 w-full border border-white/10 bg-navy-dark px-4 text-sm text-white outline-none transition-colors focus:border-yellow"
                >
                  <option value="in-stock">In stock only</option>
                  <option value="all">All inventory</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-gray-300">
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
              className="inline-flex h-11 items-center justify-center bg-yellow px-5 text-sm font-black uppercase tracking-[0.18em] text-navy transition-colors hover:bg-yellow-dark"
            >
              Apply filters
            </button>

            <Link
              href="/shop"
              className="inline-flex h-11 items-center justify-center border border-white/20 px-5 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:border-white hover:bg-white/5"
            >
              Clear all
            </Link>
          </div>
        </form>

        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-6">
              <section className="border border-white/10 bg-navy p-5">
                <div className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">
                  <SlidersHorizontal size={14} />
                  Quick filters
                </div>

                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                    Brands
                  </p>
                  <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                    <Link
                      href={buildShopUrl(currentParams, { brand: null })}
                      className={`block border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${facetLinkClass(!selectedBrand)}`}
                    >
                      All brands
                    </Link>
                    {brandGroups.map((brand) => {
                      const isActive = selectedBrand?.slug === brand.slug;
                      return (
                        <Link
                          key={brand.slug}
                          href={buildShopUrl(currentParams, { brand: isActive ? null : brand.slug })}
                          className={`block border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${facetLinkClass(isActive)}`}
                        >
                          {brand.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section className="border border-white/10 bg-navy p-5">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                  Categories
                </p>
                <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                  <Link
                    href={buildShopUrl(currentParams, { category: null })}
                    className={`block border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${facetLinkClass(!selectedCategory)}`}
                  >
                    All categories
                  </Link>
                  {categories.map((category) => {
                    const isActive = selectedCategory?.slug === category.slug;
                    return (
                      <Link
                        key={category.slug}
                        href={buildShopUrl(currentParams, { category: isActive ? null : category.slug })}
                        className={`block border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${facetLinkClass(isActive)}`}
                      >
                        {category.name}
                      </Link>
                    );
                  })}
                </div>
              </section>

              <section className="border border-white/10 bg-navy p-5">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                  Price bands
                </p>
                <div className="space-y-2">
                  <Link
                    href={buildShopUrl(currentParams, { price: null })}
                    className={`block border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${facetLinkClass(!selectedPrice)}`}
                  >
                    Any price
                  </Link>
                  {PRICE_FILTERS.map((option) => {
                    const isActive = selectedPrice?.value === option.value;
                    return (
                      <Link
                        key={option.value}
                        href={buildShopUrl(currentParams, { price: isActive ? null : option.value })}
                        className={`block border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${facetLinkClass(isActive)}`}
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
            <div className="mb-6 flex flex-col gap-4 border border-white/10 bg-white/5 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                  Results
                </p>
                <p className="mt-2 text-sm text-gray-300">
                  {totalCount > 0
                    ? `Showing ${startResult.toLocaleString()} to ${endResult.toLocaleString()} of ${totalCount.toLocaleString()} products`
                    : "No products matched the current filters."}
                </p>
              </div>

              {activeFilters.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {activeFilters.map((filter) => (
                    <Link
                      key={filter.label}
                      href={filter.href}
                      className="inline-flex items-center gap-2 border border-yellow/30 bg-yellow/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-yellow transition-colors hover:bg-yellow/15"
                    >
                      {filter.label}
                      <X size={13} />
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>

            {invalidBrandFilter || invalidCategoryFilter ? (
              <div className="mb-6 border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                One of the selected filters no longer exists. Clear filters and try again.
              </div>
            ) : null}

            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
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
              <div className="border border-dashed border-white/10 bg-white/5 px-6 py-16 text-center">
                <p className="text-lg font-semibold text-white">No products found</p>
                <p className="mt-2 text-sm text-gray-400">
                  Try a different search, loosen the price range, or clear the current filters.
                </p>
                <div className="mt-6">
                  <Link
                    href="/shop"
                    className="inline-flex items-center justify-center border border-yellow/30 bg-yellow/10 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-yellow transition-colors hover:bg-yellow/15"
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
