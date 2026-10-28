# MINORA – Pure • Natural • Healthy
### Full-Stack E-Commerce Web Application MVP

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vite.dev/)

A production-minded, full-stack e-commerce application for **MINORA**, specializing in premium natural dry fruits, organic nuts, seeds, dates, and artisanal raw honey. Built with a responsive, high-aesthetic UI styled to match the official MINORA design references, backed by Supabase PostgreSQL with atomic stock transactions, manual mobile payment verification, and a protected administration console.

---

## 🌟 Brand Design System

| Element | Color Code | Purpose |
| :--- | :--- | :--- |
| **Warm Cream** | `#FFF8E8` | Hero gradient, pill tags, subtle borders |
| **Soft Ivory** | `#FFFDF7` | Page background, cards, clean canvas |
| **Honey Yellow** | `#F5C542` | Accents, badges, active indicators |
| **Golden Amber** | `#D99A16` | Primary buttons, price highlights, stars |
| **Deep Chocolate** | `#432510` | Navigation bar, headings, cart buttons, footer |
| **Dark Olive** | `#292B0B` | Secondary branding, natural badges |
| **White** | `#FFFFFF` | Product cards, input containers |

- **Typography**: Google Serif headings (*Playfair Display*) paired with clean modern sans-serif (*Plus Jakarta Sans*).
- **Default Currency**: Bangladeshi Taka (`৳` / BDT).

---

## 🚀 Key Features

### 1. Customer Storefront
- **Header & Navigation**:
  - Official MINORA brand logo with gold leaves.
  - Live search bar with instant autocomplete results and debounce.
  - Social media icons (Facebook, Instagram, YouTube, Twitter) editable from admin.
  - Shopping cart icon with real-time counter badge.
  - Deep chocolate navigation bar with responsive mobile drawer.
- **Hero Section**:
  - Highlighting *"Pure Goodness in Every Bite"*.
  - Featured selection showcase using the original **Mini Honey Nuts** image.
  - Accessible slide carousel with pagination dots and navigation chevrons.
- **Shop by Category**:
  - 8 circular cards matching the mockup: Dry Fruits, Nuts, Seeds, Dates, Superfoods, Trail Mix, Organic, Honey & More.
  - Quick filtering by category slug.
- **Latest Products & Filter Tabs**:
  - Filter by All, New Harvest, Best Sellers, and Special Offers.
  - Status badges: *New*, *Best Seller*, *Organic*, *Popular*, *Sale*.
  - Strikethrough regular price with bold discounted sale price.
  - Quick "Add to Cart" with stock validation.
- **Interactive Product Details (`/product/:slug`)**:
  - High-resolution gallery with thumbnail switcher.
  - Database-driven package variation selectors (**100g, 250g, 500g, 1kg**).
  - Immediate dynamic updating of SKU, price, regular price, stock, and image upon selecting variations.
  - Quantity selector capped at current stock level.
  - "Add to Cart" and "Buy Now" workflows.
- **Slide-Over Cart Drawer**:
  - Variation attributes, unit prices, and line subtotals.
  - Free delivery progress bar indicating threshold.
  - Real-time stock validation preventing excess additions.
- **Mobile-Friendly Checkout (`/checkout`)**:
  - Recipient full name, phone number, email, address, district, and notes.
  - Dynamic delivery charge calculation (City vs. Nationwide vs. Free delivery threshold).
  - **Payment Methods**:
    1. Cash on Delivery (COD).
    2. Manual bKash (Personal Send Money).
    3. Manual Nagad (Personal Send Money).
    4. Manual Rocket (Personal Send Money).
    5. Manual Bank Transfer (City Bank Account).
  - For manual payments: Displays dynamic instructions, account numbers, and collects Transaction ID (TrxID) & sender number.
  - Idempotent submission preventing duplicate order creation.
- **Order Confirmation & Tracking (`/order-confirmation/:orderNumber`)**:
  - Displays generated order number (e.g. `MNR-20261027-1042`).
  - Invoice breakdown, payment verification notice, and print button.

---

### 2. Protected Administration Dashboard (`/admin`)
- **Dashboard Overview**:
  - Real-time database KPI metrics: Total revenue, total orders, pending review, out-of-stock items, active products.
  - Recent orders feed with payment status flags.
- **Order Management**:
  - Searchable and filterable by fulfillment status and payment status.
  - Inspection modal with ordered items, variations, customer address, and submitted TrxID.
  - One-click **Approve & Verify Payment** or **Reject Payment**.
  - Fulfillment status controls (*Pending*, *Confirmed*, *Processing*, *Shipped*, *Delivered*).
  - **Cancel Order & Restore Inventory**: Atomically restores stock back into package variants and products with movement audit logging.
- **Product & Variation Management**:
  - Full CRUD for products: image URLs, category, SKU, prices, description, publication status.
  - Dynamic package variations builder: customize weights (100g, 250g, etc.), variation SKUs, individual prices, and variant stocks.
- **Category Management**:
  - Full CRUD: Name, slug, description, image, display order, active toggle.
  - Safe deletion prevention if active products reference the category.
