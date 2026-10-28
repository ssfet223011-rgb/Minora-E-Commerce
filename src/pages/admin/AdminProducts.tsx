import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  Layers,
  X,
  CheckCircle,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { storeService } from '../../services/storeService';
import { Product, ProductVariant, Category } from '../../types';
import { useSettings } from '../../context/SettingsContext';

export const AdminProducts: React.FC = () => {
  const { formatPrice } = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sku, setSku] = useState('');
  const [regularPrice, setRegularPrice] = useState<number>(0);
  const [salesPrice, setSalesPrice] = useState<number>(0);
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [weightDisplay, setWeightDisplay] = useState('250g');
  const [imageUrl, setImageUrl] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');
  const [featured, setFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [active, setActive] = useState(true);

  // Dynamic Variations list
  const [variants, setVariants] = useState<Partial<ProductVariant>[]>([]);

  const fetchAll = async () => {
    setLoading(true);
    const [prods, cats] = await Promise.all([
      storeService.getProducts(),
      storeService.getCategories(),
    ]);
    setProducts(prods);
    setCategories(cats);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setSlug('');
    setCategoryId(categories[0]?.id || 'c1');
    setSku(`MNR-${Math.floor(1000 + Math.random() * 9000)}`);
    setRegularPrice(450);
    setSalesPrice(390);
    setStockQuantity(25);
    setWeightDisplay('250g - 1kg');
    setImageUrl('/assets/mini-honey-nuts.jpg');
    setShortDesc('100% Pure Natural Goodness');
    setDescription('Artisanal natural ingredients harvested carefully to retain original enzymes and wholesome nutrition.');
    setFeatured(false);
    setIsBestSeller(false);
    setActive(true);
    setVariants([
      {
        id: 'var_' + Date.now() + '_1',
        sku: 'MNR-250G',
        attributes: { weight: '250g' },
        regular_price: 450,
        sales_price: 390,
        stock_quantity: 15,
        active: true,
      },
      {
        id: 'var_' + Date.now() + '_2',
        sku: 'MNR-500G',
        attributes: { weight: '500g' },
        regular_price: 850,
        sales_price: 750,
        stock_quantity: 10,
        active: true,
      },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSlug(p.slug);
    setCategoryId(p.category_id);
    setSku(p.sku);
    setRegularPrice(p.regular_price);
    setSalesPrice(p.sales_price);
    setStockQuantity(p.stock_quantity);
    setWeightDisplay(p.weight_display || '');
    setImageUrl(p.image_url);
    setShortDesc(p.short_description || '');
    setDescription(p.description);
    setFeatured(p.featured);
    setIsBestSeller(p.is_best_seller);
    setActive(p.active);
    setVariants(p.variants ? [...p.variants] : []);
    setIsModalOpen(true);
  };

  const handleAddVariant = () => {
    const newVar: Partial<ProductVariant> = {
      id: 'var_' + Date.now(),
      sku: `${sku}-${variants.length + 1}`,
      attributes: { weight: '1kg' },
      regular_price: regularPrice * 2,
      sales_price: salesPrice * 2,
      stock_quantity: 5,
      active: true,
    };
    setVariants([...variants, newVar]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Calculate total stock from variants if variants exist
    const totalVariantStock = variants.length > 0
      ? variants.reduce((sum, v) => sum + (Number(v.stock_quantity) || 0), 0)
      : stockQuantity;

    const payload: Partial<Product> = {
      id: editingProduct?.id,
      name: name.trim(),
      slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category_id: categoryId,
      sku: sku.trim(),
      regular_price: Number(regularPrice),
      sales_price: Number(salesPrice),
      stock_quantity: totalVariantStock,
      weight_display: weightDisplay.trim(),
      image_url: imageUrl.trim() || '/assets/mini-honey-nuts.jpg',
      short_description: shortDesc.trim(),
      description: description.trim(),
      featured,
      is_best_seller: isBestSeller,
      active,
    };

    const result = await storeService.saveProduct(payload, variants as ProductVariant[]);
    if (!result.success) {
      alert('Error saving product: ' + (result.error || 'Unknown error'));
      return;
    }
    setSuccessMessage(editingProduct ? `Product "${name}" updated successfully!` : `Product "${name}" created successfully!`);
    setTimeout(() => setSuccessMessage(null), 3500);
    setIsModalOpen(false);
    await fetchAll();
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await storeService.deleteProduct(id);
      await fetchAll();
    }
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.category_id !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.short_description?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-chocolate">Product Catalog & Variations</h1>
          <p className="text-xs text-chocolate/70 mt-1">
            Manage natural foods, packaging variations (100g, 250g, 500g, 1kg), prices, and stock.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-chocolate hover:bg-chocolate-light text-honey font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter toolbar */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-fadeIn shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-bold">{successMessage}</span>
        </div>
      )}

      <div className="bg-white p-4 rounded-2xl border border-amber/20 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, SKU..."
            className="w-full bg-cream-50 pl-9 pr-4 py-2 rounded-xl text-xs text-chocolate border border-amber/20 focus:outline-none focus:ring-2 focus:ring-amber"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-chocolate/40" />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-chocolate/70 font-semibold">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-cream-50 border border-amber/20 rounded-xl px-3 py-1.5 text-xs text-chocolate font-medium"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-amber/20 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-amber border-t-transparent mx-auto" />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 border-b border-amber/15 text-chocolate/70">
                <tr>
                  <th className="py-3 px-4 font-bold">Product</th>
                  <th className="py-3 px-4 font-bold">SKU</th>
                  <th className="py-3 px-4 font-bold">Category</th>
                  <th className="py-3 px-4 font-bold">Sales Price</th>
                  <th className="py-3 px-4 font-bold">Variations</th>
                  <th className="py-3 px-4 font-bold">Total Stock</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber/10">
                {filteredProducts.map((p) => {
                  const cat = categories.find((c) => c.id === p.category_id);
                  const varCount = p.variants?.length || 0;
                  return (
                    <tr key={p.id} className="hover:bg-cream/40 transition-colors">
                      <td className="py-3 px-4">
                        <div
                          onClick={() => openEditModal(p)}
                          className="flex items-center gap-3 cursor-pointer group"
                          title="Click to edit product details"
                        >
                          <img
                            src={p.image_url}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover border border-amber/15 flex-shrink-0 group-hover:scale-105 transition-transform"
                          />
                          <div>
                            <strong className="font-semibold text-chocolate block group-hover:text-amber transition-colors">
                              {p.name}
                            </strong>
                            <span className="text-[10px] text-chocolate/60 truncate max-w-[180px] block">
                              {p.short_description}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-chocolate/70">{p.sku}</td>
                      <td className="py-3 px-4 text-chocolate/80">{cat?.name || 'Uncategorized'}</td>
                      <td className="py-3 px-4 font-bold text-chocolate">
                        {formatPrice(p.sales_price)}
                        {p.regular_price > p.sales_price && (
                          <span className="text-[10px] text-chocolate/40 line-through block">
                            {formatPrice(p.regular_price)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded bg-cream text-chocolate font-bold text-[10px] border border-amber/20">
                          {varCount > 0 ? `${varCount} Variants` : 'Single'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-mono font-bold ${
                            p.stock_quantity <= 0
                              ? 'text-red-600'
                              : p.stock_quantity <= 10
                              ? 'text-amber-dark'
                              : 'text-emerald-700'
                          }`}
                        >
                          {p.stock_quantity}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {p.active ? 'Active' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber/10 hover:bg-amber/20 text-chocolate font-bold text-xs border border-amber/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Edit Product & Variations"
                          >
                            <Edit className="w-3.5 h-3.5 text-amber" />
                            <span>Edit Details</span>
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors border border-red-200 cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-chocolate/60">
            No products found matching criteria.
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chocolate-deep/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-amber/30 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-amber/15">
              <h3 className="font-serif text-xl font-bold text-chocolate">
                {editingProduct ? 'Edit Product & Package Variations' : 'Create New Natural Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-chocolate/60 hover:text-chocolate rounded-full hover:bg-cream"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-chocolate mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Mini Honey Nuts"
                    className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-chocolate mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="mini-honey-nuts"
                    className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-chocolate mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-chocolate mb-1">Base SKU</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-chocolate mb-1">Packaging Range</label>
                  <input
                    type="text"
                    value={weightDisplay}
                    onChange={(e) => setWeightDisplay(e.target.value)}
                    placeholder="e.g. 100g - 1kg"
                    className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-chocolate mb-1">Regular Price (৳)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={regularPrice}
                    onChange={(e) => setRegularPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-chocolate mb-1">Discounted Sales Price (৳)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={salesPrice}
                    onChange={(e) => setSalesPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl font-bold text-amber-dark"
                  />
                </div>
                <div>
                  <label className="block font-bold text-chocolate mb-1">Base Stock Quantity</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-chocolate mb-1">
                  Product Image (Storage path or URL)
                </label>
                <input
                  type="text"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="/assets/mini-honey-nuts.jpg or https://..."
                  className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-chocolate mb-1">Short Tagline Description</label>
                  <input
                    type="text"
                    value={shortDesc}
                    onChange={(e) => setShortDesc(e.target.value)}
                    placeholder="e.g. Mixed Nuts & Pure Artisanal Honey"
                    className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-chocolate mb-1">Detailed Full Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Dynamic Variations Builder */}
              <div className="p-4 bg-cream/40 rounded-2xl border border-amber/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-chocolate flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber" /> Package Variations (e.g. 100g, 250g, 500g, 1kg)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="px-3 py-1 bg-amber text-white font-bold rounded-lg text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Variation</span>
                  </button>
                </div>

                {variants.length > 0 ? (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {variants.map((v, idx) => (
                      <div
                        key={v.id || idx}
                        className="p-3 bg-white rounded-xl border border-amber/20 grid grid-cols-1 sm:grid-cols-5 gap-2 items-center text-xs"
                      >
                        <div>
                          <span className="block text-[10px] text-chocolate/60">Attribute / Weight</span>
                          <input
                            type="text"
                            value={v.attributes?.weight || ''}
                            onChange={(e) => {
                              const updated = [...variants];
                              updated[idx].attributes = { ...updated[idx].attributes, weight: e.target.value };
                              setVariants(updated);
                            }}
                            placeholder="e.g. 250g"
                            className="w-full px-2 py-1 bg-cream-50 rounded border border-amber/20 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <span className="block text-[10px] text-chocolate/60">SKU</span>
                          <input
                            type="text"
                            value={v.sku || ''}
                            onChange={(e) => {
                              const updated = [...variants];
                              updated[idx].sku = e.target.value;
                              setVariants(updated);
                            }}
                            className="w-full px-2 py-1 bg-cream-50 rounded border border-amber/20 font-mono text-xs"
                          />
                        </div>
                        <div>
                          <span className="block text-[10px] text-chocolate/60">Sales Price (৳)</span>
                          <input
                            type="number"
                            min={0}
                            value={v.sales_price || 0}
                            onChange={(e) => {
                              const updated = [...variants];
                              updated[idx].sales_price = Number(e.target.value);
                              setVariants(updated);
                            }}
                            className="w-full px-2 py-1 bg-cream-50 rounded border border-amber/20 text-xs font-bold text-amber-dark"
                          />
                        </div>
                        <div>
                          <span className="block text-[10px] text-chocolate/60">Stock Qty</span>
                          <input
                            type="number"
                            min={0}
                            value={v.stock_quantity || 0}
                            onChange={(e) => {
                              const updated = [...variants];
                              updated[idx].stock_quantity = Number(e.target.value);
                              setVariants(updated);
                            }}
                            className="w-full px-2 py-1 bg-cream-50 rounded border border-amber/20 text-xs font-mono font-bold"
                          />
                        </div>
                        <div className="text-right pt-3 sm:pt-0">
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(idx)}
                            className="text-red-500 hover:text-red-700 text-xs font-semibold"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-chocolate/60 italic">
                    No variations configured. The product will be sold as a single package item.
                  </p>
                )}
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-semibold text-chocolate">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 accent-chocolate"
                  />
                  <span>Show as Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={(e) => setIsBestSeller(e.target.checked)}
                    className="w-4 h-4 accent-chocolate"
                  />
                  <span>Best Seller Badge</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 accent-chocolate"
                  />
                  <span>Active & Published</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-amber/15">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-xl text-xs font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-chocolate hover:bg-chocolate-light text-honey font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
                >
                  Save Product & Variations
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
