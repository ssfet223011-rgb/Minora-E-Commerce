import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  Package,
  AlertTriangle,
  Users,
  CheckCircle2,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { storeService } from '../../services/storeService';
import { authService } from '../../services/authService';
import { Order, Product, UserProfile } from '../../types';
import { useSettings } from '../../context/SettingsContext';

interface AdminDashboardOverviewProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({ onNavigateTab }) => {
  const { formatPrice } = useSettings();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverviewData = async () => {
      setLoading(true);
      const [orderList, prodList, userList] = await Promise.all([
        orderService.getOrders(),
        storeService.getProducts(),
        authService.getUsers(),
      ]);
      setOrders(orderList);
      setProducts(prodList);
      setUsers(userList);
      setLoading(false);
    };
    loadOverviewData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-amber border-t-transparent mx-auto" />
      </div>
    );
  }

  // Calculate real metrics from database/records
  const totalOrders = orders.length;
  // Revenue from completed or paid/verified orders
  const totalRevenue = orders
    .filter((o) => o.fulfillment_status !== 'cancelled' && o.payment_status !== 'rejected')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter(
    (o) => o.fulfillment_status === 'pending' || o.payment_status === 'pending_verification'
  ).length;

  const activeProducts = products.filter((p) => p.active).length;
  const lowStockProducts = products.filter(
    (p) => p.stock_quantity > 0 && p.stock_quantity <= 10
  );
  const outOfStockProducts = products.filter((p) => p.stock_quantity <= 0);

  const recentOrders = orders.slice(0, 5);
  const bestSellers = products.filter((p) => p.is_best_seller);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-chocolate">Store Overview & Performance</h1>
        <p className="text-xs text-chocolate/70 mt-1">
          Real-time metrics from current database and inventory records.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-amber/20 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-chocolate/60 font-semibold block">Total Revenue</span>
            <span className="text-xl sm:text-2xl font-serif font-extrabold text-chocolate mt-1 block">
              {formatPrice(totalRevenue)}
            </span>
            <span className="text-[10px] text-emerald-700 font-bold block mt-1">
              From valid/active orders
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber/15 text-amber flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-amber/20 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-chocolate/60 font-semibold block">Total Orders</span>
            <span className="text-xl sm:text-2xl font-serif font-extrabold text-chocolate mt-1 block">
              {totalOrders}
            </span>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-[11px] text-amber hover:underline font-semibold block mt-1"
            >
              View all orders →
            </button>
          </div>
          <div className="w-12 h-12 rounded-xl bg-chocolate/10 text-chocolate flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Pending Orders */}
        <div className="bg-white p-5 rounded-2xl border border-amber/20 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-chocolate/60 font-semibold block">Needs Review / Pending</span>
            <span className="text-xl sm:text-2xl font-serif font-extrabold text-amber-dark mt-1 block">
              {pendingOrders}
            </span>
            <span className="text-[10px] text-chocolate/60 block mt-1">
              Payment verification & dispatch
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-dark flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Inventory Alert */}
        <div className="bg-white p-5 rounded-2xl border border-amber/20 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-chocolate/60 font-semibold block">Stock Alerts</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-serif font-extrabold text-red-600">
                {outOfStockProducts.length}
              </span>
              <span className="text-xs text-chocolate/60">Out of Stock</span>
            </div>
            <span className="text-[10px] text-amber-dark font-medium block mt-0.5">
              {lowStockProducts.length} items low stock
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Second Row: Recent Orders & Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-amber/20 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-amber/15">
            <h2 className="font-serif font-bold text-base text-chocolate">Recent Orders</h2>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-amber hover:underline flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-amber/10 text-chocolate/60">
                    <th className="py-2.5 font-bold">Order #</th>
                    <th className="py-2.5 font-bold">Customer</th>
                    <th className="py-2.5 font-bold">Total</th>
                    <th className="py-2.5 font-bold">Payment</th>
                    <th className="py-2.5 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber/10">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-cream/30 transition-colors">
                      <td className="py-3 font-mono font-bold text-chocolate">{ord.order_number}</td>
                      <td className="py-3">
                        <span className="font-semibold block">{ord.guest_name}</span>
                        <span className="text-[10px] text-chocolate/60">{ord.guest_phone}</span>
                      </td>
                      <td className="py-3 font-bold text-chocolate">{formatPrice(ord.total)}</td>
                      <td className="py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            ord.payment_status === 'verified'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.payment_status === 'pending_verification'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-cream text-chocolate/70'
                          }`}
                        >
                          {ord.payment_status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="font-semibold capitalize text-chocolate/80">
                          {ord.fulfillment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-chocolate/60 py-8 text-center">No orders placed yet.</p>
          )}
        </div>

        {/* Best Sellers Card */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-amber/20 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-amber/15">
            <h2 className="font-serif font-bold text-base text-chocolate">Featured Products</h2>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-xs font-bold text-amber hover:underline"
            >
              View Products
            </button>
          </div>

          <div className="divide-y divide-amber/10">
            {products.slice(0, 4).map((p) => (
              <div key={p.id} className="py-3 flex items-center gap-3">
                <img
                  src={p.image_url}
                  alt={p.name}
                  className="w-12 h-12 rounded-xl object-cover border border-amber/15 bg-cream/30 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-chocolate truncate">{p.name}</h4>
                  <span className="text-[10px] text-chocolate/60 block">{p.short_description}</span>
                  <span className="text-xs font-bold text-amber-dark">{formatPrice(p.sales_price)}</span>
                </div>
                <span className="text-[11px] font-mono text-chocolate/70">
                  Stock: <strong>{p.stock_quantity}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
