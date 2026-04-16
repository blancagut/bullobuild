"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";
import { Container } from "@/components/ui/Container";

const AUTO_ROTATE_MS = 6000;

const heroSlides = [
  { id: "concrete", image: "/hero/slide-1.jpg", label: "Concrete" },
  { id: "grinders", image: "/hero/slide-2.jpg", label: "Grinding" },
  { id: "outdoor", image: "/hero/slide-3.jpg", label: "Outdoor" },
  { id: "race", image: "/hero/slide-4.jpg", label: "Performance" },
];

const stats = [
  { value: "10+", label: "Premium Brands" },
  { value: "5,000+", label: "Products" },
  { value: "100%", label: "Authentic" },
  { value: "48h", label: "Avg. Delivery" },
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, AUTO_ROTATE_MS);

    return () => window.clearTimeout(timer);
  }, [currentSlide]);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#070f1c]">
      <div className="absolute inset-0">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
            style={{ backgroundImage: `url(${slide.image})` }}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-[#070f1c]/58" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#070f1c]/88 via-[#070f1c]/68 to-[#070f1c]/35" aria-hidden="true" />

      {/* Industrial grid background */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
        aria-hidden="true"
      />

      {/* Yellow top bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#f2b705]" aria-hidden="true" />

      {/* Left yellow accent */}
      <div className="absolute left-0 top-1/4 h-48 w-1 bg-[#f2b705]" aria-hidden="true" />

      {/* Watermark */}
      <div
        className="absolute right-[-2rem] top-1/2 -translate-y-1/2 pointer-events-none select-none hidden xl:block"
        aria-hidden="true"
      >
        <span
          className="font-black text-[22vw] uppercase text-white/[0.022] leading-none tracking-tight"
          style={{ fontFamily: "var(--font-barlow), system-ui" }}
        >
          TOOLS
        </span>
      </div>

      <Container className="relative z-10 py-24">
        <div className="max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#f2b705]/10 border border-[#f2b705]/30 px-4 py-2 mb-8">
            <Shield size={13} className="text-[#f2b705]" />
            <span className="text-[11px] font-bold text-[#f2b705] uppercase tracking-[0.3em]">
              Authorized Distributor · 10 Premium Brands
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-black text-[4rem] sm:text-[5.5rem] lg:text-[7.5rem] xl:text-[9rem] uppercase leading-[0.88] tracking-tight text-white mb-6"
            style={{ fontFamily: "var(--font-barlow), system-ui" }}
          >
            Professional
            <br />
            <span className="text-[#f2b705]">Tools.</span>
            <br />
            Trusted
            <span className="text-[#f2b705]">.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-gray-400 max-w-xl mb-10 font-light leading-relaxed">
            Authorized distributor of the world&apos;s top tool brands. New
            inventory, competitive pricing, fast delivery across the US.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 mb-16">
            <Link
              href="/shop"
              className="inline-flex items-center gap-3 bg-[#f2b705] hover:bg-[#d9a204] text-[#0b1f3a] font-black text-xs uppercase tracking-widest px-8 py-4 transition-colors group"
            >
              Shop Tools
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              href="/brands"
              className="inline-flex items-center gap-3 border border-white/25 hover:border-white text-white font-bold text-xs uppercase tracking-widest px-8 py-4 transition-colors"
            >
              View Brands
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 border-t border-white/10 pt-10">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <span
                  className="font-black text-3xl text-[#f2b705] leading-none"
                  style={{ fontFamily: "var(--font-barlow), system-ui" }}
                >
                  {stat.value}
                </span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center gap-3">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentSlide(index)}
                className={`group flex items-center gap-3 ${
                  index === currentSlide ? "opacity-100" : "opacity-55 hover:opacity-80"
                }`}
                aria-label={`Show ${slide.label} slide`}
              >
                <span
                  className={`block h-[2px] transition-all ${
                    index === currentSlide ? "w-14 bg-[#f2b705]" : "w-8 bg-white/35"
                  }`}
                />
                <span className="text-[10px] uppercase tracking-[0.28em] text-white/70">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Container>

      {/* Corner label - removed, icon only as favicon */}
    </section>
  );
}
