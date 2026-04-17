import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string>;
  className?: string;
}

function buildUrl(
  base: string,
  page: number,
  params: Record<string, string>
) {
  const p = new URLSearchParams({ ...params, page: String(page) });
  return `${base}?${p.toString()}`;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams = {},
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Build page numbers with ellipsis
  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  const btnBase =
    "flex h-9 w-9 items-center justify-center text-sm font-bold transition-colors";

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1", className)}
    >
      {currentPage > 1 ? (
        <Link
          href={buildUrl(basePath, currentPage - 1, searchParams)}
          className={cn(btnBase, "border border-stroke text-ink-soft hover:border-yellow/30 hover:bg-panel hover:text-ink")}
          aria-label="Previous page"
        >
          <ChevronLeft size={15} />
        </Link>
      ) : (
        <span className={cn(btnBase, "cursor-not-allowed border border-stroke text-ink-muted")}>
          <ChevronLeft size={15} />
        </span>
      )}

      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`ellipsis-${i}`} className={cn(btnBase, "cursor-default text-ink-muted")}>
            …
          </span>
        ) : (
          <Link
            key={page}
            href={buildUrl(basePath, page, searchParams)}
            className={cn(
              btnBase,
              page === currentPage
                ? "bg-yellow text-ink"
                : "border border-stroke text-ink-soft hover:border-yellow/30 hover:bg-panel hover:text-ink"
            )}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </Link>
        )
      )}

      {currentPage < totalPages ? (
        <Link
          href={buildUrl(basePath, currentPage + 1, searchParams)}
          className={cn(btnBase, "border border-stroke text-ink-soft hover:border-yellow/30 hover:bg-panel hover:text-ink")}
          aria-label="Next page"
        >
          <ChevronRight size={15} />
        </Link>
      ) : (
        <span className={cn(btnBase, "cursor-not-allowed border border-stroke text-ink-muted")}>
          <ChevronRight size={15} />
        </span>
      )}
    </nav>
  );
}
