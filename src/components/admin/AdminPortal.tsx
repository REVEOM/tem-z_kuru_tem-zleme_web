import React, { useState, useMemo } from 'react';
import { 
  Lock, 
  Key, 
  Package, 
  DollarSign, 
  Settings as SettingsIcon, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Search, 
  Phone, 
  Clock, 
  MapPin, 
  LogOut, 
  CheckCircle2, 
  ShieldAlert,
  BarChart3,
  Users,
  Tag,
  Palette,
  Printer,
  Download,
  MessageCircle,
  Check,
  Sparkles
} from 'lucide-react';
import { useSettings } from '../../context/useSettings';
import type { Order, Coupon, BrandColor } from '../../context/SettingsContext';
import type { PriceItem } from '../../data/pricing';
import type { ServiceItem } from '../../data/services';
import { OrderReceiptModal } from './OrderReceiptModal';
import temizLogo from '../../assets/temiz-logo.svg';

const getStatusLabel = (status: Order['status']): string => {
  switch (status) {
    case 'pending': return '💬 WhatsApp Onayı Bekliyor';
    case 'confirmed': return '✅ Satış Onaylandı';
    case 'pickup_scheduled': return '📅 Alım Planlandı';
    case 'picked_up': return '🚗 Alındı / Yolda';
    case 'washing': return '🫧 Yıkamada';
    case 'ironing': return '🔥 Ütüde';
    case 'ready': return '✨ Teslimata Hazır';
    case 'delivering': return '🚚 Teslimatta';
    case 'completed': return '✅ Tamamlandı';
    case 'cancelled': return '❌ İptal';
    default: return status;
  }
};

const getStatusBadgeClass = (status: Order['status']): string => {
  switch (status) {
    case 'pending':
      return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 animate-pulse';
    case 'confirmed':
      return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    case 'pickup_scheduled':
      return 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800';
    case 'picked_up':
      return 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    case 'washing':
      return 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800';
    case 'ironing':
      return 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
    case 'ready':
      return 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800';
    case 'delivering':
      return 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800';
    case 'completed':
      return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    case 'cancelled':
      return 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800';
    default:
      return 'bg-zinc-100 text-zinc-700 border-zinc-200';
  }
};

interface AdminPortalProps {
  onClose: () => void;
}

type TabType = 'dashboard' | 'orders' | 'services' | 'pricing' | 'coupons' | 'customers' | 'appearance' | 'settings';

