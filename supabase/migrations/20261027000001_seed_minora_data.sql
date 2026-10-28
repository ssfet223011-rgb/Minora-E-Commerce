-- SEED INITIAL DATA FOR MINORA E-COMMERCE
-- Migration: 20261027000001_seed_minora_data.sql

-- 1. Insert Categories
INSERT INTO public.categories (id, name, slug, description, image_url, display_order, active)
VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Dry Fruits', 'dry-fruits', 'Nature''s Energy - Premium dried fruits and raisins', 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=400&q=80', 1, true),
  ('c2222222-2222-2222-2222-222222222222', 'Premium Nuts', 'nuts', 'Healthy Fats - Almonds, cashews, walnuts and pistachios', 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=400&q=80', 2, true),
  ('c3333333-3333-3333-3333-333333333333', 'Seeds', 'seeds', 'Small Seeds Big Benefits - Chia, pumpkin and sunflower seeds', 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=400&q=80', 3, true),
  ('c4444444-4444-4444-4444-444444444444', 'Dates', 'dates', 'Natural Sweetness - Premium Medjool, Ajwa and Safawi dates', 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=400&q=80', 4, true),
  ('c5555555-5555-5555-5555-555555555555', 'Superfoods', 'superfoods', 'Boost Your Health - Goji berries, maca and spirulina', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80', 5, true),
  ('c6666666-6666-6666-6666-666666666666', 'Trail Mix', 'trail-mix', 'On-the-Go Nutrition - Energy packed mixed nuts & fruits', 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=400&q=80', 6, true),
  ('c7777777-7777-7777-7777-777777777777', 'Organic Products', 'organic', 'Pure & Clean - 100% certified organic dry food', 'https://images.unsplash.com/photo-1608797178974-15b35a61dd75?auto=format&fit=crop&w=400&q=80', 7, true),
  ('c8888888-8888-8888-8888-888888888888', 'Honey & More', 'honey-more', 'Nature''s Goodness - Raw pure honey and natural spreads', 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80', 8, true)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Featured Products
INSERT INTO public.products (
  id, name, slug, description, short_description, category_id, sku,
  regular_price, sales_price, stock_quantity, weight_display, rating, reviews_count,
  image_url, featured, is_best_seller, is_organic, is_popular, is_new, is_sale, active
)
VALUES
  (
    'p1111111-1111-1111-1111-111111111111',
    'Mini Honey Nuts',
    'mini-honey-nuts',
    'Experience the irresistible crunch of hand-selected premium nuts soaked in golden raw natural honey. Our Mini Honey Nuts mix combines roasted almonds, buttery cashews, rich walnuts, pumpkin seeds, and succulent dried cranberries glazed with pure artisanal honey. Perfect as an energizing snack, dessert topping, or nutritious gift.',
    'Mixed Nuts & Pure Honey - Handcrafted energy booster',
    'c6666666-6666-6666-6666-666666666666',
    'MNR-HN-001',
    350.00, 290.00, 45, '100g - 1kg', 5.0, 24,
    '/assets/mini-honey-nuts.jpg',
    true, true, true, true, true, false, true
  ),
  (
    'p2222222-2222-2222-2222-222222222222',
    'Premium California Almonds',
    'premium-almonds',
    'Naturally sun-dried Grade A California almonds. Packed with Vitamin E, dietary fiber, magnesium, and healthy monounsaturated fats. Crisp, fresh, and naturally sweet.',
    '100% Natural Fresh Almonds',
    'c2222222-2222-2222-2222-222222222222',
    'MNR-ALM-002',
    450.00, 390.00, 60, '250g - 1kg', 4.9, 18,
    'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=600&q=80',
    true, true, false, false, false, false, true
  ),
  (
    'p3333333-3333-3333-3333-333333333333',
    'Crisp Walnut Kernels',
    'walnut-kernels',
    'Fresh and brain-healthy whole walnut kernels rich in Omega-3 fatty acids and antioxidants. Shelled carefully to preserve delicate natural oils.',
    'Fresh & Crunchy Walnut Kernels',
    'c2222222-2222-2222-2222-222222222222',
    'MNR-WLN-003',
    550.00, 480.00, 30, '250g - 1kg', 4.8, 12,
    'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=600&q=80',
    true, false, true, false, false, false, true
  ),
  (
    'p4444444-4444-4444-4444-444444444444',
    'Premium Saudi Dates',
    'premium-dates',
    'Naturally sweet and succulent royal dates imported directly from Medina. Soft texture, rich caramel flavor, and loaded with natural potassium and fiber.',
    'Natural Sweetness Royal Dates',
    'c4444444-4444-4444-4444-444444444444',
    'MNR-DAT-004',
    380.00, 320.00, 80, '500g - 1kg', 4.9, 32,
    'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=600&q=80',
    true, false, false, true, false, false, true
  ),
  (
    'p5555555-5555-5555-5555-555555555555',
    'Gourmet Trail Mix',
    'gourmet-trail-mix',
    'Balanced combination of roasted nuts, dried berries, and wholesome seeds. The perfect daily nutrient boost for athletes, students, and busy professionals.',
    'Energy & Daily Nutrition Mix',
    'c6666666-6666-6666-6666-666666666666',
    'MNR-TRL-005',
    420.00, 350.00, 55, '250g - 500g', 4.7, 20,
    'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=600&q=80',
    true, false, false, false, false, true, true
  ),
  (
    'p6666666-6666-6666-6666-666666666666',
    'Raw Sundarban Wild Honey',
    'sundarban-wild-honey',
    '100% pure, unprocessed raw floral honey harvested from the pristine mangroves of the Sundarbans. Unpasteurized and packed with natural enzymes, pollen, and immune-strengthening antioxidants.',
    'Pure Floral Forest Honey',
    'c8888888-8888-8888-8888-888888888888',
    'MNR-HNY-006',
    600.00, 520.00, 40, '250g - 1kg', 5.0, 45,
    'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    true, true, true, true, false, false, true
  )
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Product Variants
-- Variants for Mini Honey Nuts
INSERT INTO public.product_variants (id, product_id, sku, attributes, regular_price, sales_price, stock_quantity, low_stock_threshold, image_url, active)
VALUES
  ('v1111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', 'MNR-HN-100G', '{"weight": "100g"}'::jsonb, 350.00, 290.00, 20, 5, '/assets/mini-honey-nuts.jpg', true),
  ('v1111111-1111-1111-1111-111111111112', 'p1111111-1111-1111-1111-111111111111', 'MNR-HN-250G', '{"weight": "250g"}'::jsonb, 790.00, 650.00, 15, 5, '/assets/mini-honey-nuts.jpg', true),
  ('v1111111-1111-1111-1111-111111111113', 'p1111111-1111-1111-1111-111111111111', 'MNR-HN-500G', '{"weight": "500g"}'::jsonb, 1490.00, 1250.00, 10, 3, '/assets/mini-honey-nuts.jpg', true),
  ('v1111111-1111-1111-1111-111111111114', 'p1111111-1111-1111-1111-111111111111', 'MNR-HN-1KG',  '{"weight": "1kg"}'::jsonb, 2800.00, 2390.00, 5, 2, '/assets/mini-honey-nuts.jpg', true),

  -- Variants for Almonds
  ('v2222222-2222-2222-2222-222222222221', 'p2222222-2222-2222-2222-222222222222', 'MNR-ALM-250G', '{"weight": "250g"}'::jsonb, 450.00, 390.00, 30, 5, NULL, true),
  ('v2222222-2222-2222-2222-222222222222', 'p2222222-2222-2222-2222-222222222222', 'MNR-ALM-500G', '{"weight": "500g"}'::jsonb, 850.00, 750.00, 20, 5, NULL, true),
  ('v2222222-2222-2222-2222-222222222223', 'p2222222-2222-2222-2222-222222222222', 'MNR-ALM-1KG',  '{"weight": "1kg"}'::jsonb, 1650.00, 1450.00, 10, 3, NULL, true),

  -- Variants for Walnuts
  ('v3333333-3333-3333-3333-333333333331', 'p3333333-3333-3333-3333-333333333333', 'MNR-WLN-250G', '{"weight": "250g"}'::jsonb, 550.00, 480.00, 15, 5, NULL, true),
  ('v3333333-3333-3333-3333-333333333332', 'p3333333-3333-3333-3333-333333333333', 'MNR-WLN-500G', '{"weight": "500g"}'::jsonb, 1050.00, 920.00, 10, 3, NULL, true),

  -- Variants for Dates
  ('v4444444-4444-4444-4444-444444444441', 'p4444444-4444-4444-4444-444444444444', 'MNR-DAT-500G', '{"weight": "500g"}'::jsonb, 380.00, 320.00, 50, 10, NULL, true),
  ('v4444444-4444-4444-4444-444444444442', 'p4444444-4444-4444-4444-444444444444', 'MNR-DAT-1KG',  '{"weight": "1kg"}'::jsonb, 720.00, 620.00, 30, 5, NULL, true),

  -- Variants for Trail Mix
  ('v5555555-5555-5555-5555-555555555551', 'p5555555-5555-5555-5555-555555555555', 'MNR-TRL-250G', '{"weight": "250g"}'::jsonb, 420.00, 350.00, 35, 5, NULL, true),
  ('v5555555-5555-5555-5555-555555555552', 'p5555555-5555-5555-5555-555555555555', 'MNR-TRL-500G', '{"weight": "500g"}'::jsonb, 800.00, 680.00, 20, 5, NULL, true),

  -- Variants for Honey
  ('v6666666-6666-6666-6666-666666666661', 'p6666666-6666-6666-6666-666666666666', 'MNR-HNY-250G', '{"weight": "250g"}'::jsonb, 600.00, 520.00, 25, 5, NULL, true),
  ('v6666666-6666-6666-6666-666666666662', 'p6666666-6666-6666-6666-666666666666', 'MNR-HNY-500G', '{"weight": "500g"}'::jsonb, 1150.00, 990.00, 15, 3, NULL, true)
ON CONFLICT (id) DO NOTHING;

-- 4. Hero Slides
INSERT INTO public.hero_slides (id, headline, description, image_url, badge, cta_text, cta_url, display_order, active)
VALUES
  (
    'h1111111-1111-1111-1111-111111111111',
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
    'h2222222-2222-2222-2222-222222222222',
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

-- 5. Site Settings
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
