import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductCard } from "@/components/ui/ProductCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("brands")
    .select("name")
    .eq("slug", slug)
    .single();
  return {
    title: data ? `${data.name} Tools | BULLOBUILD` : "Brand Not Found",
  };
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const [{ data: brand }, ] = await Promise.all([
    supabase.from("brands").select("*").eq("slug", slug).single(),
  ]);

  if (!brand) notFound();

  const { data: products } = await supabase
    .from("products")
    .select("*, brands(*)")
    .eq("brand_id", brand.id)
    .order("is_featured", { ascending: false });

  return (
    <div className="min-h-screen bg-[#070F1C] py-10">
      <Container>
        <Breadcrumb
          items={[
            { label: "Brands", href: "/brands" },
            { label: brand.name },
          ]}
          className="mb-8"
        />

        {/* Brand hero */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-12 p-8 bg-[#0B1F3A] border border-white/10">
          <div className="h-24 w-24 bg-white/10 flex items-center justify-center shrink-0">
            {brand.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={brand.logo_url}
                alt={brand.name}
                className="h-16 w-16 object-contain"
              />
            ) : (
              <span
                className="text-3xl font-black text-[#F2B705] uppercase"
                style={{ fontFamily: "var(--font-barlow), system-ui" }}
              >
                {brand.name.slice(0, 2)}
              </span>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1
                className="text-4xl font-black uppercase text-white tracking-tight"
                style={{ fontFamily: "var(--font-barlow), system-ui" }}
              >
                {brand.name}
              </h1>
              {brand.is_authorized && (
                <Badge variant="success">
                  <CheckCircle size={12} className="mr-1" />
                  Authorized Dealer
                </Badge>
              )}
            </div>
            <p className="text-gray-400 text-sm">
              {products?.length ?? 0} products available
            </p>
          </div>
        </div>

        {/* Products grid */}
        <SectionHeader
          label={brand.name}
          title="All Products"
          className="mb-6"
        />

        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                slug={p.slug}
                name={p.name}
                brand={p.brands?.name ?? brand.name}
                price={p.price}
                originalPrice={p.original_price ?? undefined}
                image={p.images?.[0]}
                inStock={p.stock > 0}
                badge={p.is_deal ? "Deal" : p.is_featured ? "Featured" : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            No products listed yet for {brand.name}.
          </div>
        )}
      </Container>
    </div>
  );
}
