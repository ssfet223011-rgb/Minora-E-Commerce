import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storeService } from '../../services/storeService';
import { Category } from '../../types';

export const ShopByCategory: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCats = async () => {
      const data = await storeService.getCategories();
      setCategories(data.filter((c) => c.active));
    };
    fetchCats();
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="py-12 bg-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with leaf flourishes matching mockup */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <span className="text-amber text-lg select-none">🍂</span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate tracking-tight">
            Shop by Category
          </h2>
          <span className="text-amber text-lg select-none">🍂</span>
        </div>

        {/* 8 Category Circular Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 sm:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/shop?category=${category.slug}`}
              className="group flex flex-col items-center text-center p-3 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:bg-cream/50"
            >
              {/* Circular image container with golden ring */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-cream-200 border-2 border-amber/30 group-hover:border-amber transition-all shadow-sm overflow-hidden mb-3">
                <img
                  src={category.image_url}
                  alt={category.name}
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* Title & subtitle */}
              <h3 className="font-serif font-bold text-sm text-chocolate group-hover:text-amber-dark transition-colors line-clamp-1">
                {category.name}
              </h3>
              <p className="text-[11px] text-chocolate/60 line-clamp-1 mt-0.5 font-sans">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
