-- ============================================================
-- ShopSeeMe — Seed Core Parent Categories
-- Run ONCE in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Insert the 5 fixed parent categories (slug is unique key)
INSERT INTO public.categories (name, slug, description, parent_id)
VALUES
  ('Men',         'men',         'Men''s fashion collection',          NULL),
  ('Women',       'women',       'Women''s fashion collection',        NULL),
  ('Kids',        'kids',        'Kids'' clothing and accessories',    NULL),
  ('Accessories', 'accessories', 'Bags, belts, hats and more',        NULL),
  ('Sale',        'sale',        'Discounted items and special offers',NULL)
ON CONFLICT (slug) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description;

-- Example child categories you can also seed (optional)
-- You can add more from the admin dashboard
DO $$
DECLARE
  men_id         uuid;
  women_id       uuid;
  kids_id        uuid;
  accessories_id uuid;
BEGIN
  SELECT id INTO men_id         FROM public.categories WHERE slug = 'men';
  SELECT id INTO women_id       FROM public.categories WHERE slug = 'women';
  SELECT id INTO kids_id        FROM public.categories WHERE slug = 'kids';
  SELECT id INTO accessories_id FROM public.categories WHERE slug = 'accessories';

  -- Men subcategories
  INSERT INTO public.categories (name, slug, parent_id)
  VALUES
    ('T-Shirts', 'men-tshirts', men_id),
    ('Shirts',   'men-shirts',  men_id),
    ('Hoodies',  'men-hoodies', men_id),
    ('Trousers', 'men-trousers',men_id),
    ('All Men',  'men-all',     men_id)
  ON CONFLICT (slug) DO NOTHING;

  -- Women subcategories
  INSERT INTO public.categories (name, slug, parent_id)
  VALUES
    ('Dresses',   'women-dresses',  women_id),
    ('Tops',      'women-tops',     women_id),
    ('Hoodies',   'women-hoodies',  women_id),
    ('All Women', 'women-all',      women_id)
  ON CONFLICT (slug) DO NOTHING;

  -- Kids subcategories
  INSERT INTO public.categories (name, slug, parent_id)
  VALUES
    ('Boys',     'kids-boys',  kids_id),
    ('Girls',    'kids-girls', kids_id),
    ('All Kids', 'kids-all',   kids_id)
  ON CONFLICT (slug) DO NOTHING;

  -- Accessories subcategories
  INSERT INTO public.categories (name, slug, parent_id)
  VALUES
    ('Bags',     'acc-bags',  accessories_id),
    ('Belts',    'acc-belts', accessories_id),
    ('Hats',     'acc-hats',  accessories_id)
  ON CONFLICT (slug) DO NOTHING;

END $$;

SELECT
  CASE WHEN parent_id IS NULL THEN '📁 ' ELSE '  └─ ' END || name AS category,
  slug
FROM public.categories
ORDER BY
  COALESCE(parent_id::text, id::text),
  parent_id NULLS FIRST,
  name;
