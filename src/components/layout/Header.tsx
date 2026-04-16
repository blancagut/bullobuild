"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Menu, X } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { useCartStore } from "@/store/cart";

const nav = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Brands", href: "/brands" },
  { label: "Deals", href: "/deals" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const count = useCartStore((s) => s.count);
  const toggleCart = useCartStore((s) => s.toggleCart);

  return (
    <header className="sticky top-0 z-50 border-b border-stroke bg-paper shadow-[0_10px_30px_rgba(26,35,51,0.06)]">
      <Container>
        <div className="flex items-center justify-between h-24 lg:h-28">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/main-logo.png"
              alt="BULLOBUILD"
              width={1112}
              height={489}
              className="h-16 lg:h-20 w-auto drop-shadow-[0_10px_24px_rgba(26,35,51,0.12)]"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs font-bold text-ink-soft hover:text-navy transition-colors uppercase tracking-widest"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative p-2 text-ink-soft hover:text-navy transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart size={20} />
              {count() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#f2b705] text-[#0b1f3a] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {count()}
                </span>
              )}
            </button>

            {/* Sign In */}
            <Link
              href="/auth/login"
              className="hidden lg:inline-flex items-center rounded-full bg-navy px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-navy-light"
            >
              Sign In
            </Link>

            {/* Mobile toggle */}
            <button
              className="lg:hidden p-2 text-ink-soft hover:text-navy"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-stroke bg-paper shadow-[0_20px_40px_rgba(26,35,51,0.08)]">
          <Container>
            <nav className="py-4 flex flex-col">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="border-b border-stroke px-2 py-3 text-sm font-bold uppercase tracking-widest text-ink-soft transition-colors hover:bg-panel hover:text-navy"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/auth/login"
                className="mt-4 rounded-full bg-navy px-4 py-3.5 text-center text-xs font-black uppercase tracking-widest text-white"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
}
