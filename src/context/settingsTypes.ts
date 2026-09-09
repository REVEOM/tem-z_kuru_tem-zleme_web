import { createContext } from 'react';
import type { PriceItem } from '../data/pricing';
import type { ServiceItem } from '../data/services';

export type BrandColor = 'blue' | 'emerald' | 'cyan' | 'indigo' | 'violet' | 'amber';

export interface Coupon {
  code: string;
  discountPercent: number; // e.g. 15 for 15%
  minOrderAmount: number; // e.g. 200
  active: boolean;
  description?: string;
  expiryDate?: string;
}

export interface SiteSettings {
  phone: string;
  phoneRaw: string;
  whatsapp: string;
  email: string;
  address: string;
  workingHoursWeekday: string;
  workingHoursWeekend: string;
  freeShippingLimit: number;
  districts: string[];
  adminGateSlug: string;
  brandColor?: BrandColor;
  customLogoUrl?: string;
  announcementText?: string;
  announcementActive?: boolean;
}

export interface Order {
  orderCode: string;
  customerName: string;
  customerPhone: string;
  district: string;
  address: string;
  services: string[];
  pickupDate: string;
  timeSlot: string;
  notes?: string;
  itemsSummary?: string;
  totalAmount: number;
  discountAmount?: number;
  couponCode?: string;
  status: 'pending' | 'confirmed' | 'in_process' | 'ironing' | 'delivering' | 'completed' | 'cancelled';
  createdAt: string;
  isWhatsAppConfirmed?: boolean;
  whatsAppConfirmedAt?: string;
  orderSource?: 'whatsapp' | 'web';
}

export interface SettingsContextType {
  settings: SiteSettings;
  services: ServiceItem[];
  prices: PriceItem[];
  orders: Order[];
  coupons: Coupon[];
  adminToken: string | null;
  adminKey: string;
  setAdminKey: (key: string) => void;
  setAdminToken: (token: string | null) => void;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<boolean>;
  updateServiceItem: (item: ServiceItem) => Promise<boolean>;
  addServiceItem: (item: ServiceItem) => Promise<boolean>;
  deleteServiceItem: (id: string) => Promise<boolean>;
  updatePriceItem: (item: PriceItem) => Promise<boolean>;
  addPriceItem: (item: PriceItem) => Promise<boolean>;
  deletePriceItem: (id: string) => Promise<boolean>;
  createOrder: (order: Omit<Order, 'orderCode' | 'createdAt' | 'status'>) => Promise<{ success: boolean; orderCode: string }>;
  confirmWhatsAppSale: (orderCode: string) => Promise<boolean>;
  updateOrderStatus: (orderCode: string, status: Order['status']) => Promise<boolean>;
  deleteOrder: (orderCode: string) => Promise<boolean>;
  clearOrders: () => Promise<boolean>;
  trackOrder: (orderCode: string) => Promise<Order | null>;
  addCoupon: (coupon: Coupon) => Promise<boolean>;
  updateCoupon: (coupon: Coupon) => Promise<boolean>;
  deleteCoupon: (code: string) => Promise<boolean>;
  applyCoupon: (code: string, subtotal: number) => { valid: boolean; discountAmount: number; message: string; coupon?: Coupon };
  fetchOrders: () => Promise<void>;
  fetchPrices: () => Promise<void>;
  fetchSettings: () => Promise<void>;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);
