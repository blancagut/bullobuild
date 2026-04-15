import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, TableEmpty } from "@/components/ui/Table";
import { formatPrice } from "@/lib/utils";
import { Package } from "lucide-react";
import Link from "next/link";
import { AdminProductActions } from "@/components/admin/AdminProductActions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Products | Admin" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; brand?: string; category?: string }>;
}) {
  const { q, brand, category } = await searchParams;
  const supabase = await createClient();

  const [{ data: products }, { data: brands }, { data: categories }] = await Promise.all([
    (() => {
      let query = supabase
        .from("products")
        .select("id, name, slug, price, stock, is_featured, is_deal, created_at, brand:brands(name), category:categories(name)")
        .order("created_at", { ascending: false });
      if (q) query = query.ilike("name", `%${q}%`);
      if (brand) query = query.eq("brand_id", brand);
      if (category) query = query.eq("category_id", category);
      return query;
    })(),
    supabase.from("brands").select("id, name").order("name"),
    supabase.from("categories").select("id, name").order("name"),
  ]);

  return (
    <div className="space-y-6">
      <SectionHeader
        label="Admin"
        title="Products"
        action={
          <Link href="/admin/products/new" className="inline-flex items-center gap-2 bg-[#F2B705] hover:bg-[#D9A204] text-[#0B1F3A] text-xs font-black uppercase tracking-widest px-4 py-2 transition-colors">
            + Add Product
          </Link>
        }
      />

      {/* Filters */}
      <form method="GET" className="flex gap-3 flex-wrap">
        <input name="q" defaultValue={q} placeholder="Search..." className="bg-[#0B1F3A] border border-white/10 text-white text-sm px-4 py-2 outline-none focus:border-[#F2B705] w-48" />
        <select name="brand" defaultValue={brand} className="bg-[#0B1F3A] border border-white/10 text-white text-sm px-4 py-2 outline-none focus:border-[#F2B705]">
          <option value="">All Brands</option>
          {brands?.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select name="category" defaultValue={category} className="bg-[#0B1F3A] border border-white/10 text-white text-sm px-4 py-2 outline-none focus:border-[#F2B705]">
          <option value="">All Categories</option>
          {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button type="submit" className="bg-[#F2B705] hover:bg-[#D9A204] text-[#0B1F3A] text-xs font-black uppercase tracking-widest px-4 py-2 transition-colors">Search</button>
        {(q || brand || category) && <Link href="/admin/products" className="border border-white/10 text-gray-400 hover:text-white text-xs font-bold uppercase px-4 py-2 transition-colors">Clear</Link>}
      </form>

      <div className="bg-[#0B1F3A] border border-white/8">
        <Table>
          <TableHead>
            <TableHeadCell>Name</TableHeadCell>
            <TableHeadCell>Brand</TableHeadCell>
            <TableHeadCell>Category</TableHeadCell>
            <TableHeadCell>Price</TableHeadCell>
            <TableHeadCell>Stock</TableHeadCell>
            <TableHeadCell>Flags</TableHeadCell>
            <TableHeadCell>Actions</TableHeadCell>
          </TableHead>
          <TableBody>
            {!products || products.length === 0 ? (
              <TableEmpty icon={<Package size={32} />} title="No products" description="Add your first product" />
            ) : (
              products.map((p) => {
                const b = Array.isArray(p.brand) ? p.brand[0] as { name: string } | undefined : p.brand as { name: string } | null;
                const c = Array.isArray(p.category) ? p.category[0] as { name: string } | undefined : p.category as { name: string } | null;
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link href={`/shop/${p.slug}`} className="text-white hover:text-[#F2B705] font-medium transition-colors line-clamp-1 max-w-[180px] block">
                        {p.name}
                      </Link>
                    </TableCell>
                    <TableCell>{b?.name ?? "—"}</TableCell>
                    <TableCell>{c?.name ?? "—"}</TableCell>
                    <TableCell className="text-white font-semibold">{formatPrice(p.price)}</TableCell>
                    <TableCell>
                      <Badge variant={p.stock > 0 ? "success" : "danger"}>{p.stock}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {p.is_featured && <Badge variant="yellow">Featured</Badge>}
                        {p.is_deal && <Badge variant="warning">Deal</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Link href={`/admin/products/${p.id}/edit`} className="text-xs text-[#F2B705] hover:underline">Edit</Link>
                        <AdminProductActions productId={p.id} isFeatured={p.is_featured} isDeal={p.is_deal} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
