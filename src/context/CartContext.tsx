import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductVariant } from '../types';

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  itemCount: number;
  subtotal: number;
  addToCart: (product: Product, variant?: ProductVariant, quantity?: number) => { success: boolean; message?: string };
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'minora_cart_items';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to persist cart', e);
    }
  }, [items]);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.line_total, 0);

  const addToCart = (
    product: Product,
    variant?: ProductVariant,
    quantity: number = 1
  ): { success: boolean; message?: string } => {
    const selectedVariant = variant || (product.variants && product.variants.length > 0 ? product.variants[0] : undefined);
    const availableStock = selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity;
    const unitPrice = selectedVariant ? selectedVariant.sales_price : product.sales_price;
    const cartItemId = `${product.id}_${selectedVariant ? selectedVariant.id : 'standard'}`;

    const existingIndex = items.findIndex((i) => i.id === cartItemId);
    const currentQtyInCart = existingIndex >= 0 ? items[existingIndex].quantity : 0;
    const totalDesiredQty = currentQtyInCart + quantity;

    if (totalDesiredQty > availableStock) {
      return {
        success: false,
        message: `Only ${availableStock} units available in stock. You already have ${currentQtyInCart} in your cart.`,
      };
    }

    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].quantity = totalDesiredQty;
      updated[existingIndex].line_total = totalDesiredQty * unitPrice;
      setItems(updated);
    } else {
      const newItem: CartItem = {
        id: cartItemId,
        product_id: product.id,
        variant_id: selectedVariant?.id,
        product,
        variant: selectedVariant,
        quantity,
        unit_price: unitPrice,
        line_total: quantity * unitPrice,
      };
      setItems([...items, newItem]);
    }

    setIsCartOpen(true);
    return { success: true };
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const availableStock = item.variant ? item.variant.stock_quantity : item.product.stock_quantity;
          const cappedQty = Math.min(quantity, availableStock);
          return {
            ...item,
            quantity: cappedQty,
            line_total: cappedQty * item.unit_price,
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  return (
    <CartContext.Provider
      value={{
        items,
        isCartOpen,
        itemCount,
        subtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
