-- ============================================================
-- ShopSeeMe — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

create extension if not exists "uuid-ossp";

-- Categories
create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  parent_id uuid references public.categories(id),
  created_at timestamptz not null default now()
);

-- Products
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  price integer not null,
  compare_at_price integer,
  category_id uuid references public.categories(id),
  tags text[] not null default '{}',
  is_featured boolean not null default false,
  is_new boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Product Images
create table public.product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt text not null default '',
  position integer not null default 0
);

-- Product Variants
create table public.product_variants (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null,
  color text,
  stock integer not null default 0,
  sku text not null unique
);

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  avatar_url text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

-- Orders
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id),
  order_number text not null unique,
  status text not null default 'pending' check (status in ('pending','confirmed','processing','shipped','delivered','cancelled')),
  subtotal integer not null,
  shipping_fee integer not null default 0,
  total integer not null,
  customer_name text not null,
  customer_phone text not null,
  shipping_address jsonb not null,
  payment_method text not null default 'cod',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Order Items
create table public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text not null,
  product_image text not null default '',
  variant_id uuid references public.product_variants(id),
  size text not null,
  quantity integer not null,
  unit_price integer not null,
  total_price integer not null
);

-- Wishlist
create table public.wishlist (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

-- Conversations
create table public.conversations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id),
  customer_name text not null default 'Guest',
  customer_email text,
  customer_phone text,
  product_id uuid references public.products(id),
  product_name text,
  status text not null default 'open' check (status in ('open','closed')),
  last_message text,
  last_message_at timestamptz,
  created_at timestamptz not null default now()
);

-- Messages
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_type text not null check (sender_type in ('customer','admin')),
  sender_id uuid,
  content text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_products_category on public.products(category_id);
create index idx_products_slug on public.products(slug);
create index idx_products_is_new on public.products(is_new);
create index idx_products_is_featured on public.products(is_featured);
create index idx_product_images_product on public.product_images(product_id, position);
create index idx_product_variants_product on public.product_variants(product_id);
create index idx_orders_user on public.orders(user_id);
create index idx_orders_number on public.orders(order_number);
create index idx_messages_convo on public.messages(conversation_id, created_at);
create index idx_wishlist_user on public.wishlist(user_id);

-- RLS
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.wishlist enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "Products public read" on public.products for select using (true);
create policy "Categories public read" on public.categories for select using (true);
create policy "Product images public read" on public.product_images for select using (true);
create policy "Product variants public read" on public.product_variants for select using (true);
create policy "Users read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users view own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users insert orders" on public.orders for insert with check (auth.uid() = user_id or user_id is null);
create policy "Users view own order items" on public.order_items for select using (order_id in (select id from public.orders where user_id = auth.uid()));
create policy "Users manage wishlist" on public.wishlist for all using (auth.uid() = user_id);
create policy "Anyone read conversations" on public.conversations for select using (user_id = auth.uid() or user_id is null);
create policy "Anyone create conversations" on public.conversations for insert with check (true);
create policy "Anyone read messages" on public.messages for select using (conversation_id in (select id from public.conversations where user_id = auth.uid() or user_id is null));
create policy "Anyone insert messages" on public.messages for insert with check (true);

-- Triggers
create or replace function update_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
create trigger trg_products_updated_at before update on public.products for each row execute function update_updated_at();
create trigger trg_orders_updated_at before update on public.orders for each row execute function update_updated_at();

create or replace function handle_new_user() returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles(id, email, full_name) values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

-- Storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do nothing;

create policy "Public read product images" on storage.objects for select using (bucket_id = 'product-images');
create policy "Admin upload product images" on storage.objects for insert with check (bucket_id = 'product-images' and auth.role() = 'authenticated');
create policy "Admin delete product images" on storage.objects for delete using (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- Realtime
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;
