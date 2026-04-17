"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, UserCog, Settings, FileText, Shield } from "lucide-react";

const navLinks = [
  { href: "/super-admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/super-admin/admins", label: "Admin Users", icon: UserCog },
  { href: "/super-admin/settings", label: "Settings", icon: Settings },
  { href: "/super-admin/logs", label: "Audit Logs", icon: FileText },
  { href: "/admin", label: "Admin Panel ↗", icon: Shield },
];

export function SuperAdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-0.5">
      {navLinks.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href) && href !== "/admin";
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors",
              active
                ? "-ml-0.5 border-l-2 border-red-300 bg-red-50 text-red-700"
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
