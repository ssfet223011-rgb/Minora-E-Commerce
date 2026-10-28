import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, CheckCircle, AlertCircle, ShoppingBag, Truck, Smartphone, Building2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { orderService } from '../services/orderService';
import { PaymentMethod } from '../types';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { settings, formatPrice } = useSettings();

  // Form states
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Chittagong');
  const [city, setCity] = useState('');
  const [instructions, setInstructions] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [transactionReference, setTransactionReference] = useState('');
  const [senderPhone, setSenderPhone] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="py-20 max-w-md mx-auto text-center px-4">
        <div className="w-16 h-16 rounded-full bg-cream mx-auto flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8 text-amber" />
        </div>
        <h2 className="text-xl font-serif font-bold text-chocolate mb-2">Your Cart is Empty</h2>
        <p className="text-xs text-chocolate/70 mb-6">You have no items in your cart to checkout.</p>
        <Link
          to="/shop"
          className="px-6 py-2.5 bg-chocolate text-honey text-xs font-bold rounded-full shadow-md hover:bg-chocolate-light transition-all"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  // Delivery calculation
  const isInsideCity =
    district.toLowerCase().includes('chittagong') ||
    district.toLowerCase().includes('dhaka') ||
    city.toLowerCase().includes('chittagong') ||
    city.toLowerCase().includes('dhaka');

  const freeDeliveryThreshold = settings.deliveryFees.freeDeliveryThreshold || 1500;
  const deliveryFee = subtotal >= freeDeliveryThreshold
    ? 0
    : isInsideCity
    ? settings.deliveryFees.insideCity
    : settings.deliveryFees.outsideCity;

  const grandTotal = subtotal + deliveryFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!fullName.trim()) {
      setErrorMessage('Please enter recipient full name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setErrorMessage('Please enter a valid phone number (minimum 10 digits).');
      return;
    }
    if (!address.trim() || address.trim().length < 5) {
      setErrorMessage('Please enter a complete delivery address.');
      return;
    }
    if (!district.trim()) {
      setErrorMessage('Please specify your delivery district.');
      return;
    }

    // Manual payment validation
    if (paymentMethod !== 'cod' && !transactionReference.trim()) {
      setErrorMessage(`Please enter your Transaction Reference (TrxID) for ${settings.paymentSettings[paymentMethod]?.title || 'manual payment'}.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        userId: user?.id || null,
        guestName: fullName.trim(),
        guestPhone: phone.trim(),
        guestEmail: email.trim() || undefined,
        deliveryAddress: address.trim(),
        district: district.trim(),
        city: city.trim() || district.trim(),
        deliveryInstructions: instructions.trim() || undefined,
        orderNotes: orderNotes.trim() || undefined,
        paymentMethod,
        senderPhone: senderPhone.trim() || phone.trim(),
        transactionReference: transactionReference.trim() || undefined,
        items: items.map((i) => ({
          productId: i.product_id,
          variantId: i.variant_id,
          quantity: i.quantity,
        })),
      };

      const result = await orderService.createOrder(payload);

      if (result.success && result.order) {
        clearCart();
        navigate(`/order-confirmation/${result.order.order_number}`);
      } else {
        setErrorMessage(result.error || 'Failed to place order. Please review your details and try again.');
        setIsSubmitting(false);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred during checkout.');
      setIsSubmitting(false);
    }
  };

  const activeMethodSettings = settings.paymentSettings[paymentMethod];

  return (
    <div className="py-10 bg-ivory min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-xs font-bold text-chocolate hover:text-amber mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>

        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate mb-8">
          Secure Checkout
        </h1>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Delivery Details & Payment */}
          <div className="lg:col-span-7 space-y-6">
            {/* Customer & Address Form */}
            <div className="bg-white p-6 rounded-2xl border border-amber/20 shadow-xs space-y-4">
              <h2 className="text-base font-serif font-bold text-chocolate flex items-center gap-2 pb-3 border-b border-amber/10">
                <Truck className="w-4 h-4 text-amber" />
                <span>1. Delivery Information</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-chocolate mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Recipient name"
                    className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl text-xs text-chocolate focus:outline-none focus:ring-2 focus:ring-amber"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-chocolate mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 01838838488"
                    className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl text-xs text-chocolate focus:outline-none focus:ring-2 focus:ring-amber"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-chocolate mb-1">
                  Email Address <span className="text-chocolate/50 font-normal">(Optional, for invoice)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl text-xs text-chocolate focus:outline-none focus:ring-2 focus:ring-amber"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-chocolate mb-1">
                    District <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl text-xs text-chocolate font-medium focus:outline-none focus:ring-2 focus:ring-amber"
                  >
                    <option value="Chittagong">Chittagong</option>
                    <option value="Dhaka">Dhaka</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Khulna">Khulna</option>
                    <option value="Barisal">Barisal</option>
                    <option value="Rangpur">Rangpur</option>
                    <option value="Mymensingh">Mymensingh</option>
                    <option value="Comilla">Comilla</option>
                    <option value="Cox's Bazar">Cox's Bazar</option>
                    <option value="Other District">Other District (All 64 districts)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-chocolate mb-1">
                    Area / Thana / City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Nasirabad, GEC, Dhanmondi..."
                    className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl text-xs text-chocolate focus:outline-none focus:ring-2 focus:ring-amber"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-chocolate mb-1">
                  Full Street Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House number, Road, Flat, Landmark..."
                  className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl text-xs text-chocolate focus:outline-none focus:ring-2 focus:ring-amber"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-chocolate mb-1">
                  Delivery Notes <span className="text-chocolate/50 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Leave with security guard, call before arriving..."
                  className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl text-xs text-chocolate focus:outline-none focus:ring-2 focus:ring-amber"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white p-6 rounded-2xl border border-amber/20 shadow-xs space-y-4">
              <h2 className="text-base font-serif font-bold text-chocolate flex items-center gap-2 pb-3 border-b border-amber/10">
                <ShieldCheck className="w-4 h-4 text-amber" />
                <span>2. Select Payment Method</span>
              </h2>

              <div className="space-y-2.5">
                {/* Cash on Delivery */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-amber bg-cream/50 ring-2 ring-amber/30'
                      : 'border-amber/20 hover:bg-cream/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1 accent-chocolate"
                  />
                  <div className="flex-1 text-xs">
                    <strong className="block font-bold text-chocolate">Cash on Delivery (COD)</strong>
                    <span className="text-chocolate/70">Pay in cash when you receive the package at your doorstep.</span>
                  </div>
                </label>

                {/* bKash */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'bkash'
                      ? 'border-amber bg-pink-50/50 ring-2 ring-amber/30'
                      : 'border-amber/20 hover:bg-cream/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'bkash'}
                    onChange={() => setPaymentMethod('bkash')}
                    className="mt-1 accent-chocolate"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center gap-2">
                      <strong className="font-bold text-pink-700">bKash (Send Money)</strong>
                      <span className="bg-pink-100 text-pink-700 text-[10px] font-bold px-2 py-0.5 rounded">Manual</span>
                    </div>
                    <span className="text-chocolate/70 block mt-0.5">
                      Send Money to <strong>{settings.paymentSettings.bkash.accountNumber}</strong> & provide TrxID.
                    </span>
                  </div>
                </label>

                {/* Nagad */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'nagad'
                      ? 'border-amber bg-orange-50/50 ring-2 ring-amber/30'
                      : 'border-amber/20 hover:bg-cream/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'nagad'}
                    onChange={() => setPaymentMethod('nagad')}
                    className="mt-1 accent-chocolate"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center gap-2">
                      <strong className="font-bold text-orange-700">Nagad (Send Money)</strong>
                      <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded">Manual</span>
                    </div>
                    <span className="text-chocolate/70 block mt-0.5">
                      Send Money to <strong>{settings.paymentSettings.nagad.accountNumber}</strong> & provide TrxID.
                    </span>
                  </div>
                </label>

                {/* Rocket */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'rocket'
                      ? 'border-amber bg-purple-50/50 ring-2 ring-amber/30'
                      : 'border-amber/20 hover:bg-cream/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'rocket'}
                    onChange={() => setPaymentMethod('rocket')}
                    className="mt-1 accent-chocolate"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center gap-2">
                      <strong className="font-bold text-purple-700">Rocket (Send Money)</strong>
                      <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded">Manual</span>
                    </div>
                    <span className="text-chocolate/70 block mt-0.5">
                      Send Money to <strong>{settings.paymentSettings.rocket.accountNumber}</strong> & provide TrxID.
                    </span>
                  </div>
                </label>

                {/* Bank Transfer */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-amber bg-amber-50/50 ring-2 ring-amber/30'
                      : 'border-amber/20 hover:bg-cream/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={() => setPaymentMethod('bank_transfer')}
                    className="mt-1 accent-chocolate"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center gap-2">
                      <strong className="font-bold text-chocolate">Manual Bank Transfer</strong>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">Manual</span>
                    </div>
                    <span className="text-chocolate/70 block mt-0.5">
                      Transfer to City Bank account & enter deposit slip reference.
                    </span>
                  </div>
                </label>
              </div>

              {/* Instructions and Input Box for Manual Payment */}
              {paymentMethod !== 'cod' && (
                <div className="mt-4 p-4 rounded-xl bg-cream border border-amber/30 space-y-3 animate-fadeIn">
                  <div className="flex items-start gap-2 text-xs text-chocolate">
                    <Smartphone className="w-4 h-4 text-amber flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-chocolate font-bold">
                        {activeMethodSettings.title} Payment Instructions:
                      </strong>
                      <p className="mt-1 text-chocolate/80 text-[11px] leading-relaxed">
                        {activeMethodSettings.instructions}
                      </p>
                      <div className="mt-2 p-2 bg-white rounded-lg border border-amber/20 font-mono text-xs text-chocolate font-bold">
                        Account: {activeMethodSettings.accountNumber}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-chocolate mb-1">
                        Transaction ID (TrxID) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={transactionReference}
                        onChange={(e) => setTransactionReference(e.target.value)}
                        placeholder="e.g. BKH98234710"
                        className="w-full px-3 py-2 bg-white border border-amber/30 rounded-lg text-xs font-mono uppercase text-chocolate focus:outline-none focus:ring-2 focus:ring-amber"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-chocolate mb-1">
                        Sender Phone / Account <span className="text-chocolate/50 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        placeholder="e.g. 01838838488"
                        className="w-full px-3 py-2 bg-white border border-amber/30 rounded-lg text-xs font-mono text-chocolate focus:outline-none focus:ring-2 focus:ring-amber"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-chocolate/60 italic">
                    * Manual payments are verified by our team before dispatch. Your stock is reserved upon submission.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-amber/20 shadow-xs space-y-5 sticky top-24">
              <h2 className="text-base font-serif font-bold text-chocolate pb-3 border-b border-amber/10">
                Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
              </h2>

              {/* Items Breakdown */}
              <div className="divide-y divide-amber/10 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex gap-3">
                    <img
                      src={item.variant?.image_url || item.product.image_url}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-lg object-cover border border-amber/20 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-chocolate truncate">{item.product.name}</h4>
                      {item.variant?.attributes && (
                        <span className="text-[11px] text-chocolate/60">
                          {Object.values(item.variant.attributes).join(' • ')}
                        </span>
                      )}
                      <div className="flex justify-between items-center mt-1 text-xs">
                        <span className="text-chocolate/70">Qty: {item.quantity}</span>
                        <span className="font-bold text-chocolate">{formatPrice(item.line_total)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Calculation */}
              <div className="pt-3 border-t border-amber/15 space-y-2 text-xs">
                <div className="flex justify-between text-chocolate/70">
                  <span>Subtotal</span>
                  <span className="font-semibold text-chocolate">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-chocolate/70">
                  <span>Delivery Charge ({isInsideCity ? 'City' : 'Nationwide'})</span>
                  <span>{deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : formatPrice(deliveryFee)}</span>
                </div>
                <div className="pt-2 border-t border-amber/20 flex justify-between text-base font-bold text-chocolate">
                  <span>Grand Total</span>
                  <span className="text-amber-dark font-serif text-lg">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-chocolate hover:bg-chocolate-light text-honey font-bold rounded-xl transition-all shadow-warm flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-honey border-t-transparent" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-honey" />
                    <span>Confirm Order ({formatPrice(grandTotal)})</span>
                  </>
                )}
              </button>

              <div className="text-[11px] text-chocolate/60 text-center space-y-1">
                <p>🔒 256-bit Secure Encryption</p>
                <p>By placing this order, you agree to our Terms & Conditions and Privacy Policy.</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
