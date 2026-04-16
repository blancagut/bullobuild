"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSeller, setIsSeller] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  }

  return (
    <div className="min-h-screen bg-[#070f1c] flex items-center justify-center py-16">
      <Container className="max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex">
            <Image
              src="/main-logo.png"
              alt="BULLOBUILD"
              width={1112}
              height={489}
              className="h-14 w-auto drop-shadow-[0_10px_24px_rgba(0,0,0,0.45)] brightness-110 contrast-125"
            />
          </Link>
        </div>

        <div className="bg-[#0b1f3a] border border-white/5 p-8">
          <h1
            className="font-black text-2xl uppercase text-white mb-1 tracking-tight"
            style={{ fontFamily: "var(--font-barlow), system-ui" }}
          >
            Create Account
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#f2b705] hover:underline">
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                autoComplete="name"
                className="w-full bg-[#070f1c] border border-white/10 focus:border-[#f2b705] text-white text-sm px-4 py-3 outline-none transition-colors"
                placeholder="John Smith"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                className="w-full bg-[#070f1c] border border-white/10 focus:border-[#f2b705] text-white text-sm px-4 py-3 outline-none transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full bg-[#070f1c] border border-white/10 focus:border-[#f2b705] text-white text-sm px-4 py-3 pr-11 outline-none transition-colors"
                  placeholder="Min. 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Seller toggle */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isSeller}
                onChange={(e) => setIsSeller(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#f2b705]"
              />
              <div>
                <p className="text-sm text-white font-semibold">
                  I want to sell tools on the marketplace
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Your account will be reviewed for seller verification.
                </p>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#f2b705] hover:bg-[#d9a204] disabled:opacity-60 text-[#0b1f3a] font-black text-xs uppercase tracking-widest py-4 transition-colors mt-2"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

            <p className="text-[10px] text-gray-600 text-center leading-relaxed">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-gray-400">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-gray-400">
                Privacy Policy
              </Link>
              .
            </p>
          </form>
        </div>
      </Container>
    </div>
  );
}
