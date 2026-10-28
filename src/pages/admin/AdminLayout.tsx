import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Boxes,
  Users,
  UserCheck,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  Menu,
  X,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

interface AdminLayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentTab, onTabChange, children }) => {
  const {
    user,
    isStaff,
    isSuperAdmin,
    isEditor,
    isCustomer,
    hasPermission,
    enableDemoSuperAdmin,
    enableDemoEditor,
    signOut,
  } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Authorization Guard: If logged in as a customer, strictly deny access
  if (user && isCustomer) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-amber/20 shadow-warm text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-chocolate">Customer Account Restricted</h2>
          <p className="text-xs text-chocolate/70 leading-relaxed">
            You are currently signed in as a customer (<strong>{user.email}</strong>). Customers do not have permission to access the management portal or modify website settings.
          </p>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => navigate('/')}
              className="w-full py-2.5 bg-chocolate hover:bg-chocolate-light text-honey font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Return to Storefront
            </button>
            <button
              onClick={() => signOut()}
              className="w-full py-2.5 bg-cream hover:bg-cream-300 text-chocolate font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Sign Out & Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authorization Guard: If not staff, show authentication / evaluation options
  if (!isStaff) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-amber/20 shadow-warm text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-amber/10 text-amber mx-auto flex items-center justify-center">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-chocolate">Staff Access Protected</h2>
          <p className="text-xs text-chocolate/70 leading-relaxed">
            The MINORA administration console is restricted to Super Administrators and authorized Editors.
          </p>

          <div className="space-y-2 pt-2">
            <p className="text-[11px] font-bold text-chocolate uppercase tracking-wider mb-2">
              Quick Test Evaluation Access:
            </p>
            <button
              onClick={() => enableDemoSuperAdmin()}
              className="w-full py-2.5 bg-chocolate hover:bg-chocolate-light text-honey font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-honey" />
              <span>Sign In as Super Admin (Full Control)</span>
            </button>

            <button
              onClick={() => enableDemoEditor()}
              className="w-full py-2.5 bg-amber hover:bg-amber-dark text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-white" />
              <span>Sign In as Editor (Catalog & Products)</span>
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full py-2 bg-cream hover:bg-cream-300 text-chocolate font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Back to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Build permitted navigation items based on role & authorities
  const allNavItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard, perm: 'view_reports' },
    { id: 'orders', label: 'Order Management', icon: ShoppingBag, perm: 'manage_orders' },
    { id: 'products', label: 'Product Management', icon: Package, perm: 'manage_products' },
    { id: 'categories', label: 'Category Management', icon: Layers, perm: 'manage_categories' },
    { id: 'inventory', label: 'Stock & Movements', icon: Boxes, perm: 'manage_inventory' },
    { id: 'users', label: 'Customer Accounts', icon: Users, superAdminOnly: true },
    { id: 'editors', label: 'Staff & Editors', icon: UserCheck, superAdminOnly: true },
    { id: 'settings', label: 'Website Settings', icon: Settings, superAdminOnly: true },
  ];

  const navItems = allNavItems.filter((item) => {
    if (isSuperAdmin) return true;
    if (item.superAdminOnly) return false;
    return hasPermission(item.perm as any);
  });

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col md:flex-row text-chocolate">
      {/* Mobile Header */}
      <div className="md:hidden bg-chocolate text-cream p-4 flex items-center justify-between border-b border-amber/20">
        <div className="flex items-center gap-2">
          <img src="/assets/minora-logo.png" alt="MINORA" className="h-8 filter brightness-110" />
          <span className="text-xs font-bold text-honey">Admin Console</span>
        </div>
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-1.5 text-cream hover:text-honey"
        >
          {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 z-40 inset-y-0 left-0 w-64 bg-chocolate text-cream flex flex-col justify-between border-r border-amber/20 transition-transform duration-300 md:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-amber/15">
            <Link to="/" className="block">
              <img
                src="/assets/minora-logo.png"
                alt="MINORA"
                className="h-10 w-auto filter brightness-110 object-contain"
              />
            </Link>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] font-serif italic text-honey">
                {isSuperAdmin ? 'Super Admin Portal' : 'Editor Workspace'}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                isSuperAdmin ? 'bg-amber text-chocolate font-bold' : 'bg-honey/20 text-honey'
              }`}>
                {isSuperAdmin ? 'Super Admin' : 'Editor'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber text-white shadow-xs font-bold'
                      : 'text-cream/80 hover:text-honey hover:bg-cream/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-amber/15 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs text-cream/70 hover:text-honey hover:bg-cream/5 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Storefront</span>
          </Link>

          <button
            onClick={() => {
              signOut();
              navigate('/');
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="hidden md:flex h-16 bg-white border-b border-amber/15 px-8 items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-medium text-chocolate/60">
            <span>Admin</span>
            <span>/</span>
            <span className="text-chocolate font-bold capitalize">
              {allNavItems.find((n) => n.id === currentTab)?.label || currentTab}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-xs font-semibold text-chocolate/80 hover:text-amber flex items-center gap-1.5 py-1 px-3 rounded-full bg-cream border border-amber/20"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber" />
              <span>Live Website</span>
            </Link>

            <div className="flex items-center gap-2.5 pl-3 border-l border-amber/20 text-xs">
              <div className="w-8 h-8 rounded-full bg-chocolate text-honey flex items-center justify-center font-bold">
                {user?.full_name?.charAt(0) || 'A'}
              </div>
              <div>
                <p className="font-bold text-chocolate truncate max-w-[130px]">{user?.full_name}</p>
                <div className="flex items-center gap-1">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${
                      isSuperAdmin ? 'bg-amber' : 'bg-emerald-500'
                    }`}
                  />
                  <p className="text-[10px] text-chocolate/60 font-semibold">
                    {isSuperAdmin ? 'Super Administrator' : 'Authorized Editor'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
};
