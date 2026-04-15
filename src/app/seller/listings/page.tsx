import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, TableEmpty } from "@/components/ui/Table";
import { formatPrice } from "@/lib/utils";
import { List } from "lucide-react";
import Link from "next/link";
import { DeleteListingButton } from "@/components/account/DeleteListingButton";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Listings | Seller" };

export default async function SellerListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("listings")
    .select("id, title, price, condition, is_approved, is_sold, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  if (status === "pending") query = query.eq("is_approved", false).eq("is_sold", false);
  else if (status === "approved") query = query.eq("is_approved", true).eq("is_sold", false);
  else if (status === "sold") query = query.eq("is_sold", true);

  const { data: listings } = await query;

  const filters = [
    { label: "All", value: "" },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Sold", value: "sold" },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        label="Seller"
        title="My Listings"
        action={
          <Link
            href="/seller/listings/new"
            className="inline-flex items-center gap-2 bg-[#F2B705] hover:bg-[#D9A204] text-[#0B1F3A] text-xs font-black uppercase tracking-widest px-4 py-2 transition-colors"
          >
            + New Listing
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/seller/listings?status=${f.value}` : "/seller/listings"}
            className={`text-xs font-bold uppercase tracking-wider px-4 py-2 border transition-colors ${
              (status ?? "") === f.value
                ? "border-[#F2B705] text-[#F2B705] bg-[#F2B705]/10"
                : "border-white/10 text-gray-500 hover:text-white hover:border-white/30"
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
            <TableHeadCell>Price</TableHeadCell>
            <TableHeadCell>Condition</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell>Date</TableHeadCell>
            <TableHeadCell>Actions</TableHeadCell>
          </TableHead>
          <TableBody>
            {!listings || listings.length === 0 ? (
              <TableEmpty
                icon={<List size={32} />}
                title="No listings"
                description="Create your first listing to start selling"
              />
            ) : (
              listings.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>
                    <Link href={`/marketplace/${l.id}`} className="text-white hover:text-[#F2B705] transition-colors font-medium line-clamp-1 max-w-[200px] block">
                      {l.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-white font-semibold">{formatPrice(l.price)}</TableCell>
                  <TableCell>
                    <Badge variant="dark" className="capitalize">{l.condition.replace("_", " ")}</Badge>
                  </TableCell>
                  <TableCell>
                    {l.is_sold ? (
                      <Badge variant="danger">Sold</Badge>
                    ) : l.is_approved ? (
                      <Badge variant="success">Live</Badge>
                    ) : (
                      <Badge variant="warning">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell>{new Date(l.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Link href={`/seller/listings/${l.id}/edit`} className="text-xs text-[#F2B705] hover:underline">
                        Edit
                      </Link>
                      <DeleteListingButton listingId={l.id} />
                    </div>
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
