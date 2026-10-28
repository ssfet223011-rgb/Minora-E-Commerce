import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Printer,
  AlertCircle,
  RotateCcw,
  X,
  Smartphone,
  MapPin,
  Phone,
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { Order, OrderStatus, PaymentStatus } from '../../types';
import { useSettings } from '../../context/SettingsContext';

export const AdminOrders: React.FC = () => {
  const { formatPrice, settings } = useSettings();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [internalNote, setInternalNote] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    const data = await orderService.getOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenDetail = (ord: Order) => {
    setSelectedOrder(ord);
    setInternalNote(ord.internal_notes || '');
    setShowCancelPrompt(false);
    setActionSuccess(null);
  };

  const handleVerifyPayment = async (orderId: string, status: PaymentStatus) => {
    const success = await orderService.verifyPayment(orderId, status);
    if (success) {
      setActionSuccess(`Payment status successfully set to: ${status}`);
      await fetchOrders();
      if (selectedOrder) {
        const updated = await orderService.getOrderById(orderId);
        if (updated) setSelectedOrder(updated);
      }
    }
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    const success = await orderService.updateOrderStatus(orderId, status, internalNote);
    if (success) {
      setActionSuccess(`Order status updated to: ${status}`);
      await fetchOrders();
      if (selectedOrder) {
        const updated = await orderService.getOrderById(orderId);
        if (updated) setSelectedOrder(updated);
      }
    }
  };

  const handleCancelWithRestoration = async (orderId: string) => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancelling this order.');
      return;
    }
    const success = await orderService.cancelOrder(orderId, cancelReason);
    if (success) {
      setActionSuccess('Order cancelled and all product stock successfully restored!');
      setShowCancelPrompt(false);
      setCancelReason('');
      await fetchOrders();
      if (selectedOrder) {
        const updated = await orderService.getOrderById(orderId);
        if (updated) setSelectedOrder(updated);
      }
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.fulfillment_status !== statusFilter) return false;
    if (paymentFilter !== 'all' && o.payment_status !== paymentFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const match =
        o.order_number.toLowerCase().includes(q) ||
        o.guest_name.toLowerCase().includes(q) ||
        o.guest_phone.toLowerCase().includes(q) ||
        o.payment_record?.transaction_reference?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-chocolate">Order Management</h1>
          <p className="text-xs text-chocolate/70 mt-1">
            Track, verify manual payments, update fulfillment, and safely process cancellations.
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-amber/20 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, phone, customer, or TrxID..."
            className="w-full bg-cream-50 pl-9 pr-4 py-2 rounded-xl text-xs text-chocolate border border-amber/20 focus:outline-none focus:ring-2 focus:ring-amber"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-chocolate/40" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Fulfillment Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-chocolate/70 font-semibold">Fulfillment:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-cream-50 border border-amber/20 rounded-xl px-2.5 py-1.5 text-xs text-chocolate font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-chocolate/70 font-semibold">Payment:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-cream-50 border border-amber/20 rounded-xl px-2.5 py-1.5 text-xs text-chocolate font-medium"
            >
              <option value="all">All Payments</option>
              <option value="pending">Pending (COD)</option>
              <option value="pending_verification">Needs Verification</option>
              <option value="verified">Verified / Paid</option>
              <option value="rejected">Rejected</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-amber/20 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-amber border-t-transparent mx-auto" />
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 border-b border-amber/15 text-chocolate/70">
                <tr>
                  <th className="py-3 px-4 font-bold">Order Number</th>
                  <th className="py-3 px-4 font-bold">Date & Time</th>
                  <th className="py-3 px-4 font-bold">Customer Details</th>
                  <th className="py-3 px-4 font-bold">Items</th>
                  <th className="py-3 px-4 font-bold">Total</th>
                  <th className="py-3 px-4 font-bold">Payment</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber/10">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-cream/20 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-chocolate">
                      {ord.order_number}
                    </td>
                    <td className="py-3.5 px-4 text-chocolate/60">
                      {new Date(ord.created_at).toLocaleDateString()} {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4">
                      <strong className="block text-chocolate font-semibold">{ord.guest_name}</strong>
                      <span className="text-[11px] text-chocolate/60">{ord.guest_phone}</span>
                      <span className="text-[10px] text-chocolate/50 block truncate max-w-[150px]">{ord.city}, {ord.district}</span>
                    </td>
                    <td className="py-3.5 px-4 text-chocolate/80">
                      {ord.items?.length || 0} items
                    </td>
                    <td className="py-3.5 px-4 font-bold text-chocolate">
                      {formatPrice(ord.total)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="font-bold uppercase text-[10px] text-chocolate/70 block">
                          {ord.payment_method}
                        </span>
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            ord.payment_status === 'verified'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.payment_status === 'pending_verification'
                              ? 'bg-amber-100 text-amber-800'
                              : ord.payment_status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-cream text-chocolate/80'
                          }`}
                        >
                          {ord.payment_status.replace('_', ' ')}
                        </span>
                        {ord.payment_record?.transaction_reference && (
                          <span className="font-mono text-[10px] text-amber-dark block truncate max-w-[120px]">
                            Ref: {ord.payment_record.transaction_reference}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                          ord.fulfillment_status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.fulfillment_status === 'cancelled'
                            ? 'bg-gray-100 text-gray-600 line-through'
                            : ord.fulfillment_status === 'shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : ord.fulfillment_status === 'confirmed'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-cream-300 text-chocolate'
                        }`}
                      >
                        {ord.fulfillment_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(ord)}
                        className="p-1.5 rounded-lg bg-cream hover:bg-cream-300 text-chocolate transition-colors border border-amber/20 inline-flex items-center gap-1 font-semibold"
                        title="View details and verify payment"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-chocolate/60">
            No orders match the selected filters.
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chocolate-deep/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-amber/30 shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-amber/15">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-dark">Order Management</span>
                <h3 className="font-serif text-xl font-bold text-chocolate font-mono">
                  {selectedOrder.order_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-chocolate/60 hover:text-chocolate rounded-full hover:bg-cream"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {/* Customer & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-cream/40 rounded-xl space-y-1">
                <strong className="block font-bold text-chocolate flex items-center gap-1.5 mb-1">
                  <MapPin className="w-4 h-4 text-amber" /> Recipient & Address
                </strong>
                <p className="font-semibold text-chocolate">{selectedOrder.guest_name}</p>
                <p className="text-chocolate/80">{selectedOrder.delivery_address}</p>
                <p className="text-chocolate/80">{selectedOrder.city}, {selectedOrder.district}</p>
                {selectedOrder.delivery_instructions && (
                  <p className="text-chocolate/60 italic pt-1">Note: {selectedOrder.delivery_instructions}</p>
                )}
              </div>

              <div className="p-4 bg-cream/40 rounded-xl space-y-1">
                <strong className="block font-bold text-chocolate flex items-center gap-1.5 mb-1">
                  <Smartphone className="w-4 h-4 text-amber" /> Payment Details
                </strong>
                <p className="text-chocolate font-semibold">{selectedOrder.guest_phone}</p>
                <p className="text-chocolate/80">Method: <strong className="uppercase">{selectedOrder.payment_method}</strong></p>
                {selectedOrder.payment_record?.transaction_reference && (
                  <p className="text-chocolate font-mono bg-white p-1.5 rounded border border-amber/20 mt-1">
                    TrxID: <strong>{selectedOrder.payment_record.transaction_reference}</strong>
                    {selectedOrder.payment_record.sender_phone && ` (${selectedOrder.payment_record.sender_phone})`}
                  </p>
                )}
                <p className="text-chocolate/80 pt-1">
                  Status:{' '}
                  <span className="font-bold text-amber-dark capitalize">
                    {selectedOrder.payment_status.replace('_', ' ')}
                  </span>
                </p>
              </div>
            </div>

            {/* Manual Payment Verification Actions */}
            {selectedOrder.payment_method !== 'cod' && selectedOrder.payment_status === 'pending_verification' && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-chocolate">
                  <Clock className="w-4 h-4 text-amber" />
                  <span>Review Manual Payment Reference</span>
                </div>
                <p className="text-xs text-chocolate/80">
                  Verify against your bank/mobile statement before marking as verified.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleVerifyPayment(selectedOrder.id, 'verified')}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve & Verify Payment</span>
                  </button>
                  <button
                    onClick={() => handleVerifyPayment(selectedOrder.id, 'rejected')}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject Payment</span>
                  </button>
                </div>
              </div>
            )}

            {/* Ordered Items */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-chocolate uppercase">Ordered Items</h4>
              <div className="divide-y divide-amber/10 border-y border-amber/10 text-xs">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={item.image_url} alt="" className="w-10 h-10 rounded-lg object-cover border border-amber/15" />
                      <div>
                        <span className="font-bold text-chocolate block">{item.product_name}</span>
                        {item.selected_attributes && (
                          <span className="text-[11px] text-chocolate/60">
                            {Object.values(item.selected_attributes).join(' • ')} (SKU: {item.sku})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-chocolate/70 block">{item.quantity} × {formatPrice(item.unit_price)}</span>
                      <strong className="font-bold text-chocolate">{formatPrice(item.line_total)}</strong>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-2 font-bold text-sm text-chocolate">
                <span>Grand Total:</span>
                <span className="text-base text-amber-dark">{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Status Controller */}
            <div className="space-y-2 pt-2 border-t border-amber/15">
              <label className="block text-xs font-bold text-chocolate">Update Fulfillment Status:</label>
              <div className="flex flex-wrap items-center gap-2">
                {(['pending', 'confirmed', 'processing', 'shipped', 'delivered'] as OrderStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                      selectedOrder.fulfillment_status === st
                        ? 'bg-chocolate text-honey font-bold shadow-xs'
                        : 'bg-cream hover:bg-cream-300 text-chocolate/80'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Internal Notes */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-chocolate">Internal Admin Notes:</label>
              <textarea
                rows={2}
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Private notes (visible only to admins)..."
                className="w-full p-2.5 bg-cream-50 rounded-xl text-xs border border-amber/20 text-chocolate focus:outline-none focus:ring-1 focus:ring-amber"
              />
            </div>

            {/* Safe Cancellation with Stock Restoration */}
            {selectedOrder.fulfillment_status !== 'cancelled' && (
              <div className="pt-4 border-t border-amber/15">
                {!showCancelPrompt ? (
                  <button
                    onClick={() => setShowCancelPrompt(true)}
                    className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Cancel Order & Restore Inventory Stock</span>
                  </button>
                ) : (
                  <div className="p-4 bg-red-50 rounded-xl border border-red-200 space-y-3">
                    <strong className="text-xs font-bold text-red-800 block">
                      Confirm Cancellation & Stock Restoration
                    </strong>
                    <p className="text-[11px] text-red-700">
                      Cancelling will automatically return all {selectedOrder.items.length} item quantities back to active inventory and log the restoration reason.
                    </p>
                    <input
                      type="text"
                      required
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Reason for cancellation (e.g. Customer request, Unverifiable payment)..."
                      className="w-full px-3 py-1.5 bg-white border border-red-300 rounded-lg text-xs"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCancelWithRestoration(selectedOrder.id)}
                        className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs"
                      >
                        Confirm Cancellation
                      </button>
                      <button
                        onClick={() => setShowCancelPrompt(false)}
                        className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs rounded-lg font-semibold"
                      >
                        Abort
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
