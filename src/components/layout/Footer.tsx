import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";

const links: Record<string, { label: string; href: string }[]> = {
  Shop: [
    { label: "New Tools", href: "/shop" },
    { label: "Pre-Owned", href: "/marketplace" },
    { label: "Weekly Deals", href: "/deals" },
    { label: "All Brands", href: "/brands" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
  ],
  Support: [
    { label: "FAQ", href: "/faq" },
    { label: "Shipping Policy", href: "/shipping" },
    { label: "Returns", href: "/returns" },
    { label: "Warranty", href: "/warranty" },
  ],
  Sellers: [
    { label: "Sell on BULLOBUILD", href: "/marketplace/sell" },
    { label: "Seller Dashboard", href: "/dashboard" },
    { label: "Seller Guidelines", href: "/seller-guidelines" },
    { label: "Verified Sellers", href: "/verified-sellers" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#070f1c] border-t border-white/5 mt-auto">
      {/* CTA Banner */}
      <div className="bg-[#f2b705]">
        <Container>
          <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p
              className="font-black text-xl uppercase tracking-wide text-[#0b1f3a]"
              style={{ fontFamily: "var(--font-barlow), system-ui" }}
            >
              Need a quote for your crew?{" "}
              <span className="font-light">We do bulk orders.</span>
            </p>
            <Link
              href="/contact"
              className="shrink-0 text-xs font-black text-[#f2b705] bg-[#0b1f3a] hover:bg-black px-6 py-3 uppercase tracking-widest transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </Container>
      </div>

      <Container>
        {/* Main footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-5 inline-flex items-center">
              <Image
                src="/logo.png"
                alt="BULLOBUILD"
                width={756}
                height={330}
                className="h-16 w-auto drop-shadow-[0_10px_24px_rgba(0,0,0,0.45)] brightness-110 contrast-125"
              />
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-xs">
              Authorized distributor of premium professional tool brands. Serving
              contractors, mechanics, and builders across the United States.
            </p>
            <div className="flex flex-col gap-3">
              {[
                { icon: MapPin, text: "Houston, Texas, United States" },
                { icon: Phone, text: "+1 (800) 776-8665" },
                { icon: Mail, text: "support@bullobuild.com" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-gray-500">
                  <Icon size={14} className="text-[#f2b705] shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <h4
                className="font-bold text-xs uppercase tracking-[0.2em] text-gray-400 mb-5"
                style={{ fontFamily: "var(--font-barlow), system-ui" }}
              >
                {group}
              </h4>
              <ul className="flex flex-col gap-3">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-600 hover:text-gray-300 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} BULLOBUILD LLC. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
              (item) => (
                <Link
                  key={item}
                  href="#"
                  className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                >
                  {item}
                </Link>
              )
            )}
          </div>
        </div>
      </Container>
    </footer>
  );
}
