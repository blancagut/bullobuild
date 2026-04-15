import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, TableEmpty } from "@/components/ui/Table";
import { formatPrice } from "@/lib/utils";
import { List } from "lucide-react";
import Link from "next/link";
import { AdminListingActions } from "@/components/admin/AdminListingActions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Listings | Admin" };

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select("id, title, price, condition, is_approved, is_sold, created_at, user:profiles(email)")
    .order("created_at", { ascending: false });

  if (filter === "pending") query = query.eq("is_approved", false).eq("is_sold", false);
  else if (filter === "approved") query = query.eq("is_approved", true).eq("is_sold", false);
  else if (filter === "sold") query = query.eq("is_sold", true);

  const { data: listings } = await query;

  const filters = [
    { label: "All", value: "" },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Sold", value: "sold" },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader label="Admin" title="Listings" />

      <div className="flex gap-2">
        {filters.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/admin/listings?filter=${f.value}` : "/admin/listings"}
            className={`text-xs font-bold uppercase tracking-wider px-4 py-2 border transition-colors ${
              (filter ?? "") === f.value
                ? "border-[#F2B705] text-[#F2B705] bg-[#F2B705]/10"
                : "border-white/10 text-gray-500 hover:text-white"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="bg-[#0B1F3A] border border-white/8">
        <Table>
          <TableHead>
            <TableHeadCell>Title</TableHeadCell>
            <TableHeadCell>Seller</TableHeadCell>
            <TableHeadCell>Price</TableHeadCell>
            <TableHeadCell>Condition</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell>Date</TableHeadCell>
            <TableHeadCell>Actions</TableHeadCell>
          </TableHead>
          <TableBody>
            {!listings || listings.length === 0 ? (
              <TableEmpty icon={<List size={32} />} title="No listings" />
            ) : (
              listings.map((l) => {
                const seller = Array.isArray(l.user) ? l.user[0] as { email: string } | undefined : l.user as { email: string } | null;
                return (
                  <TableRow key={l.id}>
                    <TableCell>
                      <Link href={`/marketplace/${l.id}`} className="text-white hover:text-[#F2B705] transition-colors font-medium line-clamp-1 max-w-[180px] block">
                        {l.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-gray-400 text-xs">{seller?.email ?? "—"}</TableCell>
                    <TableCell className="text-white font-semibold">{formatPrice(l.price)}</TableCell>
                    <TableCell><Badge variant="dark" className="capitalize">{l.condition.replace("_", " ")}</Badge></TableCell>
                    <TableCell>
                      {l.is_sold ? <Badge variant="danger">Sold</Badge>
                        : l.is_approved ? <Badge variant="success">Approved</Badge>
                        : <Badge variant="warning">Pending</Badge>}
                    </TableCell>
                    <TableCell>{new Date(l.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <AdminListingActions listingId={l.id} isApproved={l.is_approved} />
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
