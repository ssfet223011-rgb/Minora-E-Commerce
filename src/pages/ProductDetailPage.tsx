import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, ShieldCheck, Truck, RefreshCw, CheckCircle, AlertCircle, Plus, Minus, ArrowRight } from 'lucide-react';
import { storeService } from '../services/storeService';
import { Product, ProductVariant } from '../types';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { ProductCard } from '../components/store/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { formatPrice } = useSettings();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      if (!slug) return;
      setLoading(true);
      const prod = await storeService.getProductBySlug(slug);
      if (prod) {
        setProduct(prod);
        setSelectedImage(prod.image_url);
        if (prod.variants && prod.variants.length > 0) {
          setSelectedVariant(prod.variants[0]);
          if (prod.variants[0].image_url) {
            setSelectedImage(prod.variants[0].image_url);
          }
        } else {
          setSelectedVariant(null);
        }

        // Fetch related products from same category
        const all = await storeService.getProducts({ categoryId: prod.category_id });
        setRelatedProducts(all.filter((p) => p.id !== prod.id).slice(0, 4));
      }
      setLoading(false);
      setQuantity(1);
      setFeedback(null);
    };

    loadProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center max-w-md mx-auto px-4">
        <h2 className="text-2xl font-serif font-bold text-chocolate mb-2">Product Not Found</h2>
        <p className="text-sm text-chocolate/70 mb-6">The requested natural food item could not be found or has been archived.</p>
        <Link
          to="/shop"
          className="px-6 py-2.5 bg-chocolate text-honey font-bold text-sm rounded-full shadow-md hover:bg-chocolate-light transition-all"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  // Active prices and stock
  const currentSalesPrice = selectedVariant ? selectedVariant.sales_price : product.sales_price;
  const currentRegularPrice = selectedVariant ? selectedVariant.regular_price : product.regular_price;
  const currentStock = selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity;
  const currentSku = selectedVariant ? selectedVariant.sku : product.sku;
  const isOutOfStock = currentStock <= 0;

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    if (variant.image_url) {
      setSelectedImage(variant.image_url);
    }
    if (quantity > variant.stock_quantity) {
      setQuantity(Math.max(1, variant.stock_quantity));
    }
    setFeedback(null);
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const res = addToCart(product, selectedVariant || undefined, quantity);
    if (res.success) {
      setFeedback({ type: 'success', message: `Added ${quantity} item(s) to your cart!` });
    } else {
      setFeedback({ type: 'error', message: res.message || 'Could not add to cart.' });
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const res = addToCart(product, selectedVariant || undefined, quantity);
    if (res.success) {
      navigate('/checkout');
    } else {
      setFeedback({ type: 'error', message: res.message || 'Could not proceed.' });
    }
  };

  return (
    <div className="py-10 bg-ivory min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-chocolate/60 flex items-center gap-2 mb-6">
          <Link to="/" className="hover:text-amber">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-amber">Shop</Link>
          <span>/</span>
          {product.category_name && (
            <>
              <Link to={`/shop?category=${product.category_id}`} className="hover:text-amber">
                {product.category_name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-chocolate font-semibold truncate">{product.name}</span>
        </nav>

        {/* Product Main Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white rounded-3xl p-6 sm:p-10 border border-amber/20 shadow-warm">
          {/* Left Column: Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-cream-50 border border-amber/20 flex items-center justify-center p-4">
              <img
                src={selectedImage || product.image_url}
                alt={product.name}
                className="w-full h-full object-cover rounded-xl transition-all duration-300"
              />
              {product.is_best_seller && (
                <span className="absolute top-4 left-4 bg-honey-dark text-chocolate text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider shadow-xs">
                  Best Seller
                </span>
              )}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-chocolate-deep/60 backdrop-blur-xs flex items-center justify-center">
                  <span className="bg-red-600 text-white text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                    Currently Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail previews */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedImage(product.image_url)}
                className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                  selectedImage === product.image_url ? 'border-amber shadow-xs scale-102' : 'border-amber/20 opacity-70'
                }`}
              >
                <img src={product.image_url} alt="Main" className="w-full h-full object-cover" />
              </button>
              {product.variants?.map(
                (v) =>
                  v.image_url &&
                  v.image_url !== product.image_url && (
                    <button
                      key={v.id}
                      onClick={() => setSelectedImage(v.image_url!)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                        selectedImage === v.image_url ? 'border-amber shadow-xs scale-102' : 'border-amber/20 opacity-70'
                      }`}
                    >
                      <img src={v.image_url} alt={v.sku} className="w-full h-full object-cover" />
                    </button>
                  )
              )}
            </div>
          </div>

          {/* Right Column: Information, Variations & Actions */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs uppercase font-bold tracking-widest text-amber-dark">
                  {product.category_name || '100% Pure Natural'}
                </span>
                <span className="text-xs font-mono text-chocolate/50">SKU: {currentSku}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-chocolate mt-1">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex text-amber">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating || 5) ? 'fill-amber text-amber' : 'text-amber/40'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-chocolate">{product.rating.toFixed(1)}</span>
                <span className="text-xs text-chocolate/60">({product.reviews_count} verified reviews)</span>
              </div>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-3 p-3 bg-cream/50 rounded-xl border border-amber/15">
                <span className="text-2xl sm:text-3xl font-extrabold text-chocolate font-sans">
                  {formatPrice(currentSalesPrice)}
                </span>
                {currentRegularPrice > currentSalesPrice && (
                  <span className="text-base text-chocolate/40 line-through">
                    {formatPrice(currentRegularPrice)}
                  </span>
                )}
                {currentRegularPrice > currentSalesPrice && (
                  <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">
                    Save {formatPrice(currentRegularPrice - currentSalesPrice)}
                  </span>
                )}
              </div>

              {/* Short description */}
              <p className="mt-4 text-sm text-chocolate/80 leading-relaxed font-sans">
                {product.description}
              </p>

              {/* Variation Selectors (e.g. Weight: 100g, 250g, 500g, 1kg) */}
              {product.variants && product.variants.length > 0 && (
                <div className="mt-6 pt-5 border-t border-amber/15">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-chocolate uppercase tracking-wider">
                      Select Package / Weight:
                    </span>
                    <span className="text-xs text-amber-dark font-medium">
                      {selectedVariant?.attributes?.weight || 'Standard'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {product.variants.map((variant) => {
                      const isSelected = selectedVariant?.id === variant.id;
                      const isVarOut = variant.stock_quantity <= 0;
                      return (
                        <button
                          key={variant.id}
                          disabled={isVarOut}
                          onClick={() => handleVariantSelect(variant)}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            isSelected
                              ? 'border-amber bg-amber/10 shadow-xs ring-2 ring-amber/50 font-bold text-chocolate'
                              : 'border-amber/20 bg-cream-50 hover:bg-cream text-chocolate/80'
                          } ${isVarOut ? 'opacity-40 cursor-not-allowed line-through' : 'cursor-pointer'}`}
                        >
                          <span className="block text-xs font-bold">
                            {variant.attributes?.weight || variant.sku}
                          </span>
                          <span className="block text-[11px] font-semibold text-amber-dark mt-0.5">
                            {formatPrice(variant.sales_price)}
                          </span>
                          <span className="block text-[10px] text-chocolate/60 mt-0.5">
                            {isVarOut ? 'Out of stock' : `${variant.stock_quantity} available`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stock status indicator */}
              <div className="mt-4 flex items-center gap-2 text-xs">
                {isOutOfStock ? (
                  <span className="text-red-600 font-bold flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> Out of Stock
                  </span>
                ) : (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> In Stock ({currentStock} units ready for immediate dispatch)
                  </span>
                )}
              </div>

              {/* Quantity selector & Action buttons */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-chocolate">Quantity:</span>
                  <div className="flex items-center border border-amber/30 rounded-xl bg-white overflow-hidden shadow-2xs">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || isOutOfStock}
                      className="px-3 py-2 text-chocolate/70 hover:bg-cream hover:text-chocolate transition-colors disabled:opacity-40"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 text-sm font-bold text-chocolate min-w-[36px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                      disabled={quantity >= currentStock || isOutOfStock}
                      className="px-3 py-2 text-chocolate/70 hover:bg-cream hover:text-chocolate transition-colors disabled:opacity-40"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-chocolate/50">Max: {currentStock}</span>
                </div>

                {/* Feedback alert */}
                {feedback && (
                  <div
                    className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 animate-fadeIn ${
                      feedback.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {feedback.type === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    )}
                    <span>{feedback.message}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="py-3.5 bg-chocolate hover:bg-chocolate-light text-honey font-bold rounded-xl transition-all shadow-warm flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4 text-honey group-hover:scale-110 transition-transform" />
                    <span>Add to Cart</span>
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className="py-3.5 bg-amber hover:bg-amber-dark text-white font-bold rounded-xl transition-all shadow-warm flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span>Buy Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Value Guarantees list */}
            <div className="pt-6 border-t border-amber/15 grid grid-cols-3 gap-2 text-center text-[11px] text-chocolate/80">
              <div className="flex flex-col items-center gap-1 p-2 bg-cream/40 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-amber" />
                <span className="font-semibold">100% Authentic</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 bg-cream/40 rounded-xl">
                <Truck className="w-4 h-4 text-amber" />
                <span className="font-semibold">Fast Courier</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 bg-cream/40 rounded-xl">
                <RefreshCw className="w-4 h-4 text-amber" />
                <span className="font-semibold">48h Return Window</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h3 className="font-serif text-2xl font-bold text-chocolate mb-6 text-center">
              You May Also Love
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
