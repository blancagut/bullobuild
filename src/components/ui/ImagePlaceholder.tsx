/**
 * ImagePlaceholder — defense-in-depth fallback for product cards / galleries.
 *
 * The storefront filters, DB stock gating, and importer guards should ensure
 * this component is NEVER rendered in production. We keep it as a last-resort
 * so a future regression never surfaces a blank white square to a customer,
 * and we emit a warning so the issue gets noticed immediately.
 */
"use client";
import { useEffect } from "react";

export function ImagePlaceholder({ slug, brand }: { slug?: string; brand?: string }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-console
      console.warn(
        `[ImagePlaceholder] Rendered for product ${slug ?? "?"} (brand: ${brand ?? "?"}). This should never happen — investigate the image pipeline.`,
      );
    }
  }, [slug, brand]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-wash to-white p-4 text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="h-10 w-10 text-gray-400"
        aria-hidden
      >
        <rect x={3} y={3} width={18} height={18} rx={2} />
        <circle cx={8.5} cy={8.5} r={1.5} />
        <path d="M21 15l-5-5L5 21" />
      </svg>
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Image coming soon
      </span>
      {brand && <span className="text-[10px] uppercase text-gray-400">{brand}</span>}
    </div>
  );
}
