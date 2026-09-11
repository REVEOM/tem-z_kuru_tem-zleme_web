import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Minus, Trash2, ShoppingBag, Truck, Calendar, Clock, 
  MapPin, User, Phone, MessageCircle, Tag, 
  ArrowRight, Sparkles, Zap, ChevronRight, CheckCircle2, X
} from 'lucide-react';
import { useSettings } from '../context/useSettings';
import { CATEGORIES } from '../data/pricing';
import { useCart } from '../context/useCart';

interface UnifiedOrderSectionProps {
  onOrderSuccess?: (orderCode: string) => void;
  onViewTracking?: () => void;
  defaultTab?: 'products' | 'checkout';
  initialCategory?: string;
}

export const UnifiedOrderSection: React.FC<UnifiedOrderSectionProps> = ({ 
  onOrderSuccess,
  onViewTracking,
  defaultTab = 'products',
  initialCategory = 'all'
}) => {
  const { prices, settings, createOrder, applyCoupon } = useSettings();

  // Mode: 'items' (Pick items) vs 'quick' (Kapıda sayılsın)
  const [orderMode, setOrderMode] = useState<'items' | 'quick'>('items');
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { cart, addToCart, updateQuantity, clearCart, totalCount, subtotalAmount } = useCart();

  // Mobile Step Switcher: 'products' (Browse/Add) vs 'checkout' (Address/Submit)
  const [mobileStep, setMobileStep] = useState<'products' | 'checkout'>(defaultTab);

  React.useEffect(() => {
    if (defaultTab) {
      setMobileStep(defaultTab);
    }
  }, [defaultTab]);

  React.useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory]);

  // Customer & Delivery Info
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState(settings.districts?.[0] || 'Kadıköy');
  const [address, setAddress] = useState('');
  const [pickupDate, setPickupDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [timeSlot, setTimeSlot] = useState('09:00 - 12:00');
  const [notes, setNotes] = useState('');

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Submit status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedOrderCode, setSubmittedOrderCode] = useState('');

  const FREE_SHIPPING_LIMIT = settings.freeShippingLimit || 350;

  // Filtered Products
  const filteredItems = useMemo(() => {
    return prices.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [prices, activeCategory, searchQuery]);

  const freeShippingProgress = Math.min(100, Math.round((subtotalAmount / FREE_SHIPPING_LIMIT) * 100));
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_LIMIT - subtotalAmount);
  const isFreeCourier = orderMode === 'quick' || subtotalAmount >= FREE_SHIPPING_LIMIT;
  const courierFee = isFreeCourier || subtotalAmount === 0 ? 0 : 40;
  // Re-compute discount live from current subtotal to handle cart changes after coupon application
  const discountAmount = appliedCoupon
    ? Math.min(appliedCoupon.discountAmount, subtotalAmount)
    : 0;
  const finalTotal = Math.max(0, subtotalAmount + courierFee - discountAmount);

  const handleClearCart = () => {
    clearCart();
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponMsg(null);
  };

  const handleApplyCoupon = () => {
    setCouponMsg(null);
    const cleanInput = couponInput.trim().toUpperCase();
    if (!cleanInput) {
      // Empty input is completely allowed and valid (coupon is optional)
      setAppliedCoupon(null);
      setCouponMsg(null);
      return;
    }
    if (subtotalAmount === 0) {
      setCouponMsg({ text: 'Kupon uygulamak için önce sepetinize ürün ekleyin.', isError: true });
      return;
    }
    const res = applyCoupon(cleanInput, subtotalAmount);
    if (res.valid) {
      setAppliedCoupon({ code: cleanInput, discountAmount: res.discountAmount });
      setCouponMsg({ text: res.message, isError: false });
    } else {
      setAppliedCoupon(null);
      setCouponMsg({ text: res.message, isError: true });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponMsg(null);
  };

  const handleQuickDateSelect = (daysFromToday: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromToday);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setPickupDate(`${yyyy}-${mm}-${dd}`);
  };

  // Submit Order
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert('Lütfen ad, telefon ve açık adres alanlarını eksiksiz doldurunuz.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      alert('Lütfen geçerli bir telefon numarası giriniz (en az 10 hane).');
      return;
    }

    if (!pickupDate) {
      alert('Lütfen kapıdan alım tarihi seçiniz.');
      return;
    }

    // In items mode, require at least one item in the cart
    if (orderMode === 'items' && totalCount === 0) {
      alert('Ürün listesinden en az bir ürün ekleyin veya "Kapıda Sayım" moduna geçin.');
      return;
    }

    setIsSubmitting(true);

    let summaryText = '';
    let servicesList: string[] = [];

    if (orderMode === 'quick') {
      summaryText = '⚡ Kapıda Sayım (Ürünler kapıda teslim alınırken sayılacaktır)';
      servicesList = ['Kuru Temizleme', 'Kapıda Sayım'];
    } else {
      const lines = Object.values(cart).map((entry) => {
        const typeLabel = entry.serviceType === 'iron' ? '(Sadece Ütü)' : '(Kuru Temizleme + Ütü)';
        const unitPrice = entry.serviceType === 'iron' && entry.item.ironOnlyPrice 
          ? entry.item.ironOnlyPrice 
          : entry.item.dryCleanPrice;
        return `${entry.quantity}x ${entry.item.name} ${typeLabel} - ₺${unitPrice * entry.quantity}`;
      });
      summaryText = lines.join('\n');
      servicesList = Array.from(new Set(Object.values(cart).map(c => c.serviceType === 'iron' ? 'Buharlı Ütü' : 'Kuru Temizleme')));
      if (servicesList.length === 0) servicesList = ['Kuru Temizleme'];
    }

    try {
      const res = await createOrder({
        customerName: name,
        customerPhone: phone,
        district,
        address,
        services: servicesList,
        pickupDate,
        timeSlot,
        notes,
        itemsSummary: summaryText,
        totalAmount: orderMode === 'quick' ? 0 : finalTotal,
        discountAmount: appliedCoupon?.discountAmount,
        couponCode: appliedCoupon?.code
      });

      if (!res.success || !res.orderCode) {
        throw new Error('Sipariş oluşturulamadı');
      }

      const orderCode = res.orderCode;
      setSubmittedOrderCode(orderCode);
      setIsSubmitted(true);
      if (onOrderSuccess) onOrderSuccess(orderCode);

      // Construct and open WhatsApp immediately to site owner
      const lines = [
        `*🧺 TEMİZ KURU TEMİZLEME — WHATSAPP SİPARİŞ TALEBİ*`,
        `*Sipariş Takip Kodu:* ${orderCode}`,
        `*Müşteri:* ${name}`,
        `*Telefon:* ${phone}`,
        `*Semt/Bölge:* ${district}`,
        `*Açık Adres:* ${address}`,
        `*Alım Randevusu:* ${pickupDate} (${timeSlot})`,
      ];

      if (orderMode === 'quick') {
        lines.push(`\n*📦 Sipariş Tipi:* Kapıda Sayım`);
      } else if (Object.keys(cart).length > 0) {
        lines.push(`\n*📦 Seçilen Ürünler (Tahmini Tutar: ₺${finalTotal}):*`);
        Object.values(cart).forEach(entry => {
          const typeLabel = entry.serviceType === 'iron' ? '(Sadece Ütü)' : '(Kuru Temizleme + Ütü)';
          lines.push(`• ${entry.quantity}x ${entry.item.name} ${typeLabel}`);
        });
      }

      if (appliedCoupon) {
        lines.push(`*Kupon:* ${appliedCoupon.code} (-₺${appliedCoupon.discountAmount})`);
      }

      if (notes) {
        lines.push(`\n*Müşteri Notu:* ${notes}`);
      }

      lines.push(`\n_Merhaba, temizkurutemizleme.com üzerinden randevu oluşturdum. Sipariş Takip Kodum: ${orderCode}. Siparişi onaylayabilir misiniz?_`);

      const message = encodeURIComponent(lines.join('\n'));
      const waUrl = `https://wa.me/${settings.whatsapp}?text=${message}`;

      try {
        window.open(waUrl, '_blank');
      } catch {
        // Fallback if browser blocks popups
      }
    } catch {
      alert('Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppSend = () => {
    const lines = [
      `*🧺 TEMİZ KURU TEMİZLEME — WHATSAPP SİPARİŞ TALEBİ*`,
      `*Sipariş Takip Kodu:* ${submittedOrderCode || 'YENİ'}`,
      `*Müşteri:* ${name}`,
      `*Telefon:* ${phone}`,
      `*Semt/Bölge:* ${district}`,
      `*Açık Adres:* ${address}`,
      `*Alım Randevusu:* ${pickupDate} (${timeSlot})`,
    ];

    if (orderMode === 'quick') {
      lines.push(`\n*📦 Sipariş Tipi:* Kapıda Sayım`);
    } else if (Object.keys(cart).length > 0) {
      lines.push(`\n*📦 Seçilen Ürünler (Tahmini Tutar: ₺${finalTotal}):*`);
      Object.values(cart).forEach(entry => {
        const typeLabel = entry.serviceType === 'iron' ? '(Sadece Ütü)' : '(Kuru Temizleme + Ütü)';
        lines.push(`• ${entry.quantity}x ${entry.item.name} ${typeLabel}`);
      });
    }

    if (appliedCoupon) {
      lines.push(`*Kupon:* ${appliedCoupon.code} (-₺${appliedCoupon.discountAmount})`);
    }

    if (notes) {
      lines.push(`\n*Müşteri Notu:* ${notes}`);
    }

    lines.push(`\n_Merhaba, temizkurutemizleme.com üzerinden sipariş oluşturdum. Sipariş Takip Kodum: ${submittedOrderCode}. Siparişi onaylayabilir misiniz?_`);

    const message = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/${settings.whatsapp}?text=${message}`, '_blank');
  };

  return (
    <section id="siparis" className="py-12 sm:py-20 bg-zinc-50/70 dark:bg-zinc-950/70 border-y border-zinc-200/80 dark:border-zinc-800/80 transition-colors relative">
      <div id="kurye-cagir" className="absolute -top-20 opacity-0 pointer-events-none" />
      <div id="fiyatlar" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1475bc]/10 dark:bg-[#1475bc]/20 border border-[#1475bc]/30 text-[#1475bc] dark:text-[#38a3f5] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fiyat Listesi & Sipariş Randevusu</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Ürünlerinizi Seçin, Kapınızdan Teslim Alalım
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2.5">
            İster aşağıdaki listeden ürünlerinizi tek tek seçin, ister hızlı randevu oluşturun kapınızda sayalım.
          </p>
        </div>

        {/* ORDER SUCCESS SCREEN */}
        {isSubmitted ? (
          <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 border border-zinc-200 dark:border-zinc-800 shadow-xl text-center space-y-6 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <MessageCircle className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                <span>💬 WhatsApp Operasyonuna İletildi</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
                Sipariş Talebiniz Alındı!
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Siparişiniz sisteme kaydedildi ve işletme sahibimizin WhatsApp onay kutusuna düştü.
              </p>
            </div>

            {/* Tracking Code Highlight Box */}
            <div className="bg-[#1475bc]/10 dark:bg-[#1475bc]/20 border border-[#1475bc]/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div>
                <span className="text-[11px] text-[#1475bc] dark:text-[#38a3f5] font-bold uppercase tracking-wider block">
                  Sipariş Takip Numaranız
                </span>
                <span className="text-2xl sm:text-3xl font-mono font-black text-[#1475bc] dark:text-[#38a3f5] tracking-wider">
                  {submittedOrderCode}
                </span>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Bu kod ile sipariş durumunuzu web sitemizden 7/24 canlı takip edebilirsiniz.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (submittedOrderCode) {
                    navigator.clipboard.writeText(submittedOrderCode);
                    alert(`Takip Kodu Kopyalandı: ${submittedOrderCode}`);
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-[#1475bc] hover:bg-[#10629e] text-white text-xs font-bold transition-colors shrink-0 cursor-pointer shadow-xs"
              >
                Kodu Kopyala
              </button>
            </div>

            {/* Appointment & Explanation Card */}
            <div className="p-4.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-left space-y-2 text-zinc-700 dark:text-zinc-300">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <span className="font-semibold text-zinc-900 dark:text-white">Randevu & Onay Süreci</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-bold border border-amber-200 dark:border-amber-800">
                  Onay Bekleniyor
                </span>
              </div>
              <p>
                Sayın <strong>{name}</strong>, sipariş randevunuz <strong>{pickupDate}</strong> tarihinde <strong>{timeSlot}</strong> aralığında <strong>{district}</strong> adresiniz için planlandı.
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                • İşletme yetkilimiz WhatsApp mesajınızı inceleyip satışı onayladığında müşteri fişiniz düzenlenir ve randevu saatinde kapınızdan teslim alınır.
              </p>
              {orderMode !== 'quick' && totalCount > 0 && (
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  • Seçilen {totalCount} parça giysi için hesaplanan tutar: <strong>₺{finalTotal}</strong>
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleWhatsAppSend}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all active:scale-98 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Görüşmesini Aç</span>
              </button>

              {onViewTracking && (
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('open-order-tracking', { detail: { orderCode: submittedOrderCode } }));
                    onViewTracking();
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 font-bold text-xs transition-colors cursor-pointer shadow-sm"
                >
                  <span>Canlı Takip Ekranına Git →</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  clearCart();
                  setName('');
                  setPhone('');
                  setAddress('');
                  setNotes('');
                  setAppliedCoupon(null);
                  setCouponInput('');
                  setCouponMsg(null);
                  setSubmittedOrderCode('');
                  setMobileStep('products');
                }}
                className="w-full sm:w-auto px-4 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
              >
                Yeni Talep
              </button>
            </div>
          </div>
        ) : (

          /* MAIN UNIFIED WORKFLOW (SIDE BY SIDE ON DESKTOP, TABBED/STEPPED ON MOBILE) */
          <div className="space-y-6">

            {/* Top Mode Selector (Ürün Seçimi vs Hızlı Sipariş) */}
            <div className="bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 max-w-md mx-auto flex items-center gap-1.5 shadow-xs">
              <button
                type="button"
                onClick={() => {
                  setOrderMode('items');
                  setMobileStep('products');
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  orderMode === 'items'
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Ürün Seçerek Sipariş</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOrderMode('quick');
                  setMobileStep('checkout');
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  orderMode === 'quick'
                    ? 'bg-[#1475bc] text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-[#1475bc]'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Hızlı Sipariş (Kapıda Sayım)</span>
              </button>
            </div>

            {/* MOBILE ONLY STEP SELECTOR (When in Items Mode) */}
            {orderMode === 'items' && (
              <div className="lg:hidden flex items-center bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setMobileStep('products')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    mobileStep === 'products'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                      : 'text-zinc-500'
                  }`}
                >
                  <span>1. Ürünleri Seç</span>
                  {totalCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#1475bc] text-white text-[9px] flex items-center justify-center font-bold">
                      {totalCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setMobileStep('checkout')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    mobileStep === 'checkout'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                      : 'text-zinc-500'
                  }`}
                >
                  <span>2. Teslimat Randevusu</span>
                  {subtotalAmount > 0 && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      (₺{subtotalAmount})
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* UNIFIED GRID CONTAINER */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* LEFT COLUMN (7 COLS): PRODUCT CATALOG */}
              <div className={`lg:col-span-7 space-y-4 ${
                orderMode === 'quick' ? 'hidden' : (mobileStep === 'checkout' ? 'hidden lg:block' : 'block')
              }`}>
                
                {/* Search & Category Filter */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
                  <div className="relative">
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Ürün ara (ör: Gömlek, Takım Elbise, Yorgan, Kaban)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                          activeCategory === cat.id
                            ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredItems.map((item) => {
                    const fullKey = `${item.id}_full`;
                    const ironKey = `${item.id}_iron`;
                    const inCartFull = cart[fullKey]?.quantity || 0;
                    const inCartIron = cart[ironKey]?.quantity || 0;

                    return (
                      <div
                        key={item.id}
                        className={`bg-white dark:bg-zinc-900 rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                          inCartFull > 0 || inCartIron > 0
                            ? 'border-[#1475bc]/60 shadow-xs ring-1 ring-[#1475bc]/20'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-semibold text-zinc-900 dark:text-white text-sm">{item.name}</h4>
                            <span className="text-[10px] text-zinc-500">Birim: {item.unit}</span>
                          </div>
                          {item.popular && (
                            <span className="text-[9px] bg-[#1475bc]/10 dark:bg-[#1475bc]/20 text-[#1475bc] dark:text-[#38a3f5] px-2 py-0.5 rounded-md font-bold uppercase">
                              Popüler
                            </span>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                          {/* Option 1: Dry Clean + Iron */}
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-zinc-500 block">Kuru Temizleme + Ütü</span>
                              <span className="text-sm font-extrabold text-zinc-900 dark:text-white">₺{item.dryCleanPrice}</span>
                            </div>

                            {inCartFull > 0 ? (
                              <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(fullKey, -1)}
                                  className="w-6 h-6 rounded bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center justify-center font-bold text-xs cursor-pointer active:scale-90"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-bold text-zinc-900 dark:text-white w-4 text-center">{inCartFull}</span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(fullKey, 1)}
                                  className="w-6 h-6 rounded bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center justify-center font-bold text-xs cursor-pointer active:scale-90"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => addToCart(item, 'full')}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-all cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Ekle</span>
                              </button>
                            )}
                          </div>

                          {/* Option 2: Iron Only (if available) */}
                          {item.ironOnlyPrice && (
                            <div className="flex items-center justify-between pt-1.5 border-t border-dashed border-zinc-100 dark:border-zinc-800">
                              <div>
                                <span className="text-[10px] text-zinc-400 block">Sadece Ütü</span>
                                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">₺{item.ironOnlyPrice}</span>
                              </div>

                              {inCartIron > 0 ? (
                                <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(ironKey, -1)}
                                    className="w-6 h-6 rounded bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center justify-center font-bold text-xs cursor-pointer active:scale-90"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="text-xs font-bold text-zinc-900 dark:text-white w-4 text-center">{inCartIron}</span>
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(ironKey, 1)}
                                    className="w-6 h-6 rounded bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center justify-center font-bold text-xs cursor-pointer active:scale-90"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => addToCart(item, 'iron')}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-[11px] transition-colors cursor-pointer"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                  <span>Sadece Ütü</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Floating Mobile Cart Bar (When in products step) */}
                {totalCount > 0 && (
                  <div className="lg:hidden fixed bottom-16 left-3 right-3 z-30 animate-in slide-in-from-bottom-3">
                    <button
                      type="button"
                      onClick={() => setMobileStep('checkout')}
                      className="w-full py-3.5 px-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-bold text-xs shadow-2xl flex items-center justify-between cursor-pointer active:scale-98 transition-transform"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#1475bc] text-white flex items-center justify-center text-[10px]">
                          {totalCount}
                        </span>
                        <span>Tahmini Tutar: <strong>₺{subtotalAmount}</strong></span>
                      </div>
                      <div className="flex items-center gap-1 text-[#1475bc] dark:text-[#38a3f5]">
                        <span>Teslimat Randevusuna Geç</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN (5 COLS): LIVE CART & APPOINTMENT FORM */}
              <div className={`space-y-5 ${
                orderMode === 'quick' ? 'lg:col-span-8 lg:col-start-3' : 'lg:col-span-5'
              } ${
                orderMode === 'items' && mobileStep === 'products' ? 'hidden lg:block' : 'block'
              }`}>
                
                <form onSubmit={handleSubmitOrder} className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                  
                  {/* Cart Header (When in Items Mode) */}
                  {orderMode === 'items' && (
                    <div className="space-y-3 border-b border-zinc-100 dark:border-zinc-800 pb-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-[#1475bc] dark:text-[#38a3f5]" />
                          <h3 className="font-bold text-zinc-900 dark:text-white text-sm">
                            Seçilen Giysiler ({totalCount})
                          </h3>
                        </div>
                        {totalCount > 0 && (
                          <button
                            type="button"
                            onClick={handleClearCart}
                            className="text-zinc-400 hover:text-rose-500 text-xs transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Temizle</span>
                          </button>
                        )}
                      </div>

                      {/* Free Delivery Bar */}
                      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400 text-[11px]">
                            <Truck className="w-3.5 h-3.5 text-[#1475bc]" /> Ücretsiz Teslimat
                          </span>
                          <span className="font-bold text-zinc-900 dark:text-white text-[11px]">
                            {subtotalAmount >= FREE_SHIPPING_LIMIT ? '🎉 Teslimat Ücretsiz!' : `₺${subtotalAmount} / ₺${FREE_SHIPPING_LIMIT}`}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-[#1475bc] rounded-full transition-all" style={{ width: `${freeShippingProgress}%` }} />
                        </div>
                        {remainingForFreeShipping > 0 && (
                          <p className="text-[10px] text-zinc-500">
                            Ücretsiz teslimat için <strong>₺{remainingForFreeShipping}</strong> değerinde giysi daha ekleyin.
                          </p>
                        )}
                      </div>

                      {/* Cart Items List */}
                      {totalCount === 0 ? (
                        <div className="py-4 text-center text-xs text-zinc-400">
                          Henüz ürün eklemediniz. Soldaki listeden ürün seçebilir veya doğrudan randevu oluşturabilirsiniz.
                        </div>
                      ) : (
                        <div className="max-h-48 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 text-xs space-y-1.5 pr-1">
                          {Object.entries(cart).map(([key, entry]) => {
                            const unitPrice = entry.serviceType === 'iron' && entry.item.ironOnlyPrice
                              ? entry.item.ironOnlyPrice
                              : entry.item.dryCleanPrice;
                            const subtotal = unitPrice * entry.quantity;

                            return (
                              <div key={key} className="pt-2 flex items-center justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <div className="font-semibold text-zinc-900 dark:text-white truncate">{entry.item.name}</div>
                                  <div className="text-[10px] text-zinc-400">
                                    {entry.serviceType === 'iron' ? 'Sadece Ütü' : 'Kuru Temizleme'} • ₺{unitPrice}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded px-1">
                                    <button
                                      type="button"
                                      onClick={() => updateQuantity(key, -1)}
                                      className="text-zinc-500 hover:text-black dark:hover:text-white font-bold px-1"
                                    >
                                      -
                                    </button>
                                    <span className="font-bold text-zinc-900 dark:text-white px-1 text-[11px]">{entry.quantity}</span>
                                    <button
                                      type="button"
                                      onClick={() => updateQuantity(key, 1)}
                                      className="text-zinc-500 hover:text-black dark:hover:text-white font-bold px-1"
                                    >
                                      +
                                    </button>
                                  </div>
                                  <span className="font-bold text-zinc-900 dark:text-white w-12 text-right text-xs">₺{subtotal}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Coupon Box (100% Optional) */}
                      <div className="pt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                            İndirim Kuponu <span className="text-[10px] text-zinc-400 font-normal">(İsteğe Bağlı / Opsiyonel)</span>
                          </span>
                        </div>

                        {appliedCoupon ? (
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
                            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Kupon Aktif: <strong>{appliedCoupon.code}</strong> (-₺{discountAmount})</span>
                            </div>
                            <button
                              type="button"
                              onClick={handleRemoveCoupon}
                              className="text-xs text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Kaldır</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Tag className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                placeholder="Varsa kupon kodu (Boş bırakabilirsiniz)"
                                value={couponInput}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleApplyCoupon();
                                  }
                                }}
                                onChange={(e) => {
                                  const val = e.target.value.toUpperCase();
                                  setCouponInput(val);
                                  if (!val.trim()) {
                                    setCouponMsg(null);
                                  }
                                }}
                                className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs uppercase text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={handleApplyCoupon}
                              disabled={!couponInput.trim()}
                              className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-opacity"
                            >
                              Uygula
                            </button>
                          </div>
                        )}

                        {couponMsg && (
                          <div className={`text-[11px] mt-1.5 font-medium ${couponMsg.isError ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {couponMsg.text}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* QUICK MODE BANNER */}
                  {orderMode === 'quick' && (
                    <div className="p-4 rounded-2xl bg-[#1475bc]/10 dark:bg-[#1475bc]/20 border border-[#1475bc]/30 text-xs text-zinc-800 dark:text-zinc-200 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-[#1475bc] dark:text-[#38a3f5]">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span>Hızlı Sipariş Modu Seçildi</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                        Ürün seçimi yapmanıza gerek yok. Servisimiz belirttiğiniz randevu saatinde kapınıza gelip giysilerinizi teslim alacak, kapınızda sayımını yapıp fişinizi iletecektir.
                      </p>
                    </div>
                  )}

                  {/* APPOINTMENT & DELIVERY FORM FIELDS */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#1475bc] dark:text-[#38a3f5]" />
                      <h3 className="font-bold text-zinc-900 dark:text-white text-sm">
                        Teslimat & Randevu Bilgileri
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                          Adınız Soyadınız *
                        </label>
                        <div className="relative">
                          <User className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            placeholder="Ad Soyad"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                          Telefon Numaranız *
                        </label>
                        <div className="relative">
                          <Phone className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            required
                            placeholder="05XX XXX XX XX"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                          Semt / İlçe *
                        </label>
                        <div className="relative">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <select
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white appearance-none cursor-pointer"
                          >
                            {settings.districts.map((d) => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                          Alım Saati Aralığı *
                        </label>
                        <div className="relative">
                          <Clock className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <select
                            value={timeSlot}
                            onChange={(e) => setTimeSlot(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white appearance-none cursor-pointer"
                          >
                            <option value="09:00 - 12:00">09:00 - 12:00 (Sabah)</option>
                            <option value="12:00 - 15:00">12:00 - 15:00 (Öğle)</option>
                            <option value="15:00 - 18:00">15:00 - 18:00 (Öğleden Sonra)</option>
                            <option value="18:00 - 21:00">18:00 - 21:00 (Akşam)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                          Kapıdan Alım Tarihi *
                        </label>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleQuickDateSelect(1)}
                            className="text-[10px] font-semibold text-[#1475bc] dark:text-[#38a3f5] hover:underline cursor-pointer"
                          >
                            Yarın
                          </button>
                          <span className="text-zinc-300">|</span>
                          <button
                            type="button"
                            onClick={() => handleQuickDateSelect(2)}
                            className="text-[10px] font-semibold text-[#1475bc] dark:text-[#38a3f5] hover:underline cursor-pointer"
                          >
                            2 Gün Sonra
                          </button>
                        </div>
                      </div>
                      <div className="relative">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="date"
                          required
                          value={pickupDate}
                          min={(() => {
                            const tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            return tomorrow.toISOString().slice(0, 10);
                          })()}
                          onChange={(e) => setPickupDate(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                        Açık Adres (Cadde, Sokak, Bina No, Kat / Daire) *
                      </label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Örn: Moda Cad. Güneş Apt. No:14 Daire:5"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                        Siparişe Özel Not (Opsiyonel)
                      </label>
                      <input
                        type="text"
                        placeholder="Örn: Zili çalmayın bebek uyuyor, güvenliğe bırakılacak vb."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* PRICE SUMMARY & SUBMIT */}
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                    {orderMode === 'items' && (
                      <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                        <div className="flex items-center justify-between">
                          <span>Ara Toplam ({totalCount} parça)</span>
                          <span className="font-semibold text-zinc-900 dark:text-white">₺{subtotalAmount}</span>
                        </div>

                        {appliedCoupon && (
                          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                            <span>İndirim ({appliedCoupon.code})</span>
                            <span className="font-semibold">-₺{discountAmount}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span>Kapıdan Servis / Alım</span>
                          <span className={`font-semibold ${courierFee === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-white'}`}>
                            {courierFee === 0 ? 'ÜCRETSİZ' : `₺${courierFee}`}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-900 dark:text-white">
                          <span>Tahmini Toplam</span>
                          <span className="text-xl text-[#1475bc] dark:text-[#38a3f5]">₺{finalTotal}</span>
                        </div>
                      </div>
                    )}

                    {orderMode === 'quick' && (
                      <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-center text-xs text-zinc-600 dark:text-zinc-300">
                        <span>Tutar kapıda teslimat sırasında giysilerinizin sayımına göre belirlenecektir.</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <span>Kaydediliyor ve WhatsApp Açılıyor...</span>
                        ) : (
                          <>
                            <MessageCircle className="w-4 h-4 fill-white" />
                            <span>
                              {orderMode === 'quick' 
                                ? 'WhatsApp ile Hemen Sipariş Ver' 
                                : (totalCount > 0 ? `WhatsApp ile Sipariş Ver (₺${finalTotal})` : 'WhatsApp ile Sipariş Randevusu Oluştur')
                              }
                            </span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                      <p className="text-[10px] text-center text-zinc-500 dark:text-zinc-400">
                        ⚡ Siparişiniz sisteme kaydedilir ve WhatsApp üzerinden işletme onay kutumuza anında iletilir.
                      </p>

                      {/* Return to products button on mobile */}
                      {orderMode === 'items' && mobileStep === 'checkout' && (
                        <button
                          type="button"
                          onClick={() => setMobileStep('products')}
                          className="lg:hidden w-full py-2.5 text-center text-xs font-semibold text-[#1475bc] dark:text-[#38a3f5] hover:underline cursor-pointer"
                        >
                          ← Ürün Eklemeye Dön ({totalCount} ürün seçili)
                        </button>
                      )}
                    </div>
                  </div>

                </form>

              </div>

            </div>

          </div>
        )}

      </div>
    </section>
  );
};
