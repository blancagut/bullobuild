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
  searchParams: Promise<{ q?: string; brand?: string; category?: string; images?: string }>;
}) {
  const { q, brand, category, images } = await searchParams;
  const supabase = await createClient();

  const [{ data: products }, { data: brands }, { data: categories }, { count: missingImagesCount }] = await Promise.all([
    (() => {
      let query = supabase
        .from("products")
        .select("id, name, slug, price, stock, is_featured, is_deal, images, created_at, brand:brands(name), category:categories(name)")
        .order("created_at", { ascending: false });
      if (q) query = query.ilike("name", `%${q}%`);
      if (brand) query = query.eq("brand_id", brand);
      if (category) query = query.eq("category_id", category);
      if (images === "missing") query = query.eq("images", "{}");
      return query;
    })(),
    supabase.from("brands").select("id, name").order("name"),
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("images", "{}"),
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
        <select name="images" defaultValue={images} className="bg-[#0B1F3A] border border-white/10 text-white text-sm px-4 py-2 outline-none focus:border-[#F2B705]">
          <option value="">All images</option>
          <option value="missing">Missing photos only</option>
        </select>
        <button type="submit" className="bg-[#F2B705] hover:bg-[#D9A204] text-[#0B1F3A] text-xs font-black uppercase tracking-widest px-4 py-2 transition-colors">Search</button>
        {(q || brand || category || images) && <Link href="/admin/products" className="border border-white/10 text-gray-400 hover:text-white text-xs font-bold uppercase px-4 py-2 transition-colors">Clear</Link>}
      </form>

      {missingImagesCount ? (
        <Link href="/admin/products?images=missing" className="block border border-red-500/40 bg-red-500/10 text-red-200 text-sm px-4 py-3 hover:bg-red-500/20 transition-colors">
          <strong className="font-black uppercase tracking-wider">{missingImagesCount.toLocaleString()}</strong> product{missingImagesCount === 1 ? "" : "s"} have no photos — hidden from the storefront until fixed. Click to review.
        </Link>
      ) : (
        <div className="border border-emerald-500/40 bg-emerald-500/10 text-emerald-200 text-sm px-4 py-2">
          All products have at least one photo.
        </div>
      )}

      <div className="bg-[#0B1F3A] border border-white/8">
        <Table>
          <TableHead>
            <TableHeadCell>Photo</TableHeadCell>
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
                const imgs = Array.isArray(p.images) ? p.images : [];
                const hero = imgs[0];
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="relative w-12 h-12 bg-[#081629] border border-white/10 overflow-hidden flex items-center justify-center">
                          {hero ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={hero} alt="" className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-[10px] text-red-400 font-bold">NONE</span>
                          )}
                        </div>
                        <Badge variant={imgs.length === 0 ? "danger" : imgs.length < 3 ? "warning" : "success"}>{imgs.length}</Badge>
                      </div>
                    </TableCell>
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
