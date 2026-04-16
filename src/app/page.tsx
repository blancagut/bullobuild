import { createClient } from "@/lib/supabase/server";
import { Hero } from "@/components/home/Hero";
import { BrandsSection } from "@/components/home/BrandsSection";
import { ProductsSection } from "@/components/home/ProductsSection";
import { DealsSection } from "@/components/home/DealsSection";
import { WhyUsSection } from "@/components/home/WhyUsSection";
import { MarketplaceSection } from "@/components/home/MarketplaceSection";

export default async function HomePage() {
  const supabase = await createClient();

  const [
    { count: productCount },
    { count: brandCount },
    { count: categoryCount },
    { data: categories },
    { data: brands },
    { data: featuredProducts },
    { data: dealProducts },
    { data: listings },
  ] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).gt("stock", 0),
    supabase
      .from("brands")
      .select("id", { count: "exact", head: true })
      .eq("is_authorized", true),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("categories").select("name, slug").order("name").limit(8),
    supabase
      .from("brands")
      .select("name, slug")
      .eq("is_authorized", true)
      .order("name")
      .limit(10),
    supabase
      .from("products")
      .select("id, slug, name, price, original_price, images, stock, is_featured, is_deal, brands(name)")
      .gt("stock", 0)
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(8),
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

  const normalizedCategories = (categories ?? []).map((category) => ({
    name: category.name,
    slug: category.slug,
  }));

  const normalizedBrands = (brands ?? []).map((brand) => ({
    name: brand.name,
    slug: brand.slug,
  }));

  const normalizedFeaturedProducts = (featuredProducts ?? []).map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    original_price: product.original_price,
    images: Array.isArray(product.images) ? product.images : [],
    stock: product.stock,
    is_featured: product.is_featured,
    is_deal: product.is_deal,
    brands: Array.isArray(product.brands) ? (product.brands[0] ?? null) : product.brands,
  }));

  const normalizedDealProducts = (dealProducts ?? []).map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    original_price: product.original_price,
    images: Array.isArray(product.images) ? product.images : [],
    stock: product.stock,
    brands: Array.isArray(product.brands) ? (product.brands[0] ?? null) : product.brands,
  }));

  const normalizedListings = (listings ?? []).map((listing) => ({
    id: listing.id,
    title: listing.title,
    price: listing.price,
    condition: listing.condition,
    images: Array.isArray(listing.images) ? listing.images : [],
    created_at: listing.created_at,
    brands: Array.isArray(listing.brands) ? (listing.brands[0] ?? null) : listing.brands,
    profiles: Array.isArray(listing.profiles) ? (listing.profiles[0] ?? null) : listing.profiles,
  }));

  return (
    <>
      <Hero
        productCount={productCount ?? 0}
        brandCount={brandCount ?? 0}
        categoryCount={categoryCount ?? 0}
        categories={normalizedCategories}
      />
      <ProductsSection products={normalizedFeaturedProducts} categories={normalizedCategories} />
      <DealsSection products={normalizedDealProducts} />
      <BrandsSection brands={normalizedBrands} />
      <WhyUsSection />
      <MarketplaceSection listings={normalizedListings} />
    </>
  );
}
