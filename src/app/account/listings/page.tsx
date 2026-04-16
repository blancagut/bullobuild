import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, TableEmpty } from "@/components/ui/Table";
import { formatPrice } from "@/lib/utils";
import { List } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { DeleteListingButton } from "@/components/account/DeleteListingButton";

export const metadata: Metadata = { title: "My Listings | BULLOBUILD" };

export default async function AccountListingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, price, condition, is_approved, is_sold, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <SectionHeader
        label="Account"
        title="My Listings"
        action={
          <Link
            href="/marketplace/sell"
            className="inline-flex items-center gap-2 bg-[#F2B705] hover:bg-[#D9A204] text-[#0B1F3A] text-xs font-black uppercase tracking-widest px-4 py-2 transition-colors"
          >
            + New Listing
          </Link>
        }
      />

      <div className="bg-[#0B1F3A] border border-white/8">
        <Table>
          <TableHead>
            <TableHeadCell>Title</TableHeadCell>
            <TableHeadCell>Price</TableHeadCell>
            <TableHeadCell>Condition</TableHeadCell>
            <TableHeadCell>Approved</TableHeadCell>
            <TableHeadCell>Sold</TableHeadCell>
            <TableHeadCell>Date</TableHeadCell>
            <TableHeadCell></TableHeadCell>
          </TableHead>
          <TableBody>
            {!listings || listings.length === 0 ? (
              <TableEmpty
                icon={<List size={32} />}
                title="No listings yet"
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
                    <Badge variant={l.is_approved ? "success" : "warning"}>
                      {l.is_approved ? "Approved" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={l.is_sold ? "danger" : "dark"}>
                      {l.is_sold ? "Sold" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(l.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DeleteListingButton listingId={l.id} />
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
