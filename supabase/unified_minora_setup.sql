-- ===================================================================
-- MINORA – COMPLETE DATABASE SETUP & SEED SCRIPT (ONE-CLICK EXECUTION)
-- Run this complete script in: https://supabase.com/dashboard/project/nqzxcklsubkodturmkrt/sql/new
-- ===================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  parent_category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  display_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  sku TEXT UNIQUE,
  regular_price NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (regular_price >= 0),
  sales_price NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (sales_price >= 0),
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  weight_display TEXT,
  rating NUMERIC(3,2) NOT NULL DEFAULT 5.00,
  reviews_count INT NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL,
  featured BOOLEAN NOT NULL DEFAULT false,
  is_best_seller BOOLEAN NOT NULL DEFAULT false,
  is_organic BOOLEAN NOT NULL DEFAULT false,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  is_new BOOLEAN NOT NULL DEFAULT false,
  is_sale BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INT NOT NULL DEFAULT 0,
  variant_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PRODUCT ATTRIBUTES TABLE
CREATE TABLE IF NOT EXISTS public.product_attributes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL
);

-- 6. PRODUCT ATTRIBUTE VALUES TABLE
CREATE TABLE IF NOT EXISTS public.product_attribute_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attribute_id UUID NOT NULL REFERENCES public.product_attributes(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  label TEXT NOT NULL
);

-- 7. PRODUCT VARIANTS TABLE
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL UNIQUE,
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  regular_price NUMERIC(10,2) NOT NULL CHECK (regular_price >= 0),
  sales_price NUMERIC(10,2) NOT NULL CHECK (sales_price >= 0),
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold INT NOT NULL DEFAULT 5,
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. CARTS & CART ITEMS
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  guest_email TEXT,
  delivery_address TEXT NOT NULL,
  district TEXT NOT NULL,
  city TEXT NOT NULL,
  delivery_instructions TEXT,
  order_notes TEXT,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  shipping_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'bkash', 'nagad', 'rocket', 'bank_transfer')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'pending_verification', 'verified', 'rejected', 'refunded')),
  fulfillment_status TEXT NOT NULL DEFAULT 'pending' CHECK (fulfillment_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')),
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  sku TEXT NOT NULL,
  selected_attributes JSONB DEFAULT '{}'::jsonb,
  image_url TEXT,
  unit_price NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  line_total NUMERIC(10,2) NOT NULL
);

-- 11. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  payment_method TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  transaction_reference TEXT,
  sender_phone TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'pending_verification', 'verified', 'rejected', 'refunded')),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. INVENTORY MOVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  quantity_change INT NOT NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('order_deduction', 'order_cancellation', 'restock', 'adjustment', 'return')),
  reason TEXT NOT NULL,
  related_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- 14. HERO SLIDES TABLE
CREATE TABLE IF NOT EXISTS public.hero_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  headline TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  badge TEXT,
  cta_text TEXT NOT NULL DEFAULT 'Shop Now',
  cta_url TEXT NOT NULL DEFAULT '/shop',
  display_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. ORDER EVENTS / AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  related_record_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(active);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(fulfillment_status, payment_status);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_variant ON public.inventory_movements(variant_id);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attribute_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- HELPER FUNCTION: Check if caller has admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS POLICIES
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update permitted fields in own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins full manage profiles" ON public.profiles
  FOR ALL USING (public.is_admin());

-- Categories & Products
CREATE POLICY "Public read active categories" ON public.categories
  FOR SELECT USING (active = true OR public.is_admin());

CREATE POLICY "Admins manage categories" ON public.categories
  FOR ALL USING (public.is_admin());

CREATE POLICY "Public read active products" ON public.products
  FOR SELECT USING (active = true OR public.is_admin());

CREATE POLICY "Admins manage products" ON public.products
  FOR ALL USING (public.is_admin());

CREATE POLICY "Public read product variants" ON public.product_variants
  FOR SELECT USING (active = true OR public.is_admin());

CREATE POLICY "Admins manage variants" ON public.product_variants
  FOR ALL USING (public.is_admin());

CREATE POLICY "Public read product images" ON public.product_images
  FOR SELECT USING (true);

CREATE POLICY "Admins manage product images" ON public.product_images
  FOR ALL USING (public.is_admin());

-- Site Settings & Hero Slides
CREATE POLICY "Public read site settings" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins manage site settings" ON public.site_settings
  FOR ALL USING (public.is_admin());

