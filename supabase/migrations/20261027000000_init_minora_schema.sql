-- MINORA E-COMMERCE DATABASE INITIALIZATION
-- Migration: 20261027000000_init_minora_schema.sql

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
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g. {"weight": "250g"}
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

-- INDEXES FOR PERFORMANCE
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

-- HELPER FUNCTION: Check if user is an admin
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

-- Profiles:
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update permitted fields in own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins full manage profiles" ON public.profiles
  FOR ALL USING (public.is_admin());

-- Categories & Products (Public Read, Admin Write):
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

-- Site Settings & Hero Slides:
CREATE POLICY "Public read site settings" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins manage site settings" ON public.site_settings
  FOR ALL USING (public.is_admin());

CREATE POLICY "Public read hero slides" ON public.hero_slides
  FOR SELECT USING (active = true OR public.is_admin());

CREATE POLICY "Admins manage hero slides" ON public.hero_slides
  FOR ALL USING (public.is_admin());

-- Orders:
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

-- Payments:
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = payments.order_id AND (user_id = auth.uid() OR public.is_admin()))
  );

CREATE POLICY "Public can insert payments" ON public.payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins manage payments" ON public.payments
  FOR ALL USING (public.is_admin());

-- Inventory Movements & Audits (Admin only):
CREATE POLICY "Admins view inventory movements" ON public.inventory_movements
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins manage inventory movements" ON public.inventory_movements
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins view audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_admin());

-- AUTH HOOK TRIGGER: Auto-create profile on signup
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
  p_items JSONB, -- Array of { variant_id: UUID, quantity: INT }
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
  -- Determine payment status
  IF p_payment_method = 'cod' THEN
    v_initial_payment_status := 'pending';
  ELSE
    v_initial_payment_status := 'pending_verification';
  END IF;

  -- Generate readable unique order number: MNR-YYYYMMDD-XXXX
  v_order_number := 'MNR-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');

  -- Verify each variant stock with row locking (FOR UPDATE) and compute subtotal
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

  -- Insert order
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

  -- Insert items and deduct stock
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

    -- Atomic decrement
    UPDATE public.product_variants
    SET stock_quantity = stock_quantity - (v_item->>'quantity')::INT,
        updated_at = NOW()
    WHERE id = v_variant.id;

    -- Also keep product table total stock updated
    UPDATE public.products
    SET stock_quantity = (SELECT COALESCE(SUM(stock_quantity), 0) FROM public.product_variants WHERE product_id = v_variant.product_id),
        updated_at = NOW()
    WHERE id = v_variant.product_id;

    -- Record movement
    INSERT INTO public.inventory_movements (
      variant_id, quantity_change, movement_type, reason, related_order_id, actor_id
    )
    VALUES (
      v_variant.id, -(v_item->>'quantity')::INT, 'order_deduction',
      'Placed order ' || v_order_number, v_order_id, p_user_id
    );
  END LOOP;

  -- Create payment record
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
