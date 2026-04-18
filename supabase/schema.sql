-- ============================================================
-- BULLOBUILD · Supabase Database Schema
-- Run this in the Supabase SQL editor (in order)
-- ============================================================

-- ----------------------------------------------------------------
-- 1. PROFILES (extends auth.users)
-- ----------------------------------------------------------------
create table public.profiles (
  id         uuid references auth.users on delete cascade not null primary key,
  email      text not null,
  full_name  text,
  avatar_url text,
  role       text not null default 'user'
             check (role in ('user', 'seller', 'admin', 'super_admin')),
  is_verified_seller boolean not null default false,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- 2. BRANDS
-- ----------------------------------------------------------------
create table public.brands (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null unique,
  logo_url     text,
  is_authorized boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- 3. CATEGORIES
-- ----------------------------------------------------------------
create table public.categories (
  id        uuid primary key default gen_random_uuid(),
  name      text not null,
  slug      text not null unique,
  parent_id uuid references public.categories(id)
);

-- ----------------------------------------------------------------
-- 4. PRODUCTS (new, store inventory)
-- ----------------------------------------------------------------
create table public.products (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text not null unique,
  model           text,
  description     text,
  price           numeric(10,2) not null,
  original_price  numeric(10,2),
  msrp                numeric(10,2),
  msrp_source         text,
  price_updated_at    timestamptz,
  raw_pricing_data    jsonb,
  brand_id        uuid references public.brands(id),
  category_id     uuid references public.categories(id),
  images          text[] not null default '{}',
  stock           integer not null default 0,
  is_featured     boolean not null default false,
  is_deal         boolean not null default false,
  created_at      timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- 5. MARKETPLACE LISTINGS (second-hand)
-- ----------------------------------------------------------------
create table public.listings (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade not null,
  title       text not null,
  description text,
  price       numeric(10,2) not null,
  brand_id    uuid references public.brands(id),
  images      text[] not null default '{}',
  condition   text not null
              check (condition in ('like_new', 'excellent', 'good', 'fair')),
  is_sold     boolean not null default false,
  is_approved boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- 6. ORDERS
-- ----------------------------------------------------------------
create table public.orders (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid references public.profiles(id),
  stripe_payment_intent_id  text unique,
  status                    text not null default 'pending'
                            check (status in ('pending','paid','shipped','delivered','cancelled')),
  total                     numeric(10,2) not null,
  items                     jsonb not null default '[]',
  shipping_address          jsonb,
  created_at                timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- 7. ENABLE ROW LEVEL SECURITY
-- ----------------------------------------------------------------
alter table public.profiles  enable row level security;
alter table public.brands    enable row level security;
alter table public.products  enable row level security;
alter table public.listings  enable row level security;
alter table public.orders    enable row level security;

-- ----------------------------------------------------------------
-- 8. RLS POLICIES
-- ----------------------------------------------------------------

-- Brands: anyone can read
create policy "Public read brands"
  on public.brands for select using (true);

-- Products: anyone can read in-stock items that have at least one image.
-- The image requirement is the enforcement of our "no missing-photo products"
-- policy: a product without imagery is never sellable and must never appear
-- on the public storefront. Admin queries bypass RLS via the service role.
create policy "Public read products"
  on public.products for select
  using (stock > 0 and array_length(images, 1) >= 1);

-- Listings: anyone can read approved, unsold listings
create policy "Public read approved listings"
  on public.listings for select
  using (is_approved = true and is_sold = false);

-- Profiles: users can read/update their own profile
create policy "Users read own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Listings: authenticated users can create
create policy "Users create listings"
  on public.listings for insert
  with check (auth.uid() = user_id);

create policy "Users update own listings"
  on public.listings for update using (auth.uid() = user_id);

-- Orders: users can read their own orders
create policy "Users read own orders"
  on public.orders for select using (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- 9. AUTO-CREATE PROFILE ON SIGNUP
-- ----------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    case
      when new.email = 'renvagu1@icloud.com' then 'super_admin'
      else 'user'
    end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------
-- 10. SEED BRANDS
-- ----------------------------------------------------------------
insert into public.brands (name, slug) values
  ('DeWalt',       'dewalt'),
  ('Milwaukee',    'milwaukee'),
  ('Craftsman',    'craftsman'),
  ('Stanley',      'stanley'),
  ('Black+Decker', 'black-decker'),
  ('Snap-on',      'snap-on'),
  ('Mac Tools',    'mac-tools'),
  ('Kobalt',       'kobalt'),
  ('Skil',         'skil'),
  ('Proto',        'proto');

-- ----------------------------------------------------------------
-- 11. SEED CATEGORIES
-- ----------------------------------------------------------------
insert into public.categories (name, slug) values
  ('Drills & Drivers',   'drills-drivers'),
  ('Saws',               'saws'),
  ('Impact Wrenches',    'impact-wrenches'),
  ('Grinders',           'grinders'),
  ('Measuring Tools',    'measuring'),
  ('Hand Tools',         'hand-tools'),
  ('Air Tools',          'air-tools'),
  ('Combo Kits',         'combo-kits'),
  ('Storage',            'storage'),
  ('Accessories',        'accessories');