CREATE POLICY "Public read hero slides" ON public.hero_slides
  FOR SELECT USING (active = true OR public.is_admin());

CREATE POLICY "Admins manage hero slides" ON public.hero_slides
  FOR ALL USING (public.is_admin());

-- Orders & Order Items
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Public can insert orders" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins update orders" ON public.orders
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Order items viewable by owner or admin" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND (user_id = auth.uid() OR public.is_admin()))
  );

CREATE POLICY "Public can insert order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

-- Payments
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = payments.order_id AND (user_id = auth.uid() OR public.is_admin()))
  );

CREATE POLICY "Public can insert payments" ON public.payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins manage payments" ON public.payments
  FOR ALL USING (public.is_admin());

-- Inventory Movements & Audits
CREATE POLICY "Admins view inventory movements" ON public.inventory_movements
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins manage inventory movements" ON public.inventory_movements
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins view audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_admin());

-- AUTH TRIGGER: Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'customer',
    'active'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- SECURE ATOMIC ORDER CREATION RPC
CREATE OR REPLACE FUNCTION public.create_order_secure(
  p_user_id UUID,
  p_guest_name TEXT,
  p_guest_phone TEXT,
  p_guest_email TEXT,
  p_delivery_address TEXT,
  p_district TEXT,
  p_city TEXT,
  p_delivery_instructions TEXT,
  p_order_notes TEXT,
  p_payment_method TEXT,
  p_items JSONB,
  p_shipping_fee NUMERIC,
  p_sender_phone TEXT DEFAULT NULL,
  p_transaction_reference TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_order_id UUID;
  v_order_number TEXT;
  v_subtotal NUMERIC(10,2) := 0.00;
  v_total NUMERIC(10,2) := 0.00;
  v_item JSONB;
  v_variant RECORD;
  v_line_total NUMERIC(10,2);
  v_initial_payment_status TEXT;
BEGIN
  IF p_payment_method = 'cod' THEN
    v_initial_payment_status := 'pending';
  ELSE
    v_initial_payment_status := 'pending_verification';
  END IF;

  v_order_number := 'MNR-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT pv.*, p.name as product_name, p.image_url as product_image
    INTO v_variant
    FROM public.product_variants pv
    JOIN public.products p ON pv.product_id = p.id
    WHERE pv.id = (v_item->>'variant_id')::UUID AND pv.active = true AND p.active = true
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product variant % is not active or does not exist.', v_item->>'variant_id';
    END IF;

    IF v_variant.stock_quantity < (v_item->>'quantity')::INT THEN
      RAISE EXCEPTION 'Insufficient stock for product % (SKU: %). Available: %, Requested: %',
        v_variant.product_name, v_variant.sku, v_variant.stock_quantity, v_item->>'quantity';
    END IF;

    v_line_total := v_variant.sales_price * (v_item->>'quantity')::INT;
    v_subtotal := v_subtotal + v_line_total;
  END LOOP;

  v_total := v_subtotal + p_shipping_fee;

  INSERT INTO public.orders (
    order_number, user_id, guest_name, guest_phone, guest_email,
    delivery_address, district, city, delivery_instructions, order_notes,
    subtotal, discount, shipping_fee, total,
    payment_method, payment_status, fulfillment_status
  )
  VALUES (
    v_order_number, p_user_id, p_guest_name, p_guest_phone, p_guest_email,
    p_delivery_address, p_district, p_city, p_delivery_instructions, p_order_notes,
    v_subtotal, 0.00, p_shipping_fee, v_total,
    p_payment_method, v_initial_payment_status, 'pending'
  )
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT pv.*, p.name as product_name, p.image_url as product_image
    INTO v_variant
    FROM public.product_variants pv
    JOIN public.products p ON pv.product_id = p.id
    WHERE pv.id = (v_item->>'variant_id')::UUID;

    v_line_total := v_variant.sales_price * (v_item->>'quantity')::INT;

    INSERT INTO public.order_items (
      order_id, product_id, variant_id, product_name, sku,
      selected_attributes, image_url, unit_price, quantity, line_total
    )
    VALUES (
      v_order_id, v_variant.product_id, v_variant.id, v_variant.product_name, v_variant.sku,
      v_variant.attributes, COALESCE(v_variant.image_url, v_variant.product_image),
      v_variant.sales_price, (v_item->>'quantity')::INT, v_line_total
    );

    UPDATE public.product_variants
    SET stock_quantity = stock_quantity - (v_item->>'quantity')::INT,
        updated_at = NOW()
    WHERE id = v_variant.id;

    UPDATE public.products
    SET stock_quantity = (SELECT COALESCE(SUM(stock_quantity), 0) FROM public.product_variants WHERE product_id = v_variant.product_id),
        updated_at = NOW()
    WHERE id = v_variant.product_id;

    INSERT INTO public.inventory_movements (
      variant_id, quantity_change, movement_type, reason, related_order_id, actor_id
    )
    VALUES (
      v_variant.id, -(v_item->>'quantity')::INT, 'order_deduction',
      'Placed order ' || v_order_number, v_order_id, p_user_id
    );
  END LOOP;

  INSERT INTO public.payments (
    order_id, payment_method, amount, transaction_reference, sender_phone, verification_status
  )
  VALUES (
    v_order_id, p_payment_method, v_total, p_transaction_reference, p_sender_phone, v_initial_payment_status
  );

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'total', v_total,
    'status', 'success'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SECURE CANCELLATION & STOCK RESTORATION RPC
CREATE OR REPLACE FUNCTION public.cancel_order_secure(
  p_order_id UUID,
  p_reason TEXT,
  p_actor_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: only administrators can cancel orders.';
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found.';
  END IF;

  IF v_order.fulfillment_status = 'cancelled' THEN
    RAISE EXCEPTION 'Order is already cancelled.';
  END IF;

  FOR v_item IN SELECT * FROM public.order_items WHERE order_id = p_order_id
  LOOP
    IF v_item.variant_id IS NOT NULL THEN
      UPDATE public.product_variants
      SET stock_quantity = stock_quantity + v_item.quantity,
          updated_at = NOW()
      WHERE id = v_item.variant_id;

      UPDATE public.products
      SET stock_quantity = (SELECT COALESCE(SUM(stock_quantity), 0) FROM public.product_variants WHERE product_id = v_item.product_id),
          updated_at = NOW()
      WHERE id = v_item.product_id;

      INSERT INTO public.inventory_movements (
        variant_id, quantity_change, movement_type, reason, related_order_id, actor_id
      )
      VALUES (
        v_item.variant_id, v_item.quantity, 'order_cancellation',
        COALESCE(p_reason, 'Restored upon cancellation of order ' || v_order.order_number),
        p_order_id, p_actor_id
      );
    END IF;
  END LOOP;

  UPDATE public.orders
  SET fulfillment_status = 'cancelled',
      payment_status = CASE WHEN payment_status = 'verified' THEN 'refunded' ELSE 'rejected' END,
      updated_at = NOW()
  WHERE id = p_order_id;

  RETURN jsonb_build_object(
    'order_id', p_order_id,
    'status', 'cancelled',
    'restored', true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SECURE PAYMENT VERIFICATION RPC
CREATE OR REPLACE FUNCTION public.verify_payment_secure(
  p_order_id UUID,
  p_status TEXT,
  p_actor_id UUID
)
RETURNS JSONB AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: only administrators can verify payments.';
  END IF;

  UPDATE public.payments
  SET verification_status = p_status,
      verified_by = p_actor_id,
      verified_at = NOW()
  WHERE order_id = p_order_id;

  UPDATE public.orders
  SET payment_status = p_status,
      fulfillment_status = CASE 
        WHEN p_status = 'verified' AND fulfillment_status = 'pending' THEN 'confirmed'
        ELSE fulfillment_status
      END,
      updated_at = NOW()
  WHERE id = p_order_id;

  RETURN jsonb_build_object(
    'order_id', p_order_id,
    'payment_status', p_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ASSIGN ADMIN ROLE HELPER
CREATE OR REPLACE FUNCTION public.assign_admin_role(p_email TEXT)
RETURNS TEXT AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;

  IF NOT FOUND THEN
    RETURN 'Error: User with email ' || p_email || ' not found in auth.users. Please create or sign up this user first.';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (v_user_id, p_email, 'Super Admin', 'admin', 'active')
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    status = 'active',
    updated_at = NOW();

  RETURN 'Success: Admin role assigned to ' || p_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================================================
-- SEED INITIAL DATA (CATEGORIES, PRODUCTS, VARIANTS, SETTINGS, SLIDES)
-- ===================================================================

-- Categories
INSERT INTO public.categories (id, name, slug, description, image_url, display_order, active)
VALUES
  ('a1000001-0000-0000-0000-000000000001', 'Dry Fruits', 'dry-fruits', 'Nature''s Energy - Premium dried fruits and raisins', 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=400&q=80', 1, true),
  ('a2000002-0000-0000-0000-000000000002', 'Premium Nuts', 'nuts', 'Healthy Fats - Almonds, cashews, walnuts and pistachios', 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=400&q=80', 2, true),
  ('a3000003-0000-0000-0000-000000000003', 'Seeds', 'seeds', 'Small Seeds Big Benefits - Chia, pumpkin and sunflower seeds', 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=400&q=80', 3, true),
  ('a4000004-0000-0000-0000-000000000004', 'Dates', 'dates', 'Natural Sweetness - Premium Medjool, Ajwa and Safawi dates', 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=400&q=80', 4, true),
  ('a5000005-0000-0000-0000-000000000005', 'Superfoods', 'superfoods', 'Boost Your Health - Goji berries, maca and spirulina', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80', 5, true),
  ('a6000006-0000-0000-0000-000000000006', 'Trail Mix', 'trail-mix', 'On-the-Go Nutrition - Energy packed mixed nuts & fruits', 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=400&q=80', 6, true),
  ('a7000007-0000-0000-0000-000000000007', 'Organic Products', 'organic', 'Pure & Clean - 100% certified organic dry food', 'https://images.unsplash.com/photo-1608797178974-15b35a61dd75?auto=format&fit=crop&w=400&q=80', 7, true),
  ('a8000008-0000-0000-0000-000000000008', 'Honey & More', 'honey-more', 'Nature''s Goodness - Raw pure honey and natural spreads', 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80', 8, true)
ON CONFLICT (id) DO NOTHING;

-- Featured Products
INSERT INTO public.products (
  id, name, slug, description, short_description, category_id, sku,
  regular_price, sales_price, stock_quantity, weight_display, rating, reviews_count,
  image_url, featured, is_best_seller, is_organic, is_popular, is_new, is_sale, active
)
VALUES
  (
    'b1000001-0000-0000-0000-000000000001',
    'Mini Honey Nuts',
    'mini-honey-nuts',
    'Experience the irresistible crunch of hand-selected premium nuts soaked in golden raw natural honey. Our Mini Honey Nuts mix combines roasted almonds, buttery cashews, rich walnuts, pumpkin seeds, and succulent dried cranberries glazed with pure artisanal honey.',
    'Mixed Nuts & Pure Honey - Handcrafted energy booster',
    'a6000006-0000-0000-0000-000000000006',
    'MNR-HN-001',
    350.00, 290.00, 45, '100g - 1kg', 5.0, 24,
    '/assets/mini-honey-nuts.jpg',
    true, true, true, true, true, false, true
  ),
  (
    'b2000002-0000-0000-0000-000000000002',
    'Premium California Almonds',
    'premium-almonds',
    'Naturally sun-dried Grade A California almonds. Packed with Vitamin E, dietary fiber, magnesium, and healthy monounsaturated fats. Crisp, fresh, and naturally sweet.',
    '100% Natural Fresh Almonds',
    'a2000002-0000-0000-0000-000000000002',
    'MNR-ALM-002',
    450.00, 390.00, 60, '250g - 1kg', 4.9, 18,
    'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=600&q=80',
    true, true, false, false, false, false, true
  ),
  (
    'b3000003-0000-0000-0000-000000000003',
    'Crisp Walnut Kernels',
    'walnut-kernels',
    'Fresh and brain-healthy whole walnut kernels rich in Omega-3 fatty acids and antioxidants. Shelled carefully to preserve delicate natural oils.',
    'Fresh & Crunchy Walnut Kernels',
    'a2000002-0000-0000-0000-000000000002',
    'MNR-WLN-003',
    550.00, 480.00, 30, '250g - 1kg', 4.8, 12,
    'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=600&q=80',
    true, false, true, false, false, false, true
  ),
  (
    'b4000004-0000-0000-0000-000000000004',
    'Premium Saudi Dates',
    'premium-dates',
    'Naturally sweet and succulent royal dates imported directly from Medina. Soft texture, rich caramel flavor, and loaded with natural potassium and fiber.',
    'Natural Sweetness Royal Dates',
    'a4000004-0000-0000-0000-000000000004',
    'MNR-DAT-004',
    380.00, 320.00, 80, '500g - 1kg', 4.9, 32,
    'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=600&q=80',
    true, false, false, true, false, false, true
  ),
  (
    'b5000005-0000-0000-0000-000000000005',
    'Gourmet Trail Mix',
    'gourmet-trail-mix',
    'Balanced combination of roasted nuts, dried berries, and wholesome seeds. The perfect daily nutrient boost for athletes, students, and busy professionals.',
    'Energy & Daily Nutrition Mix',
    'a6000006-0000-0000-0000-000000000006',
    'MNR-TRL-005',
    420.00, 350.00, 55, '250g - 500g', 4.7, 20,
    'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=600&q=80',
    true, false, false, false, false, true, true
  ),
  (
    'b6000006-0000-0000-0000-000000000006',
    'Raw Sundarban Wild Honey',
    'sundarban-wild-honey',
    '100% pure, unprocessed raw floral honey harvested from the pristine mangroves of the Sundarbans. Unpasteurized and packed with natural enzymes, pollen, and immune-strengthening antioxidants.',
    'Pure Floral Forest Honey',
    'a8000008-0000-0000-0000-000000000008',
    'MNR-HNY-006',
    600.00, 520.00, 40, '250g - 1kg', 5.0, 45,
    'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    true, true, true, true, false, false, true
  )
ON CONFLICT (id) DO NOTHING;

-- Variants for Mini Honey Nuts
INSERT INTO public.product_variants (id, product_id, sku, attributes, regular_price, sales_price, stock_quantity, low_stock_threshold, image_url, active)
VALUES
  ('d1000001-0000-0000-0000-100000000001', 'b1000001-0000-0000-0000-000000000001', 'MNR-HN-100G', '{"weight": "100g"}'::jsonb, 350.00, 290.00, 20, 5, '/assets/mini-honey-nuts.jpg', true),
  ('d1000001-0000-0000-0000-100000000002', 'b1000001-0000-0000-0000-000000000001', 'MNR-HN-250G', '{"weight": "250g"}'::jsonb, 790.00, 650.00, 15, 5, '/assets/mini-honey-nuts.jpg', true),
  ('d1000001-0000-0000-0000-100000000003', 'b1000001-0000-0000-0000-000000000001', 'MNR-HN-500G', '{"weight": "500g"}'::jsonb, 1490.00, 1250.00, 10, 3, '/assets/mini-honey-nuts.jpg', true),
  ('d1000001-0000-0000-0000-100000000004', 'b1000001-0000-0000-0000-000000000001', 'MNR-HN-1KG',  '{"weight": "1kg"}'::jsonb, 2800.00, 2390.00, 5, 2, '/assets/mini-honey-nuts.jpg', true),
  ('d2000002-0000-0000-0000-200000000001', 'b2000002-0000-0000-0000-000000000002', 'MNR-ALM-250G', '{"weight": "250g"}'::jsonb, 450.00, 390.00, 30, 5, NULL, true),
  ('d2000002-0000-0000-0000-200000000002', 'b2000002-0000-0000-0000-000000000002', 'MNR-ALM-500G', '{"weight": "500g"}'::jsonb, 850.00, 750.00, 20, 5, NULL, true),
  ('d2000002-0000-0000-0000-200000000003', 'b2000002-0000-0000-0000-000000000002', 'MNR-ALM-1KG',  '{"weight": "1kg"}'::jsonb, 1650.00, 1450.00, 10, 3, NULL, true),
  ('d3000003-0000-0000-0000-300000000001', 'b3000003-0000-0000-0000-000000000003', 'MNR-WLN-250G', '{"weight": "250g"}'::jsonb, 550.00, 480.00, 15, 5, NULL, true),
  ('d3000003-0000-0000-0000-300000000002', 'b3000003-0000-0000-0000-000000000003', 'MNR-WLN-500G', '{"weight": "500g"}'::jsonb, 1050.00, 920.00, 10, 3, NULL, true),
  ('d4000004-0000-0000-0000-400000000001', 'b4000004-0000-0000-0000-000000000004', 'MNR-DAT-500G', '{"weight": "500g"}'::jsonb, 380.00, 320.00, 50, 10, NULL, true),
  ('d4000004-0000-0000-0000-400000000002', 'b4000004-0000-0000-0000-000000000004', 'MNR-DAT-1KG',  '{"weight": "1kg"}'::jsonb, 720.00, 620.00, 30, 5, NULL, true),
  ('d5000005-0000-0000-0000-500000000001', 'b5000005-0000-0000-0000-000000000005', 'MNR-TRL-250G', '{"weight": "250g"}'::jsonb, 420.00, 350.00, 35, 5, NULL, true),
  ('d5000005-0000-0000-0000-500000000002', 'b5000005-0000-0000-0000-000000000005', 'MNR-TRL-500G', '{"weight": "500g"}'::jsonb, 800.00, 680.00, 20, 5, NULL, true),
  ('d6000006-0000-0000-0000-600000000001', 'b6000006-0000-0000-0000-000000000006', 'MNR-HNY-250G', '{"weight": "250g"}'::jsonb, 600.00, 520.00, 25, 5, NULL, true),
  ('d6000006-0000-0000-0000-600000000002', 'b6000006-0000-0000-0000-000000000006', 'MNR-HNY-500G', '{"weight": "500g"}'::jsonb, 1150.00, 990.00, 15, 3, NULL, true)
ON CONFLICT (id) DO NOTHING;

-- Hero Slides
INSERT INTO public.hero_slides (id, headline, description, image_url, badge, cta_text, cta_url, display_order, active)
VALUES
  (
    'e1000001-0000-0000-0000-000000000001',
    'Pure Goodness in Every Bite',
    'Discover premium quality nuts, dry fruits, seeds and natural honey for a healthier tomorrow.',
    '/assets/mini-honey-nuts.jpg',
    'Featured Harvest',
    'Shop Now',
    '/shop',
    1,
    true
  ),
  (
    'e2000002-0000-0000-0000-000000000002',
    'Handpicked Natural Superfoods',
    'Nourish your body and mind with pure, unadulterated dry fruits sourced from ethical organic farms.',
    'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80',
    '100% Organic',
    'Explore Categories',
    '/categories',
    2,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Site Settings
INSERT INTO public.site_settings (key, value)
VALUES
  ('general', '{
    "brandName": "MINORA",
    "tagline": "Pure • Natural • Healthy",
    "logoUrl": "/assets/minora-logo.png",
    "contactAddress": "123 Green Road, Chittagong, Bangladesh",
    "contactPhone": "+880 1838 384488",
    "contactEmail": "info@minora.com",
    "socialLinks": {
      "facebook": "https://facebook.com/minora.natural",
      "instagram": "https://instagram.com/minora.natural",
      "youtube": "https://youtube.com/@minorafoods",
      "twitter": "https://twitter.com/minorafoods"
    },
    "deliveryFees": {
      "insideCity": 60,
      "outsideCity": 120,
      "freeDeliveryThreshold": 1500
    },
    "paymentSettings": {
      "cod": {
        "enabled": true,
        "title": "Cash on Delivery",
        "accountType": "Doorstep",
        "accountNumber": "Pay at doorstep",
        "instructions": "Pay with cash directly to our delivery courier upon receipt of your package."
      },
      "bkash": {
        "enabled": true,
        "title": "bKash",
        "accountType": "Personal (Send Money)",
        "accountNumber": "01838838488",
        "instructions": "Go to bKash App or dial *247# -> Choose Send Money -> Enter 01838838488 -> Enter total order amount -> Enter your PIN. Then enter your Transaction ID (TrxID) below."
      },
      "nagad": {
        "enabled": true,
        "title": "Nagad",
        "accountType": "Personal (Send Money)",
        "accountNumber": "01838838488",
        "instructions": "Go to Nagad App or dial *167# -> Choose Send Money -> Enter 01838838488 -> Enter total order amount. Then enter your Transaction ID below."
      },
      "rocket": {
        "enabled": true,
        "title": "Rocket",
        "accountType": "Personal (Send Money)",
        "accountNumber": "01838838488",
        "instructions": "Open Rocket App -> Select Send Money -> Enter 01838838488 -> Submit and provide transaction reference."
      },
      "bank_transfer": {
        "enabled": true,
        "title": "Manual Bank Transfer",
        "accountType": "Bank Account",
        "accountNumber": "City Bank A/C: 1502938472910, Branch: GEC Chittagong, Account Title: MINORA HEALTH FOODS",
        "instructions": "Transfer the payable total to our City Bank Account and specify your sender bank name and transaction slip reference."
      }
    },
    "policies": {
      "terms": "Welcome to MINORA. By accessing our services, you agree to comply with our terms and conditions.",
      "privacy": "MINORA values your privacy. We securely protect your customer information and never share your data with unauthorized third parties.",
      "refund": "We accept returns and refund requests for damaged, defective, or incorrect products within 48 hours of delivery.",
      "shipping": "We deliver across all 64 districts of Bangladesh. Regular delivery takes 24-48 hours inside Chittagong & Dhaka, and 2-4 days nationwide."
    }
  }'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
