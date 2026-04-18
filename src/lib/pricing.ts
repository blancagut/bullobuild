const QUOTE_ONLY_BRANDS = new Set([
  "bobcat",
  "case ce",
  "casece",
  "john deere",
  "johndeere",
  "new holland",
  "newholland",
]);

function normalizeBrandName(value?: string | null) {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function isQuoteOnlyBrand(brand?: string | null) {
  const normalized = normalizeBrandName(brand);
  return QUOTE_ONLY_BRANDS.has(normalized) || QUOTE_ONLY_BRANDS.has(normalized.replace(/\s+/g, ""));
}

export function getProductPricingMode(params: {
  brand?: string | null;
  price?: number | null;
  originalPrice?: number | null;
}) {
  const price = Number(params.price ?? 0);
  const originalPrice = Number(params.originalPrice ?? 0);

  if (price > 0 || originalPrice > 0) {
    return "priced" as const;
  }

  if (isQuoteOnlyBrand(params.brand)) {
    return "contact" as const;
  }

  return "catalog" as const;
}

export function buildContactHref(params?: {
  brand?: string | null;
  productName?: string | null;
  productSlug?: string | null;
}) {
  const query = new URLSearchParams();

  if (params?.brand) query.set("brand", params.brand);
  if (params?.productName) query.set("product", params.productName);
  if (params?.productSlug) query.set("sku", params.productSlug);

  const qs = query.toString();
  return qs ? `/contact?${qs}` : "/contact";
}