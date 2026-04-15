import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SellerNav } from "@/components/seller/SellerNav";
import { BecomeSeller } from "@/components/seller/BecomeSeller";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/seller");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  const allowed = ["seller", "admin", "super_admin"];
  if (!profile || !allowed.includes(profile.role)) {
    return (
      <div className="min-h-screen bg-[#070F1C]">
        <BecomeSeller userId={user.id} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070F1C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-8">
          <aside className="w-52 shrink-0">
            <div className="bg-[#0B1F3A] border border-white/8 py-2">
              <SellerNav />
            </div>
          </aside>
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
