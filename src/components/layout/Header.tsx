"use client";

import { useState, useEffect, useRef } from "react";
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
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const count = useCartStore((s) => s.count);
  const toggleCart = useCartStore((s) => s.toggleCart);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      if (y < 80) {
        setVisible(true);
      } else if (y > lastScrollY.current) {
        setVisible(false); // scrolling down → hide
      } else {
        setVisible(true); // scrolling up → show
      }
      lastScrollY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-navy shadow-lg transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <Container>
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/tranparentlogo.png"
              alt="BULLOBUILD"
              width={1112}
              height={489}
              className="h-12 lg:h-14 w-auto"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs font-bold text-white/70 hover:text-white transition-colors uppercase tracking-widest"
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
              className="relative p-2 text-white/70 hover:text-white transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart size={20} />
              {count() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-yellow text-[#0b1f3a] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {count()}
                </span>
              )}
            </button>

            {/* Sign In */}
            <Link
              href="/auth/login"
              className="hidden lg:inline-flex items-center rounded-full bg-yellow px-5 py-2.5 text-xs font-black uppercase tracking-widest text-[#0b1f3a] transition-colors hover:bg-yellow-dark"
            >
              Sign In
            </Link>

            {/* Mobile toggle */}
            <button
              className="lg:hidden p-2 text-white/70 hover:text-white"
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
        <div className="lg:hidden border-t border-white/10 bg-[#0b1f3a]">
          <Container>
            <nav className="py-4 flex flex-col">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="border-b border-white/10 px-2 py-3 text-sm font-bold uppercase tracking-widest text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/auth/login"
                className="mt-4 rounded-full bg-yellow px-4 py-3.5 text-center text-xs font-black uppercase tracking-widest text-[#0b1f3a]"
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
