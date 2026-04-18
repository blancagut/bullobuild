-- Adds official-source MSRP tracking columns.
-- Nullable + additive; safe with existing rows and existing UI logic.
alter table public.products
  add column if not exists msrp numeric(10,2),
  add column if not exists msrp_source text,
  add column if not exists price_updated_at timestamptz,
  add column if not exists raw_pricing_data jsonb;

comment on column public.products.msrp is 'Manufacturer Suggested Retail Price from an official brand source.';
comment on column public.products.msrp_source is 'Identifier for the official source that produced msrp (e.g. mactools-catalog, blackdecker-shopify).';
comment on column public.products.price_updated_at is 'Timestamp of the last official pricing refresh.';
comment on column public.products.raw_pricing_data is 'Raw payload snapshot from the official pricing source for auditing.';
