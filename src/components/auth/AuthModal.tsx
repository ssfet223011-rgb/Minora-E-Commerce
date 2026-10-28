import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  CheckCircle,
  ShieldCheck,
  UserCheck,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const {
    signIn,
    signUp,
    enableDemoSuperAdmin,
    enableDemoEditor,
    enableDemoCustomer,
  } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await signIn(email, password);
        if (res.success) {
          setSuccessMsg('Signed in successfully!');
          setTimeout(() => {
            onClose();
          }, 600);
        } else {
          setError(res.error || 'Login failed. Please check your credentials.');
        }
      } else {
        const res = await signUp(email, password, fullName, phone);
        if (res.success) {
          setSuccessMsg('Account created successfully! Welcome to MINORA.');
          setTimeout(() => {
            onClose();
          }, 1200);
        } else {
          setError(res.error || 'Signup failed.');
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role: 'superadmin' | 'editor' | 'customer') => {
    if (role === 'superadmin') {
      enableDemoSuperAdmin();
      setSuccessMsg('Signed in as Super Administrator (Full Authority)');
    } else if (role === 'editor') {
      enableDemoEditor();
      setSuccessMsg('Signed in as Editor (Product & Catalog Management)');
    } else {
      enableDemoCustomer();
      setSuccessMsg('Signed in as Customer (Shopping & Cart)');
    }
    setTimeout(() => {
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chocolate-deep/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-ivory rounded-2xl shadow-warm-lg border border-amber/20 overflow-hidden">
        {/* Header decoration */}
        <div className="bg-chocolate p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-cream/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src="/assets/minora-logo.png"
            alt="MINORA"
            className="h-10 mx-auto mb-2 filter brightness-110 object-contain"
          />
          <h3 className="text-xl font-serif font-bold text-cream">
            {mode === 'login' ? 'Welcome Back to MINORA' : 'Create Your Customer Account'}
          </h3>
          <p className="text-xs text-honey/90 mt-1 font-sans">
            Unified Portal: Super Admin • Editor • Customer
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-amber/10 bg-cream/40">
          <button
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-3 text-sm font-semibold transition-all cursor-pointer ${
              mode === 'login'
                ? 'text-chocolate border-b-2 border-amber bg-white font-bold'
                : 'text-chocolate/60 hover:text-chocolate'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-3 text-sm font-semibold transition-all cursor-pointer ${
              mode === 'register'
                ? 'text-chocolate border-b-2 border-amber bg-white font-bold'
                : 'text-chocolate/60 hover:text-chocolate'
            }`}
          >
            Create Customer Account
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg animate-fadeIn">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg flex items-center gap-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-chocolate mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-amber" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Tanvir Hossain"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-amber/20 rounded-lg text-sm text-chocolate focus:outline-none focus:ring-2 focus:ring-amber/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-chocolate mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-amber" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 018XXXXXXXX"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-amber/20 rounded-lg text-sm text-chocolate focus:outline-none focus:ring-2 focus:ring-amber/50"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-chocolate mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-amber" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-amber/20 rounded-lg text-sm text-chocolate focus:outline-none focus:ring-2 focus:ring-amber/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-chocolate mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-amber" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-amber/20 rounded-lg text-sm text-chocolate focus:outline-none focus:ring-2 focus:ring-amber/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-chocolate hover:bg-chocolate-light text-honey font-bold rounded-lg transition-all shadow-md flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-honey border-t-transparent" />
              ) : mode === 'login' ? (
                'Sign In to Account'
              ) : (
                'Complete Registration'
              )}
            </button>
          </form>

          {/* Quick One-Click Switcher for All 3 Roles */}
          <div className="mt-6 pt-4 border-t border-amber/20">
            <p className="text-[11px] font-bold text-chocolate uppercase tracking-wider text-center mb-2.5">
              Quick Sign In as:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('superadmin')}
                className="p-2 bg-cream hover:bg-cream-300 text-chocolate border border-amber/40 rounded-xl text-center transition-all hover:scale-[1.02] cursor-pointer"
                title="Super Admin has full authority over all settings and editor setup"
              >
                <ShieldCheck className="w-4 h-4 text-amber mx-auto mb-1" />
                <span className="block text-[11px] font-bold text-chocolate leading-tight">Super Admin</span>
                <span className="block text-[9px] text-chocolate/60">Full Control</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('editor')}
                className="p-2 bg-cream hover:bg-cream-300 text-chocolate border border-amber/40 rounded-xl text-center transition-all hover:scale-[1.02] cursor-pointer"
                title="Editor can work on products, categories, stock, and orders"
              >
                <UserCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span className="block text-[11px] font-bold text-chocolate leading-tight">Editor</span>
                <span className="block text-[9px] text-chocolate/60">Catalog & Stock</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('customer')}
                className="p-2 bg-cream hover:bg-cream-300 text-chocolate border border-amber/40 rounded-xl text-center transition-all hover:scale-[1.02] cursor-pointer"
                title="Customer can browse, add to cart, and purchase products"
              >
                <ShoppingBag className="w-4 h-4 text-chocolate mx-auto mb-1" />
                <span className="block text-[11px] font-bold text-chocolate leading-tight">Customer</span>
                <span className="block text-[9px] text-chocolate/60">Shop & Cart</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
