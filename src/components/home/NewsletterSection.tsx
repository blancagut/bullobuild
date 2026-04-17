"use client";

import { useState } from "react";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/Container";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || status === "submitting") return;
    setStatus("submitting");
    try {
      // TODO: wire to a real newsletter endpoint once available.
      await new Promise((resolve) => setTimeout(resolve, 400));
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="border-y border-stroke bg-canvas py-16 lg:py-20">
      <Container>
        <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-stroke bg-white p-8 shadow-sm sm:p-10">
          <div className="grid gap-8 md:grid-cols-[auto_minmax(0,1fr)] md:items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow text-ink">
              <Mail size={24} />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-yellow-dark">
                Deal alerts
              </p>
              <h2 className="font-display mt-2 text-3xl font-black uppercase leading-tight text-ink sm:text-4xl">
                Get price drops in your inbox
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                One short email a week: the best deals on Milwaukee, DeWalt, Makita, Mac Tools and more. No spam, unsubscribe anytime.
              </p>

              {status === "success" ? (
                <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 size={16} />
                  You&apos;re on the list. Watch your inbox.
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"
                >
                  <label htmlFor="newsletter-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@company.com"
                    className="h-12 min-w-0 flex-1 rounded-full border border-stroke bg-card px-5 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-yellow"
                  />
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-yellow px-6 text-sm font-black uppercase tracking-[0.18em] text-ink transition-colors hover:bg-yellow-dark disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === "submitting" ? "Sending…" : "Get deals"}
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}

              {status === "error" ? (
                <p className="mt-3 text-xs font-semibold text-red-600">
                  Something went wrong. Please try again.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
