import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountNav } from "@/components/account/AccountNav";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/account");
  }

  return (
    <div className="min-h-screen bg-[#070F1C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-8">
          <aside className="w-52 shrink-0">
            <div className="bg-[#0B1F3A] border border-white/8 py-2">
              <AccountNav />
            </div>
          </aside>
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
