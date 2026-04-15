import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, TableEmpty } from "@/components/ui/Table";
import { Users } from "lucide-react";
import { AdminUserRoleSelect } from "@/components/admin/AdminUserRoleSelect";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Users | Admin" };

const roleVariant: Record<string, "yellow" | "success" | "dark" | "danger"> = {
  super_admin: "danger",
  admin: "yellow",
  seller: "success",
  user: "dark",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: false });

  if (q) query = query.ilike("email", `%${q}%`);

  const { data: users } = await query;

  return (
    <div className="space-y-6">
      <SectionHeader label="Admin" title="Users" />

      <form method="GET" className="flex gap-3">
        <input name="q" defaultValue={q} placeholder="Search by email..." className="bg-[#0B1F3A] border border-white/10 text-white text-sm px-4 py-2 outline-none focus:border-[#F2B705] w-64" />
        <button type="submit" className="bg-[#F2B705] hover:bg-[#D9A204] text-[#0B1F3A] text-xs font-black uppercase tracking-widest px-4 py-2 transition-colors">Search</button>
      </form>

      <div className="bg-[#0B1F3A] border border-white/8">
        <Table>
          <TableHead>
            <TableHeadCell>Email</TableHeadCell>
            <TableHeadCell>Name</TableHeadCell>
            <TableHeadCell>Role</TableHeadCell>
            <TableHeadCell>Joined</TableHeadCell>
            <TableHeadCell>Change Role</TableHeadCell>
          </TableHead>
          <TableBody>
            {!users || users.length === 0 ? (
              <TableEmpty icon={<Users size={32} />} title="No users found" />
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="text-white font-medium">{u.email}</TableCell>
                  <TableCell className="text-gray-400">{u.full_name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={roleVariant[u.role] ?? "dark"}>{u.role}</Badge>
                  </TableCell>
                  <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <AdminUserRoleSelect userId={u.id} currentRole={u.role} />
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
