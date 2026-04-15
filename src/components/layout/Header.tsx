"use client";

import { useState } from "react";
import Link from "next/link";
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
    <header className="sticky top-0 z-50 bg-[#070f1c]/95 backdrop-blur-md border-b border-white/5">
      <Container>
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-baseline gap-0 shrink-0">
            <span
              className="font-black text-2xl lg:text-3xl tracking-tight text-white uppercase leading-none"
              style={{ fontFamily: "var(--font-barlow), system-ui, sans-serif" }}
            >
              PROTOOL
            </span>
            <span
              className="font-light text-sm lg:text-sm tracking-[0.3em] text-[#f2b705] uppercase ml-2"
              style={{ fontFamily: "var(--font-barlow), system-ui, sans-serif" }}
            >
              MARKET
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest"
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
              className="relative p-2 text-gray-400 hover:text-white transition-colors"
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
              className="hidden lg:inline-flex items-center text-xs font-black text-[#0b1f3a] bg-[#f2b705] hover:bg-[#d9a204] px-5 py-2.5 transition-colors uppercase tracking-widest"
            >
              Sign In
            </Link>

            {/* Mobile toggle */}
            <button
              className="lg:hidden p-2 text-gray-400 hover:text-white"
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
        <div className="lg:hidden bg-[#070f1c] border-t border-white/5">
          <Container>
            <nav className="py-4 flex flex-col">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="py-3 px-2 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors uppercase tracking-widest border-b border-white/5"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/auth/login"
                className="mt-4 text-center text-xs font-black text-[#0b1f3a] bg-[#f2b705] px-4 py-3.5 uppercase tracking-widest"
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
