import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Search, X } from 'lucide-react';
import { storeService } from '../services/storeService';
import { Product, Category } from '../types';
import { ProductCard } from '../components/store/ProductCard';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  const queryParam = searchParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [searchQuery, setSearchQuery] = useState<string>(queryParam);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [allCats, allProds] = await Promise.all([
        storeService.getCategories(),
        storeService.getProducts(),
      ]);
      setCategories(allCats.filter((c) => c.active));
      setProducts(allProds.filter((p) => p.active));
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
    if (slug) {
      searchParams.set('category', slug);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (val.trim()) {
      searchParams.set('q', val.trim());
    } else {
      searchParams.delete('q');
    }
    setSearchParams(searchParams);
  };

  // Filter & sort
  let filtered = products.filter((p) => {
    if (selectedCategory) {
      const cat = categories.find((c) => c.slug === selectedCategory);
      if (cat && p.category_id !== cat.id) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.short_description?.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (inStockOnly && p.stock_quantity <= 0) return false;
    return true;
  });

  if (sortBy === 'price-low') {
    filtered = [...filtered].sort((a, b) => a.sales_price - b.sales_price);
  } else if (sortBy === 'price-high') {
    filtered = [...filtered].sort((a, b) => b.sales_price - a.sales_price);
  } else if (sortBy === 'rating') {
    filtered = [...filtered].sort((a, b) => b.rating - a.rating);
  }

  const activeCategoryObj = categories.find((c) => c.slug === selectedCategory);

  return (
    <div className="py-8 bg-ivory min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-serif font-bold text-chocolate">
            {activeCategoryObj ? activeCategoryObj.name : 'All Natural Products'}
          </h1>
          <p className="text-xs text-chocolate/70 mt-1">
            {activeCategoryObj
              ? activeCategoryObj.description
              : 'Explore our full collection of premium dry fruits, nuts, seeds, and artisanal honey.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search Box */}
            <div className="bg-white p-4 rounded-2xl border border-amber/20 shadow-xs">
              <label className="block text-xs font-bold text-chocolate mb-2">Search Products</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="e.g. Honey nuts, Almonds..."
                  className="w-full bg-cream-50 text-chocolate text-xs pl-3 pr-8 py-2 rounded-xl border border-amber/20 focus:outline-none focus:ring-2 focus:ring-amber"
                />
                {searchQuery ? (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="absolute right-2.5 top-2.5 text-chocolate/50 hover:text-chocolate"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <Search className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-chocolate/40" />
                )}
              </div>
            </div>

            {/* Categories Filter */}
            <div className="bg-white p-4 rounded-2xl border border-amber/20 shadow-xs space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-amber/10">
                <h3 className="text-xs font-bold text-chocolate flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-amber" />
                  <span>Categories</span>
                </h3>
                {selectedCategory && (
                  <button
                    onClick={() => handleCategorySelect('')}
                    className="text-[11px] text-amber hover:underline font-semibold"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="space-y-1 pt-1 max-h-64 overflow-y-auto">
                <button
                  onClick={() => handleCategorySelect('')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    !selectedCategory ? 'bg-chocolate text-honey font-bold' : 'text-chocolate/80 hover:bg-cream'
                  }`}
                >
                  <span>All Products</span>
                  <span className="text-[10px] opacity-70">({products.length})</span>
                </button>
                {categories.map((cat) => {
                  const count = products.filter((p) => p.category_id === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.slug)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                        selectedCategory === cat.slug
                          ? 'bg-chocolate text-honey font-bold'
                          : 'text-chocolate/80 hover:bg-cream'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className="text-[10px] opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* In stock only toggle */}
            <div className="bg-white p-4 rounded-2xl border border-amber/20 shadow-xs flex items-center justify-between">
              <span className="text-xs font-semibold text-chocolate">In Stock Only</span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 accent-chocolate rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Product Listing Main Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Top Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-amber/20 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs font-medium text-chocolate/70">
                Showing <strong className="text-chocolate">{filtered.length}</strong> {filtered.length === 1 ? 'product' : 'products'}
              </p>

              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber" />
                <span className="text-xs font-semibold text-chocolate">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-cream-50 border border-amber/20 rounded-xl px-2.5 py-1.5 text-xs text-chocolate font-medium focus:outline-none focus:ring-1 focus:ring-amber"
                >
                  <option value="featured">Featured Harvest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Customer Rating</option>
                </select>
              </div>
            </div>

            {/* Product Cards Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-cream/40 rounded-2xl h-80 animate-pulse border border-amber/10" />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-amber/20">
                <p className="text-base font-serif font-bold text-chocolate mb-2">No matching products found</p>
                <p className="text-xs text-chocolate/60 mb-4">Try clearing filters or searching with a different term.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setSearchQuery('');
                    setInStockOnly(false);
                    setSearchParams({});
                  }}
                  className="px-5 py-2 bg-chocolate text-honey font-bold text-xs rounded-full shadow-xs hover:bg-chocolate-light transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
