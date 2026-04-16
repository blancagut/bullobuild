import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, TableEmpty } from "@/components/ui/Table";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Orders | BULLOBUILD" };

const statusVariant: Record<string, "success" | "warning" | "danger" | "dark"> = {
  paid: "success",
  shipped: "dark",
  delivered: "success",
  pending: "warning",
  cancelled: "danger",
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, total, status, created_at, items")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <SectionHeader label="Account" title="My Orders" />

      <div className="bg-[#0B1F3A] border border-white/8">
        <Table>
          <TableHead>
            <TableHeadCell>Order</TableHeadCell>
            <TableHeadCell>Date</TableHeadCell>
            <TableHeadCell>Items</TableHeadCell>
            <TableHeadCell>Total</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell></TableHeadCell>
          </TableHead>
          <TableBody>
            {!orders || orders.length === 0 ? (
              <TableEmpty
                icon={<ShoppingBag size={32} />}
                title="No orders yet"
                description="Your order history will appear here"
              />
            ) : (
              orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-white">#{o.id.slice(0, 8).toUpperCase()}</TableCell>
                  <TableCell>{new Date(o.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{Array.isArray(o.items) ? o.items.length : 0} item(s)</TableCell>
                  <TableCell className="text-white font-semibold">{formatPrice(o.total)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[o.status] ?? "dark"}>{o.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/account/orders/${o.id}`} className="text-xs text-[#F2B705] hover:underline">
                      View
                    </Link>
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
