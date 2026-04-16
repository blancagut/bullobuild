import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductCard } from "@/components/ui/ProductCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("name")
    .eq("slug", slug)
    .single();
  return {
    title: data ? `${data.name} | BULLOBUILD` : "Category Not Found",
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!category) notFound();

  const { data: products } = await supabase
    .from("products")
    .select("*, brands(*)")
    .eq("category_id", category.id)
    .order("is_featured", { ascending: false });

  return (
    <div className="min-h-screen bg-[#070F1C] py-10">
      <Container>
        <Breadcrumb
          items={[
            { label: "Shop", href: "/shop" },
            { label: category.name },
          ]}
          className="mb-8"
        />

        <SectionHeader
          label="Category"
          title={category.name}
          subtitle={`${products?.length ?? 0} products`}
          className="mb-8"
        />

        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
        ) : (
          <div className="text-center py-20 text-gray-500">
            No products in this category yet.
          </div>
        )}
      </Container>
    </div>
  );
}
