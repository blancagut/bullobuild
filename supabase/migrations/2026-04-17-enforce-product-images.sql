-- ============================================================
-- Migration: Enforce "no missing-photo products" rule
--
-- Tightens the public-read RLS policy on public.products so that rows
-- without any images never leak to the storefront, even if a future bug
-- re-sets stock > 0 on an image-less row.
--
-- Apply via Supabase SQL editor once:
--   (safe to re-run — drop-and-create is idempotent)
-- ============================================================

drop policy if exists "Public read products" on public.products;

create policy "Public read products"
  on public.products for select
  using (stock > 0 and array_length(images, 1) >= 1);

-- Optional hard guard: block any future INSERT/UPDATE that leaves a product
-- with both stock > 0 AND no images. (Commented out by default to avoid
-- breaking admin imports that seed stock then populate images later; enable
-- once the admin UI performs both writes atomically.)
--
-- alter table public.products
--   add constraint products_must_have_image_if_live
--   check (stock = 0 or array_length(images, 1) >= 1);
