-- STORAGE SETUP AND ADMINISTRATIVE RPC FUNCTIONS
-- Migration: 20261027000002_admin_helpers_and_storage.sql

-- 1. Storage Buckets Setup
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('product-images', 'product-images', true),
  ('category-images', 'category-images', true),
  ('brand-assets', 'brand-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public read storage product-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admin upload storage product-images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND
    public.is_admin()
  );

CREATE POLICY "Admin delete storage product-images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' AND
    public.is_admin()
  );

-- 2. Secure Order Cancellation RPC with Stock Restoration
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
  -- Verify caller is admin
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

  -- Restore stock for each item in the order
  FOR v_item IN SELECT * FROM public.order_items WHERE order_id = p_order_id
  LOOP
    IF v_item.variant_id IS NOT NULL THEN
      -- Add back stock to variant
      UPDATE public.product_variants
      SET stock_quantity = stock_quantity + v_item.quantity,
          updated_at = NOW()
      WHERE id = v_item.variant_id;

      -- Update total product stock
      UPDATE public.products
      SET stock_quantity = (SELECT COALESCE(SUM(stock_quantity), 0) FROM public.product_variants WHERE product_id = v_item.product_id),
          updated_at = NOW()
      WHERE id = v_item.product_id;

      -- Log movement
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

  -- Mark order cancelled
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

-- 3. Payment Verification RPC
CREATE OR REPLACE FUNCTION public.verify_payment_secure(
  p_order_id UUID,
  p_status TEXT, -- 'verified', 'rejected', 'refunded'
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

-- 4. Initial Admin Bootstrap Helper (For SQL Editor execution only)
-- Usage in Supabase SQL editor:
-- SELECT public.assign_admin_role('admin@minora.com');
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
