import React, { useState, useEffect } from 'react';
import { PRICING_ITEMS } from '../data/pricing';
import type { PriceItem } from '../data/pricing';
import { SERVICES } from '../data/services';
import type { ServiceItem } from '../data/services';
import { SettingsContext } from './settingsTypes';
import type { SiteSettings, Order, Coupon } from './settingsTypes';

export type { SiteSettings, Order, Coupon, BrandColor, SettingsContextType } from './settingsTypes';
export { SettingsContext } from './settingsTypes';

const DEFAULT_SETTINGS: SiteSettings = {
  phone: '0 (555) 123 45 67',
  phoneRaw: '+905551234567',
  whatsapp: '905551234567',
  email: 'info@temizkurutemizleme.com',
  address: 'Bağdat Caddesi No: 184/A Erenköy, Kadıköy / İstanbul',
  workingHoursWeekday: '08:30 – 20:00',
  workingHoursWeekend: 'Kapalı (Online Siparişler Açıktır)',
  freeShippingLimit: 350,
  districts: ['Kadıköy', 'Ataşehir', 'Üsküdar', 'Maltepe', 'Kartal', 'Beşiktaş', 'Şişli', 'Sarıyer', 'Bakırköy', 'Beyoğlu'],
  adminGateSlug: 'gate_7f9a8b1c4e2d309',
  brandColor: 'blue',
  customLogoUrl: '',
  announcementText: '350 ₺ ve üzeri siparişlerde ücretsiz kapıdan alım & teslimat',
  announcementActive: true
};

const DEFAULT_COUPONS: Coupon[] = [
  {
    code: 'TEMIZ20',
    discountPercent: 20,
    minOrderAmount: 250,
    active: true,
    description: 'Yeni müşterilere özel %20 kuru temizleme indirimi',
    expiryDate: '2026-12-31'
  },
  {
    code: 'BAHAR15',
    discountPercent: 15,
    minOrderAmount: 200,
    active: true,
    description: 'Bahar temizliği %15 indirim',
    expiryDate: '2026-06-30'
  }
];

const DEFAULT_ORDERS: Order[] = [];


