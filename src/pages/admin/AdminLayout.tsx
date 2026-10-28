import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Boxes,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Menu,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

interface AdminLayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentTab, onTabChange, children }) => {
  const { user, isAdmin, enableDemoAdmin, signOut } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Authorization Guard
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-amber/20 shadow-warm text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-amber/10 text-amber mx-auto flex items-center justify-center">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-chocolate">Admin Access Protected</h2>
          <p className="text-xs text-chocolate/70 leading-relaxed">
            The MINORA administration console is restricted to verified administrators. Please sign in with administrative credentials or activate demo evaluation mode below.
          </p>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => {
                enableDemoAdmin();
              }}
              className="w-full py-3 bg-chocolate hover:bg-chocolate-light text-honey font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Enable Admin Access (Evaluation Mode)</span>
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full py-2.5 bg-cream hover:bg-cream-300 text-chocolate font-semibold rounded-xl text-xs transition-colors"
            >
              Back to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Order Management', icon: ShoppingBag },
    { id: 'products', label: 'Product Management', icon: Package },
    { id: 'categories', label: 'Category Management', icon: Layers },
    { id: 'inventory', label: 'Stock & Movements', icon: Boxes },
    { id: 'users', label: 'Customer Accounts', icon: Users },
    { id: 'settings', label: 'Website Settings', icon: Settings },
  ];

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
              <span className="text-[11px] font-serif italic text-honey">Admin Dashboard</span>
              <span className="text-[10px] bg-amber/20 text-honey px-2 py-0.5 rounded-full font-bold">
                v1.0 MVP
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
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
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
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit Admin</span>
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
              {navItems.find((n) => n.id === currentTab)?.label || currentTab}
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

            <div className="flex items-center gap-2 pl-3 border-l border-amber/20 text-xs">
              <div className="w-8 h-8 rounded-full bg-chocolate text-honey flex items-center justify-center font-bold">
                {user?.full_name?.charAt(0) || 'A'}
              </div>
              <div>
                <p className="font-bold text-chocolate truncate max-w-[120px]">{user?.full_name}</p>
                <p className="text-[10px] text-amber-dark font-medium capitalize">Administrator</p>
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
