import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { formatPrice } = useSettings();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const primaryVariant = product.variants && product.variants.length > 0 ? product.variants[0] : undefined;
    addToCart(product, primaryVariant, 1);
  };

  // Determine badge
  let badgeLabel = '';
  let badgeClass = '';
  if (product.is_new) {
    badgeLabel = 'New';
    badgeClass = 'bg-amber-dark text-white';
  } else if (product.is_best_seller) {
    badgeLabel = 'Best Seller';
    badgeClass = 'bg-honey-dark text-chocolate font-bold';
  } else if (product.is_organic) {
    badgeLabel = 'Organic';
    badgeClass = 'bg-emerald-700 text-white';
  } else if (product.is_popular) {
    badgeLabel = 'Popular';
    badgeClass = 'bg-amber text-white';
  } else if (product.is_sale) {
    badgeLabel = 'Sale';
    badgeClass = 'bg-red-600 text-white';
  }

  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <div className="group relative bg-white rounded-2xl border border-amber/20 shadow-warm hover:shadow-warm-lg transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1">
      {/* Product Image & Badges */}
      <Link to={`/product/${product.slug}`} className="relative block p-3 bg-cream/30 overflow-hidden">
        {badgeLabel && (
          <span
            className={`absolute top-4 left-4 z-10 px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase shadow-xs ${badgeClass}`}
          >
            {badgeLabel}
          </span>
        )}

        <div className="w-full aspect-square rounded-xl overflow-hidden bg-cream-50 flex items-center justify-center">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
            loading="lazy"
          />
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-chocolate-deep/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <Link to={`/product/${product.slug}`} className="block">
          <h3 className="font-serif font-bold text-base text-chocolate group-hover:text-amber-dark transition-colors truncate">
            {product.name}
          </h3>
          <p className="text-xs text-chocolate/60 truncate mt-0.5">
            {product.short_description || product.category_name || 'Pure Natural Foods'}
          </p>

          {/* Star Rating */}
          <div className="flex items-center gap-1 mt-2">
            <div className="flex text-amber">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(product.rating || 5)
                      ? 'fill-amber text-amber'
                      : 'text-amber/40'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-chocolate/60 font-medium">({product.reviews_count || 18})</span>
          </div>

          {/* Pricing */}
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-bold text-chocolate font-sans">
              {formatPrice(product.sales_price)}
            </span>
            {product.regular_price > product.sales_price && (
              <span className="text-xs text-chocolate/40 line-through">
                {formatPrice(product.regular_price)}
              </span>
            )}
          </div>
        </Link>

        {/* Add to Cart Button */}
        <div className="mt-4">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full py-2.5 bg-chocolate hover:bg-chocolate-light text-honey font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 text-xs group/btn cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-honey group-hover/btn:scale-110 transition-transform" />
            <span>{isOutOfStock ? 'Unavailable' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
