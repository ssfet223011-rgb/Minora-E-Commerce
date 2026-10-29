import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://nqzxcklsubkodturmkrt.supabase.co';
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xenhja2xzdWJrb2R0dXJta3J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwNzM0MDcsImV4cCI6MjEwODY0OTQwN30.wpJwsbRIWc9eQ4avi4_fAmmCS8pSMq1Y0uQ8R764yhs';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, payload } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    switch (action) {
      case 'save_product': {
        const { product, variants } = payload;
        if (!product) return res.status(400).json({ error: 'Missing product data' });

        let savedProduct: any = null;

        if (product.id) {
          const { data, error } = await supabaseAdmin
            .from('products')
            .update({ ...product, updated_at: new Date().toISOString() })
            .eq('id', product.id)
            .select();

          if (error) throw error;
          savedProduct = data?.[0] || product;

          if (variants && variants.length > 0) {
            const vars = variants.map((v: any) => ({ ...v, product_id: product.id }));
            const { error: vErr } = await supabaseAdmin.from('product_variants').upsert(vars);
            if (vErr) console.warn('Variant upsert warning:', vErr.message);
          }
        } else {
          const { data, error } = await supabaseAdmin.from('products').insert(product).select();
          if (error) throw error;
          savedProduct = data?.[0];

          if (variants && variants.length > 0 && savedProduct) {
            const vars = variants.map((v: any) => ({ ...v, product_id: savedProduct.id }));
            await supabaseAdmin.from('product_variants').insert(vars);
          }
        }

        return res.status(200).json({ success: true, data: savedProduct });
      }

      case 'delete_product': {
        const { id } = payload;
        const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ success: true });
      }

      case 'save_category': {
        const { category } = payload;
        let savedCat: any = null;

        if (category.id) {
          const { data, error } = await supabaseAdmin
            .from('categories')
            .update({ ...category, updated_at: new Date().toISOString() })
            .eq('id', category.id)
            .select();
          if (error) throw error;
          savedCat = data?.[0] || category;
        } else {
          const { data, error } = await supabaseAdmin.from('categories').insert(category).select();
          if (error) throw error;
          savedCat = data?.[0];
        }

        return res.status(200).json({ success: true, data: savedCat });
      }

      case 'delete_category': {
        const { id } = payload;
        const { error } = await supabaseAdmin.from('categories').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ success: true });
      }

      case 'save_settings': {
        const { settings } = payload;
        const { error } = await supabaseAdmin.from('site_settings').upsert(
          {
            key: 'general',
            value: settings,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        );
        if (error) throw error;
        return res.status(200).json({ success: true, data: settings });
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (err: any) {
    console.error('API Admin error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
