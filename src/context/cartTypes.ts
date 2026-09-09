import type { PriceItem } from '../data/pricing';

export interface SelectedCartItem {
  item: PriceItem;
  quantity: number;
  serviceType: 'full' | 'iron';
}

export interface CartContextType {
  cart: Record<string, SelectedCartItem>;
  addToCart: (item: PriceItem, serviceType?: 'full' | 'iron') => void;
  updateQuantity: (key: string, delta: number) => void;
  clearCart: () => void;
  totalCount: number;
  subtotalAmount: number;
  lastUpdated: number;
}
