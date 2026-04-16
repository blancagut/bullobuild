import { createClient } from "@/lib/supabase/server";
import { Hero } from "@/components/home/Hero";
import { BrandsSection } from "@/components/home/BrandsSection";
import { ProductsSection } from "@/components/home/ProductsSection";
import { DealsSection } from "@/components/home/DealsSection";
import { WhyUsSection } from "@/components/home/WhyUsSection";
import { MarketplaceSection } from "@/components/home/MarketplaceSection";

const HOME_DEPARTMENT_SLUGS = [
  "drills-drivers",
  "impact-drivers",
  "saws",
  "wrenches-sockets",
  "tool-boxes",
  "vacuums-cleaning",
] as const;

const HOME_SHELF_SLUGS = [
  "drills-drivers",
  "impact-drivers",
  "saws",
  "wrenches-sockets",
] as const;

export const revalidate = 1800;

function normalizeRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function HomePage() {
  const supabase = await createClient();

  const [
    { count: productCount },
    { count: brandCount },
    { count: categoryCount },
    { data: brands },
    { data: departmentCategories },
    { data: dealProducts },
    { data: listings },
  ] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).gt("stock", 0),
    supabase
      .from("brands")
      .select("id", { count: "exact", head: true })
      .eq("is_authorized", true),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase
      .from("brands")
      .select("name, slug")
      .eq("is_authorized", true)
      .order("name")
      .limit(10),
    supabase
      .from("categories")
      .select("id, name, slug")
      .in("slug", [...HOME_DEPARTMENT_SLUGS]),
    supabase
      .from("products")
      .select("id, slug, name, price, original_price, images, stock, brands(name)")
      .eq("is_deal", true)
      .gt("stock", 0)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("listings")
      .select("id, title, price, condition, images, created_at, brands(name), profiles(full_name)")
      .eq("is_approved", true)
      .eq("is_sold", false)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const orderedDepartments = HOME_DEPARTMENT_SLUGS.map((slug) =>
    (departmentCategories ?? []).find((category) => category.slug === slug)
  ).filter(Boolean) as Array<{ id: string; name: string; slug: string }>;

  const departmentCollections = await Promise.all(
    orderedDepartments.map(async (category) => {
      const [{ count }, { data: products }] = await Promise.all([
        supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("category_id", category.id)
          .gt("stock", 0),
        supabase
          .from("products")
          .select("id, slug, name, price, original_price, images, stock, brands(name)")
          .eq("category_id", category.id)
          .gt("stock", 0)
          .order("created_at", { ascending: false })
          .limit(4),
      ]);

      return {
        ...category,
        count: count ?? 0,
        products: (products ?? []).map((product) => ({
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          original_price: product.original_price,
          images: Array.isArray(product.images) ? product.images : [],
          stock: product.stock,
          brands: normalizeRelation(product.brands),
        })),
      };
    })
  );

  const normalizedCategories = departmentCollections
    .filter((category) => category.count > 0)
    .map((category) => ({
      name: category.name,
      slug: category.slug,
    }));

  const homepageDepartments = departmentCollections
    .filter((category) => category.count > 0)
    .map((category) => ({
      name: category.name,
      slug: category.slug,
      count: category.count,
      image: category.products[0]?.images[0] ?? null,
    }));

  const homepageShelves = departmentCollections
    .filter(
      (category) =>
        HOME_SHELF_SLUGS.includes(category.slug as (typeof HOME_SHELF_SLUGS)[number]) &&
        category.products.length > 0
    )
    .map((category) => ({
      name: category.name,
      slug: category.slug,
      count: category.count,
      products: category.products,
    }));

  const normalizedBrands = (brands ?? []).map((brand) => ({
    name: brand.name,
    slug: brand.slug,
  }));

  const normalizedDealProducts = (dealProducts ?? []).map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    original_price: product.original_price,
    images: Array.isArray(product.images) ? product.images : [],
    stock: product.stock,
    brands: normalizeRelation(product.brands),
  }));

  const normalizedListings = (listings ?? []).map((listing) => ({
    id: listing.id,
    title: listing.title,
    price: listing.price,
    condition: listing.condition,
    images: Array.isArray(listing.images) ? listing.images : [],
    created_at: listing.created_at,
    brands: normalizeRelation(listing.brands),
    profiles: normalizeRelation(listing.profiles),
  }));

  return (
    <>
      <Hero
        productCount={productCount ?? 0}
        brandCount={brandCount ?? 0}
        categoryCount={categoryCount ?? 0}
        categories={normalizedCategories}
      />
      <ProductsSection departments={homepageDepartments} shelves={homepageShelves} />
      <DealsSection products={normalizedDealProducts} />
      <BrandsSection brands={normalizedBrands} />
      <WhyUsSection />
      <MarketplaceSection listings={normalizedListings} />
    </>
  );
}
