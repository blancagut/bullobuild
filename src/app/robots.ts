import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/super-admin/", "/api/", "/account/", "/seller/"],
      },
    ],
    sitemap: "https://protoolmarket.com/sitemap.xml",
  };
}
