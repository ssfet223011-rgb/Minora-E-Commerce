import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User, LogOut, ShieldCheck, Menu, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { storeService } from '../../services/storeService';
import type { Product } from '../../types';
import { AuthModal } from '../auth/AuthModal';
import { FacebookIcon, InstagramIcon, YoutubeIcon, TwitterIcon } from '../common/SocialIcons';

export const Header: React.FC = () => {
  const { itemCount, toggleCart } = useCart();
  const { user, signOut, isStaff, isSuperAdmin, isEditor } = useAuth();
  const { settings, formatPrice } = useSettings();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await storeService.getProducts({ search: searchQuery, limit: 5 });
      setSearchResults(results);
      setIsSearching(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close search
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-ivory/95 backdrop-blur-md border-b border-amber/15 transition-all">
        {/* Top announcement bar if needed, or top info */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="md:hidden p-2 text-chocolate hover:text-amber transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* MINORA Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <img
              src={settings.logoUrl || '/assets/minora-logo.png'}
              alt={settings.brandName || 'MINORA'}
              className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-102"
            />
          </Link>

          {/* Search bar */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-md hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search for natural, healthy dry food..."
                className="w-full bg-[#FFF8E8] text-chocolate placeholder-chocolate/50 pl-4 pr-11 py-2 rounded-full border border-amber/30 text-sm focus:outline-none focus:ring-2 focus:ring-amber focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-chocolate text-honey flex items-center justify-center hover:bg-chocolate-light transition-colors"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Instant Search Results Dropdown */}
            {isSearchOpen && searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-warm-lg border border-amber/20 overflow-hidden z-50 animate-fadeIn">
                {isSearching ? (
                  <div className="p-4 text-xs text-chocolate/60 text-center">Searching...</div>
                ) : searchResults.length > 0 ? (
                  <div className="divide-y divide-amber/10 max-h-80 overflow-y-auto">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.slug}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="p-3 flex items-center gap-3 hover:bg-cream/40 transition-colors"
                      >
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-lg border border-amber/15 bg-cream/30"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-chocolate truncate">{product.name}</h4>
                          <span className="text-[11px] text-chocolate/60">{product.short_description}</span>
                        </div>
                        <span className="text-xs font-bold text-amber-dark">{formatPrice(product.sales_price)}</span>
                      </Link>
                    ))}
                    <button
                      onClick={handleSearchSubmit}
                      className="w-full py-2 bg-cream text-chocolate text-xs font-semibold text-center hover:bg-cream-300 transition-colors"
                    >
                      View all results for "{searchQuery}"
                    </button>
                  </div>
                ) : (
                  <div className="p-4 text-xs text-chocolate/60 text-center">
                    No products found matching "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right actions: Auth, Socials, Cart */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* User Account / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-chocolate hover:text-amber py-1 px-2.5 rounded-full bg-cream/70 border border-amber/20 transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-amber" />
                  <span className="hidden sm:inline max-w-[110px] truncate">{user.full_name}</span>
                  <span className={`hidden md:inline-block px-1.5 py-0.2 rounded text-[9px] font-bold ${
                    isSuperAdmin
                      ? 'bg-amber text-chocolate'
                      : isEditor
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-cream-300 text-chocolate/70'
                  }`}>
                    {isSuperAdmin ? 'Admin' : isEditor ? 'Editor' : 'Customer'}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-warm-lg border border-amber/20 py-1.5 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-amber/10">
                      <p className="text-xs font-bold text-chocolate truncate">{user.full_name}</p>
                      <p className="text-[11px] text-chocolate/60 truncate">{user.email}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isSuperAdmin
                          ? 'bg-amber/20 text-chocolate'
                          : isEditor
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-cream text-chocolate/70'
                      }`}>
                        {isSuperAdmin
                          ? '👑 Super Administrator'
                          : isEditor
                          ? '✍️ Catalog Editor'
                          : '👤 Customer Account'}
                      </span>
                    </div>
                    {isStaff && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="px-4 py-2 text-xs text-chocolate hover:bg-cream flex items-center gap-2 font-bold border-b border-amber/10"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-amber" />
                        <span>{isSuperAdmin ? 'Admin Dashboard' : 'Editor Workspace'}</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        signOut();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center text-xs font-semibold text-chocolate">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="hover:text-amber transition-colors"
                >
                  Login
                </button>
                <span className="mx-1.5 text-chocolate/30">|</span>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="hover:text-amber transition-colors"
                >
                  Register
                </button>
              </div>
            )}

            {/* Social media links from settings */}
            <div className="hidden lg:flex items-center gap-2 text-chocolate/80">
              {settings.socialLinks?.facebook && (
                <a
                  href={settings.socialLinks.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-cream hover:bg-chocolate hover:text-honey flex items-center justify-center transition-all border border-amber/20"
                  aria-label="Facebook"
                >
                  <FacebookIcon className="w-3.5 h-3.5" />
                </a>
              )}
              {settings.socialLinks?.instagram && (
                <a
                  href={settings.socialLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-cream hover:bg-chocolate hover:text-honey flex items-center justify-center transition-all border border-amber/20"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
                </a>
              )}
              {settings.socialLinks?.youtube && (
                <a
                  href={settings.socialLinks.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-cream hover:bg-chocolate hover:text-honey flex items-center justify-center transition-all border border-amber/20"
                  aria-label="YouTube"
                >
                  <YoutubeIcon className="w-3.5 h-3.5" />
                </a>
              )}
              {settings.socialLinks?.twitter && (
                <a
                  href={settings.socialLinks.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-cream hover:bg-chocolate hover:text-honey flex items-center justify-center transition-all border border-amber/20"
                  aria-label="Twitter"
                >
                  <TwitterIcon className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Shopping Cart Button */}
            <button
              onClick={toggleCart}
              className="relative p-2 rounded-full text-chocolate hover:text-amber transition-colors flex items-center justify-center"
              aria-label="Shopping Cart"
            >
              <div className="w-9 h-9 rounded-full bg-chocolate text-honey flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
                <ShoppingBag className="w-4 h-4" />
              </div>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile search bar if mobile */}
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dry food, nuts, honey..."
              className="w-full bg-[#FFF8E8] text-chocolate placeholder-chocolate/50 pl-4 pr-10 py-1.5 rounded-full border border-amber/30 text-xs focus:outline-none focus:ring-2 focus:ring-amber"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-chocolate text-honey flex items-center justify-center"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Secondary Navigation Bar (Deep Chocolate background matching mockup) */}
        <nav className="bg-chocolate text-cream shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-sm font-medium">
            <div className="hidden md:flex items-center gap-1 py-1">
              <Link
                to="/"
                className="px-4 py-1.5 rounded-full bg-honey text-chocolate font-bold transition-all shadow-xs"
              >
                Home
              </Link>
              <Link
                to="/shop"
                className="px-4 py-1.5 rounded-full text-cream/90 hover:text-honey transition-colors"
              >
                Shop
              </Link>
              <Link
                to="/categories"
                className="px-4 py-1.5 rounded-full text-cream/90 hover:text-honey transition-colors"
              >
                Categories
              </Link>
              <Link
                to="/about"
                className="px-4 py-1.5 rounded-full text-cream/90 hover:text-honey transition-colors"
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className="px-4 py-1.5 rounded-full text-cream/90 hover:text-honey transition-colors"
              >
                Contact
              </Link>
            </div>

            {/* Quick admin/editor access link */}
            <div className="py-1">
              {isStaff ? (
                <Link
                  to="/admin"
                  className="text-xs text-honey hover:text-cream flex items-center gap-1 font-semibold"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isSuperAdmin ? 'Admin Panel' : 'Editor Workspace'}</span>
                </Link>
              ) : (
                <Link
                  to="/admin"
                  className="text-[11px] text-cream/60 hover:text-honey transition-colors"
                >
                  Staff Portal
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        {isMobileNavOpen && (
          <div className="md:hidden bg-chocolate text-cream border-t border-amber/20 px-4 py-3 space-y-2 animate-fadeIn">
            <Link
              to="/"
              onClick={() => setIsMobileNavOpen(false)}
              className="block py-2 text-honey font-bold border-b border-amber/10"
            >
              Home
            </Link>
            <Link
              to="/shop"
              onClick={() => setIsMobileNavOpen(false)}
              className="block py-2 text-cream/90 hover:text-honey border-b border-amber/10"
            >
              Shop All Products
            </Link>
            <Link
              to="/categories"
              onClick={() => setIsMobileNavOpen(false)}
              className="block py-2 text-cream/90 hover:text-honey border-b border-amber/10"
            >
              Categories
            </Link>
            <Link
              to="/about"
              onClick={() => setIsMobileNavOpen(false)}
              className="block py-2 text-cream/90 hover:text-honey border-b border-amber/10"
            >
              About Us
            </Link>
            <Link
              to="/contact"
              onClick={() => setIsMobileNavOpen(false)}
              className="block py-2 text-cream/90 hover:text-honey border-b border-amber/10"
            >
              Contact Us
            </Link>
            <Link
              to="/admin"
              onClick={() => setIsMobileNavOpen(false)}
              className="block py-2 text-amber font-semibold"
            >
              Admin Dashboard
            </Link>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};
