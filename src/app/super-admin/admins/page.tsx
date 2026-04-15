import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, TableEmpty } from "@/components/ui/Table";
import { Users } from "lucide-react";
import { SuperAdminPromoteSelect } from "@/components/super-admin/SuperAdminPromoteSelect";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Users | Super Admin" };

export default async function SuperAdminAdminsPage() {
  const supabase = await createClient();

  const { data: admins } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .in("role", ["admin", "super_admin"])
    .order("created_at", { ascending: false });

  const roleVariant: Record<string, "danger" | "yellow"> = {
    super_admin: "danger",
    admin: "yellow",
  };

  return (
    <div className="space-y-6">
      <SectionHeader label="Super Admin" title="Admin Users" />

      <div className="bg-[#0B1F3A] border border-white/8">
        <Table>
          <TableHead>
            <TableHeadCell>Email</TableHeadCell>
            <TableHeadCell>Name</TableHeadCell>
            <TableHeadCell>Role</TableHeadCell>
            <TableHeadCell>Joined</TableHeadCell>
            <TableHeadCell>Actions</TableHeadCell>
          </TableHead>
          <TableBody>
            {!admins || admins.length === 0 ? (
              <TableEmpty icon={<Users size={32} />} title="No admins found" />
            ) : (
              admins.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="text-white font-medium">{u.email}</TableCell>
                  <TableCell className="text-gray-400">{u.full_name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={roleVariant[u.role] ?? "dark"}>{u.role}</Badge>
                  </TableCell>
                  <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <SuperAdminPromoteSelect userId={u.id} currentRole={u.role} />
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
