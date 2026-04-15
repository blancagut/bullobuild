import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, TableEmpty } from "@/components/ui/Table";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";
import { AdminOrderStatusSelect } from "@/components/admin/AdminOrderStatusSelect";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Orders | Admin" };

const statusVariant: Record<string, "success" | "warning" | "danger" | "dark"> = {
  paid: "success", shipped: "dark", delivered: "success", pending: "warning", cancelled: "danger",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("id, total, status, created_at, user:profiles(email)")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (q) query = query.ilike("id", `%${q}%`);

  const { data: orders } = await query;

  const statuses = ["", "pending", "paid", "shipped", "delivered", "cancelled"];

  return (
    <div className="space-y-6">
      <SectionHeader label="Admin" title="Orders" />

      <form method="GET" className="flex gap-3 flex-wrap">
        <input name="q" defaultValue={q} placeholder="Search order ID..." className="bg-[#0B1F3A] border border-white/10 text-white text-sm px-4 py-2 outline-none focus:border-[#F2B705] w-48" />
        <select name="status" defaultValue={status} className="bg-[#0B1F3A] border border-white/10 text-white text-sm px-4 py-2 outline-none focus:border-[#F2B705]">
          {statuses.map((s) => <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : "All Statuses"}</option>)}
        </select>
        <button type="submit" className="bg-[#F2B705] hover:bg-[#D9A204] text-[#0B1F3A] text-xs font-black uppercase tracking-widest px-4 py-2 transition-colors">Filter</button>
      </form>

      <div className="bg-[#0B1F3A] border border-white/8">
        <Table>
          <TableHead>
            <TableHeadCell>Order ID</TableHeadCell>
            <TableHeadCell>Customer</TableHeadCell>
            <TableHeadCell>Date</TableHeadCell>
            <TableHeadCell>Total</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell>Update</TableHeadCell>
          </TableHead>
          <TableBody>
            {!orders || orders.length === 0 ? (
              <TableEmpty icon={<ShoppingBag size={32} />} title="No orders" />
            ) : (
              orders.map((o) => {
                const user = Array.isArray(o.user) ? o.user[0] as { email: string } | undefined : o.user as { email: string } | null;
                return (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-white">#{o.id.slice(0, 8).toUpperCase()}</TableCell>
                    <TableCell className="text-gray-400 text-xs">{user?.email ?? "—"}</TableCell>
                    <TableCell>{new Date(o.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-white font-semibold">{formatPrice(o.total)}</TableCell>
                    <TableCell><Badge variant={statusVariant[o.status] ?? "dark"}>{o.status}</Badge></TableCell>
                    <TableCell><AdminOrderStatusSelect orderId={o.id} currentStatus={o.status} /></TableCell>
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
