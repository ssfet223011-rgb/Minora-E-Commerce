import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, AlertCircle, CheckCircle, Layers } from 'lucide-react';
import { storeService } from '../../services/storeService';
import { Category, Product } from '../../types';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [active, setActive] = useState(true);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    const [cats, prods] = await Promise.all([
      storeService.getCategories(),
      storeService.getProducts(),
    ]);
    setCategories(cats);
    setProducts(prods);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=400&q=80');
    setDisplayOrder(categories.length + 1);
    setActive(true);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description);
    setImageUrl(cat.image_url);
    setDisplayOrder(cat.display_order);
    setActive(cat.active);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setErrorMessage(null);

    const payload: Partial<Category> = {
      id: editingCategory?.id,
      name: name.trim(),
      slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: description.trim(),
      image_url: imageUrl.trim(),
      display_order: Number(displayOrder),
      active,
    };

    const result = await storeService.saveCategory(payload);
    if (!result.success) {
      setErrorMessage(result.error || 'Failed to save category. Please try again.');
      return;
    }
    setSuccessMessage(editingCategory ? 'Category updated successfully!' : 'Category added successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
    setIsModalOpen(false);
    await fetchAll();
  };

  const handleDelete = async (id: string) => {
    setErrorMessage(null);
    const res = await storeService.deleteCategory(id);
    if (res.success) {
      setSuccessMessage('Category deleted successfully.');
      setTimeout(() => setSuccessMessage(null), 3000);
      await fetchAll();
    } else {
      setErrorMessage(res.error || 'Cannot delete category.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-chocolate">Category Management</h1>
          <p className="text-xs text-chocolate/70 mt-1">
            Configure departments, visual icons, ordering, and active visibility on the storefront.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-chocolate hover:bg-chocolate-light text-honey font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-amber/20 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-amber border-t-transparent mx-auto" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 border-b border-amber/15 text-chocolate/70">
                <tr>
                  <th className="py-3 px-4 font-bold">Category</th>
                  <th className="py-3 px-4 font-bold">Slug</th>
                  <th className="py-3 px-4 font-bold">Short Tagline</th>
                  <th className="py-3 px-4 font-bold">Products</th>
                  <th className="py-3 px-4 font-bold">Display Order</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber/10">
                {categories.map((cat) => {
                  const count = products.filter((p) => p.category_id === cat.id).length;
                  return (
                    <tr key={cat.id} className="hover:bg-cream/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={cat.image_url}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover border border-amber/20 flex-shrink-0"
                          />
                          <span className="font-serif font-bold text-chocolate text-sm">{cat.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-chocolate/60">{cat.slug}</td>
                      <td className="py-3 px-4 text-chocolate/80">{cat.description}</td>
                      <td className="py-3 px-4 font-bold text-chocolate">
                        {count} items
                      </td>
                      <td className="py-3 px-4 font-mono">{cat.display_order}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            cat.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {cat.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(cat)}
                            className="p-1.5 rounded-lg bg-cream hover:bg-cream-300 text-chocolate transition-colors border border-amber/20"
                            title="Edit Category"
                          >
                            <Edit className="w-3.5 h-3.5 text-amber" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors border border-red-200"
                            title="Delete Category"
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
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chocolate-deep/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full border border-amber/30 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amber/15">
              <h3 className="font-serif text-lg font-bold text-chocolate">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-chocolate/60 hover:text-chocolate rounded-full hover:bg-cream"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-chocolate mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dry Fruits"
                  className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-chocolate mb-1">URL Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="dry-fruits"
                  className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-chocolate mb-1">Short Tagline Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Nature's Energy"
                  className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-chocolate mb-1">Image URL</label>
                <input
                  type="text"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block font-bold text-chocolate mb-1">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl font-mono font-bold"
                  />
                </div>
                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-chocolate">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="w-4 h-4 accent-chocolate"
                    />
                    <span>Active on Store</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-amber/15">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded-xl font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-chocolate text-honey font-bold rounded-xl shadow-xs"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
