import { Category, Product, ProductVariant, HeroSlide, SiteSettings, InventoryMovement } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_HERO_SLIDES,
  INITIAL_SITE_SETTINGS,
} from './initialData';

const STORAGE_KEYS = {
  CATEGORIES: 'minora_categories',
  PRODUCTS: 'minora_products',
  HERO_SLIDES: 'minora_hero_slides',
  SETTINGS: 'minora_settings',
  MOVEMENTS: 'minora_inventory_movements',
};

// Helper for local state
function getLocalItem<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocalItem<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

export const storeService = {
  // CATEGORIES
  async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('display_order', { ascending: true });
        if (!error && data) {
          // Always trust Supabase data when configured — even if empty
          if (data.length > 0) setLocalItem(STORAGE_KEYS.CATEGORIES, data);
          return data;
        }
        if (error) console.error('Supabase getCategories error:', error.message);
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local store', err);
      }
    }
    return getLocalItem<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const categories = await this.getCategories();
    return categories.find((c) => c.slug === slug) || null;
  },

  async saveCategory(cat: Partial<Category>): Promise<{ success: boolean; data?: Category; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        if (cat.id) {
          // UPDATE existing category
          const { data, error } = await supabase
            .from('categories')
            .update({
              name: cat.name,
              slug: cat.slug,
              description: cat.description,
              image_url: cat.image_url,
              display_order: cat.display_order,
              active: cat.active,
              updated_at: new Date().toISOString(),
            })
            .eq('id', cat.id)
            .select();
          if (error) {
            console.error('Supabase update category error:', error.message);
            return { success: false, error: error.message };
          }
          return { success: true, data: (data?.[0] || cat) as Category };
        } else {
          // INSERT new category
          const { data, error } = await supabase
            .from('categories')
            .insert({
              name: cat.name,
              slug: cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-'),
              description: cat.description,
              image_url: cat.image_url,
              display_order: cat.display_order,
              active: cat.active ?? true,
            })
            .select();
          if (error) {
            console.error('Supabase insert category error:', error.message);
            return { success: false, error: error.message };
          }
          return { success: true, data: (data?.[0] || cat) as Category };
        }
      } catch (e) {
        console.warn('Supabase category save exception', e);
      }
    }

    // localStorage fallback
    const categories = getLocalItem<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    let updatedCategory: Category;
    if (cat.id) {
      const index = categories.findIndex((c) => c.id === cat.id);
      updatedCategory = { ...categories[index >= 0 ? index : 0], ...cat } as Category;
      if (index >= 0) categories[index] = updatedCategory;
    } else {
      updatedCategory = {
        id: 'c_' + Date.now(),
        name: cat.name || 'New Category',
        slug: cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-') || `category-${Date.now()}`,
        description: cat.description || '',
        image_url: cat.image_url || '',
        display_order: cat.display_order || categories.length + 1,
        active: cat.active ?? true,
      };
      categories.push(updatedCategory);
    }
    setLocalItem(STORAGE_KEYS.CATEGORIES, categories);
    return { success: true, data: updatedCategory };
  },

  async deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
    const products = await this.getProducts();
    const hasProducts = products.some((p) => p.category_id === id);
    if (hasProducts) {
      return {
        success: false,
        error: 'Cannot delete category because active products belong to it. Please reassign or delete products first.',
      };
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) {
          console.error('Supabase delete category error:', error.message);
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (e) {
        console.warn('Supabase category delete exception', e);
      }
    }

    // localStorage fallback
    const categories = getLocalItem<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    const filtered = categories.filter((c) => c.id !== id);
    setLocalItem(STORAGE_KEYS.CATEGORIES, filtered);
    return { success: true };
  },

  // PRODUCTS
  async getProducts(filters?: {
    categoryId?: string;
    categorySlug?: string;
    search?: string;
    sort?: string;
    featured?: boolean;
    bestSeller?: boolean;
    limit?: number;
  }): Promise<Product[]> {
    let products: Product[] = [];

    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('products').select('*, product_variants(*)');
        if (filters?.categoryId) query = query.eq('category_id', filters.categoryId);
        if (filters?.featured) query = query.eq('featured', true);
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          products = data.map((item) => ({
            ...item,
            variants: item.product_variants || [],
          }));
        }
      } catch (err) {
        console.warn('Supabase products fetch failed, using local', err);
      }
    }

    if (products.length === 0) {
      products = getLocalItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    }

    // Apply filters
    if (filters?.categoryId) {
      products = products.filter((p) => p.category_id === filters.categoryId);
    }

    if (filters?.categorySlug) {
      const categories = await this.getCategories();
      const targetCat = categories.find((c) => c.slug === filters.categorySlug);
      if (targetCat) {
        products = products.filter((p) => p.category_id === targetCat.id);
      }
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.short_description?.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }

    if (filters?.featured) {
      products = products.filter((p) => p.featured);
    }

    if (filters?.bestSeller) {
      products = products.filter((p) => p.is_best_seller);
    }

    // Sorting
    if (filters?.sort === 'price-low') {
      products.sort((a, b) => a.sales_price - b.sales_price);
    } else if (filters?.sort === 'price-high') {
      products.sort((a, b) => b.sales_price - a.sales_price);
    } else if (filters?.sort === 'rating') {
      products.sort((a, b) => b.rating - a.rating);
    }

    if (filters?.limit && filters.limit > 0) {
      products = products.slice(0, filters.limit);
    }

    return products;
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find((p) => p.slug === slug) || null;
  },

  async getProductById(id: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find((p) => p.id === id) || null;
  },

  async saveProduct(
    prod: Partial<Product>,
    variants?: Partial<ProductVariant>[]
  ): Promise<{ success: boolean; data?: Product; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        if (prod.id) {
          // UPDATE existing product
          const { variants: _v, ...productData } = prod as Product;
          const { data: updatedProd, error: updateErr } = await supabase
            .from('products')
            .update({ ...productData, updated_at: new Date().toISOString() })
            .eq('id', prod.id)
            .select();
          if (updateErr) {
            console.error('Supabase update product error:', updateErr.message);
            return { success: false, error: updateErr.message };
          }
          // Upsert variants
          if (variants && variants.length > 0) {
            const variantsWithProductId = variants.map(v => ({ ...v, product_id: prod.id }));
            const { error: varErr } = await supabase.from('product_variants').upsert(variantsWithProductId);
            if (varErr) console.error('Supabase variant upsert error:', varErr.message);
          }
          const fullProduct = { ...(updatedProd?.[0] || prod), variants: variants as ProductVariant[] || [] };
          return { success: true, data: fullProduct as Product };
        } else {
          // INSERT new product
          const newSlug = prod.slug || prod.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `product-${Date.now()}`;
          const { data: inserted, error: insertErr } = await supabase
            .from('products')
            .insert({
              name: prod.name,
              slug: newSlug,
              description: prod.description,
              short_description: prod.short_description,
              category_id: prod.category_id,
              sku: prod.sku || `MNR-${Date.now().toString().slice(-4)}`,
              regular_price: prod.regular_price || 0,
              sales_price: prod.sales_price || 0,
              stock_quantity: prod.stock_quantity || 0,
              weight_display: prod.weight_display,
              image_url: prod.image_url,
              featured: prod.featured ?? false,
              is_best_seller: prod.is_best_seller ?? false,
              is_organic: prod.is_organic ?? false,
              is_popular: prod.is_popular ?? false,
              is_new: prod.is_new ?? true,
              is_sale: prod.is_sale ?? false,
              active: prod.active ?? true,
            })
            .select();
          if (insertErr) {
            console.error('Supabase insert product error:', insertErr.message);
            return { success: false, error: insertErr.message };
          }
          // Insert variants
          const insertedRow = inserted?.[0];
          if (variants && variants.length > 0 && insertedRow) {
            const variantsWithProductId = variants.map(v => ({ ...v, product_id: insertedRow.id }));
            const { error: varErr } = await supabase.from('product_variants').insert(variantsWithProductId);
            if (varErr) console.error('Supabase variant insert error:', varErr.message);
          }
          const fullProduct = { ...(insertedRow || prod), variants: variants as ProductVariant[] || [] };
          return { success: true, data: fullProduct as Product };
        }
      } catch (e) {
        console.warn('Supabase product save exception', e);
      }
    }

    // localStorage fallback
    const products = getLocalItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    let targetProduct: Product;
    if (prod.id) {
      const index = products.findIndex((p) => p.id === prod.id);
      targetProduct = { ...products[index >= 0 ? index : 0], ...prod, variants: (variants as ProductVariant[]) || [], updated_at: new Date().toISOString() };
      if (index >= 0) products[index] = targetProduct;
    } else {
      const newId = 'p_' + Date.now();
      targetProduct = {
        id: newId, name: prod.name || 'New Product',
        slug: prod.slug || prod.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `product-${Date.now()}`,
        description: prod.description || '', short_description: prod.short_description || '',
        category_id: prod.category_id || '',
        sku: prod.sku || `MNR-${Date.now().toString().slice(-4)}`,
        regular_price: prod.regular_price || 0, sales_price: prod.sales_price || 0,
        stock_quantity: prod.stock_quantity || 0, weight_display: prod.weight_display || '250g',
        rating: 5.0, reviews_count: 0, image_url: prod.image_url || '/assets/mini-honey-nuts.jpg',
        featured: prod.featured ?? false, is_best_seller: prod.is_best_seller ?? false,
        is_organic: prod.is_organic ?? false, is_popular: prod.is_popular ?? false,
        is_new: prod.is_new ?? true, is_sale: prod.is_sale ?? false, active: prod.active ?? true,
        variants: (variants as ProductVariant[]) || [],
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      };
      products.push(targetProduct);
    }
    setLocalItem(STORAGE_KEYS.PRODUCTS, products);
    return { success: true, data: targetProduct };
  },

  async deleteProduct(id: string): Promise<boolean> {
    const products = await this.getProducts();
    const filtered = products.filter((p) => p.id !== id);
    setLocalItem(STORAGE_KEYS.PRODUCTS, filtered);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase product delete error', err);
      }
    }

    return true;
  },

  // VARIANT STOCK UPDATE & INVENTORY MOVEMENTS
  async updateVariantStock(
    productId: string,
    variantId: string,
    newQuantity: number,
    reason: string,
    actorId?: string
  ): Promise<boolean> {
    const products = await this.getProducts();
    const product = products.find((p) => p.id === productId);
    if (!product || !product.variants) return false;

    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant) return false;

    const diff = newQuantity - variant.stock_quantity;
    variant.stock_quantity = newQuantity;

    // Recalculate total product stock
    product.stock_quantity = product.variants.reduce((acc, v) => acc + v.stock_quantity, 0);

    setLocalItem(STORAGE_KEYS.PRODUCTS, products);

    // Record movement
    const movements = getLocalItem<InventoryMovement[]>(STORAGE_KEYS.MOVEMENTS, []);
    movements.unshift({
      id: 'mov_' + Date.now(),
      variant_id: variantId,
      product_name: product.name,
      sku: variant.sku,
      quantity_change: diff,
      movement_type: diff > 0 ? 'restock' : 'adjustment',
      reason,
      actor_id: actorId || 'admin',
      created_at: new Date().toISOString(),
    });
    setLocalItem(STORAGE_KEYS.MOVEMENTS, movements);

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('product_variants')
          .update({ stock_quantity: newQuantity, updated_at: new Date().toISOString() })
          .eq('id', variantId);
      } catch (err) {
        console.warn('Supabase stock update error', err);
      }
    }

    return true;
  },

  async getInventoryMovements(): Promise<InventoryMovement[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('inventory_movements')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase inventory movements fetch failed', err);
      }
    }
    return getLocalItem<InventoryMovement[]>(STORAGE_KEYS.MOVEMENTS, []);
  },

  // HERO SLIDES
  async getHeroSlides(): Promise<HeroSlide[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('hero_slides')
          .select('*')
          .order('display_order', { ascending: true });
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase hero fetch failed', err);
      }
    }
    return getLocalItem<HeroSlide[]>(STORAGE_KEYS.HERO_SLIDES, INITIAL_HERO_SLIDES);
  },

  async saveHeroSlide(slide: Partial<HeroSlide>): Promise<{ success: boolean; data?: HeroSlide; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        if (slide.id) {
          const { data, error } = await supabase
            .from('hero_slides')
            .update({ ...slide, updated_at: new Date().toISOString() })
            .eq('id', slide.id)
            .select();
          if (error) return { success: false, error: error.message };
          return { success: true, data: (data?.[0] || slide) as HeroSlide };
        } else {
          const { data, error } = await supabase
            .from('hero_slides')
            .insert({
              headline: slide.headline || 'New Headline',
              description: slide.description || '',
              image_url: slide.image_url || '/assets/mini-honey-nuts.jpg',
              badge: slide.badge,
              cta_text: slide.cta_text || 'Shop Now',
              cta_url: slide.cta_url || '/shop',
              display_order: slide.display_order || 1,
              active: slide.active ?? true,
            })
            .select();
          if (error) return { success: false, error: error.message };
          return { success: true, data: (data?.[0] || slide) as HeroSlide };
        }
      } catch (err) {
        console.warn('Supabase hero save exception', err);
      }
    }

    // localStorage fallback
    const slides = getLocalItem<HeroSlide[]>(STORAGE_KEYS.HERO_SLIDES, INITIAL_HERO_SLIDES);
    let updated: HeroSlide;
    if (slide.id) {
      const idx = slides.findIndex((s) => s.id === slide.id);
      updated = { ...slides[idx >= 0 ? idx : 0], ...slide } as HeroSlide;
      if (idx >= 0) slides[idx] = updated;
    } else {
      updated = {
        id: 'h_' + Date.now(),
        headline: slide.headline || 'New Headline',
        description: slide.description || '',
        image_url: slide.image_url || '/assets/mini-honey-nuts.jpg',
        badge: slide.badge,
        cta_text: slide.cta_text || 'Shop Now',
        cta_url: slide.cta_url || '/shop',
        display_order: slide.display_order || slides.length + 1,
        active: slide.active ?? true,
      };
      slides.push(updated);
    }
    setLocalItem(STORAGE_KEYS.HERO_SLIDES, slides);
    return { success: true, data: updated };
  },

  // SITE SETTINGS
  async getSiteSettings(): Promise<SiteSettings> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'general')
          .single();
        if (!error && data && data.value) {
          setLocalItem(STORAGE_KEYS.SETTINGS, data.value);
          return data.value as SiteSettings;
        }
      } catch (err) {
        console.warn('Supabase settings fetch failed', err);
      }
    }
    return getLocalItem<SiteSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SITE_SETTINGS);
  },

  async updateSiteSettings(settings: Partial<SiteSettings>): Promise<{ success: boolean; data?: SiteSettings; error?: string }> {
    const current = await this.getSiteSettings();
    const merged: SiteSettings = {
      ...current,
      ...settings,
      socialLinks: { ...current.socialLinks, ...(settings.socialLinks || {}) },
      deliveryFees: { ...current.deliveryFees, ...(settings.deliveryFees || {}) },
      paymentSettings: { ...current.paymentSettings, ...(settings.paymentSettings || {}) },
      policies: { ...current.policies, ...(settings.policies || {}) },
    };

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('site_settings').upsert({
          key: 'general',
          value: merged,
          updated_at: new Date().toISOString(),
        });
        if (error) {
          console.error('Supabase settings save error:', error.message);
          return { success: false, error: error.message };
        }
        setLocalItem(STORAGE_KEYS.SETTINGS, merged);
        return { success: true, data: merged };
      } catch (err) {
        console.warn('Supabase settings save exception', err);
      }
    }

    setLocalItem(STORAGE_KEYS.SETTINGS, merged);
    return { success: true, data: merged };
  },
};
