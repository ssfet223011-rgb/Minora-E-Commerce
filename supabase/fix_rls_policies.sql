-- ===================================================================
-- MINORA – FIX RLS POLICIES FOR ADMIN OPERATIONS
-- Run this in Supabase SQL Editor AFTER the initial setup script.
-- 
-- This script makes admin-managed tables (categories, products,
-- variants, hero_slides, site_settings) fully accessible via the
-- anon key so the frontend admin panel works without requiring
-- a Supabase Auth session.
--
-- For production, replace these with proper auth-checked policies.
-- ===================================================================

-- ---------------------------------------------------------------
-- CATEGORIES: Allow all operations
-- ---------------------------------------------------------------
DROP POLICY IF EXISTS "Public read active categories" ON public.categories;
DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;

CREATE POLICY "Anyone can read categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert categories" ON public.categories
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update categories" ON public.categories
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete categories" ON public.categories
  FOR DELETE USING (true);

-- ---------------------------------------------------------------
-- PRODUCTS: Allow all operations
-- ---------------------------------------------------------------
DROP POLICY IF EXISTS "Public read active products" ON public.products;
DROP POLICY IF EXISTS "Admins manage products" ON public.products;

CREATE POLICY "Anyone can read products" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert products" ON public.products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update products" ON public.products
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete products" ON public.products
  FOR DELETE USING (true);

-- ---------------------------------------------------------------
-- PRODUCT VARIANTS: Allow all operations
-- ---------------------------------------------------------------
DROP POLICY IF EXISTS "Public read product variants" ON public.product_variants;
DROP POLICY IF EXISTS "Admins manage variants" ON public.product_variants;

CREATE POLICY "Anyone can read variants" ON public.product_variants
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert variants" ON public.product_variants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update variants" ON public.product_variants
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete variants" ON public.product_variants
  FOR DELETE USING (true);

-- ---------------------------------------------------------------
-- PRODUCT IMAGES: Allow all operations
-- ---------------------------------------------------------------
DROP POLICY IF EXISTS "Public read product images" ON public.product_images;
DROP POLICY IF EXISTS "Admins manage product images" ON public.product_images;

CREATE POLICY "Anyone can read product images" ON public.product_images
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert product images" ON public.product_images
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update product images" ON public.product_images
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete product images" ON public.product_images
  FOR DELETE USING (true);

-- ---------------------------------------------------------------
-- HERO SLIDES: Allow all operations
-- ---------------------------------------------------------------
DROP POLICY IF EXISTS "Public read hero slides" ON public.hero_slides;
DROP POLICY IF EXISTS "Admins manage hero slides" ON public.hero_slides;

CREATE POLICY "Anyone can read hero slides" ON public.hero_slides
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert hero slides" ON public.hero_slides
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update hero slides" ON public.hero_slides
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete hero slides" ON public.hero_slides
  FOR DELETE USING (true);

-- ---------------------------------------------------------------
-- SITE SETTINGS: Allow all operations
-- ---------------------------------------------------------------
DROP POLICY IF EXISTS "Public read site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins manage site settings" ON public.site_settings;

CREATE POLICY "Anyone can read site settings" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert site settings" ON public.site_settings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update site settings" ON public.site_settings
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete site settings" ON public.site_settings
  FOR DELETE USING (true);

-- ---------------------------------------------------------------
-- ORDERS: Allow all operations (guest checkout support)
-- ---------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Admins update orders" ON public.orders;

CREATE POLICY "Anyone can read orders" ON public.orders
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert orders" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update orders" ON public.orders
  FOR UPDATE USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------
-- ORDER ITEMS: Allow all operations
-- ---------------------------------------------------------------
DROP POLICY IF EXISTS "Order items viewable by owner or admin" ON public.order_items;
DROP POLICY IF EXISTS "Public can insert order items" ON public.order_items;

CREATE POLICY "Anyone can read order items" ON public.order_items
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

-- ---------------------------------------------------------------
-- PAYMENTS: Allow all operations
-- ---------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Public can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Admins manage payments" ON public.payments;

CREATE POLICY "Anyone can read payments" ON public.payments
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert payments" ON public.payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update payments" ON public.payments
  FOR UPDATE USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------
-- INVENTORY MOVEMENTS: Allow all operations
-- ---------------------------------------------------------------
DROP POLICY IF EXISTS "Admins view inventory movements" ON public.inventory_movements;
DROP POLICY IF EXISTS "Admins manage inventory movements" ON public.inventory_movements;

CREATE POLICY "Anyone can read inventory movements" ON public.inventory_movements
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert inventory movements" ON public.inventory_movements
  FOR INSERT WITH CHECK (true);

-- ---------------------------------------------------------------
-- PROFILES: Allow all operations
-- ---------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update permitted fields in own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins full manage profiles" ON public.profiles;

CREATE POLICY "Anyone can read profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update profiles" ON public.profiles
  FOR UPDATE USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------
-- AUDIT LOGS: Allow all operations
-- ---------------------------------------------------------------
DROP POLICY IF EXISTS "Admins view audit logs" ON public.audit_logs;

CREATE POLICY "Anyone can read audit logs" ON public.audit_logs
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);
