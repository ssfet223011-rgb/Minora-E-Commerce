export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'rocket' | 'bank_transfer';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentStatus =
  | 'pending'
  | 'pending_verification'
  | 'verified'
  | 'rejected'
  | 'refunded';

export type UserRole = 'admin' | 'customer';
export type UserStatus = 'active' | 'suspended';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  parent_category_id?: string | null;
  display_order: number;
  active: boolean;
  created_at?: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  attributes: Record<string, string>; // e.g. { weight: "250g", packaging: "Jar" }
  regular_price: number;
  sales_price: number;
  stock_quantity: number;
  low_stock_threshold?: number;
  image_url?: string;
  active: boolean;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string;
  display_order: number;
  variant_id?: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  category_id: string;
  category_name?: string;
  sku: string;
  regular_price: number;
  sales_price: number;
  stock_quantity: number;
  weight_display?: string;
  rating: number;
  reviews_count: number;
  image_url: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  featured: boolean;
  is_best_seller: boolean;
  is_organic?: boolean;
  is_popular?: boolean;
  is_new?: boolean;
  is_sale?: boolean;
  active: boolean;
  seo_title?: string;
  seo_description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  variant_id?: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string;
  product_name: string;
  sku: string;
  selected_attributes?: Record<string, string>;
  image_url: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface PaymentRecord {
  id: string;
  order_id: string;
  payment_method: PaymentMethod;
  amount: number;
  transaction_reference?: string;
  sender_phone?: string;
  verification_status: PaymentStatus;
  verified_by?: string;
  verified_at?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string | null;
  guest_name: string;
  guest_phone: string;
  guest_email?: string;
  delivery_address: string;
  district: string;
  city: string;
  delivery_instructions?: string;
  order_notes?: string;
  subtotal: number;
  discount: number;
  shipping_fee: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  fulfillment_status: OrderStatus;
  items: OrderItem[];
  payment_record?: PaymentRecord;
  internal_notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface InventoryMovement {
  id: string;
  variant_id: string;
  product_name?: string;
  sku?: string;
  quantity_change: number; // e.g. -2 for order, +10 for restock
  movement_type: 'order_deduction' | 'order_cancellation' | 'restock' | 'adjustment' | 'return';
  reason: string;
  related_order_id?: string;
  actor_id?: string;
  created_at: string;
}

export interface HeroSlide {
  id: string;
  headline: string;
  description: string;
  image_url: string;
  badge?: string;
  cta_text: string;
  cta_url: string;
  display_order: number;
  active: boolean;
}

export interface SiteSettings {
  brandName: string;
  tagline: string;
  logoUrl: string;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    youtube: string;
    twitter: string;
  };
  deliveryFees: {
    insideCity: number;
    outsideCity: number;
    freeDeliveryThreshold: number;
  };
  paymentSettings: {
    [key in PaymentMethod]: {
      enabled: boolean;
      title: string;
      accountType: string; // e.g. "Personal (Send Money)", "Merchant", "Bank Account"
      accountNumber: string;
      instructions: string;
    };
  };
  policies: {
    terms: string;
    privacy: string;
    refund: string;
    shipping: string;
  };
}
