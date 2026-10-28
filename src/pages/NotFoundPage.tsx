import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Search } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] bg-ivory flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-amber/20 shadow-warm text-center space-y-5">
        <span className="text-5xl sm:text-6xl font-serif font-extrabold text-amber-dark block">
          404
        </span>
        <h1 className="text-2xl font-serif font-bold text-chocolate">Page Not Found</h1>
        <p className="text-xs text-chocolate/70 leading-relaxed">
          The natural food page you are looking for may have been moved, renamed, or is temporarily unavailable.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="px-6 py-2.5 bg-chocolate hover:bg-chocolate-light text-honey font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Homepage</span>
          </Link>
          <Link
            to="/shop"
            className="px-6 py-2.5 bg-cream hover:bg-cream-300 text-chocolate font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-amber/20 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Explore All Products</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