- **Inventory & Movement Logs**:
  - Real-time variant stock tracking with low-stock alerts.
  - Stock adjustment modal with movement classification (*Restock*, *Damage*, *Count Correction*, *Return*).
  - Full chronological movement audit log.
- **Customer Accounts & Anti-Abuse**:
  - View registered customer profiles and associated order histories.
  - Suspend or activate accounts to block abusive customers.
- **Storefront Settings**:
  - Live configuration of brand name, tagline, contact address, phone, email, and social links.
  - Configure manual payment recipient numbers (bKash, Nagad, Rocket, Bank Transfer) without code deployment.
  - Shipping fees and free delivery threshold configuration.

---

## 🗄️ Database Architecture (15 Supabase Tables)

The application includes PostgreSQL migrations in `supabase/migrations/`:

1. `profiles`: User accounts linked with Supabase Auth, roles (`admin` | `customer`), and status.
2. `categories`: Product categories with slugs, display order, and active visibility.
3. `products`: Natural food catalog items with slugs, category references, flags, and SEO metadata.
4. `product_images`: Multi-image gallery references per product or variation.
5. `product_attributes`: Dynamic attribute definitions (e.g. `weight`, `packaging`).
6. `product_attribute_values`: Attribute values (e.g. `100g`, `250g`, `500g`, `1kg`).
7. `product_variants`: Package variations with specific SKU, price, sales price, stock quantity, and attributes JSONB.
8. `carts` & `cart_items`: Cart persistence across devices.
9. `orders`: Customer and guest orders with unique order numbers, addresses, financial calculations, and statuses.
10. `order_items`: Snapshot of purchased items, variants, SKUs, unit prices, and quantities.
11. `payments`: Payment records, transaction reference IDs, sender numbers, verification status, and audit timestamps.
12. `inventory_movements`: Immutable log of every inventory delta with movement reason and actor.
13. `site_settings`: Global configuration (brand, contact, payment numbers, delivery fees) in JSONB.
14. `hero_slides`: Slideshow banners, headlines, CTAs, and active toggles.
15. `audit_logs`: Operational events for security and administrative audits.

### Stored Database Functions (RPC):
- `public.create_order_secure(...)`: Locks variant rows with `FOR UPDATE` to prevent race-condition overselling, validates inventory, recalculates line totals and shipping on the server, inserts the order and items, deducts inventory, records movement, and returns the order number.
- `public.cancel_order_secure(...)`: Restores item quantities atomically back to the variants and products and writes movement logs.
- `public.verify_payment_secure(...)`: Verifies manual payment references and updates order fulfillment.
- `public.assign_admin_role(p_email)`: Secure function for bootstrapping initial administrators.

---

## 🛠️ Installation & Local Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 1. Clone & Install Dependencies
```bash
cd C:\Users\UESR\.gemini\antigravity\scratch\minora-ecommerce
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Supabase project credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-public-key
```
> **Offline / Demo Architecture Note**: If Supabase credentials are not configured yet, MINORA automatically boots into a local persistent database populated with the exact mock data (Mini Honey Nuts, almonds, walnuts, dates, trail mix, honey, categories, and settings). All cart, checkout, stock adjustment, and admin workflows are completely functional and persist in browser storage. Once Supabase credentials are provided, the application connects to the PostgreSQL backend!

### 3. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```

### 5. Run Automated Workflows Verification
```bash
npm run test
```

---

## 🔒 Supabase Setup & Secure Admin Bootstrap

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Under **Project Settings -> API**, copy your **Project URL** and **anon public key** into your `.env` file.

### 2. Execute SQL Migrations
In the Supabase Dashboard, navigate to the **SQL Editor**, and run the migrations in `supabase/migrations/` in order:
1. `20261027000000_init_minora_schema.sql` (Creates all 15 tables, RLS policies, and RPC functions).
2. `20261027000001_seed_minora_data.sql` (Seeds initial categories, products, variants, settings, and hero slides).
3. `20261027000002_admin_helpers_and_storage.sql` (Sets up storage buckets, cancellation procedure, and admin helper).

### 3. Securely Create the First Administrator
1. In your MINORA storefront, click **Register** (or use the Supabase Auth Dashboard) to sign up your admin email (e.g. `admin@minora.com`).
2. In the Supabase **SQL Editor**, run the bootstrap procedure:
   ```sql
   SELECT public.assign_admin_role('admin@minora.com');
   ```
3. Your account is now granted the `admin` role with full access to `/admin`.
4. *For evaluation*: In demo mode, click **Quick One-Click Admin Access** in the Login modal to test the admin dashboard immediately.

---

## 📁 Reference Brand Assets

The official brand images have been integrated into the public asset pipeline:
- **MINORA Logo**: `public/assets/minora-logo.png`
- **Mini Honey Nuts Featured Product**: `public/assets/mini-honey-nuts.jpg`
- **Design Mockup Reference**: `public/assets/minora-mockup-reference.jpg`

---

## 🚢 Deployment (Vercel)

1. Push your repository to GitHub / GitLab.
2. Import the project into [Vercel](https://vercel.com).
3. Set the Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Deploy!
