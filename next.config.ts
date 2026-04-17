import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "cdn.makitatools.com" },
      { protocol: "https", hostname: "assets.craftsman.com" },
      { protocol: "https", hostname: "assets.dewalt.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "www.milwaukeetool.com" },
      { protocol: "https", hostname: "cnhi-p-001-delivery.sitecorecontenthub.cloud" },
      { protocol: "https", hostname: "www.dewalt.com" },
      { protocol: "https", hostname: "www.stanleytools.com" },
    ],
  },
};

export default nextConfig;
