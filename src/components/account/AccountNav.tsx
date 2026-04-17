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
                ? "border-l-2 border-yellow bg-yellow/10 text-yellow-dark"
                : "border-l-2 border-transparent text-ink-soft hover:bg-panel hover:text-ink"
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
