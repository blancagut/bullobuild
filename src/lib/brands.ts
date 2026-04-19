export interface BrandRecord {
  id: string;
  name: string;
  slug: string;
  is_authorized?: boolean | null;
  logo_url?: string | null;
  updated_at?: string | null;
}

export interface BrandGroup {
  name: string;
  slug: string;
  ids: string[];
  sourceSlugs: string[];
  isAuthorized: boolean;
  logoUrl: string | null;
  updatedAt: string | null;
}

const CANONICAL_BRAND_SLUGS: Record<string, string> = {
  "Black+Decker": "black-decker",
  "Mac Tools": "mac-tools",
};

export function getCanonicalBrandSlug(name: string, fallbackSlug: string) {
  return CANONICAL_BRAND_SLUGS[name] ?? fallbackSlug;
}

export function groupBrandRecords(rows: BrandRecord[]) {
  const groups = new Map<string, BrandGroup>();

  for (const row of rows) {
    const key = row.name.trim().toLowerCase();
    const canonicalSlug = getCanonicalBrandSlug(row.name, row.slug);
    const existing = groups.get(key);

    if (existing) {
      existing.ids.push(row.id);
      if (!existing.sourceSlugs.includes(row.slug)) {
        existing.sourceSlugs.push(row.slug);
      }
      existing.isAuthorized = existing.isAuthorized || Boolean(row.is_authorized);
      if (!existing.logoUrl && row.logo_url) {
        existing.logoUrl = row.logo_url;
      }
      if (row.slug === canonicalSlug && row.logo_url) {
        existing.logoUrl = row.logo_url;
      }
      if (row.updated_at && (!existing.updatedAt || row.updated_at > existing.updatedAt)) {
        existing.updatedAt = row.updated_at;
      }
      continue;
    }

    groups.set(key, {
      name: row.name,
      slug: canonicalSlug,
      ids: [row.id],
      sourceSlugs: [row.slug],
      isAuthorized: Boolean(row.is_authorized),
      logoUrl: row.logo_url ?? null,
      updatedAt: row.updated_at ?? null,
    });
  }

  return Array.from(groups.values()).sort((left, right) =>
    left.name.localeCompare(right.name)
  );
}

export function findBrandGroupBySlug(groups: BrandGroup[], slug: string) {
  return groups.find((group) => group.slug === slug || group.sourceSlugs.includes(slug)) ?? null;
}