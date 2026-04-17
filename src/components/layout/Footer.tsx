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
    <footer className="mt-auto border-t border-slate-800/50 bg-[#1b2a4a]">
      {/* CTA Banner */}
      <div className="border-b border-slate-700/30 bg-[radial-gradient(circle_at_top_left,rgba(242,183,5,0.08),transparent_28%)]">
        <Container>
          <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-display text-xl font-black uppercase tracking-wide text-[#ffffff]">
              Need a quote for your crew?{" "}
              <span className="font-light text-[#ffffff99]">We do bulk orders.</span>
            </p>
            <Link
              href="/contact"
              className="shrink-0 rounded-full bg-[#f2b705] px-6 py-3 text-xs font-black uppercase tracking-widest text-[#1a1a1a] transition-colors hover:bg-[#cf9500]"
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
                src="/logo-transparent.png"
                alt="BULLOBUILD"
                width={1112}
                height={489}
                className="h-14 w-auto"
              />
            </Link>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-[#ffffff99]">
              Authorized distributor of premium professional tool brands. Serving
              contractors, mechanics, and builders across the United States.
            </p>
            <div className="flex flex-col gap-3">
              {[
                { icon: MapPin, text: "Houston, Texas, United States" },
                { icon: Phone, text: "+1 (800) 776-8665" },
                { icon: Mail, text: "support@bullobuild.com" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-[#ffffff99]">
                  <Icon size={14} className="shrink-0 text-[#f2b705]" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <h4 className="mb-5 font-display text-xs font-bold uppercase tracking-[0.2em] text-[#ffffff]">
                {group}
              </h4>
              <ul className="flex flex-col gap-3">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-[#ffffff80] transition-colors hover:text-[#ffffff]"
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
        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-700/30 py-6 sm:flex-row">
          <p className="text-xs text-[#ffffff66]">
            © {new Date().getFullYear()} BULLOBUILD LLC. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
              (item) => (
                <Link
                  key={item}
                  href="#"
                  className="text-xs text-[#ffffff66] transition-colors hover:text-[#ffffff]"
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
