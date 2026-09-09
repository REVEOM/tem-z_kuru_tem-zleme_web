import React, { createContext, useState, useEffect, useMemo } from 'react';
import type { PriceItem } from '../data/pricing';
import type { SelectedCartItem, CartContextType } from './cartTypes';
import { playBubblePop } from '../utils/audioEffects';

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Record<string, SelectedCartItem>>(() => {
    try {
      const saved = localStorage.getItem('temiz_cart');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return {};
  });

  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('temiz_cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  const addToCart = (item: PriceItem, serviceType: 'full' | 'iron' = 'full') => {
    playBubblePop(1.1);
    const key = `${item.id}_${serviceType}`;
    setCart((prev) => {
      const existing = prev[key];
      return {
        ...prev,
        [key]: {
          item,
          quantity: existing ? existing.quantity + 1 : 1,
          serviceType
        }
      };
    });
    setLastUpdated(Date.now());
  };

  const updateQuantity = (key: string, delta: number) => {
    playBubblePop(0.95);
    setCart((prev) => {
      const existing = prev[key];
      if (!existing) return prev;
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return {
        ...prev,
        [key]: { ...existing, quantity: newQty }
      };
    });
    setLastUpdated(Date.now());
  };

  const clearCart = () => {
    setCart({});
    setLastUpdated(Date.now());
    try {
      localStorage.removeItem('temiz_cart');
    } catch {
      // ignore
    }
  };

  const totalCount = useMemo(() => {
    return Object.values(cart).reduce((acc, curr) => acc + curr.quantity, 0);
  }, [cart]);

  const subtotalAmount = useMemo(() => {
    return Object.values(cart).reduce((acc, curr) => {
      const unitPrice = curr.serviceType === 'iron' && curr.item.ironOnlyPrice 
        ? curr.item.ironOnlyPrice 
        : curr.item.dryCleanPrice;
      return acc + (unitPrice * curr.quantity);
    }, 0);
  }, [cart]);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      updateQuantity,
      clearCart,
      totalCount,
      subtotalAmount,
      lastUpdated
    }}>
      {children}
    </CartContext.Provider>
  );
};
