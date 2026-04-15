import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, TableEmpty } from "@/components/ui/Table";
import { Tag } from "lucide-react";
import { AdminBrandActions } from "@/components/admin/AdminBrandActions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Brands | Admin" };

export default async function AdminBrandsPage() {
  const supabase = await createClient();
  const { data: brands } = await supabase
    .from("brands")
    .select("id, name, slug, logo_url, is_authorized")
    .order("name");

  return (
    <div className="space-y-6">
      <SectionHeader label="Admin" title="Brands" />

      <div className="bg-[#0B1F3A] border border-white/8">
        <Table>
          <TableHead>
            <TableHeadCell>Name</TableHeadCell>
            <TableHeadCell>Slug</TableHeadCell>
            <TableHeadCell>Logo URL</TableHeadCell>
            <TableHeadCell>Authorized</TableHeadCell>
            <TableHeadCell>Actions</TableHeadCell>
          </TableHead>
          <TableBody>
            {!brands || brands.length === 0 ? (
              <TableEmpty icon={<Tag size={32} />} title="No brands" />
            ) : (
              brands.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="text-white font-bold">{b.name}</TableCell>
                  <TableCell className="font-mono text-gray-400 text-xs">{b.slug}</TableCell>
                  <TableCell>
                    <span className="text-gray-500 text-xs line-clamp-1 max-w-[200px] block">
                      {b.logo_url ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs font-bold uppercase ${b.is_authorized ? "text-green-400" : "text-gray-600"}`}>
                      {b.is_authorized ? "Yes" : "No"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <AdminBrandActions brandId={b.id} isAuthorized={b.is_authorized} logoUrl={b.logo_url ?? ""} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
