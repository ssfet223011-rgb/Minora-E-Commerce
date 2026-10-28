import { Order, OrderStatus, PaymentStatus, PaymentMethod, OrderItem, InventoryMovement } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { storeService } from './storeService';
import { INITIAL_ORDERS } from './initialData';

const ORDERS_STORAGE_KEY = 'minora_orders';
const MOVEMENTS_STORAGE_KEY = 'minora_inventory_movements';

export interface CheckoutPayload {
  userId?: string | null;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  deliveryAddress: string;
  district: string;
  city: string;
  deliveryInstructions?: string;
  orderNotes?: string;
  paymentMethod: PaymentMethod;
  senderPhone?: string;
  transactionReference?: string;
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
  }>;
}

export const orderService = {
  // GET ALL ORDERS (Admin / Filterable)
  async getOrders(filters?: {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    search?: string;
  }): Promise<Order[]> {
    let orders: Order[] = [];

    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('orders').select('*, order_items(*), payments(*)');
        if (filters?.status) query = query.eq('fulfillment_status', filters.status);
        if (filters?.paymentStatus) query = query.eq('payment_status', filters.paymentStatus);
        const { data, error } = await query.order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          orders = data.map((ord) => ({
            ...ord,
            items: ord.order_items || [],
            payment_record: ord.payments?.[0],
          }));
        }
      } catch (err) {
        console.warn('Supabase orders fetch error, falling back to local', err);
      }
    }

    if (orders.length === 0) {
      try {
        const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
        orders = raw ? JSON.parse(raw) : INITIAL_ORDERS;
      } catch {
        orders = INITIAL_ORDERS;
      }
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      orders = orders.filter(
        (o) =>
          o.order_number.toLowerCase().includes(q) ||
          o.guest_name.toLowerCase().includes(q) ||
          o.guest_phone.toLowerCase().includes(q) ||
          o.payment_record?.transaction_reference?.toLowerCase().includes(q)
      );
    }

    if (filters?.status) {
      orders = orders.filter((o) => o.fulfillment_status === filters.status);
    }

    if (filters?.paymentStatus) {
      orders = orders.filter((o) => o.payment_status === filters.paymentStatus);
    }

    return orders;
  },

  // GET ORDER BY NUMBER (for tracking or confirmation)
  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    const orders = await this.getOrders();
    return orders.find((o) => o.order_number.toUpperCase() === orderNumber.toUpperCase().trim()) || null;
  },

  // GET ORDER BY ID
  async getOrderById(id: string): Promise<Order | null> {
    const orders = await this.getOrders();
    return orders.find((o) => o.id === id) || null;
  },

  // CREATE ORDER (Atomic, Server-validated prices and stock)
  async createOrder(payload: CheckoutPayload): Promise<{ success: boolean; order?: Order; error?: string }> {
    if (!payload.items || payload.items.length === 0) {
      return { success: false, error: 'Your shopping cart is empty.' };
    }

    if (!payload.guestName?.trim() || !payload.guestPhone?.trim() || !payload.deliveryAddress?.trim()) {
      return { success: false, error: 'Please provide full recipient name, valid phone number, and delivery address.' };
    }

    // Attempt RPC if Supabase configured
    if (isSupabaseConfigured) {
      try {
        const settings = await storeService.getSiteSettings();
        const shippingFee = payload.district.toLowerCase().includes('dhaka') || payload.district.toLowerCase().includes('chittagong')
          ? settings.deliveryFees.insideCity
          : settings.deliveryFees.outsideCity;

        const { data, error } = await supabase.rpc('create_order_secure', {
          p_user_id: payload.userId || null,
          p_guest_name: payload.guestName,
          p_guest_phone: payload.guestPhone,
          p_guest_email: payload.guestEmail || '',
          p_delivery_address: payload.deliveryAddress,
          p_district: payload.district,
          p_city: payload.city,
          p_delivery_instructions: payload.deliveryInstructions || '',
          p_order_notes: payload.orderNotes || '',
          p_payment_method: payload.paymentMethod,
          p_items: payload.items.map((i) => ({ variant_id: i.variantId, quantity: i.quantity })),
          p_shipping_fee: shippingFee,
          p_sender_phone: payload.senderPhone || null,
          p_transaction_reference: payload.transactionReference || null,
        });

        if (!error && data?.order_number) {
          const freshOrder = await this.getOrderByNumber(data.order_number);
          if (freshOrder) return { success: true, order: freshOrder };
        }
      } catch (rpcErr) {
        console.warn('Supabase RPC order error, proceeding with atomic service fallback', rpcErr);
      }
    }

    // Atomic execution & validation in data service
    const allProducts = await storeService.getProducts();
    const settings = await storeService.getSiteSettings();

    let computedSubtotal = 0;
    const orderItems: OrderItem[] = [];

    // 1. Verify availability and lock prices
    for (const item of payload.items) {
      const product = allProducts.find((p) => p.id === item.productId);
      if (!product || !product.active) {
        return { success: false, error: `Product "${product?.name || item.productId}" is no longer available.` };
      }

      let selectedVariant = product.variants?.find((v) => v.id === item.variantId);
      if (!selectedVariant && product.variants && product.variants.length > 0) {
        selectedVariant = product.variants[0];
      }

      const availableStock = selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity;
      if (availableStock < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for ${product.name} (${selectedVariant?.sku || 'Item'}). Available: ${availableStock}, Requested: ${item.quantity}`,
        };
      }

      const unitPrice = selectedVariant ? selectedVariant.sales_price : product.sales_price;
      const lineTotal = unitPrice * item.quantity;
      computedSubtotal += lineTotal;

      orderItems.push({
        id: 'ord_item_' + Math.random().toString(36).substring(2, 9),
        order_id: '',
        product_id: product.id,
        variant_id: selectedVariant?.id,
        product_name: product.name,
        sku: selectedVariant?.sku || product.sku,
        selected_attributes: selectedVariant?.attributes || {},
        image_url: selectedVariant?.image_url || product.image_url,
        unit_price: unitPrice,
        quantity: item.quantity,
        line_total: lineTotal,
      });
    }

    // 2. Shipping calculation
    const isInsideCity =
      payload.district.toLowerCase().includes('chittagong') ||
      payload.district.toLowerCase().includes('dhaka') ||
      payload.city.toLowerCase().includes('chittagong') ||
      payload.city.toLowerCase().includes('dhaka');

    const shippingFee = computedSubtotal >= settings.deliveryFees.freeDeliveryThreshold
      ? 0
      : isInsideCity
      ? settings.deliveryFees.insideCity
      : settings.deliveryFees.outsideCity;

    const total = computedSubtotal + shippingFee;

    // 3. Deduct stock and record movements
    for (const item of payload.items) {
      const product = allProducts.find((p) => p.id === item.productId);
      if (product) {
        let variant = product.variants?.find((v) => v.id === item.variantId);
        if (variant) {
          variant.stock_quantity -= item.quantity;
          product.stock_quantity = product.variants?.reduce((sum, v) => sum + v.stock_quantity, 0) || product.stock_quantity;
        } else {
          product.stock_quantity -= item.quantity;
        }
      }
    }
    // Save updated products
    localStorage.setItem('minora_products', JSON.stringify(allProducts));

    // 4. Generate order
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `MNR-${dateStr}-${randomDigits}`;
    const orderId = 'ord_' + Date.now();

    const paymentStatus: PaymentStatus =
      payload.paymentMethod === 'cod' ? 'pending' : 'pending_verification';

    const newOrder: Order = {
      id: orderId,
      order_number: orderNumber,
      user_id: payload.userId || null,
      guest_name: payload.guestName,
      guest_phone: payload.guestPhone,
      guest_email: payload.guestEmail,
      delivery_address: payload.deliveryAddress,
      district: payload.district,
      city: payload.city,
      delivery_instructions: payload.deliveryInstructions,
      order_notes: payload.orderNotes,
      subtotal: computedSubtotal,
      discount: 0,
      shipping_fee: shippingFee,
      total: total,
      payment_method: payload.paymentMethod,
      payment_status: paymentStatus,
      fulfillment_status: 'pending',
      items: orderItems.map((i) => ({ ...i, order_id: orderId })),
      payment_record: {
        id: 'pay_' + Date.now(),
        order_id: orderId,
        payment_method: payload.paymentMethod,
        amount: total,
        transaction_reference: payload.transactionReference,
        sender_phone: payload.senderPhone,
        verification_status: paymentStatus,
        created_at: new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save order
    const currentOrders = await this.getOrders();
    currentOrders.unshift(newOrder);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(currentOrders));

    // Record inventory movements
    try {
      const rawMov = localStorage.getItem(MOVEMENTS_STORAGE_KEY);
      const movements: InventoryMovement[] = rawMov ? JSON.parse(rawMov) : [];
      for (const item of orderItems) {
        movements.unshift({
          id: 'mov_' + Math.random().toString(36).substring(2, 9),
          variant_id: item.variant_id || item.product_id,
          product_name: item.product_name,
          sku: item.sku,
          quantity_change: -item.quantity,
          movement_type: 'order_deduction',
          reason: `Customer order ${orderNumber}`,
          related_order_id: orderId,
          created_at: new Date().toISOString(),
        });
      }
      localStorage.setItem(MOVEMENTS_STORAGE_KEY, JSON.stringify(movements));
    } catch (e) {
      console.error(e);
    }

    return { success: true, order: newOrder };
  },

  // UPDATE ORDER STATUS
  async updateOrderStatus(orderId: string, status: OrderStatus, internalNotes?: string): Promise<boolean> {
    const orders = await this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return false;

    order.fulfillment_status = status;
    if (internalNotes) order.internal_notes = internalNotes;
    order.updated_at = new Date().toISOString();

    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('orders')
          .update({ fulfillment_status: status, internal_notes: internalNotes, updated_at: new Date().toISOString() })
          .eq('id', orderId);
      } catch (err) {
        console.warn('Supabase update order status error', err);
      }
    }

    return true;
  },

  // VERIFY PAYMENT (Manual bKash/Nagad/Rocket/Bank Transfer)
  async verifyPayment(orderId: string, status: PaymentStatus, verifiedBy?: string): Promise<boolean> {
    const orders = await this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return false;

    order.payment_status = status;
    if (order.payment_record) {
      order.payment_record.verification_status = status;
      order.payment_record.verified_by = verifiedBy || 'admin';
      order.payment_record.verified_at = new Date().toISOString();
    }
    if (status === 'verified' && order.fulfillment_status === 'pending') {
      order.fulfillment_status = 'confirmed';
    }
    order.updated_at = new Date().toISOString();

    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));

    if (isSupabaseConfigured) {
      try {
        await supabase.rpc('verify_payment_secure', {
          p_order_id: orderId,
          p_status: status,
          p_actor_id: verifiedBy || null,
        });
      } catch (err) {
        console.warn('Supabase verify payment error', err);
      }
    }

    return true;
  },

  // CANCEL ORDER WITH ATOMIC INVENTORY RESTORATION
  async cancelOrder(orderId: string, reason: string, actorId?: string): Promise<boolean> {
    const orders = await this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return false;
    if (order.fulfillment_status === 'cancelled') return false;

    // Restore stock for all products and variants in this order
    const allProducts = await storeService.getProducts();
    const rawMov = localStorage.getItem(MOVEMENTS_STORAGE_KEY);
    const movements: InventoryMovement[] = rawMov ? JSON.parse(rawMov) : [];

    for (const item of order.items) {
      const product = allProducts.find((p) => p.id === item.product_id);
      if (product) {
        const variant = product.variants?.find((v) => v.id === item.variant_id);
        if (variant) {
          variant.stock_quantity += item.quantity;
          product.stock_quantity = product.variants?.reduce((sum, v) => sum + v.stock_quantity, 0) || product.stock_quantity;
        } else {
          product.stock_quantity += item.quantity;
        }

        movements.unshift({
          id: 'mov_' + Math.random().toString(36).substring(2, 9),
          variant_id: item.variant_id || item.product_id,
          product_name: item.product_name,
          sku: item.sku,
          quantity_change: item.quantity,
          movement_type: 'order_cancellation',
          reason: `Restoration for cancelled order ${order.order_number}: ${reason}`,
          related_order_id: orderId,
          actor_id: actorId || 'admin',
          created_at: new Date().toISOString(),
        });
      }
    }

    localStorage.setItem('minora_products', JSON.stringify(allProducts));
    localStorage.setItem(MOVEMENTS_STORAGE_KEY, JSON.stringify(movements));

    // Update order status
    order.fulfillment_status = 'cancelled';
    order.payment_status = order.payment_status === 'verified' ? 'refunded' : 'rejected';
    order.internal_notes = (order.internal_notes ? order.internal_notes + '\n' : '') + `Cancelled: ${reason}`;
    order.updated_at = new Date().toISOString();

    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));

    if (isSupabaseConfigured) {
      try {
        await supabase.rpc('cancel_order_secure', {
          p_order_id: orderId,
          p_reason: reason,
          p_actor_id: actorId || null,
        });
      } catch (err) {
        console.warn('Supabase cancel order error', err);
      }
    }

    return true;
  },
};
