import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, TableEmpty } from "@/components/ui/Table";
import { FileText } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Audit Logs | Super Admin" };

export default async function SuperAdminLogsPage() {
  const supabase = await createClient();

  // Try to fetch from audit_logs table if it exists, otherwise show recent admin actions inferred from orders/listings
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("id, status, created_at, user:profiles(email)")
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: recentListings } = await supabase
    .from("listings")
    .select("id, title, is_approved, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  type LogEntry = {
    id: string;
    action: string;
    entity: string;
    detail: string;
    time: string;
    type: "order" | "listing";
  };

  const logs: LogEntry[] = [
    ...(recentOrders ?? []).map((o) => {
      const u = Array.isArray(o.user) ? o.user[0] as { email: string } | undefined : o.user as { email: string } | null;
      return {
        id: o.id,
        action: "Order Updated",
        entity: `#${o.id.slice(0, 8).toUpperCase()}`,
        detail: `Status: ${o.status} · Customer: ${u?.email ?? "unknown"}`,
        time: o.created_at,
        type: "order" as const,
      };
    }),
    ...(recentListings ?? []).map((l) => ({
      id: l.id,
      action: l.is_approved ? "Listing Approved" : "Listing Submitted",
      entity: l.title,
      detail: l.is_approved ? "Approved by admin" : "Pending review",
      time: l.created_at,
      type: "listing" as const,
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 25);

  return (
    <div className="space-y-6">
      <SectionHeader label="Super Admin" title="Audit Logs" subtitle="Recent platform activity" />

      <div className="bg-[#0B1F3A] border border-white/8 border-l-2 border-l-yellow-600/30 px-5 py-3">
        <p className="text-xs text-gray-500">
          Showing inferred activity from orders and listings. Configure a database audit_logs table for full audit trail.
        </p>
      </div>

      <div className="bg-[#0B1F3A] border border-white/8">
        <Table>
          <TableHead>
            <TableHeadCell>Action</TableHeadCell>
            <TableHeadCell>Entity</TableHeadCell>
            <TableHeadCell>Detail</TableHeadCell>
            <TableHeadCell>Type</TableHeadCell>
            <TableHeadCell>Time</TableHeadCell>
          </TableHead>
          <TableBody>
            {logs.length === 0 ? (
              <TableEmpty icon={<FileText size={32} />} title="No logs" description="Activity will appear here" />
            ) : (
              logs.map((l, i) => (
                <TableRow key={`${l.id}-${i}`}>
                  <TableCell className="text-white font-medium text-xs">{l.action}</TableCell>
                  <TableCell className="font-mono text-gray-400 text-xs line-clamp-1 max-w-[150px]">{l.entity}</TableCell>
                  <TableCell className="text-gray-500 text-xs">{l.detail}</TableCell>
                  <TableCell>
                    <Badge variant={l.type === "order" ? "dark" : "warning"} className="text-[9px]">{l.type}</Badge>
                  </TableCell>
                  <TableCell className="text-gray-600 text-xs">
                    {new Date(l.time).toLocaleString()}
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
