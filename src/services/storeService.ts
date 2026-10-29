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
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUUID(id?: string): boolean {
  return Boolean(id && UUID_REGEX.test(id));
}

export function ensureUUID(id?: string): string {
  if (isValidUUID(id)) return id!;
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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
    let localCategories = getLocalItem<Category[]>(STORAGE_KEYS.CATEGORIES, []);

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('display_order', { ascending: true });
        if (!error && data && data.length > 0) {
          setLocalItem(STORAGE_KEYS.CATEGORIES, data);
          return data;
        }
        if (error) console.error('Supabase getCategories error:', error.message);
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local store', err);
      }
    }
    return localCategories.length > 0 ? localCategories : INITIAL_CATEGORIES;
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const categories = await this.getCategories();
    return categories.find((c) => c.slug === slug) || null;
  },

  async saveCategory(cat: Partial<Category>): Promise<{ success: boolean; data?: Category; error?: string }> {
    let savedCategory: Category | undefined;

    if (isSupabaseConfigured) {
      try {
        if (cat.id) {
          // UPDATE existing category in Supabase
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
          } else if (data && data.length > 0) {
            savedCategory = data[0] as Category;
          }
        } else {
          // INSERT new category in Supabase
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
          } else if (data && data.length > 0) {
            savedCategory = data[0] as Category;
          }
        }
      } catch (e) {
        console.warn('Supabase category save exception', e);
      }
    }

    // Always update local cache so changes are immediately visible
    const categories = getLocalItem<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    let updatedCategory: Category;
    if (cat.id) {
      const index = categories.findIndex((c) => c.id === cat.id);
      updatedCategory = { ...categories[index >= 0 ? index : 0], ...cat, ...(savedCategory || {}) } as Category;
      if (index >= 0) categories[index] = updatedCategory;
      else categories.push(updatedCategory);
    } else {
      updatedCategory = savedCategory || {
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
    const localProducts = getLocalItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);

    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('products').select('*, product_variants(*)').order('id', { ascending: true });
        if (filters?.categoryId) query = query.eq('category_id', filters.categoryId);
        if (filters?.featured) query = query.eq('featured', true);
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          products = data.map((item) => ({
            ...item,
            variants: item.product_variants || [],
          }));
          setLocalItem(STORAGE_KEYS.PRODUCTS, products);
        }
      } catch (err) {
        console.warn('Supabase products fetch failed, using local', err);
      }
    }

    if (products.length === 0) {
      products = localProducts.length > 0 ? localProducts : INITIAL_PRODUCTS;
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
    let savedProdRow: any;

    if (isSupabaseConfigured) {
      try {
        if (prod.id) {
          // UPDATE existing product in Supabase - strictly whitelist columns to prevent Postgres schema errors
          const cleanProductData: Record<string, any> = {
            updated_at: new Date().toISOString(),
          };
          if (prod.name !== undefined) cleanProductData.name = prod.name;
          if (prod.slug !== undefined) cleanProductData.slug = prod.slug;
          if (prod.description !== undefined) cleanProductData.description = prod.description;
          if (prod.short_description !== undefined) cleanProductData.short_description = prod.short_description;
          if (prod.category_id !== undefined) cleanProductData.category_id = prod.category_id;
          if (prod.sku !== undefined) cleanProductData.sku = prod.sku;
          if (prod.regular_price !== undefined) cleanProductData.regular_price = Number(prod.regular_price);
          if (prod.sales_price !== undefined) cleanProductData.sales_price = Number(prod.sales_price);
          if (prod.stock_quantity !== undefined) cleanProductData.stock_quantity = Number(prod.stock_quantity);
          if (prod.weight_display !== undefined) cleanProductData.weight_display = prod.weight_display;
          if (prod.image_url !== undefined) cleanProductData.image_url = prod.image_url;
          if (prod.featured !== undefined) cleanProductData.featured = Boolean(prod.featured);
          if (prod.is_best_seller !== undefined) cleanProductData.is_best_seller = Boolean(prod.is_best_seller);
          if (prod.is_organic !== undefined) cleanProductData.is_organic = Boolean(prod.is_organic);
          if (prod.is_popular !== undefined) cleanProductData.is_popular = Boolean(prod.is_popular);
          if (prod.is_new !== undefined) cleanProductData.is_new = Boolean(prod.is_new);
          if (prod.is_sale !== undefined) cleanProductData.is_sale = Boolean(prod.is_sale);
          if (prod.active !== undefined) cleanProductData.active = Boolean(prod.active);

          const { data: updatedProd, error: updateErr } = await supabase
            .from('products')
            .update(cleanProductData)
            .eq('id', prod.id)
            .select();
          if (updateErr) {
            console.error('Supabase update product error:', updateErr.message);
          } else if (updatedProd && updatedProd.length > 0) {
            savedProdRow = updatedProd[0];
          }
          // Upsert variants with strictly sanitized UUIDs and schema columns
          if (variants && variants.length > 0) {
            const variantsWithProductId = variants.map(v => ({
              id: ensureUUID(v.id),
              product_id: prod.id,
              sku: v.sku || `${prod.sku || 'MNR'}-${Math.floor(Math.random() * 1000)}`,
              attributes: v.attributes || {},
              regular_price: Number(v.regular_price) || 0,
              sales_price: Number(v.sales_price) || 0,
              stock_quantity: Number(v.stock_quantity) || 0,
              active: v.active ?? true,
            }));
            const { error: varErr } = await supabase.from('product_variants').upsert(variantsWithProductId);
            if (varErr) console.error('Supabase variant upsert error:', varErr.message);
          }
        } else {
          // INSERT new product in Supabase
          const newSlug = prod.slug || prod.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `product-${Date.now()}`;
          const { data: inserted, error: insertErr } = await supabase
            .from('products')
            .insert({
              name: prod.name,
              slug: newSlug,
              description: prod.description || '',
              short_description: prod.short_description || '',
              category_id: prod.category_id,
              sku: prod.sku || `MNR-${Date.now().toString().slice(-4)}`,
              regular_price: Number(prod.regular_price) || 0,
              sales_price: Number(prod.sales_price) || 0,
              stock_quantity: Number(prod.stock_quantity) || 0,
              weight_display: prod.weight_display || '250g',
              image_url: prod.image_url || '/assets/mini-honey-nuts.jpg',
              featured: Boolean(prod.featured),
              is_best_seller: Boolean(prod.is_best_seller),
              is_organic: Boolean(prod.is_organic),
              is_popular: Boolean(prod.is_popular),
              is_new: Boolean(prod.is_new ?? true),
              is_sale: Boolean(prod.is_sale),
              active: prod.active ?? true,
            })
            .select();
          if (insertErr) {
            console.error('Supabase insert product error:', insertErr.message);
          } else if (inserted && inserted.length > 0) {
            savedProdRow = inserted[0];
          }
          // Insert variants with valid UUIDs
          const insertedRow = inserted?.[0];
          if (variants && variants.length > 0 && insertedRow) {
            const variantsWithProductId = variants.map(v => ({
              id: ensureUUID(v.id),
              product_id: insertedRow.id,
              sku: v.sku || `${insertedRow.sku || 'MNR'}-${Math.floor(Math.random() * 1000)}`,
              attributes: v.attributes || {},
              regular_price: Number(v.regular_price) || 0,
              sales_price: Number(v.sales_price) || 0,
              stock_quantity: Number(v.stock_quantity) || 0,
              active: v.active ?? true,
            }));
            const { error: varErr } = await supabase.from('product_variants').insert(variantsWithProductId);
            if (varErr) console.error('Supabase variant insert error:', varErr.message);
          }
        }
      } catch (e) {
        console.warn('Supabase product save exception', e);
      }
    }

    // Always update local storage so changes immediately reflect in the UI
    const products = getLocalItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    let targetProduct: Product;
    if (prod.id) {
      const index = products.findIndex((p) => p.id === prod.id);
      targetProduct = {
        ...products[index >= 0 ? index : 0],
        ...prod,
        ...(savedProdRow || {}),
        variants: (variants as ProductVariant[]) || [],
        updated_at: new Date().toISOString(),
      };
      if (index >= 0) products[index] = targetProduct;
      else products.push(targetProduct);
    } else {
      const newId = savedProdRow?.id || ('p_' + Date.now());
      targetProduct = {
        ...(savedProdRow || {}),
        id: newId,
        name: prod.name || 'New Product',
        slug: prod.slug || prod.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `product-${Date.now()}`,
        description: prod.description || '',
        short_description: prod.short_description || '',
        category_id: prod.category_id || '',
        sku: prod.sku || `MNR-${Date.now().toString().slice(-4)}`,
        regular_price: prod.regular_price || 0,
        sales_price: prod.sales_price || 0,
        stock_quantity: prod.stock_quantity || 0,
        weight_display: prod.weight_display || '250g',
        rating: 5.0,
        reviews_count: 0,
        image_url: prod.image_url || '/assets/mini-honey-nuts.jpg',
        featured: prod.featured ?? false,
        is_best_seller: prod.is_best_seller ?? false,
        is_organic: prod.is_organic ?? false,
        is_popular: prod.is_popular ?? false,
        is_new: prod.is_new ?? true,
        is_sale: prod.is_sale ?? false,
        active: prod.active ?? true,
        variants: (variants as ProductVariant[]) || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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
          const cleanSlide: Record<string, any> = { updated_at: new Date().toISOString() };
          if (slide.headline !== undefined) cleanSlide.headline = slide.headline;
          if (slide.description !== undefined) cleanSlide.description = slide.description;
          if (slide.image_url !== undefined) cleanSlide.image_url = slide.image_url;
          if (slide.badge !== undefined) cleanSlide.badge = slide.badge;
          if (slide.cta_text !== undefined) cleanSlide.cta_text = slide.cta_text;
          if (slide.cta_url !== undefined) cleanSlide.cta_url = slide.cta_url;
          if (slide.display_order !== undefined) cleanSlide.display_order = slide.display_order;
          if (slide.active !== undefined) cleanSlide.active = slide.active;

          const { data, error } = await supabase
            .from('hero_slides')
            .update(cleanSlide)
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
        }, { onConflict: 'key' });
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
