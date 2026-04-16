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

  return (
    <>
      <Hero
        productCount={productCount ?? 0}
        brandCount={brandCount ?? 0}
        categoryCount={categoryCount ?? 0}
        categories={categories ?? []}
      />
      <ProductsSection products={featuredProducts ?? []} categories={categories ?? []} />
      <DealsSection products={dealProducts ?? []} />
      <BrandsSection brands={brands ?? []} />
      <WhyUsSection />
      <MarketplaceSection listings={listings ?? []} />
    </>
  );
}
