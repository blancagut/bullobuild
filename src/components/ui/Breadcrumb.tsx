import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1.5 flex-wrap", className)}
    >
      <Link href="/" className="text-gray-600 hover:text-gray-400 transition-colors">
        <Home size={12} />
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight size={11} className="text-gray-700" />
          {item.href && i < items.length - 1 ? (
            <Link
              href={item.href}
              className="text-[11px] text-gray-500 hover:text-gray-300 uppercase tracking-widest transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[11px] text-gray-400 uppercase tracking-widest">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
