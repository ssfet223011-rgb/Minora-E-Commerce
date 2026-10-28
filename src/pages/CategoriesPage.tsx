import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { storeService } from '../services/storeService';
import { Category, Product } from '../types';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      setLoading(true);
      const [cats, prods] = await Promise.all([
        storeService.getCategories(),
        storeService.getProducts(),
      ]);
      setCategories(cats.filter((c) => c.active));
      setProducts(prods);
      setLoading(false);
    };
    fetchCats();
  }, []);

  return (
    <div className="py-12 bg-ivory min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-amber-dark font-bold font-sans">
            Natural Categories
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-chocolate mt-1">
            Shop by Category
          </h1>
          <p className="text-sm text-chocolate/70 mt-2">
            Explore our curated departments of organic dry fruits, nuts, power seeds, royal dates, and unprocessed pure honey.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-cream/40 rounded-2xl h-64 animate-pulse border border-amber/10" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const count = products.filter((p) => p.category_id === category.id).length;
              return (
                <Link
                  key={category.id}
                  to={`/shop?category=${category.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-amber/20 shadow-warm hover:shadow-warm-lg transition-all duration-300 hover:-translate-y-1 flex flex-col"
                >
                  <div className="relative aspect-4/3 w-full overflow-hidden bg-cream-100">
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-chocolate-deep/70 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <span className="text-[11px] font-medium text-honey block">
                        {count} {count === 1 ? 'Product' : 'Products'}
                      </span>
                      <h3 className="font-serif font-bold text-lg text-cream">{category.name}</h3>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between bg-white">
                    <p className="text-xs text-chocolate/70 line-clamp-2">{category.description}</p>
                    <div className="mt-4 pt-3 border-t border-amber/10 flex items-center justify-between text-xs font-bold text-amber-dark group-hover:text-chocolate transition-colors">
                      <span>Explore Collection</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