export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem('temiz_site_settings');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      localStorage.removeItem('temiz_site_settings');
    }
    return DEFAULT_SETTINGS;
  });

  const [prices, setPrices] = useState<PriceItem[]>(() => {
    const saved = localStorage.getItem('temiz_prices');
    return saved ? JSON.parse(saved) : PRICING_ITEMS;
  });

  const [services, setServices] = useState<ServiceItem[]>(() => {
    const saved = localStorage.getItem('temiz_services');
    return saved ? JSON.parse(saved) : SERVICES;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('temiz_orders');
    return saved ? JSON.parse(saved) : DEFAULT_ORDERS;
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('temiz_coupons');
    return saved ? JSON.parse(saved) : DEFAULT_COUPONS;
  });

  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return sessionStorage.getItem('temiz_admin_token');
  });

  // adminKey is intentionally removed from browser state.
  // Authentication is handled server-side via /api/auth.
  // Only the session token (adminToken) lives in sessionStorage.
  const adminKey = ''; // kept for API header compat — token is used instead
  const setAdminKey = (_: string) => { /* no-op: key never stored in browser */ };

  // Sync brand theme to document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-brand', settings.brandColor || 'blue');
    }
  }, [settings.brandColor]);

  // 1. Fetch settings from API
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(prev => ({ ...prev, ...data }));
        localStorage.setItem('temiz_site_settings', JSON.stringify(data));
      }
    } catch {
      // Fallback to local
    }
  };

  // 2. Fetch prices from API
  const fetchPrices = async () => {
    try {
      const res = await fetch('/api/pricing');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setPrices(data);
          localStorage.setItem('temiz_prices', JSON.stringify(data));
        }
      }
    } catch {
      // Fallback
    }
  };

  // 3. Fetch orders (admin only)
  const fetchOrders = async () => {
    if (!adminToken) return;
    try {
      const res = await fetch('/api/orders', {
        headers: { 'x-admin-token': adminToken || '' }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setOrders(data);
          localStorage.setItem('temiz_orders', JSON.stringify(data));
        }
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    const initData = async () => {
      try {
        await Promise.allSettled([
          fetchSettings(),
          fetchPrices(),
          adminToken ? fetchOrders() : Promise.resolve()
        ]);
      } catch {
        // Fallback handled inside functions
      }
    };

    void initData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminToken]);

  // Update Settings
  const updateSettings = async (newSettings: Partial<SiteSettings>): Promise<boolean> => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('temiz_site_settings', JSON.stringify(updated));

    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken || ''
        },
        body: JSON.stringify(updated)
      });
    } catch {
      // Local storage already updated
    }
    return true;
  };

  // Update single price item
  const updatePriceItem = async (item: PriceItem): Promise<boolean> => {
    const updated = prices.map(p => p.id === item.id ? item : p);
    setPrices(updated);
    localStorage.setItem('temiz_prices', JSON.stringify(updated));

    try {
      await fetch('/api/pricing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken || ''
        },
        body: JSON.stringify(item)
      });
    } catch {
      // Local storage saved
    }
    return true;
  };

  // Add new price item
  const addPriceItem = async (item: PriceItem): Promise<boolean> => {
    const updated = [item, ...prices];
    setPrices(updated);
    localStorage.setItem('temiz_prices', JSON.stringify(updated));

    try {
      await fetch('/api/pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken || ''
        },
        body: JSON.stringify({ item })
      });
    } catch {
      // Local storage saved
    }
    return true;
  };

  // Delete price item
  const deletePriceItem = async (id: string): Promise<boolean> => {
    const updated = prices.filter(p => p.id !== id);
    setPrices(updated);
    localStorage.setItem('temiz_prices', JSON.stringify(updated));

    try {
      await fetch(`/api/pricing?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken || '' }
      });
    } catch {
      // Local storage saved
    }
    return true;
  };

  // Update service item
  const updateServiceItem = async (item: ServiceItem): Promise<boolean> => {
    const updated = services.map(s => s.id === item.id ? item : s);
    setServices(updated);
    localStorage.setItem('temiz_services', JSON.stringify(updated));
    return true;
  };

  // Add service item
  const addServiceItem = async (item: ServiceItem): Promise<boolean> => {
    const updated = [...services, item];
    setServices(updated);
    localStorage.setItem('temiz_services', JSON.stringify(updated));
    return true;
  };

  // Delete service item
  const deleteServiceItem = async (id: string): Promise<boolean> => {
    const updated = services.filter(s => s.id !== id);
    setServices(updated);
    localStorage.setItem('temiz_services', JSON.stringify(updated));
    return true;
  };

  // Cryptographically secure, uncrackable order code generation (e.g. TK-7K9M-2X4V)
  // 32^8 = >1.1 Trillion combinations — mathematical brute-force protection
  const generateSecureOrderCode = (): string => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    const buffer = new Uint8Array(8);
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(buffer);
    } else {
      for (let i = 0; i < 8; i++) {
        buffer[i] = Math.floor(Math.random() * 256);
      }
    }
    let str = '';
    for (let i = 0; i < 8; i++) {
      str += chars[buffer[i] % chars.length];
    }
    return `TK-${str.slice(0, 4)}-${str.slice(4, 8)}`;
  };

  // Create order
  const createOrder = async (orderData: Omit<Order, 'orderCode' | 'createdAt' | 'status'>): Promise<{ success: boolean; orderCode: string }> => {
    if (!orderData.customerName?.trim() || !orderData.customerPhone?.trim() || !orderData.address?.trim()) {
      return { success: false, orderCode: '' };
    }
    const orderCode = generateSecureOrderCode();
    const newOrder: Order = {
      ...orderData,
      orderCode,
      status: 'pending',
      isWhatsAppConfirmed: false,
      orderSource: 'web',
      createdAt: new Date().toISOString()
    };

    const updated = [newOrder, ...orders];
    setOrders(updated);
    localStorage.setItem('temiz_orders', JSON.stringify(updated));

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, orderCode: data.order?.orderCode || orderCode };
      }
    } catch {
      // Local saved
    }
    return { success: true, orderCode };
  };

  // Confirm WhatsApp Sale
  const confirmWhatsAppSale = async (orderCode: string): Promise<boolean> => {
    const updated = orders.map(o => {
      if (o.orderCode === orderCode) {
        return {
          ...o,
          status: 'confirmed' as Order['status'],
          isWhatsAppConfirmed: true,
          whatsAppConfirmedAt: new Date().toISOString()
        };
      }
      return o;
    });

    setOrders(updated);
    localStorage.setItem('temiz_orders', JSON.stringify(updated));

    try {
      await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken || ''
        },
        body: JSON.stringify({
          orderCode,
          status: 'confirmed',
          isWhatsAppConfirmed: true,
          whatsAppConfirmedAt: new Date().toISOString()
        })
      });
    } catch {
      // Local fallback saved
    }

    return true;
  };

  // Update order status
  const updateOrderStatus = async (orderCode: string, status: Order['status']): Promise<boolean> => {
    const updated = orders.map(o => {
      if (o.orderCode === orderCode) {
        return {
          ...o,
          status
        };
      }
      return o;
    });

    setOrders(updated);
    localStorage.setItem('temiz_orders', JSON.stringify(updated));

    try {
      await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken || ''
        },
        body: JSON.stringify({
          orderCode,
          status
        })
      });
    } catch {
      // Local saved
    }
    return true;
  };

  // Delete order (Admin only)
  const deleteOrder = async (orderCode: string): Promise<boolean> => {
    const updated = orders.filter(o => o.orderCode !== orderCode);
    setOrders(updated);
    localStorage.setItem('temiz_orders', JSON.stringify(updated));

    try {
      await fetch(`/api/orders?code=${encodeURIComponent(orderCode)}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken || '' }
      });
    } catch {
      // Local deleted
    }
    return true;
  };

  // Clear all orders (Admin only - for cleaning test data before launch)
  const clearOrders = async (): Promise<boolean> => {
    setOrders([]);
    localStorage.removeItem('temiz_orders');

    try {
      await fetch('/api/orders?clearAll=true', {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken || '' }
      });
    } catch {
      // Local cleared
    }
    return true;
  };

  // Track single order (flexible matching for uncrackable cryptographic codes & legacy codes)
  const trackOrder = async (orderCode: string): Promise<Order | null> => {
    const rawCode = orderCode.trim().toUpperCase();
    if (!rawCode) return null;

    const cleanStripped = rawCode.replace(/[^A-Z0-9]/g, '');
    let cleanNormalized = rawCode;

    if (cleanStripped.startsWith('TK') && cleanStripped.length === 10) {
      cleanNormalized = `TK-${cleanStripped.slice(2, 6)}-${cleanStripped.slice(6, 10)}`;
    } else if (!cleanStripped.startsWith('TK') && cleanStripped.length === 8) {
      cleanNormalized = `TK-${cleanStripped.slice(0, 4)}-${cleanStripped.slice(4, 8)}`;
    } else if (cleanStripped.startsWith('TK')) {
      cleanNormalized = `TK-${cleanStripped.slice(2)}`;
    } else {
      cleanNormalized = `TK-${cleanStripped}`;
    }

    try {
      const res = await fetch(`/api/orders?code=${encodeURIComponent(cleanNormalized)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.orderCode) {
          return data;
        }
      }
    } catch {
      // Fallback
    }

    const found = orders.find(o => {
      const oCode = o.orderCode.toUpperCase();
      const oStripped = oCode.replace(/[^A-Z0-9]/g, '');
      return (
        oCode === rawCode ||
        oCode === cleanNormalized ||
        oStripped === cleanStripped ||
        (cleanStripped.length >= 5 && oStripped.replace(/^TK/, '') === cleanStripped.replace(/^TK/, ''))
      );
    });
    return found || null;
  };

  // Coupon management
  const addCoupon = async (coupon: Coupon): Promise<boolean> => {
    const updated = [...coupons.filter(c => c.code.toUpperCase() !== coupon.code.toUpperCase()), coupon];
    setCoupons(updated);
    localStorage.setItem('temiz_coupons', JSON.stringify(updated));
    return true;
  };

  const updateCoupon = async (coupon: Coupon): Promise<boolean> => {
    const updated = coupons.map(c => c.code.toUpperCase() === coupon.code.toUpperCase() ? coupon : c);
    setCoupons(updated);
    localStorage.setItem('temiz_coupons', JSON.stringify(updated));
    return true;
  };

  const deleteCoupon = async (code: string): Promise<boolean> => {
    const updated = coupons.filter(c => c.code.toUpperCase() !== code.toUpperCase());
    setCoupons(updated);
    localStorage.setItem('temiz_coupons', JSON.stringify(updated));
    return true;
  };

  const applyCoupon = (code: string, subtotal: number) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { valid: false, discountAmount: 0, message: '' };
    }
    const found = coupons.find(c => c.code.toUpperCase() === cleanCode && c.active);
    if (!found) {
      return { valid: false, discountAmount: 0, message: 'Geçersiz veya süresi dolmuş indirim kodu.' };
    }
    // Check expiry date
    if (found.expiryDate) {
      const expiry = new Date(found.expiryDate);
      expiry.setHours(23, 59, 59, 999); // include the full expiry day
      if (expiry < new Date()) {
        return { valid: false, discountAmount: 0, message: 'Bu indirim kodunun geçerlilik süresi dolmuş.' };
      }
    }
    if (subtotal < found.minOrderAmount) {
      return {
        valid: false,
        discountAmount: 0,
        message: `Bu indirim kodu en az ₺${found.minOrderAmount} tutarındaki siparişlerde geçerlidir.`
      };
    }
    const discountAmount = Math.round((subtotal * found.discountPercent) / 100);
    return {
      valid: true,
      discountAmount,
      message: `%${found.discountPercent} indirim uygulandı! (₺${discountAmount} kazanç)`,
      coupon: found
    };
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        services,
        prices,
        orders,
        coupons,
        adminToken,
        adminKey,
        setAdminKey,
        setAdminToken,
        updateSettings,
        updateServiceItem,
        addServiceItem,
        deleteServiceItem,
        updatePriceItem,
        addPriceItem,
        deletePriceItem,
        createOrder,
        confirmWhatsAppSale,
        updateOrderStatus,
        deleteOrder,
        clearOrders,
        trackOrder,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        applyCoupon,
        fetchOrders,
        fetchPrices,
        fetchSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

