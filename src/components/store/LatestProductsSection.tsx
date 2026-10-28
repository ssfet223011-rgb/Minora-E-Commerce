import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { storeService } from '../../services/storeService';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';

export const LatestProductsSection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'latest' | 'bestseller' | 'sale'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const data = await storeService.getProducts();
      setProducts(data.filter((p) => p.active));
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    if (activeTab === 'latest') return p.is_new;
    if (activeTab === 'bestseller') return p.is_best_seller;
    if (activeTab === 'sale') return p.is_sale || p.regular_price > p.sales_price;
    return true;
  });

  return (
    <section className="py-12 bg-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header matching mockup */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            <span className="text-amber text-lg select-none">🍂</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate tracking-tight">
              Latest Products
            </h2>
            <span className="text-amber text-lg select-none">🍂</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-cream-200 p-1 rounded-full border border-amber/20 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-full transition-all ${
                  activeTab === 'all'
                    ? 'bg-chocolate text-honey shadow-xs'
                    : 'text-chocolate/70 hover:text-chocolate'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('latest')}
                className={`px-3 py-1.5 rounded-full transition-all ${
                  activeTab === 'latest'
                    ? 'bg-chocolate text-honey shadow-xs'
                    : 'text-chocolate/70 hover:text-chocolate'
                }`}
              >
                New Harvest
              </button>
              <button
                onClick={() => setActiveTab('bestseller')}
                className={`px-3 py-1.5 rounded-full transition-all ${
                  activeTab === 'bestseller'
                    ? 'bg-chocolate text-honey shadow-xs'
                    : 'text-chocolate/70 hover:text-chocolate'
                }`}
              >
                Best Sellers
              </button>
              <button
                onClick={() => setActiveTab('sale')}
                className={`px-3 py-1.5 rounded-full transition-all ${
                  activeTab === 'sale'
                    ? 'bg-chocolate text-honey shadow-xs'
                    : 'text-chocolate/70 hover:text-chocolate'
                }`}
              >
                Special Offers
              </button>
            </div>

            {/* View All Button matching mockup */}
            <Link
              to="/shop"
              className="px-4 py-1.5 rounded-full bg-amber hover:bg-amber-dark text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 group"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Product Grid (up to 5 items on desktop matching mockup) */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-cream/40 rounded-2xl h-80 animate-pulse border border-amber/10" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
            {filteredProducts.slice(0, 10).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-chocolate/60 text-sm">
            No products available in this tab right now.
          </div>
        )}
      </div>
    </section>
  );
};
