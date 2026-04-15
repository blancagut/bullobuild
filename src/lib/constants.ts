export const SITE_NAME = "ProTool Market";
export const SITE_DESCRIPTION =
  "Authorized distributor of professional tool brands. Shop DeWalt, Milwaukee, Snap-on, Mac Tools, and more.";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://protoolmarket.com";
export const SUPER_ADMIN_EMAIL = "renvagu1@icloud.com";

export const BRANDS = [
  { name: "DeWalt", slug: "dewalt" },
  { name: "Milwaukee", slug: "milwaukee" },
  { name: "Craftsman", slug: "craftsman" },
  { name: "Stanley", slug: "stanley" },
  { name: "Black+Decker", slug: "black-decker" },
  { name: "Snap-on", slug: "snap-on" },
  { name: "Mac Tools", slug: "mac-tools" },
  { name: "Kobalt", slug: "kobalt" },
  { name: "Skil", slug: "skil" },
  { name: "Proto", slug: "proto" },
] as const;

export const LISTING_CONDITIONS = [
  { value: "like_new", label: "Like New" },
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
] as const;

export const USER_ROLES = ["user", "seller", "admin", "super_admin"] as const;
