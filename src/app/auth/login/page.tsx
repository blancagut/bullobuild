"use client";

import Link from "next/link";
import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // Supabase auth will be wired once env is configured
    setTimeout(() => setLoading(false), 1000);
  }

  return (
    <div className="min-h-screen bg-[#070f1c] flex items-center justify-center py-16">
      <Container className="max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-baseline gap-0">
            <span
              className="font-black text-3xl tracking-tight text-white uppercase"
              style={{ fontFamily: "var(--font-barlow), system-ui" }}
            >
              PROTOOL
            </span>
            <span
              className="font-light text-sm tracking-[0.3em] text-[#f2b705] uppercase ml-2"
              style={{ fontFamily: "var(--font-barlow), system-ui" }}
            >
              MARKET
            </span>
          </Link>
        </div>

        <div className="bg-[#0b1f3a] border border-white/5 p-8">
          <h1
            className="font-black text-2xl uppercase text-white mb-1 tracking-tight"
            style={{ fontFamily: "var(--font-barlow), system-ui" }}
          >
            Sign In
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="text-[#f2b705] hover:underline"
            >
              Create one
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                  autoComplete="current-password"
                  className="w-full bg-[#070f1c] border border-white/10 focus:border-[#f2b705] text-white text-sm px-4 py-3 pr-11 outline-none transition-colors"
                  placeholder="••••••••"
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
              <div className="mt-2 text-right">
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-gray-600 hover:text-gray-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#f2b705] hover:bg-[#d9a204] disabled:opacity-60 text-[#0b1f3a] font-black text-xs uppercase tracking-widest py-4 transition-colors mt-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </Container>
    </div>
  );
}
