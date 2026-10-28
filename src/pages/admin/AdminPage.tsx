import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { AdminDashboardOverview } from './AdminDashboardOverview';
import { AdminOrders } from './AdminOrders';
import { AdminProducts } from './AdminProducts';
import { AdminCategories } from './AdminCategories';
import { AdminInventory } from './AdminInventory';
import { AdminUsers } from './AdminUsers';
import { AdminEditors } from './AdminEditors';
import { AdminSettings } from './AdminSettings';
import { useAuth } from '../../context/AuthContext';

export const AdminPage: React.FC = () => {
  const { isSuperAdmin, hasPermission } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('overview');

  useEffect(() => {
    if (!isSuperAdmin) {
      if (!hasPermission('view_reports') && currentTab === 'overview') {
        if (hasPermission('manage_products')) setCurrentTab('products');
        else if (hasPermission('manage_orders')) setCurrentTab('orders');
        else if (hasPermission('manage_categories')) setCurrentTab('categories');
        else if (hasPermission('manage_inventory')) setCurrentTab('inventory');
      }
    }
  }, [isSuperAdmin, hasPermission]);

  return (
    <AdminLayout currentTab={currentTab} onTabChange={setCurrentTab}>
      {currentTab === 'overview' && (
        <AdminDashboardOverview onNavigateTab={(tab) => setCurrentTab(tab)} />
      )}
      {currentTab === 'orders' && <AdminOrders />}
      {currentTab === 'products' && <AdminProducts />}
      {currentTab === 'categories' && <AdminCategories />}
      {currentTab === 'inventory' && <AdminInventory />}
      {currentTab === 'users' && <AdminUsers />}
      {currentTab === 'editors' && <AdminEditors />}
      {currentTab === 'settings' && <AdminSettings />}
    </AdminLayout>
  );
};
