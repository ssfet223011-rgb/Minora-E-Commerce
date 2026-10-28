import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Plus, Minus, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { useNavigate } from 'react-router-dom';

export const CartDrawer: React.FC = () => {
  const { isCartOpen, closeCart, items, subtotal, updateQuantity, removeFromCart } = useCart();
  const { formatPrice, settings } = useSettings();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const freeShippingThreshold = settings.deliveryFees.freeDeliveryThreshold || 1500;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-chocolate-deep/60 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-ivory shadow-2xl flex flex-col border-l border-amber/20 animate-slideLeft">
          {/* Header */}
          <div className="p-5 bg-cream/70 border-b border-amber/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber" />
              <h2 className="text-lg font-serif font-bold text-chocolate">Your Shopping Cart</h2>
              <span className="bg-chocolate text-honey text-xs font-bold px-2 py-0.5 rounded-full">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 rounded-full text-chocolate/70 hover:text-chocolate hover:bg-cream-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Banner */}
          <div className="bg-cream/40 px-5 py-3 border-b border-amber/15">
            <div className="flex items-center justify-between text-xs font-medium text-chocolate mb-1.5">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber" />
                {amountToFreeShipping > 0 ? (
                  <span>
                    Add <strong className="text-amber-dark">{formatPrice(amountToFreeShipping)}</strong> more for <strong>FREE Delivery</strong>!
                  </span>
                ) : (
                  <span className="text-emerald-700 font-bold">You qualify for FREE Delivery!</span>
                )}
              </span>
              <span className="text-[11px] text-chocolate/60">{progressPercent}%</span>
            </div>
            <div className="w-full bg-cream-300 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-amber/10">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-chocolate/60">
                <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-amber/60" />
                </div>
                <h3 className="font-serif font-semibold text-chocolate text-base mb-1">Your cart is empty</h3>
                <p className="text-xs max-w-xs mb-6">
                  Explore our selection of natural dry fruits, organic nuts, seeds, and raw pure honey.
                </p>
                <button
                  onClick={() => {
                    closeCart();
                    navigate('/shop');
                  }}
                  className="px-6 py-2.5 bg-chocolate hover:bg-chocolate-light text-honey text-sm font-bold rounded-full shadow-md transition-all"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-4 flex gap-3 group">
                  <img
                    src={item.variant?.image_url || item.product.image_url}
                    alt={item.product.name}
                    className="w-18 h-18 w-[72px] h-[72px] object-cover rounded-xl border border-amber/20 bg-cream/30 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-chocolate truncate">{item.product.name}</h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-chocolate/40 hover:text-red-600 transition-colors p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Variant badge */}
                    {item.variant?.attributes && Object.keys(item.variant.attributes).length > 0 && (
                      <span className="inline-block mt-0.5 px-2 py-0.5 bg-cream text-chocolate/80 text-[11px] font-medium rounded border border-amber/20">
                        {Object.values(item.variant.attributes).join(' • ')}
                      </span>
                    )}

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-bold text-chocolate">{formatPrice(item.unit_price)}</span>

                      {/* Quantity Controller */}
                      <div className="flex items-center border border-amber/30 rounded-lg bg-white overflow-hidden shadow-2xs">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 text-chocolate/70 hover:bg-cream hover:text-chocolate transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-chocolate min-w-[24px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 text-chocolate/70 hover:bg-cream hover:text-chocolate transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Subtotal & Checkout */}
          {items.length > 0 && (
            <div className="p-5 bg-cream/70 border-t border-amber/20 space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-chocolate/70">
                  <span>Subtotal</span>
                  <span className="font-semibold text-chocolate">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-chocolate/70 text-xs">
                  <span>Estimated Delivery</span>
                  <span>{subtotal >= freeShippingThreshold ? <strong className="text-emerald-700">FREE</strong> : 'Calculated at checkout'}</span>
                </div>
                <div className="pt-2 border-t border-amber/20 flex justify-between text-base font-bold text-chocolate">
                  <span>Payable Total</span>
                  <span className="text-amber-dark font-serif text-lg">{formatPrice(subtotal)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-chocolate hover:bg-chocolate-light text-honey font-bold rounded-xl transition-all shadow-warm flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
