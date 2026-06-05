-- ============================================================
-- ShopSeeMe — Admin RLS Policies
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Helper function: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id   = auth.uid()
    AND   role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── CATEGORIES ──────────────────────────────────────────────
-- Public read (everyone)
DROP POLICY IF EXISTS "categories_public_read"  ON public.categories;
CREATE POLICY "categories_public_read"
  ON public.categories FOR SELECT
  USING (true);

-- Admin full access
DROP POLICY IF EXISTS "categories_admin_all"    ON public.categories;
CREATE POLICY "categories_admin_all"
  ON public.categories FOR ALL
  TO authenticated
  USING      (is_admin())
  WITH CHECK (is_admin());

-- ── PRODUCTS ────────────────────────────────────────────────
DROP POLICY IF EXISTS "products_public_read"    ON public.products;
CREATE POLICY "products_public_read"
  ON public.products FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "products_admin_all"      ON public.products;
CREATE POLICY "products_admin_all"
  ON public.products FOR ALL
  TO authenticated
  USING      (is_admin())
  WITH CHECK (is_admin());

-- ── PRODUCT IMAGES ──────────────────────────────────────────
DROP POLICY IF EXISTS "product_images_public_read"  ON public.product_images;
CREATE POLICY "product_images_public_read"
  ON public.product_images FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "product_images_admin_all"    ON public.product_images;
CREATE POLICY "product_images_admin_all"
  ON public.product_images FOR ALL
  TO authenticated
  USING      (is_admin())
  WITH CHECK (is_admin());

-- ── PRODUCT VARIANTS ────────────────────────────────────────
DROP POLICY IF EXISTS "product_variants_public_read" ON public.product_variants;
CREATE POLICY "product_variants_public_read"
  ON public.product_variants FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "product_variants_admin_all"   ON public.product_variants;
CREATE POLICY "product_variants_admin_all"
  ON public.product_variants FOR ALL
  TO authenticated
  USING      (is_admin())
  WITH CHECK (is_admin());

-- ── ORDERS ──────────────────────────────────────────────────
-- Customers can see their own orders
DROP POLICY IF EXISTS "orders_owner_read"  ON public.orders;
CREATE POLICY "orders_owner_read"
  ON public.orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Customers can create orders (including guests via anon)
DROP POLICY IF EXISTS "orders_insert"      ON public.orders;
CREATE POLICY "orders_insert"
  ON public.orders FOR INSERT
  WITH CHECK (true);

-- Only admins can update orders (status changes)
DROP POLICY IF EXISTS "orders_admin_update" ON public.orders;
CREATE POLICY "orders_admin_update"
  ON public.orders FOR UPDATE
  TO authenticated
  USING      (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "orders_admin_delete" ON public.orders;
CREATE POLICY "orders_admin_delete"
  ON public.orders FOR DELETE
  TO authenticated
  USING (is_admin());

-- ── ORDER ITEMS ─────────────────────────────────────────────
DROP POLICY IF EXISTS "order_items_read"   ON public.order_items;
CREATE POLICY "order_items_read"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR is_admin())
    )
  );

DROP POLICY IF EXISTS "order_items_insert" ON public.order_items;
CREATE POLICY "order_items_insert"
  ON public.order_items FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "order_items_admin_delete" ON public.order_items;
CREATE POLICY "order_items_admin_delete"
  ON public.order_items FOR DELETE
  TO authenticated
  USING (is_admin());

-- ── PROFILES ────────────────────────────────────────────────
-- Users can read/update their own profile; admins can read all
DROP POLICY IF EXISTS "profiles_own_read"   ON public.profiles;
CREATE POLICY "profiles_own_read"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "profiles_own_update" ON public.profiles;
CREATE POLICY "profiles_own_update"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING      (id = auth.uid() OR is_admin())
  WITH CHECK (id = auth.uid() OR is_admin());

-- ── WISHLIST ────────────────────────────────────────────────
DROP POLICY IF EXISTS "wishlist_own"        ON public.wishlist;
CREATE POLICY "wishlist_own"
  ON public.wishlist FOR ALL
  TO authenticated
  USING      (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── CONVERSATIONS ────────────────────────────────────────────
DROP POLICY IF EXISTS "conversations_insert" ON public.conversations;
CREATE POLICY "conversations_insert"
  ON public.conversations FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "conversations_read"   ON public.conversations;
CREATE POLICY "conversations_read"
  ON public.conversations FOR SELECT
  USING (
    user_id = auth.uid()
    OR is_admin()
    OR user_id IS NULL
  );

DROP POLICY IF EXISTS "conversations_update" ON public.conversations;
CREATE POLICY "conversations_update"
  ON public.conversations FOR UPDATE
  USING (is_admin() OR user_id = auth.uid() OR user_id IS NULL)
  WITH CHECK (is_admin() OR user_id = auth.uid() OR user_id IS NULL);

-- ── MESSAGES ────────────────────────────────────────────────
DROP POLICY IF EXISTS "messages_insert"      ON public.messages;
CREATE POLICY "messages_insert"
  ON public.messages FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "messages_read"        ON public.messages;
CREATE POLICY "messages_read"
  ON public.messages FOR SELECT
  USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
      AND (c.user_id = auth.uid() OR c.user_id IS NULL)
    )
  );

DROP POLICY IF EXISTS "messages_update"      ON public.messages;
CREATE POLICY "messages_update"
  ON public.messages FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── STORAGE: product-images bucket ──────────────────────────
-- Allow admins to upload/delete product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public             = true,
  file_size_limit    = 5242880,
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/avif'];

DROP POLICY IF EXISTS "product_images_public_select" ON storage.objects;
CREATE POLICY "product_images_public_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "product_images_admin_insert"  ON storage.objects;
CREATE POLICY "product_images_admin_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND is_admin());

DROP POLICY IF EXISTS "product_images_admin_update"  ON storage.objects;
CREATE POLICY "product_images_admin_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images' AND is_admin());

DROP POLICY IF EXISTS "product_images_admin_delete"  ON storage.objects;
CREATE POLICY "product_images_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images' AND is_admin());

-- ============================================================
-- Confirm your admin account (replace with your email):
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'you@email.com';
-- ============================================================

SELECT 'RLS policies updated successfully ✅' AS result;
