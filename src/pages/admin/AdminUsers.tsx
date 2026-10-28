import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, Ban, CheckCircle, Mail, Phone, Calendar } from 'lucide-react';
import { authService } from '../../services/authService';
import { orderService } from '../../services/orderService';
import { UserProfile, Order } from '../../types';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const fetchUsersAndOrders = async () => {
    setLoading(true);
    const [userList, orderList] = await Promise.all([
      authService.getUsers(),
      orderService.getOrders(),
    ]);
    setUsers(userList);
    setOrders(orderList);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsersAndOrders();
  }, []);

  const handleToggleStatus = async (user: UserProfile) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    const confirmMsg =
      newStatus === 'suspended'
        ? `Are you sure you want to suspend customer account ${user.email}? They will not be able to log in or place orders.`
        : `Reactivate customer account ${user.email}?`;

    if (confirm(confirmMsg)) {
      await authService.updateUserStatus(user.id, newStatus);
      await fetchUsersAndOrders();
      if (selectedUser?.id === user.id) {
        setSelectedUser({ ...selectedUser, status: newStatus });
      }
    }
  };

  const filteredUsers = users.filter((u) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        u.email.toLowerCase().includes(q) ||
        u.full_name?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const userOrders = selectedUser
    ? orders.filter(
        (o) =>
          o.user_id === selectedUser.id ||
          o.guest_email?.toLowerCase() === selectedUser.email.toLowerCase() ||
          o.guest_phone === selectedUser.phone
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-chocolate">Customer Accounts & Anti-Abuse</h1>
        <p className="text-xs text-chocolate/70 mt-1">
          Review customer profiles, purchase history, and manage active / restricted statuses.
        </p>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-amber/20 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, email, phone..."
            className="w-full bg-cream-50 pl-9 pr-4 py-2 rounded-xl text-xs text-chocolate border border-amber/20 focus:outline-none focus:ring-2 focus:ring-amber"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-chocolate/40" />
        </div>
        <div className="text-xs text-chocolate/70 font-semibold">
          Total Registered Users: <strong>{users.length}</strong>
        </div>
      </div>

      {/* Grid: User list on left, details on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-amber/20 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-amber border-t-transparent mx-auto" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-cream-50 border-b border-amber/15 text-chocolate/70">
                  <tr>
                    <th className="py-3 px-4 font-bold">User</th>
                    <th className="py-3 px-4 font-bold">Role</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber/10">
                  {filteredUsers.map((u) => {
                    const isSelected = selectedUser?.id === u.id;
                    return (
                      <tr
                        key={u.id}
                        onClick={() => setSelectedUser(u)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-amber/10' : 'hover:bg-cream/20'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <strong className="block text-chocolate font-semibold">{u.full_name}</strong>
                          <span className="text-[11px] text-chocolate/60 block">{u.email}</span>
                          {u.phone && <span className="text-[10px] text-amber-dark">{u.phone}</span>}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              u.role === 'admin'
                                ? 'bg-chocolate text-honey'
                                : 'bg-cream text-chocolate'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              u.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(u);
                            }}
                            className={`p-1.5 rounded-lg border text-[11px] font-semibold transition-colors ${
                              u.status === 'active'
                                ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {u.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected User Detail & Order History */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-amber/20 shadow-xs p-6 space-y-5">
          {selectedUser ? (
            <>
              <div className="pb-3 border-b border-amber/15 flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-chocolate">
                    {selectedUser.full_name}
                  </h3>
                  <span className="text-xs text-chocolate/60">{selectedUser.email}</span>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    selectedUser.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {selectedUser.status}
                </span>
              </div>

              <div className="space-y-2 text-xs text-chocolate/80">
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-amber" />
                  <span>Phone: {selectedUser.phone || 'Not specified'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-amber" />
                  <span>Registered: {new Date(selectedUser.created_at).toLocaleDateString()}</span>
                </p>
              </div>

              {/* Order History */}
              <div className="pt-3 border-t border-amber/15 space-y-3">
                <h4 className="text-xs font-bold text-chocolate uppercase tracking-wider">
                  Associated Orders ({userOrders.length})
                </h4>
                {userOrders.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {userOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-3 rounded-xl bg-cream/40 border border-amber/15 text-xs flex items-center justify-between"
                      >
                        <div>
                          <strong className="block font-mono text-chocolate">{ord.order_number}</strong>
                          <span className="text-[10px] text-chocolate/60">
                            {new Date(ord.created_at).toLocaleDateString()} • {ord.items.length} items
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-chocolate block">৳{ord.total}</span>
                          <span className="text-[10px] uppercase font-bold text-amber-dark">
                            {ord.fulfillment_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-chocolate/60 italic">No past orders found for this user.</p>
                )}
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-xs text-chocolate/60">
              Select a customer from the left list to inspect details and order history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
