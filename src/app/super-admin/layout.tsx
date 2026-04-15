import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminNav } from "@/components/super-admin/SuperAdminNav";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "super_admin") {
    redirect(profile?.role === "admin" ? "/admin" : "/");
  }

  return (
    <div className="min-h-screen bg-[#070F1C]">
      <div className="bg-[#0B1F3A] border-b border-white/8 px-6 py-3">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">
          ⚡ Super Admin Console
        </span>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-8">
          <aside className="w-52 shrink-0">
            <div className="bg-[#0B1F3A] border border-white/8 border-l-2 border-l-red-600 py-2">
              <SuperAdminNav />
            </div>
          </aside>
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
