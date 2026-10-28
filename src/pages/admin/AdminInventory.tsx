import React, { useState, useEffect } from 'react';
import { Boxes, AlertTriangle, ArrowUpDown, Plus, Minus, History, X, CheckCircle } from 'lucide-react';
import { storeService } from '../../services/storeService';
import { Product, ProductVariant, InventoryMovement } from '../../types';

export const AdminInventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);

  // Stock Adjustment Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [adjustmentQty, setAdjustmentQty] = useState<number>(0);
  const [reason, setReason] = useState('New shipment restock');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    const [prods, movs] = await Promise.all([
      storeService.getProducts(),
      storeService.getInventoryMovements(),
    ]);
    setProducts(prods);
    setMovements(movs);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openAdjustModal = (product: Product, variant: ProductVariant) => {
    setSelectedProduct(product);
    setSelectedVariant(variant);
    setAdjustmentQty(variant.stock_quantity);
    setReason('New shipment restock');
    setSuccessMsg(null);
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !selectedVariant) return;

    await storeService.updateVariantStock(
      selectedProduct.id,
      selectedVariant.id,
      adjustmentQty,
      reason,
      'admin'
    );

    setSuccessMsg(`Stock updated for ${selectedVariant.sku} to ${adjustmentQty} units.`);
    setTimeout(() => {
      setSelectedProduct(null);
      setSelectedVariant(null);
      setSuccessMsg(null);
    }, 1200);

    await fetchAll();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-chocolate">Inventory & Movement Logs</h1>
        <p className="text-xs text-chocolate/70 mt-1">
          Monitor package stocks, adjust inventory quantities, and inspect chronological movement audits.
        </p>
      </div>

      {/* Stock Levels by Variant */}
      <div className="bg-white rounded-2xl border border-amber/20 shadow-xs p-6 space-y-4">
        <h2 className="font-serif font-bold text-base text-chocolate flex items-center gap-2 pb-3 border-b border-amber/15">
          <Boxes className="w-4 h-4 text-amber" />
          <span>Active Stock Levels by Package Variation</span>
        </h2>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-amber border-t-transparent mx-auto" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 border-b border-amber/15 text-chocolate/70">
                <tr>
                  <th className="py-2.5 px-3 font-bold">Product</th>
                  <th className="py-2.5 px-3 font-bold">Variant SKU</th>
                  <th className="py-2.5 px-3 font-bold">Weight / Size</th>
                  <th className="py-2.5 px-3 font-bold">Unit Price</th>
                  <th className="py-2.5 px-3 font-bold">Available Stock</th>
                  <th className="py-2.5 px-3 font-bold">Status</th>
                  <th className="py-2.5 px-3 font-bold text-right">Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber/10">
                {products.flatMap((prod) =>
                  (prod.variants || []).map((variant) => (
                    <tr key={variant.id} className="hover:bg-cream/20 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-chocolate">
                        <div className="flex items-center gap-2">
                          <img
                            src={variant.image_url || prod.image_url}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover border border-amber/15"
                          />
                          <span>{prod.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-chocolate/70">{variant.sku}</td>
                      <td className="py-2.5 px-3 font-bold text-chocolate">
                        {variant.attributes?.weight || 'Standard'}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-amber-dark">৳{variant.sales_price}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-sm">
                        {variant.stock_quantity}
                      </td>
                      <td className="py-2.5 px-3">
                        {variant.stock_quantity <= 0 ? (
                          <span className="inline-block px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[10px]">
                            Out of Stock
                          </span>
                        ) : variant.stock_quantity <= (variant.low_stock_threshold || 5) ? (
                          <span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                            Low Stock Alert
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            Healthy Stock
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => openAdjustModal(prod, variant)}
                          className="px-2.5 py-1 bg-cream hover:bg-cream-300 text-chocolate rounded-lg font-bold text-[11px] border border-amber/20 transition-colors"
                        >
                          Adjust Qty
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Chronological Inventory Movement Log */}
      <div className="bg-white rounded-2xl border border-amber/20 shadow-xs p-6 space-y-4">
        <h2 className="font-serif font-bold text-base text-chocolate flex items-center gap-2 pb-3 border-b border-amber/15">
          <History className="w-4 h-4 text-amber" />
          <span>Audit Log of Inventory Movements</span>
        </h2>

        {movements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 border-b border-amber/15 text-chocolate/70">
                <tr>
                  <th className="py-2.5 px-3 font-bold">Timestamp</th>
                  <th className="py-2.5 px-3 font-bold">Item & SKU</th>
                  <th className="py-2.5 px-3 font-bold">Quantity Change</th>
                  <th className="py-2.5 px-3 font-bold">Action Type</th>
                  <th className="py-2.5 px-3 font-bold">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber/10">
                {movements.slice(0, 15).map((mov) => (
                  <tr key={mov.id} className="hover:bg-cream/20 transition-colors">
                    <td className="py-2.5 px-3 text-chocolate/60">
                      {new Date(mov.created_at).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <strong className="block text-chocolate font-semibold">{mov.product_name || 'Product Item'}</strong>
                      <span className="font-mono text-[10px] text-chocolate/60">{mov.sku}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-sm">
                      <span className={mov.quantity_change > 0 ? 'text-emerald-700' : 'text-red-600'}>
                        {mov.quantity_change > 0 ? `+${mov.quantity_change}` : mov.quantity_change}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded uppercase font-bold text-[10px] bg-cream text-chocolate">
                        {mov.movement_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-chocolate/80">{mov.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-chocolate/60 py-6 text-center">No inventory movements recorded yet.</p>
        )}
      </div>

      {/* Adjust Modal */}
      {selectedProduct && selectedVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chocolate-deep/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full border border-amber/30 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amber/15">
              <h3 className="font-serif text-lg font-bold text-chocolate">Adjust Stock Quantity</h3>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setSelectedVariant(null);
                }}
                className="p-1 text-chocolate/60 hover:text-chocolate rounded-full hover:bg-cream"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveAdjustment} className="space-y-4 text-xs">
              <div className="p-3 bg-cream/40 rounded-xl space-y-1">
                <p className="font-bold text-chocolate">{selectedProduct.name}</p>
                <p className="font-mono text-chocolate/70">
                  SKU: {selectedVariant.sku} ({selectedVariant.attributes?.weight || 'Default'})
                </p>
                <p className="text-chocolate/80">
                  Current Stock: <strong className="text-sm">{selectedVariant.stock_quantity} units</strong>
                </p>
              </div>

              <div>
                <label className="block font-bold text-chocolate mb-1">New Total Stock Quantity</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={adjustmentQty}
                  onChange={(e) => setAdjustmentQty(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl font-mono text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-chocolate mb-1">Reason for Adjustment</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl font-medium"
                >
                  <option value="New shipment restock">New shipment restock</option>
                  <option value="Physical count correction">Physical count correction</option>
                  <option value="Damaged / expired goods removed">Damaged / expired goods removed</option>
                  <option value="Customer return processed">Customer return processed</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-amber/15">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProduct(null);
                    setSelectedVariant(null);
                  }}
                  className="px-4 py-2 bg-gray-200 rounded-xl font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-chocolate text-honey font-bold rounded-xl shadow-xs"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
