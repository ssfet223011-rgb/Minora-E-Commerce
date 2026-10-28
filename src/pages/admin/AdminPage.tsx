import React, { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { AdminDashboardOverview } from './AdminDashboardOverview';
import { AdminOrders } from './AdminOrders';
import { AdminProducts } from './AdminProducts';
import { AdminCategories } from './AdminCategories';
import { AdminInventory } from './AdminInventory';
import { AdminUsers } from './AdminUsers';
import { AdminSettings } from './AdminSettings';

export const AdminPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('overview');

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
      {currentTab === 'settings' && <AdminSettings />}
    </AdminLayout>
  );
};
