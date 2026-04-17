"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Zap, ArrowRight } from "lucide-react";

export function MobileStickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      // Show after user scrolls ~1 viewport, hide once near footer.
      const scrolled = window.scrollY;
      const viewport = window.innerHeight;
      const bottomOffset =
        document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
      setVisible(scrolled > viewport * 0.6 && bottomOffset > 220);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className={`pointer-events-none mobile-sticky-cta fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-4 transition-all duration-200 md:hidden ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
      aria-hidden={visible ? "false" : "true"}
    >
      <Link
        href="/deals"
        className="pointer-events-auto inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-full bg-yellow px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-ink shadow-lg shadow-black/10 transition-colors hover:bg-yellow-dark"
      >
        <Zap size={16} />
        Shop today&apos;s deals
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
