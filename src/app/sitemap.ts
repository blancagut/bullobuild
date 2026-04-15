import { createClient } from "@/lib/supabase/server";
import type { MetadataRoute } from "next";

const BASE_URL = "https://protoolmarket.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: products }, { data: brands }] = await Promise.all([
    supabase.from("products").select("slug, updated_at").eq("is_active", true),
    supabase.from("brands").select("slug, updated_at").eq("is_authorized", true),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/marketplace`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE_URL}/marketplace/sell`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/brands`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/auth/login`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/auth/register`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  const productRoutes: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${BASE_URL}/marketplace/${p.slug}`,
    lastModified: new Date(p.updated_at ?? Date.now()),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const brandRoutes: MetadataRoute.Sitemap = (brands ?? []).map((b) => ({
    url: `${BASE_URL}/brands/${b.slug}`,
    lastModified: new Date(b.updated_at ?? Date.now()),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes, ...brandRoutes];
}
