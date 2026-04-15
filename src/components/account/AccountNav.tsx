"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User, Package, List, Heart, Settings } from "lucide-react";

const navLinks = [
  { href: "/account", label: "Overview", icon: User, exact: true },
  { href: "/account/orders", label: "My Orders", icon: Package },
  { href: "/account/listings", label: "My Listings", icon: List },
  { href: "/account/saved", label: "Saved", icon: Heart },
  { href: "/account/profile", label: "Profile", icon: Settings },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-0.5">
      {navLinks.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-[#F2B705]/10 text-[#F2B705] border-l-2 border-[#F2B705]"
                : "text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
            )}
          >
            <Icon size={15} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
