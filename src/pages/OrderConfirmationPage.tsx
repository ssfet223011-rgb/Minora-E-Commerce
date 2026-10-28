import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, Clock, Phone, MapPin, Printer, ArrowRight } from 'lucide-react';
import { orderService } from '../services/orderService';
import { Order } from '../types';
import { useSettings } from '../context/SettingsContext';

export const OrderConfirmationPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { formatPrice, settings } = useSettings();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderNumber) return;
      setLoading(true);
      const data = await orderService.getOrderByNumber(orderNumber);
      setOrder(data);
      setLoading(false);
    };
    fetchOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber border-t-transparent mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center max-w-md mx-auto px-4">
        <h2 className="text-xl font-serif font-bold text-chocolate mb-2">Order Not Found</h2>
        <p className="text-xs text-chocolate/70 mb-6">Could not find order details for #{orderNumber}.</p>
        <Link
          to="/"
          className="px-6 py-2.5 bg-chocolate text-honey text-xs font-bold rounded-full shadow-md"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const isManualPayment = order.payment_method !== 'cod';

  return (
    <div className="py-12 bg-ivory min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Success Banner */}
        <div className="bg-white rounded-3xl p-8 border border-amber/20 shadow-warm text-center mb-8 relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-700 block">
            Thank you for choosing MINORA!
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate mt-1">
            Your Order Has Been Placed Successfully
          </h1>
          <p className="text-sm text-chocolate/70 mt-2 max-w-md mx-auto">
            Order Reference Number:{' '}
            <strong className="text-chocolate font-mono text-base">{order.order_number}</strong>
          </p>

          {/* Payment Status Alert */}
          {isManualPayment && order.payment_status === 'pending_verification' && (
            <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber/30 text-left text-xs space-y-1">
              <strong className="font-bold text-chocolate flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber" /> Manual Payment Under Verification
              </strong>
              <p className="text-chocolate/80 leading-relaxed">
                We received your {settings.paymentSettings[order.payment_method]?.title} reference (
                <span className="font-mono font-bold">{order.payment_record?.transaction_reference}</span>).
                Our accounts team will verify the payment and confirm your shipment shortly.
              </p>
            </div>
          )}

          {order.payment_method === 'cod' && (
            <div className="mt-6 p-4 rounded-2xl bg-cream border border-amber/30 text-left text-xs space-y-1">
              <strong className="font-bold text-chocolate flex items-center gap-1.5">
                <Package className="w-4 h-4 text-amber" /> Cash on Delivery (COD)
              </strong>
              <p className="text-chocolate/80">
                Please keep <strong className="text-chocolate">{formatPrice(order.total)}</strong> ready in cash for our delivery courier upon package arrival.
              </p>
            </div>
          )}
        </div>

        {/* Order Details Invoice Card */}
        <div className="bg-white rounded-3xl p-8 border border-amber/20 shadow-warm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-amber/15">
            <h2 className="font-serif text-lg font-bold text-chocolate">Order Details</h2>
            <button
              onClick={() => window.print()}
              className="text-xs font-semibold text-chocolate/70 hover:text-chocolate flex items-center gap-1 py-1.5 px-3 rounded-lg border border-amber/20 hover:bg-cream transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
          </div>

          {/* Delivery & Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-cream/40 rounded-xl space-y-1">
              <strong className="block font-bold text-chocolate flex items-center gap-1 mb-1">
                <MapPin className="w-3.5 h-3.5 text-amber" /> Delivery Address
              </strong>
              <p className="text-chocolate font-medium">{order.guest_name}</p>
              <p className="text-chocolate/80">{order.delivery_address}</p>
              <p className="text-chocolate/80">{order.city}, {order.district}</p>
              {order.delivery_instructions && (
                <p className="text-chocolate/60 italic pt-1">Note: {order.delivery_instructions}</p>
              )}
            </div>

            <div className="p-4 bg-cream/40 rounded-xl space-y-1">
              <strong className="block font-bold text-chocolate flex items-center gap-1 mb-1">
                <Phone className="w-3.5 h-3.5 text-amber" /> Contact & Payment
              </strong>
              <p className="text-chocolate font-medium">{order.guest_phone}</p>
              {order.guest_email && <p className="text-chocolate/80">{order.guest_email}</p>}
              <p className="text-chocolate/80 pt-1">
                Payment Method:{' '}
                <strong className="uppercase text-chocolate">{settings.paymentSettings[order.payment_method]?.title || order.payment_method}</strong>
              </p>
              <p className="text-chocolate/80">
                Payment Status:{' '}
                <span className="font-bold text-amber-dark capitalize">
                  {order.payment_status.replace('_', ' ')}
                </span>
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-chocolate/80">Ordered Items</h3>
            <div className="divide-y divide-amber/10 border-y border-amber/10">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="w-12 h-12 rounded-lg object-cover border border-amber/15"
                    />
                    <div>
                      <h4 className="font-bold text-chocolate">{item.product_name}</h4>
                      {item.selected_attributes && Object.keys(item.selected_attributes).length > 0 && (
                        <span className="text-[11px] text-chocolate/60">
                          {Object.values(item.selected_attributes).join(' • ')}
                        </span>
                      )}
                      <p className="text-[11px] text-chocolate/50">SKU: {item.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-chocolate/70 block">
                      {item.quantity} × {formatPrice(item.unit_price)}
                    </span>
                    <strong className="font-bold text-chocolate block">{formatPrice(item.line_total)}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="pt-2 space-y-1.5 text-xs text-right max-w-xs ml-auto">
            <div className="flex justify-between text-chocolate/70">
              <span>Subtotal:</span>
              <span className="font-medium text-chocolate">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-chocolate/70">
              <span>Delivery Charge:</span>
              <span className="font-medium text-chocolate">{formatPrice(order.shipping_fee)}</span>
            </div>
            <div className="pt-2 border-t border-amber/20 flex justify-between text-base font-bold text-chocolate">
              <span>Total Paid/Payable:</span>
              <span className="text-amber-dark font-serif text-lg">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-amber/15 flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/shop"
              className="px-6 py-2.5 bg-chocolate hover:bg-chocolate-light text-honey font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-xs"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <span className="text-xs text-chocolate/60">
              Need assistance? Call us at <a href={`tel:${settings.contactPhone}`} className="font-bold text-chocolate">{settings.contactPhone}</a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