export const AdminPortal: React.FC<AdminPortalProps> = ({ onClose }) => {
  const {
    settings,
    services,
    prices,
    orders,
    coupons,
    adminToken,
    setAdminToken,
    updateSettings,
    updateServiceItem,
    addServiceItem,
    deleteServiceItem,
    updatePriceItem,
    addPriceItem,
    deletePriceItem,
    confirmWhatsAppSale,
    updateOrderStatus,
    deleteOrder,
    clearOrders,
    addCoupon,
    updateCoupon,
    deleteCoupon
  } = useSettings();

  // Authentication state
  const [inputKey, setInputKey] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Receipt Modal State
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  // Order Filters
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');

  // Price Editing Modal / Form
  const [editingPriceItem, setEditingPriceItem] = useState<PriceItem | null>(null);
  const [isAddingPrice, setIsAddingPrice] = useState(false);
  const [newPriceItem, setNewPriceItem] = useState<Partial<PriceItem>>({
    name: '',
    category: 'erkek',
    dryCleanPrice: 100,
    ironOnlyPrice: 50,
    unit: 'Adet',
    popular: false
  });

  // Services Adding / Editing
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [serviceForm, setServiceForm] = useState<Partial<ServiceItem>>({
    title: '',
    shortDesc: '',
    longDesc: '',
    icon: 'Sparkles',
    features: [],
    tag: ''
  });
  const [serviceFeaturesInput, setServiceFeaturesInput] = useState('');

  const handleOpenEditService = (srv: ServiceItem) => {
    setEditingService(srv);
    setServiceForm(srv);
    setServiceFeaturesInput(srv.features.join('\n'));
    setIsAddingService(false);
  };

  const handleOpenAddService = () => {
    setEditingService(null);
    setServiceForm({
      id: 'srv-' + Date.now(),
      title: '',
      shortDesc: '',
      longDesc: '',
      icon: 'Sparkles',
      features: [],
      tag: ''
    });
    setServiceFeaturesInput('Ekolojik lif koruyucu temizlik\nLeke ön inceleme\nÖzel askılı teslimat');
    setIsAddingService(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.title?.trim()) {
      alert('Lütfen hizmet başlığını giriniz.');
      return;
    }

    try {
      const feats = serviceFeaturesInput
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      const serviceData: ServiceItem = {
        id: editingService?.id || serviceForm.id || ('srv-' + Date.now()),
        title: serviceForm.title.trim(),
        shortDesc: serviceForm.shortDesc?.trim() || '',
        longDesc: serviceForm.longDesc?.trim() || '',
        icon: serviceForm.icon || 'Sparkles',
        features: feats,
        tag: serviceForm.tag?.trim() || undefined
      };

      if (editingService) {
        await updateServiceItem(serviceData);
      } else {
        await addServiceItem(serviceData);
      }

      setIsAddingService(false);
      setEditingService(null);
    } catch {
      alert('Hizmet kaydedilirken bir hata oluştu. Lütfen tekrar deneyiniz.');
    }
  };

  // Coupon Adding / Editing
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    code: '',
    discountPercent: 15,
    minOrderAmount: 200,
    active: true,
    description: '',
    expiryDate: '2026-12-31'
  });

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState(settings);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);
  const [newDistrictInput, setNewDistrictInput] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Secret direct access link
  const secretUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}#${settingsForm.adminGateSlug || 'gate_7f9a8b1c4e2d309'}`
    : `/#${settingsForm.adminGateSlug || 'gate_7f9a8b1c4e2d309'}`;

  const copySecretLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(secretUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    }
  };

  // Login handler — server-side auth only, key never touches browser storage
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const trimmedInput = inputKey.trim();
    if (!trimmedInput) {
      setAuthError('Lütfen güvenlik anahtarınızı girin.');
      return;
    }

    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: trimmedInput })
      });

      if (res.ok) {
        const data = await res.json() as { token: string };
        const token = data.token;
        sessionStorage.setItem('temiz_admin_token', token);
        setAdminToken(token);
        // Clear input for security
        setInputKey('');
      } else {
        const err = await res.json() as { error?: string };
        setAuthError(err.error || 'Geçersiz güvenlik anahtarı. Erişim reddedildi.');
      }
    } catch {
      setAuthError('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
    } finally {
      setAuthLoading(false);
    }
  };


  const handleLogout = () => {
    sessionStorage.removeItem('temiz_admin_token');
    setAdminToken(null);
    onClose();
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Admin key is now server-side only (ADMIN_SECRET_KEY env var on Vercel).
      // It can no longer be changed from the browser panel.
      await updateSettings(settingsForm);
      setSettingsSavedMessage(true);
      setTimeout(() => setSettingsSavedMessage(false), 3000);
    } catch {
      alert('Ayarlar kaydedilirken bir hata oluştu. Lütfen tekrar deneyiniz.');
    }
  };

  // Export Orders as CSV
  const exportOrdersToCSV = () => {
    if (!orders.length) {
      alert('Dışa aktarılacak sipariş kaydı bulunmuyor.');
      return;
    }
    const headers = ['Sipariş Kodu', 'Müşteri', 'Telefon', 'İlçe', 'Adres', 'Hizmetler', 'Randevu', 'Saat', 'Tutar (TL)', 'Durum', 'Oluşturulma Tarihi'];
    const rows = orders.map(o => [
      o.orderCode,
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      `"${o.customerPhone || ''}"`,
      `"${o.district || ''}"`,
      `"${(o.address || '').replace(/"/g, '""')}"`,
      `"${(o.itemsSummary || o.services?.join(', ') || '').replace(/"/g, '""')}"`,
      o.pickupDate || '',
      o.timeSlot || '',
      o.totalAmount || 0,
      getStatusLabel(o.status),
      new Date(o.createdAt).toLocaleDateString('tr-TR')
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `temiz_siparisler_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quick WhatsApp Status Link
  const sendWhatsAppStatus = (order: Order) => {
    const cleanPhone = order.customerPhone.replace(/\D/g, '');
    const targetPhone = cleanPhone.startsWith('90') ? cleanPhone : `90${cleanPhone.replace(/^0/, '')}`;
    const statusTr = getStatusLabel(order.status);
    const message = encodeURIComponent(
      `Merhaba Sayın ${order.customerName},\n\nTEMİZ Kuru Temizleme'den ${order.orderCode} numaralı siparişinizin durumu: *${statusTr}* olarak güncellenmiştir.\n\nRandevu Tarihi: ${order.pickupDate} (${order.timeSlot})\nToplam Tutar: ₺${order.totalAmount}\n\nHerhangi bir sorunuz olursa bu hattan bize dilediğiniz zaman ulaşabilirsiniz!`
    );
    window.open(`https://wa.me/${targetPhone}?text=${message}`, '_blank');
  };

  // Pending WhatsApp Orders (Awaiting Sale Approval)
  const pendingWhatsAppOrders = useMemo(() => {
    return orders.filter(o => !o.isWhatsAppConfirmed && o.status === 'pending');
  }, [orders]);

  // Filtered Orders (memoized for performance)
  const filteredOrders = useMemo(() => orders.filter((o) => {
    let matchesStatus = false;
    if (orderStatusFilter === 'all') {
      matchesStatus = true;
    } else if (orderStatusFilter === 'whatsapp_pending') {
      matchesStatus = !o.isWhatsAppConfirmed && o.status === 'pending';
    } else {
      matchesStatus = o.status === orderStatusFilter;
    }

    const query = orderSearchQuery.toLowerCase().trim();
    if (!query) return matchesStatus;
    const matchesSearch = 
      o.customerName.toLowerCase().includes(query) ||
      o.customerPhone.includes(query) ||
      o.orderCode.toLowerCase().includes(query) ||
      o.district.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  }), [orders, orderStatusFilter, orderSearchQuery]);

  // CRM: Grouped Customers
  const customersList = useMemo(() => {
    const map = new Map<string, {
      name: string;
      phone: string;
      district: string;
      totalOrders: number;
      totalSpent: number;
      lastOrderDate: string;
      lastOrderCode: string;
    }>();

    orders.forEach(o => {
      const key = o.customerPhone.replace(/\D/g, '') || o.customerName;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          name: o.customerName,
          phone: o.customerPhone,
          district: o.district,
          totalOrders: 1,
          totalSpent: o.totalAmount,
          lastOrderDate: o.createdAt,
          lastOrderCode: o.orderCode
        });
      } else {
        existing.totalOrders += 1;
        existing.totalSpent += o.totalAmount;
        if (new Date(o.createdAt) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = o.createdAt;
          existing.lastOrderCode = o.orderCode;
        }
      }
    });

    return Array.from(map.values());
  }, [orders]);

  // Analytics Metrics
  const totalRevenue = useMemo(() => {
    return orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  }, [orders]);

  const activeOrdersCount = useMemo(() => {
    return orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;
  }, [orders]);

  const completedOrdersCount = useMemo(() => {
    return orders.filter(o => o.status === 'completed').length;
  }, [orders]);

  const averageOrderValue = useMemo(() => {
    return orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;
  }, [orders, totalRevenue]);

  // Top Districts
  const districtCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach(o => {
      counts[o.district] = (counts[o.district] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [orders]);

  // Handle Logo Upload to Data URL
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setSettingsForm(prev => ({ ...prev, customLogoUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // If NOT authenticated, show the Obfuscated Security Gate
  if (!adminToken) {
    return (
      <div className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 animate-in zoom-in-95">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-[#1475bc] shadow-md shadow-[#1475bc]/30 flex items-center justify-center p-0.5">
              <img src={temizLogo} alt="TEMİZ" className="w-full h-full object-contain rounded-xl" />
            </div>
            <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest block">
              GÜVENLİ YÖNETİM GEÇİDİ
            </span>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
              Yönetici Doğrulaması
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
              Bu portala sadece yetkili gizli anahtara sahip yöneticiler erişebilir.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Gizli Yönetici Anahtarı (Secret Key)
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Gizli anahtarınızı girin..."
                  value={inputKey}
                  disabled={authLoading}
                  onChange={(e) => {
                    setInputKey(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  className="w-full pl-10 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 font-mono disabled:opacity-50"
                />
              </div>
              <p className="text-[10px] text-zinc-400 mt-1 font-mono">
                Anahtarınız sunucu tarafında güvenli şekilde doğrulanır. Tarayıcıda saklanmaz.
              </p>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 font-semibold text-xs tracking-wide transition-all shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {authLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white dark:border-zinc-900/30 dark:border-t-zinc-900 rounded-full animate-spin" />
                  Doğrulanıyor...
                </>
              ) : 'Doğrula ve Panele Gir'}
            </button>
          </form>
        </div>
      </div>
    );
  }


  // Authenticated Admin Dashboard Portal
  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-md flex flex-col justify-end sm:justify-center p-0 sm:p-4 overflow-hidden">
      <div className="bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-3xl w-full max-w-6xl h-full sm:h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5">
        
        {/* Top Bar */}
        <div className="p-3.5 sm:px-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-[#1475bc] shadow-sm shadow-[#1475bc]/25 flex items-center justify-center p-0.5">
              <img src={temizLogo} alt="TEMİZ" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-zinc-900 dark:text-white">TEMİZ Yönetim Paneli</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 text-[10px] font-semibold">
                  Oturum Açık
                </span>
              </div>
              <span className="text-[11px] text-zinc-500">Operasyon, Gelir & Veri Kontrol Merkezi</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Güvenli Çıkış</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (8 Tabs) */}
        <div className="px-4 sm:px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none py-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Siparişler ({orders.length})</span>
            {pendingWhatsAppOrders.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black animate-pulse" title="Onay bekleyen WhatsApp siparişleri">
                {pendingWhatsAppOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'services'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Hizmetlerimiz ({services.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'pricing'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Fiyat & Ürünler ({prices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'coupons'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Kupon & İndirim ({coupons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'customers'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Müşteriler ({customersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'appearance'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Logo & Tema</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Site Ayarları</span>
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-50/50 dark:bg-zinc-950/40">
          
          {/* TAB 1: DASHBOARD / ANALYTICS */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Metric Cards Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
                  <span className="text-[11px] text-zinc-500 font-medium">Toplam Gelir / Ciro</span>
                  <div className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white mt-1">
                    ₺{totalRevenue.toLocaleString('tr-TR')}
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
                    ↑ {orders.length} toplam sipariş
                  </span>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
                  <span className="text-[11px] text-zinc-500 font-medium">Aktif İşlemde</span>
                  <div className="text-xl sm:text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                    {activeOrdersCount}
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    İşlemde / Yıkama / Teslimat
                  </span>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
                  <span className="text-[11px] text-zinc-500 font-medium">Tamamlanan Teslimat</span>
                  <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                    {completedOrdersCount}
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    Teslim edilmiş giysiler
                  </span>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
                  <span className="text-[11px] text-zinc-500 font-medium">Ortalama Sepet</span>
                  <div className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white mt-1">
                    ₺{averageOrderValue}
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    Sipariş başına ciro
                  </span>
                </div>
              </div>

              {/* Status Breakdown & District Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left: Order Status Distribution */}
                <div className="lg:col-span-7 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-zinc-900 dark:text-white uppercase tracking-wider">
                      Sipariş Durum Dağılımı
                    </h4>
                    <span className="text-xs text-zinc-400">{orders.length} Sipariş</span>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { status: 'pending', label: 'Onay Bekliyor' },
                      { status: 'confirmed', label: 'Onaylandı' },
                      { status: 'pickup_scheduled', label: 'Alım Planlandı' },
                      { status: 'picked_up', label: 'Alındı' },
                      { status: 'washing', label: 'Yıkamada' },
                      { status: 'ironing', label: 'Ütüde' },
                      { status: 'ready', label: 'Hazır' },
                      { status: 'delivering', label: 'Teslimatta' },
                      { status: 'completed', label: 'Tamamlandı' },
                    ].map((item) => {
                      const count = orders.filter(o => o.status === item.status).length;
                      const percent = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
                      return (
                        <div key={item.status} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-zinc-600 dark:text-zinc-400">{item.label}</span>
                            <span className="text-zinc-900 dark:text-white font-bold">{count} adet (%{percent})</span>
                          </div>
                          <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-zinc-900 dark:bg-zinc-200 rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Top Service Districts & Quick Actions */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <h4 className="font-bold text-xs text-zinc-900 dark:text-white uppercase tracking-wider">
                      En Çok Sipariş Alan İlçeler
                    </h4>
                    {districtCounts.length === 0 ? (
                      <p className="text-xs text-zinc-400">Henüz bölge verisi bulunmuyor.</p>
                    ) : (
                      <div className="space-y-2">
                        {districtCounts.slice(0, 5).map(([dist, count]) => (
                          <div key={dist} className="flex items-center justify-between text-xs py-1 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                            <span className="font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                              {dist}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-900 dark:text-white text-[11px]">
                              {count} sipariş
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Action Shortcuts */}
                  <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                    <h4 className="font-bold text-xs text-zinc-900 dark:text-white uppercase tracking-wider">
                      Hızlı İşlemler
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => { setActiveTab('orders'); }}
                        className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-left text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors"
                      >
                        📦 Siparişleri Yönet
                      </button>
                      <button
                        onClick={exportOrdersToCSV}
                        className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-left text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-600" />
                        <span>CSV İndir</span>
                      </button>
                      <button
                        onClick={() => { setActiveTab('coupons'); setIsAddingCoupon(true); }}
                        className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-left text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors"
                      >
                        🏷️ Yeni Kupon Ekle
                      </button>
                      <button
                        onClick={() => { setActiveTab('appearance'); }}
                        className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-left text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors"
                      >
                        🎨 Logo & Renk Ayarı
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS & APPOINTMENTS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Order Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Müşteri, telefon veya kod ara..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
                  {[
                    { id: 'all', label: `Tümü (${orders.length})` },
                    { id: 'whatsapp_pending', label: `🔔 Onay Kutusu (${pendingWhatsAppOrders.length})` },
                    { id: 'confirmed', label: '✅ Onaylananlar' },
                    { id: 'pickup_scheduled', label: '📅 Alım Planlandı' },
                    { id: 'picked_up', label: '🚗 Alındı' },
                    { id: 'washing', label: '🫧 Yıkamada' },
                    { id: 'ironing', label: '🔥 Ütüde' },
                    { id: 'ready', label: '✨ Hazır' },
                    { id: 'delivering', label: '🚚 Teslimatta' },
                    { id: 'completed', label: '✅ Tamamlandı' },
                    { id: 'cancelled', label: '❌ İptal' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setOrderStatusFilter(filter.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                        orderStatusFilter === filter.id
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}

                  <button
                    onClick={exportOrdersToCSV}
                    className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 ml-1 cursor-pointer"
                    title="Siparişleri CSV / Excel formatında indir"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">CSV İndir</span>
                  </button>
                  
                  {orders.length > 0 && (
                    <button
                      onClick={() => {
                        if (window.confirm('Tüm test/sipariş verilerini kalıcı olarak silmek istediğinize emin misiniz?')) {
                          clearOrders();
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 hover:bg-rose-100 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 shrink-0 ml-auto cursor-pointer"
                      title="Test verilerini temizle"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Sıfırla</span>
                    </button>
                  )}
                </div>
              </div>

              {/* WHATSAPP ONAY KUTUSU (Gelen Talepler) */}
              {pendingWhatsAppOrders.length > 0 && (
                <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border-2 border-emerald-500/30 dark:border-emerald-500/20 rounded-2xl p-4 sm:p-5 space-y-3.5 animate-in slide-in-from-top-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                          <span>WhatsApp Satış Onay Kutusu</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black">
                            {pendingWhatsAppOrders.length} Yeni Talep
                          </span>
                        </h4>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          Müşteriler web sitesinden sipariş oluşturdu ve WhatsApp mesajı gönderdi. Satışı teyit edip onaylayabilir, ardından fişi ve takip kodunu yazdırabilirsiniz.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pendingWhatsAppOrders.map((pOrder) => (
                      <div 
                        key={pOrder.orderCode}
                        className="bg-white dark:bg-zinc-900 rounded-xl p-3.5 border border-emerald-500/30 dark:border-emerald-500/20 shadow-xs space-y-2 flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                              {pOrder.orderCode}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              {pOrder.pickupDate} ({pOrder.timeSlot})
                            </span>
                          </div>

                          <div className="text-xs font-bold text-zinc-900 dark:text-white">
                            {pOrder.customerName} • <span className="font-mono text-zinc-600 dark:text-zinc-400 font-normal">{pOrder.customerPhone}</span>
                          </div>

                          <div className="text-[11px] text-zinc-500 line-clamp-1">
                            {pOrder.district} — {pOrder.address}
                          </div>

                          {pOrder.itemsSummary && (
                            <div className="text-[11px] text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg border border-zinc-200/60 dark:border-zinc-800 line-clamp-2">
                              {pOrder.itemsSummary}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[11px] text-zinc-500">Hesaplanan Tutar:</span>
                            <span className="text-sm font-extrabold text-zinc-900 dark:text-white">
                              ₺{pOrder.totalAmount}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                          <a
                            href={(() => {
                              const digits = pOrder.customerPhone.replace(/\D/g, '');
                              const normalized = digits.startsWith('90') ? digits : `90${digits.replace(/^0/, '')}`;
                              return `https://wa.me/${normalized}?text=${encodeURIComponent(`Merhaba Sayın ${pOrder.customerName}, TEMİZ Kuru Temizleme'den ulaşıyoruz. ${pOrder.orderCode} numaralı sipariş randevu talebinizi aldık.`)}`;
                            })()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-1.5 px-2 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold text-center hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>WhatsApp'ta Görüş</span>
                          </a>

                          <button
                            type="button"
                            onClick={async () => {
                              await confirmWhatsAppSale(pOrder.orderCode);
                              setReceiptOrder({ ...pOrder, isWhatsAppConfirmed: true, status: 'confirmed' });
                            }}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1 active:scale-95"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Satışı Onayla & Yazdır</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders List */}
              {filteredOrders.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 text-xs">
                  Henüz bu kritere uygun sipariş bulunamadı.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.orderCode}
                      className="bg-white dark:bg-zinc-900 rounded-2xl p-4 sm:p-5 border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white">
                            {order.orderCode}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadgeClass(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            {new Date(order.createdAt).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>

                        <div className="text-xs font-semibold text-zinc-900 dark:text-white flex flex-wrap items-center gap-2">
                          <span>{order.customerName}</span>
                          <span className="text-zinc-400">•</span>
                          <a href={`tel:${order.customerPhone}`} className="text-blue-600 dark:text-blue-400 font-mono hover:underline flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {order.customerPhone}
                          </a>
                        </div>

                        <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                          <span>{order.district} — {order.address}</span>
                        </div>

                        {order.itemsSummary && (
                          <div className="text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
                            <span className="font-semibold text-zinc-900 dark:text-white">Sipariş İçeriği: </span>
                            {order.itemsSummary}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 pt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Randevu: {order.pickupDate} ({order.timeSlot})
                          </span>
                          <span className="font-bold text-zinc-900 dark:text-white">
                            ₺{order.totalAmount}
                          </span>
                          {order.couponCode && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">
                              Kupon: {order.couponCode} (-₺{order.discountAmount})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status, Print & WhatsApp Controls */}
                      <div className="flex flex-row md:flex-col items-end gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Quick Approve & Print button for pending orders */}
                          {!order.isWhatsAppConfirmed && order.status === 'pending' && (
                            <button
                              type="button"
                              onClick={async () => {
                                await confirmWhatsAppSale(order.orderCode);
                                setReceiptOrder({ ...order, isWhatsAppConfirmed: true, status: 'confirmed' });
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
                              title="WhatsApp satışını onayla ve doğrudan fişi yazdır"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Satışı Onayla & Yazdır</span>
                            </button>
                          )}

                          {/* Print Receipt Button */}
                          <button
                            type="button"
                            onClick={() => setReceiptOrder(order)}
                            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Müşteri Fişi & Takip Kodu Yazdır"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Fiş & Takip Kodu</span>
                          </button>

                          {/* WhatsApp Customer Button */}
                          <button
                            type="button"
                            onClick={() => sendWhatsAppStatus(order)}
                            className="p-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Müşteriye WhatsApp'tan durum bilgisi ve randevu detaylarını gönder"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </button>

                          {/* Status Dropdown */}
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.orderCode, e.target.value as Order['status'])}
                            className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white font-medium focus:outline-none cursor-pointer"
                          >
                            <option value="pending">💬 WhatsApp Onayı Bekliyor</option>
                            <option value="confirmed">✅ Satış Onaylandı</option>
                            <option value="pickup_scheduled">📅 Alım Planlandı</option>
                            <option value="picked_up">🚗 Alındı / Yolda</option>
                            <option value="washing">🫧 Yıkamada</option>
                            <option value="ironing">🔥 Ütüde</option>
                            <option value="ready">✨ Teslimata Hazır</option>
                            <option value="delivering">🚚 Teslimatta</option>
                            <option value="completed">✅ Tamamlandı</option>
                            <option value="cancelled">❌ İptal</option>
                          </select>

                          {/* Delete Order Button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`${order.orderCode} numaralı siparişi silmek istediğinize emin misiniz?`)) {
                                deleteOrder(order.orderCode);
                              }
                            }}
                            className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                            title="Siparişi Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: SERVICES MANAGEMENT */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Hizmetlerimiz Yönetimi</h3>
                  <p className="text-xs text-zinc-500">Web sitesinin Hizmetlerimiz bölümündeki kartları, açıklamaları ve özellikleri buradan düzenleyebilirsiniz.</p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddService}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Yeni Hizmet Ekle</span>
                </button>
              </div>

              {/* Service Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                            <Sparkles className="w-4 h-4" />
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{srv.title}</h4>
                            <span className="text-[10px] text-zinc-400">ID: {srv.id}</span>
                          </div>
                        </div>

                        {srv.tag && (
                          <span className="text-[9px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                            {srv.tag}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2.5 line-clamp-2">
                        {srv.shortDesc}
                      </p>

                      <ul className="mt-3 space-y-1 text-[11px] text-zinc-500 border-t border-zinc-100 dark:border-zinc-800 pt-2.5">
                        {srv.features.map((f, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span className="truncate">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditService(srv)}
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Düzenle</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`"${srv.title}" hizmetini silmek istediğinize emin misiniz?`)) {
                            deleteServiceItem(srv.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Hizmeti Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Service Add/Edit Modal */}
              {(isAddingService || editingService) && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-lg w-full space-y-4 animate-in zoom-in-95">
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                      <h4 className="font-bold text-base text-zinc-900 dark:text-white">
                        {editingService ? 'Hizmeti Düzenle' : 'Yeni Hizmet Ekle'}
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingService(false);
                          setEditingService(null);
                        }}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveService} className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          Hizmet Başlığı *
                        </label>
                        <input
                          type="text"
                          required
                          value={serviceForm.title || ''}
                          onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                          placeholder="Örn: Yorgan & Battaniye Temizliği"
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                            Etiket / Rozet (Opsiyonel)
                          </label>
                          <input
                            type="text"
                            value={serviceForm.tag || ''}
                            onChange={(e) => setServiceForm({ ...serviceForm, tag: e.target.value })}
                            placeholder="Örn: En Popüler"
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                            İkon
                          </label>
                          <select
                            value={serviceForm.icon || 'Sparkles'}
                            onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                          >
                            <option value="Sparkles">Sparkles (Işıltı)</option>
                            <option value="Shirt">Shirt (Gömlek)</option>
                            <option value="BedDouble">BedDouble (Ev Tekstili)</option>
                            <option value="Scissors">Scissors (Makas/Terzi)</option>
                            <option value="Footprints">Footprints (Lostra/Ayakkabı)</option>
                            <option value="Crown">Crown (Özel Bakım)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          Kısa Açıklama *
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={serviceForm.shortDesc || ''}
                          onChange={(e) => setServiceForm({ ...serviceForm, shortDesc: e.target.value })}
                          placeholder="Kartta görünecek kısa açıklama..."
                          className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          Öne Çıkan Özellikler (Her satıra bir özellik)
                        </label>
                        <textarea
                          rows={3}
                          value={serviceFeaturesInput}
                          onChange={(e) => setServiceFeaturesInput(e.target.value)}
                          placeholder="Ekolojik lif koruyucu temizlik&#10;Askılı teslimat&#10;Leke garantisi"
                          className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                        />
                      </div>

                      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingService(false);
                            setEditingService(null);
                          }}
                          className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          İptal
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs cursor-pointer"
                        >
                          Kaydet
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PRICING & PRODUCTS */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Fiyatlandırma Listesi</h3>
                  <p className="text-xs text-zinc-500">Değişiklikler anında web sitesine ve fiyat hesaplayıcıya yansır.</p>
                </div>

                <button
                  onClick={() => setIsAddingPrice(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yeni Ürün Ekle</span>
                </button>
              </div>

              {/* Price Items Table */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-400">
                  <thead className="bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800 text-[11px] uppercase font-semibold text-zinc-700 dark:text-zinc-300">
                    <tr>
                      <th className="py-3 px-4">Ürün Adı</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4">Kuru Temizleme</th>
                      <th className="py-3 px-4">Sadece Ütü</th>
                      <th className="py-3 px-4">Birim</th>
                      <th className="py-3 px-4">Popüler</th>
                      <th className="py-3 px-4 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {prices.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                        <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">{item.name}</td>
                        <td className="py-3 px-4 capitalize">{item.category}</td>
                        <td className="py-3 px-4 font-bold text-zinc-900 dark:text-white">₺{item.dryCleanPrice}</td>
                        <td className="py-3 px-4">{item.ironOnlyPrice ? `₺${item.ironOnlyPrice}` : '—'}</td>
                        <td className="py-3 px-4">{item.unit}</td>
                        <td className="py-3 px-4">
                          {item.popular ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Evet</span>
                          ) : 'Hayır'}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => setEditingPriceItem(item)}
                            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 cursor-pointer"
                            title="Düzenle"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`"${item.name}" ürününü silmek istediğinize emin misiniz?`)) {
                                deletePriceItem(item.id);
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 cursor-pointer"
                            title="Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add / Edit Price Modal */}
              {(isAddingPrice || editingPriceItem) && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 max-w-md w-full max-h-[88vh] overflow-y-auto space-y-4 shadow-xl animate-in zoom-in-95">
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                        {editingPriceItem ? 'Ürün Fiyatını Düzenle' : 'Yeni Ürün Ekle'}
                      </h4>
                      <button onClick={() => { setIsAddingPrice(false); setEditingPriceItem(null); }}>
                        <X className="w-4 h-4 text-zinc-400 cursor-pointer" />
                      </button>
                    </div>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                          if (editingPriceItem) {
                            if (!editingPriceItem.name?.trim()) {
                              alert('Lütfen ürün adını giriniz.');
                              return;
                            }
                            if (editingPriceItem.dryCleanPrice < 0) {
                              alert('Kuru temizleme fiyatı 0 veya daha yüksek olmalıdır.');
                              return;
                            }
                            await updatePriceItem(editingPriceItem);
                            setEditingPriceItem(null);
                          } else {
                            if (!newPriceItem.name?.trim()) {
                              alert('Lütfen ürün adını giriniz.');
                              return;
                            }
                            if ((newPriceItem.dryCleanPrice ?? 0) < 0) {
                              alert('Kuru temizleme fiyatı 0 veya daha yüksek olmalıdır.');
                              return;
                            }
                            const id = 'item-' + Date.now();
                            await addPriceItem({ ...newPriceItem, id } as PriceItem);
                            setIsAddingPrice(false);
                          }
                        } catch {
                          alert('Ürün kaydedilirken bir hata oluştu.');
                        }
                      }}
                      className="space-y-3 text-xs"
                    >
                      <div>
                        <label className="block text-zinc-700 dark:text-zinc-300 mb-1 font-medium">Ürün Adı</label>
                        <input
                          type="text"
                          required
                          value={editingPriceItem ? editingPriceItem.name : newPriceItem.name}
                          onChange={(e) => editingPriceItem
                            ? setEditingPriceItem({ ...editingPriceItem, name: e.target.value })
                            : setNewPriceItem({ ...newPriceItem, name: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-zinc-700 dark:text-zinc-300 mb-1 font-medium">Kategori</label>
                          <select
                            value={editingPriceItem ? editingPriceItem.category : newPriceItem.category}
                            onChange={(e) => editingPriceItem
                              ? setEditingPriceItem({ ...editingPriceItem, category: e.target.value as any })
                              : setNewPriceItem({ ...newPriceItem, category: e.target.value as any })
                            }
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl"
                          >
                            <option value="erkek">Erkek Giyim</option>
                            <option value="kadin">Kadın Giyim</option>
                            <option value="ev">Ev & Tekstil</option>
                            <option value="deri">Deri & Lostra</option>
                            <option value="tadilat">Terzi & Tadilat</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-zinc-700 dark:text-zinc-300 mb-1 font-medium">Birim</label>
                          <input
                            type="text"
                            value={editingPriceItem ? editingPriceItem.unit : newPriceItem.unit}
                            onChange={(e) => editingPriceItem
                              ? setEditingPriceItem({ ...editingPriceItem, unit: e.target.value })
                              : setNewPriceItem({ ...newPriceItem, unit: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-zinc-700 dark:text-zinc-300 mb-1 font-medium">Kuru Temizleme (₺)</label>
                          <input
                            type="number"
                            required
                            value={editingPriceItem ? editingPriceItem.dryCleanPrice : newPriceItem.dryCleanPrice}
                            onChange={(e) => editingPriceItem
                              ? setEditingPriceItem({ ...editingPriceItem, dryCleanPrice: Number(e.target.value) })
                              : setNewPriceItem({ ...newPriceItem, dryCleanPrice: Number(e.target.value) })
                            }
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-700 dark:text-zinc-300 mb-1 font-medium">Sadece Ütü (₺)</label>
                          <input
                            type="number"
                            value={editingPriceItem ? editingPriceItem.ironOnlyPrice || '' : newPriceItem.ironOnlyPrice || ''}
                            onChange={(e) => editingPriceItem
                              ? setEditingPriceItem({ ...editingPriceItem, ironOnlyPrice: Number(e.target.value) || undefined })
                              : setNewPriceItem({ ...newPriceItem, ironOnlyPrice: Number(e.target.value) || undefined })
                            }
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="pt-3 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => { setIsAddingPrice(false); setEditingPriceItem(null); }}
                          className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-pointer"
                        >
                          Vazgeç
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-semibold cursor-pointer"
                        >
                          Kaydet
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}



          {/* TAB 5: COUPONS & DISCOUNTS */}
          {activeTab === 'coupons' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white">İndirim & Kampanya Kuponları</h3>
                  <p className="text-xs text-zinc-500">Müşterilerinizin sipariş verirken kullanabileceği promosyon kodlarını yönetin.</p>
                </div>

                <button
                  onClick={() => setIsAddingCoupon(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yeni Kupon Oluştur</span>
                </button>
              </div>

              {/* Coupons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.map((coupon) => (
                  <div
                    key={coupon.code}
                    className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <span className="font-mono font-extrabold text-sm px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                          {coupon.code}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          coupon.active 
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400' 
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                        }`}>
                          {coupon.active ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>

                      <div className="mt-3 text-xs text-zinc-600 dark:text-zinc-300">
                        <div className="text-base font-bold text-zinc-900 dark:text-white">
                          %{coupon.discountPercent} İndirim
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-0.5">{coupon.description || 'Genel kuru temizleme indirimi'}</p>
                      </div>

                      <div className="mt-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-1 text-[11px] text-zinc-500">
                        <div>Min. Sepet: <strong className="text-zinc-800 dark:text-zinc-200">₺{coupon.minOrderAmount}</strong></div>
                        {coupon.expiryDate && (
                          <div>Son Geçerlilik: <strong className="text-zinc-800 dark:text-zinc-200">{coupon.expiryDate}</strong></div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      <button
                        onClick={() => updateCoupon({ ...coupon, active: !coupon.active })}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        {coupon.active ? 'Pasife Al' : 'Aktif Et'}
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm(`"${coupon.code}" kuponunu silmek istediğinize emin misiniz?`)) {
                            deleteCoupon(coupon.code);
                          }
                        }}
                        className="text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                      >
                        Kuponu Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Coupon Modal */}
              {isAddingCoupon && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 max-w-md w-full max-h-[88vh] overflow-y-auto space-y-4 shadow-xl animate-in zoom-in-95">
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Yeni İndirim Kuponu Ekle</h4>
                      <button onClick={() => setIsAddingCoupon(false)}>
                        <X className="w-4 h-4 text-zinc-400 cursor-pointer" />
                      </button>
                    </div>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!newCoupon.code?.trim()) {
                          alert('Lütfen kupon kodunu giriniz.');
                          return;
                        }
                        const pct = Number(newCoupon.discountPercent);
                        if (isNaN(pct) || pct < 1 || pct > 100) {
                          alert('İndirim yüzdesi 1 ile 100 arasında bir değer olmalıdır.');
                          return;
                        }
                        try {
                          await addCoupon({
                            code: newCoupon.code.trim().toUpperCase(),
                            discountPercent: pct,
                            minOrderAmount: Number(newCoupon.minOrderAmount) || 200,
                            active: true,
                            description: newCoupon.description || '',
                            expiryDate: newCoupon.expiryDate || '2026-12-31'
                          });
                          setIsAddingCoupon(false);
                          setNewCoupon({
                            code: '',
                            discountPercent: 15,
                            minOrderAmount: 200,
                            active: true,
                            description: '',
                            expiryDate: '2026-12-31'
                          });
                        } catch {
                          alert('Kupon eklenirken bir hata oluştu.');
                        }
                      }}
                      className="space-y-3 text-xs"
                    >
                      <div>
                        <label className="block text-zinc-700 dark:text-zinc-300 mb-1 font-medium">Kupon Kodu (Örn: TEMIZ20)</label>
                        <input
                          type="text"
                          required
                          placeholder="TEMIZ25"
                          value={newCoupon.code}
                          onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-zinc-700 dark:text-zinc-300 mb-1 font-medium">İndirim Oranı (%)</label>
                          <input
                            type="number"
                            required
                            min="1"
                            max="100"
                            value={newCoupon.discountPercent}
                            onChange={(e) => setNewCoupon({ ...newCoupon, discountPercent: Number(e.target.value) })}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-700 dark:text-zinc-300 mb-1 font-medium">Min. Sipariş (₺)</label>
                          <input
                            type="number"
                            required
                            value={newCoupon.minOrderAmount}
                            onChange={(e) => setNewCoupon({ ...newCoupon, minOrderAmount: Number(e.target.value) })}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-zinc-700 dark:text-zinc-300 mb-1 font-medium">Açıklama</label>
                        <input
                          type="text"
                          placeholder="İlk siparişe özel indirim"
                          value={newCoupon.description}
                          onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-700 dark:text-zinc-300 mb-1 font-medium">Son Geçerlilik Tarihi</label>
                        <input
                          type="date"
                          value={newCoupon.expiryDate}
                          onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl"
                        />
                      </div>

                      <div className="pt-3 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingCoupon(false)}
                          className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-pointer"
                        >
                          Vazgeç
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-semibold cursor-pointer"
                        >
                          Oluştur
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: CUSTOMERS & CRM */}
          {activeTab === 'customers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Müşteri Rehberi & CRM</h3>
                  <p className="text-xs text-zinc-500">Sipariş geçmişine sahip müşteriler ve toplam harcama verileri.</p>
                </div>
                <span className="text-xs font-semibold text-zinc-500">Toplam: {customersList.length} Müşteri</span>
              </div>

              {customersList.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 text-xs">
                  Henüz kayıtlı müşteri bulunmuyor.
                </div>
              ) : (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
                  <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-400">
                    <thead className="bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800 text-[11px] uppercase font-semibold text-zinc-700 dark:text-zinc-300">
                      <tr>
                        <th className="py-3 px-4">Müşteri</th>
                        <th className="py-3 px-4">Telefon</th>
                        <th className="py-3 px-4">Bölge</th>
                        <th className="py-3 px-4">Sipariş Sayısı</th>
                        <th className="py-3 px-4">Toplam Ciro</th>
                        <th className="py-3 px-4">Son İşlem</th>
                        <th className="py-3 px-4 text-right">İletişim</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {customersList.map((customer) => (
                        <tr key={customer.phone} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                          <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">{customer.name}</td>
                          <td className="py-3 px-4 font-mono">{customer.phone}</td>
                          <td className="py-3 px-4">{customer.district}</td>
                          <td className="py-3 px-4 font-bold text-zinc-900 dark:text-white">{customer.totalOrders} sipariş</td>
                          <td className="py-3 px-4 font-extrabold text-emerald-600 dark:text-emerald-400">₺{customer.totalSpent}</td>
                          <td className="py-3 px-4 text-zinc-400">{new Date(customer.lastOrderDate).toLocaleDateString('tr-TR')}</td>
                          <td className="py-3 px-4 text-right space-x-1.5">
                            <a
                              href={`https://wa.me/${customer.phone.replace(/\D/g, '')}?text=Merhaba%20Sayın%20${encodeURIComponent(customer.name)},%20TEMİZ%20Kuru%20Temizleme'den%20ulaşıyoruz.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold hover:bg-emerald-100"
                              title="WhatsApp Mesajı Gönder"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </a>
                            <a
                              href={`tel:${customer.phone}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-semibold hover:bg-zinc-200"
                              title="Doğrudan Ara"
                            >
                              <Phone className="w-3 h-3" />
                              <span>Ara</span>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: APPEARANCE & LOGO & THEME */}
          {activeTab === 'appearance' && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Logo & Marka Tema Yönetimi</h3>
                <p className="text-xs text-zinc-500">Logonuzu yükleyin veya dosya yolunu girin; sitenin ana vurgu rengini logonuzun renk paletine anında uyarlayın.</p>
              </div>

              {settingsSavedMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Logo ve tema ayarları kaydedildi ve web sitesine uygulandı!</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-6 text-xs">
                
                {/* 1. Logo Preview and Upload */}
                <div className="space-y-3">
                  <label className="block text-zinc-800 dark:text-zinc-200 font-bold">
                    Marka Logosu
                  </label>
                  
                  {/* Visual Preview Box */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <div className="w-24 h-24 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center p-2 shadow-xs overflow-hidden">
                      {settingsForm.customLogoUrl ? (
                        <img
                          src={settingsForm.customLogoUrl}
                          alt="Logo Önizleme"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-center">
                          <span className="text-2xl">✨</span>
                          <span className="block text-[9px] text-zinc-400 mt-1">Logo Yok</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 flex-1 text-center sm:text-left">
                      <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        Logonuzu Seçin veya Yükleyin
                      </div>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">
                        Logonuzu projenin <code className="bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded font-mono text-[10px]">public/logo.png</code> veya <code className="bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded font-mono text-[10px]">public/logo.svg</code> dosyası olarak kaydedebilir, aşağıdaki butondan bilgisayarınızdan doğrudan seçebilir ya da görsel bağlantısını yazabilirsiniz.
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <label className="px-3.5 py-1.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-semibold text-xs cursor-pointer hover:opacity-90 transition-opacity">
                          <span>Dosyadan Logo Seç</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoFileUpload}
                            className="hidden"
                          />
                        </label>
                        {settingsForm.customLogoUrl && (
                          <button
                            type="button"
                            onClick={() => setSettingsForm({ ...settingsForm, customLogoUrl: '' })}
                            className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 text-xs cursor-pointer"
                          >
                            Varsayılana Dön
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Logo URL input field */}
                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-medium mb-1">
                      Veya Logo Dosya Yolu / URL:
                    </label>
                    <input
                      type="text"
                      placeholder="/logo.png veya /logo.svg"
                      value={settingsForm.customLogoUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, customLogoUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl font-mono text-xs text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* 2. Brand Color Palette Selection */}
                <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <div>
                    <label className="block text-zinc-800 dark:text-zinc-200 font-bold mb-1">
                      Logonuzla Uyumlu Marka Vurgu Rengi
                    </label>
                    <p className="text-[11px] text-zinc-500">
                      Logonuzun ana rengine en uygun temayı seçtiğinizde butonlar, logo noktası ve vurgular otomatik olarak bu renkle senkronize edilir.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'blue', name: 'Okyanus Mavisi', colorClass: 'bg-blue-600', desc: 'Klasik & Güvenilir' },
                      { id: 'emerald', name: 'Ekolojik Zümrüt', colorClass: 'bg-emerald-600', desc: 'Doğal & Ekolojik' },
                      { id: 'cyan', name: 'Canlı Turkuaz', colorClass: 'bg-cyan-500', desc: 'Ferah & Su Teması' },
                      { id: 'indigo', name: 'Asil Lacivert', colorClass: 'bg-indigo-600', desc: 'Lüks & Prestij' },
                      { id: 'violet', name: 'Modern Viyole', colorClass: 'bg-purple-600', desc: 'Zarif & Yenilikçi' },
                      { id: 'amber', name: 'Sıcak Kehribar', colorClass: 'bg-amber-500', desc: 'Premium & Sıcak' },
                    ].map((theme) => {
                      const isSelected = (settingsForm.brandColor || 'blue') === theme.id;
                      return (
                        <div
                          key={theme.id}
                          onClick={() => setSettingsForm({ ...settingsForm, brandColor: theme.id as BrandColor })}
                          className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                            isSelected
                              ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-800/80 shadow-xs'
                              : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl ${theme.colorClass} flex items-center justify-center text-white shadow-xs shrink-0`}>
                            {isSelected && <Check className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-zinc-900 dark:text-white">{theme.name}</div>
                            <span className="text-[10px] text-zinc-400">{theme.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Top Announcement Banner Text */}
                <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <label className="block text-zinc-800 dark:text-zinc-200 font-bold">
                      Üst Kampanya / Duyuru Bandı Metni
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="announcementActiveToggle"
                        checked={settingsForm.announcementActive !== false}
                        onChange={(e) => setSettingsForm({ ...settingsForm, announcementActive: e.target.checked })}
                        className="rounded"
                      />
                      <label htmlFor="announcementActiveToggle" className="text-zinc-600 dark:text-zinc-400 text-xs font-medium">
                        Aktif
                      </label>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={settingsForm.announcementText || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                    placeholder="350 ₺ ve üzeri siparişlerde ücretsiz kapıdan alım & teslimat"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                  />
                </div>

                {/* Save button */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 font-semibold transition-colors shadow-sm cursor-pointer"
                  >
                    Logo ve Tema Ayarlarını Kaydet
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* TAB 8: SITE SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Site & İletişim Ayarları</h3>
                <p className="text-xs text-zinc-500">Buradan güncellediğiniz tüm telefon, adres ve çalışma saatleri sitedeki tüm bölümlere anında yansır.</p>
              </div>

              {settingsSavedMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ayarlar başarıyla kaydedildi ve tüm siteye uygulandı!</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-5 text-xs">
                
                {/* 1. Phone & WhatsApp */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1.5">
                      Görünen Telefon Numarası
                    </label>
                    <input
                      type="text"
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1.5">
                      WhatsApp Hattı Numarası (Ülke kodu ile, boşluksuz)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.whatsapp}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                      placeholder="905551234567"
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl"
                    />
                  </div>
                </div>

                {/* 2. Email & Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1.5">
                      E-Posta Adresi
                    </label>
                    <input
                      type="email"
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1.5">
                      Ücretsiz Kapıdan Teslimat Limiti (₺)
                    </label>
                    <input
                      type="number"
                      value={settingsForm.freeShippingLimit}
                      onChange={(e) => setSettingsForm({ ...settingsForm, freeShippingLimit: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl"
                    />
                  </div>
                </div>

                {/* 3. Street Address */}
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1.5">
                    Şube / İşyeri Açık Adresi
                  </label>
                  <input
                    type="text"
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl"
                  />
                </div>

                {/* 4. Hours */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1.5">
                      Hafta İçi Çalışma Saatleri
                    </label>
                    <input
                      type="text"
                      value={settingsForm.workingHoursWeekday}
                      onChange={(e) => setSettingsForm({ ...settingsForm, workingHoursWeekday: e.target.value })}
                      placeholder="08:30 – 20:00"
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1.5">
                      Hafta Sonu Saatleri
                    </label>
                    <input
                      type="text"
                      value={settingsForm.workingHoursWeekend}
                      onChange={(e) => setSettingsForm({ ...settingsForm, workingHoursWeekend: e.target.value })}
                      placeholder="Kapalı (Online Siparişler Açıktır)"
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl"
                    />
                  </div>
                </div>

                {/* 5. Districts Management */}
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1.5">
                    Hizmet Verilen Semtler / İlçeler
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {settingsForm.districts.map((district, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs"
                      >
                        <span>{district}</span>
                        <button
                          type="button"
                          onClick={() => setSettingsForm({
                            ...settingsForm,
                            districts: settingsForm.districts.filter((_, i) => i !== idx)
                          })}
                          className="text-zinc-400 hover:text-rose-600 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Yeni semt ekle..."
                      value={newDistrictInput}
                      onChange={(e) => setNewDistrictInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newDistrictInput.trim()) {
                          setSettingsForm({
                            ...settingsForm,
                            districts: [...settingsForm.districts, newDistrictInput.trim()]
                          });
                          setNewDistrictInput('');
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold cursor-pointer"
                    >
                      Ekle
                    </button>
                  </div>
                </div>

                {/* 6. URL Obfuscation / Secret Gate Slug & Admin Key */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4">
                  <div>
                    <h4 className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Şifreli Yönetici URL Kapısı (Gizli Giriş)</span>
                    </h4>
                    <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                      Sitenizin güvenliği için standart <code className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono text-[10px]">#admin</code> veya <code className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono text-[10px]">/admin</code> yolları tamamen kapatılmıştır. Panele yalnızca aşağıdaki size özel şifreli bağlantı ile erişilebilir.
                    </p>
                  </div>

                  {/* Copyable Secret Link */}
                  <div>
                    <label className="block text-[11px] text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                      Doğrudan Giriş Bağlantınız (Tarayıcınıza Yer İmi Ekleyebilirsiniz):
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="flex-1 font-mono text-[11px] bg-white dark:bg-zinc-900 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 truncate text-zinc-800 dark:text-zinc-200 select-all shadow-inner">
                        {secretUrl}
                      </div>
                      <button
                        type="button"
                        onClick={copySecretLink}
                        className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 font-semibold text-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {copiedUrl ? 'Kopyalandı!' : 'Linki Kopyala'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] text-zinc-600 dark:text-zinc-400 font-medium mb-1">
                        Şifreli URL Slug'ı
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-xs">#</span>
                        <input
                          type="text"
                          value={settingsForm.adminGateSlug || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, adminGateSlug: e.target.value.replace(/[^a-zA-Z0-9_-]/g, '') })}
                          placeholder="gate_7f9a8b1c4e2d309"
                          className="w-full pl-7 pr-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-mono text-xs text-zinc-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-600 dark:text-zinc-400 font-medium mb-1">
                        Yönetici Giriş Şifresi (Admin Secret Key)
                      </label>
                      <div className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-[11px] text-zinc-500 dark:text-zinc-400 font-mono flex items-center gap-2">
                        <span className="text-amber-500">🔒</span>
                        <span>Yönetici anahtarı artık yalnızca Vercel ortam değişkenlerinden (<code className="bg-zinc-200 dark:bg-zinc-700 px-1 rounded text-[10px]">ADMIN_SECRET_KEY</code>) yönetilir. Tarayıcı üzerinden değiştirilemez.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 font-semibold transition-colors shadow-sm cursor-pointer"
                  >
                    Tüm Ayarları Kaydet
                  </button>
                </div>

              </form>
            </div>
          )}

        </div>

        {/* Order Printable Receipt Modal */}
        {receiptOrder && (
          <OrderReceiptModal
            order={receiptOrder}
            onClose={() => setReceiptOrder(null)}
          />
        )}

      </div>
    </div>
  );
};
