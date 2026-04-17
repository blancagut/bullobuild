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
      className={`sticky top-0 z-50 border-b border-slate-800/50 bg-[#1b2a4a] shadow-[0_12px_34px_rgba(0,10,30,0.3)] backdrop-blur transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <Container>
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/logo-transparent.png"
              alt="BULLOBUILD"
              width={1112}
              height={489}
              className="h-11 w-auto lg:h-12"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs font-bold uppercase tracking-widest text-[#ffffffcc] transition-colors hover:text-[#ffffff]"
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
              className="relative p-2 text-[#ffffffcc] transition-colors hover:text-[#ffffff]"
              aria-label="Open cart"
            >
              <ShoppingCart size={20} />
              {count() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-yellow text-[10px] leading-none font-black text-ink">
                  {count()}
                </span>
              )}
            </button>

            {/* Sign In */}
            <Link
              href="/auth/login"
              className="hidden lg:inline-flex items-center rounded-full bg-yellow px-5 py-2.5 text-xs font-black uppercase tracking-widest text-ink transition-colors hover:bg-yellow-dark"
            >
              Sign In
            </Link>

            {/* Mobile toggle */}
            <button
              className="p-2 text-[#ffffffcc] transition-colors hover:text-[#ffffff] lg:hidden"
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
        <div className="border-t border-slate-700/40 bg-[#1b2a4a] lg:hidden">
          <Container>
            <nav className="py-4 flex flex-col">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="border-b border-slate-700/30 px-2 py-3 text-sm font-bold uppercase tracking-widest text-[#ffffffcc] transition-colors hover:bg-[#ffffff1a] hover:text-[#ffffff]"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/auth/login"
                className="mt-4 rounded-full bg-yellow px-4 py-3.5 text-center text-xs font-black uppercase tracking-widest text-ink"
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
