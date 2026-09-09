import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Sparkles, 
  Shirt, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  MessageCircle, 
  Calendar, 
  PackageCheck,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Lock,
  RefreshCw,
  X,
  Printer,
  MapPin,
  CheckCircle
} from 'lucide-react';
import { useSettings } from '../context/useSettings';
import type { Order } from '../context/SettingsContext';
import { TechLogo } from './TechLogo';
import temizLogoBlue from '../assets/temiz-logo-blue.svg';

// Privacy & KVKK Masking Helpers to protect sensitive customer info in public tracking
const maskCustomerName = (name?: string): string => {
  if (!name) return 'Gizli Müşteri';
  return name
    .trim()
    .split(/\s+/)
    .map(word => (word.length > 0 ? `${word[0].toUpperCase()}***` : ''))
    .filter(Boolean)
    .join(' ');
};

const maskCustomerPhone = (phone?: string): string => {
  if (!phone) return '***';
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 10) {
    const norm = digits.startsWith('90') ? digits.slice(2) : (digits.startsWith('0') ? digits.slice(1) : digits);
    if (norm.length === 10) {
      return `0 (${norm.slice(0, 3)}) *** ** ${norm.slice(-2)}`;
    }
  }
  return phone.length > 5 ? `${phone.slice(0, 4)}***${phone.slice(-2)}` : '***';
};

const maskCustomerAddress = (address?: string, district?: string): string => {
  if (!address) return district || 'Kayıtlı Adres';
  const parts = address.split(/[,–-]/);
  const streetPart = parts[0] || address;
  const maskedStreet = streetPart.replace(/\b\d+\b/g, '**').trim();
  return district ? `${maskedStreet} (${district})` : maskedStreet;
};

interface OrderTrackingProps {
  initialCode?: string;
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({ initialCode }) => {
  const { trackOrder, settings, orders } = useSettings();
  const [searchInput, setSearchInput] = useState(initialCode || '');
  const [selectedOrderCode, setSelectedOrderCode] = useState<string>(initialCode || '');
  const [manualOrder, setManualOrder] = useState<Order | null>(null);

  // Derived: automatically reacts whenever orders in context update
  const currentOrder: Order | null = selectedOrderCode
    ? (orders.find(o => o.orderCode === selectedOrderCode) || manualOrder || null)
    : null;

  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isDedicatedOpen, setIsDedicatedOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSearch = useCallback(async (codeToSearch?: string) => {
    const code = (codeToSearch || searchInput).trim().toUpperCase();
    if (!code) return;

    setIsSearching(true);
    setSearchError(null);

    const found = await trackOrder(code);
    setIsSearching(false);

    if (found) {
      setSelectedOrderCode(found.orderCode);
      setManualOrder(found);
      setSearchInput(found.orderCode);
      setIsDedicatedOpen(true);
      // Update hash without jumping
      window.history.replaceState(null, '', `#takip/${found.orderCode}`);
    } else {
      setSelectedOrderCode('');
      setManualOrder(null);
      setIsDedicatedOpen(false);
      setSearchError(`"${code}" kodlu sipariş sistemde bulunamadı. Lütfen takip kodunu kontrol ediniz.`);
    }
  }, [searchInput, trackOrder]);

  const handleCloseDedicated = () => {
    setIsDedicatedOpen(false);
    // Return hash to standard #takip
    window.history.replaceState(null, '', '#takip');
  };

  const handleRefresh = async () => {
    if (!selectedOrderCode) return;
    setIsRefreshing(true);
    const refreshed = await trackOrder(selectedOrderCode);
    setIsRefreshing(false);
    if (refreshed) {
      setManualOrder(refreshed);
    }
  };

  const handleCopyCode = () => {
    if (!currentOrder?.orderCode) return;
    navigator.clipboard.writeText(currentOrder.orderCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Listen to hash changes (e.g. #takip/TK-12345 or #takip-TK-12345)
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      const match = hash.match(/^#takip\/(.+)$/i) || hash.match(/^#takip-(.+)$/i);
      if (match && match[1]) {
        const code = decodeURIComponent(match[1]).trim().toUpperCase();
        if (code && code !== selectedOrderCode) {
          handleSearch(code);
        }
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, [handleSearch, selectedOrderCode]);

  // Listen to custom open event from UnifiedOrderSection or other components
  useEffect(() => {
    const handleCustomOpen = (e: Event) => {
      const customEvt = e as CustomEvent<{ orderCode?: string }>;
      if (customEvt.detail?.orderCode) {
        handleSearch(customEvt.detail.orderCode);
      }
    };
    window.addEventListener('open-order-tracking', handleCustomOpen);
    return () => window.removeEventListener('open-order-tracking', handleCustomOpen);
  }, [handleSearch]);

  // Lock body scroll when dedicated tracking page is open
  useEffect(() => {
    if (isDedicatedOpen && currentOrder) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDedicatedOpen, currentOrder]);

  // Handle ESC key to close dedicated page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDedicatedOpen) {
        handleCloseDedicated();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDedicatedOpen]);

  const getStepIndex = (status?: Order['status']): number => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return 0;
      case 'in_process':
        return 1;
      case 'ironing':
        return 2;
      case 'delivering':
        return 3;
      case 'completed':
        return 4;
      default:
        return 0;
    }
  };

  const activeStep = getStepIndex(currentOrder?.status);

  const trackingSteps = [
    {
      id: 0,
      title: currentOrder?.status === 'pending'
        ? 'Talep Alındı'
        : 'Sipariş Onaylandı',
      desc: currentOrder?.status === 'pending'
        ? 'Sipariş talebiniz oluşturuldu, WhatsApp onay kutusunda onay bekliyor.'
        : 'Siparişiniz onaylandı, alım randevu saatinizde kapınızdan teslim alınacak.',
      time: currentOrder?.pickupDate ? `${currentOrder.pickupDate} (${currentOrder.timeSlot || '09:00 - 12:00'})` : 'Planlandı',
      icon: PackageCheck
    },
    {
      id: 1,
      title: 'Ekolojik Temizleme',
      desc: 'Kumaş liflerine özel ekolojik leke çıkarma ve temizlik işlemleri uygulanıyor.',
      time: currentOrder?.status === 'in_process' ? 'Şu An İşlemde' : 'Aşama 2',
      icon: Sparkles
    },
    {
      id: 2,
      title: 'Buharlı Pres & Ütü',
      desc: 'Özel buharlı presle kumaş parlama yapmadan özenle ütüleniyor.',
      time: currentOrder?.status === 'ironing' ? 'Şu An İşlemde' : 'Aşama 3',
      icon: Shirt
    },
    {
      id: 3,
      title: 'Kapınıza Teslimat',
      desc: 'Özel hijyenik askılı koruma kılıfında adresinize ulaştırılıyor.',
      time: currentOrder?.status === 'delivering' ? 'Dağıtımda' : 'Son Aşama',
      icon: CheckCircle2
    }
  ];

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. PUBLIC ENTRY SECTION: ONLY A CLEAN, PROMINENT TRACKING CODE INPUT      */}
      {/*    (NO stepper or dummy boxes below when unverified)                     */}
      {/* ========================================================================= */}
      <section id="takip" className="py-16 sm:py-20 bg-white dark:bg-zinc-950 border-t border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1475bc]/10 dark:bg-[#1475bc]/20 border border-[#1475bc]/30 text-[#1475bc] dark:text-[#38a3f5] text-xs font-semibold uppercase tracking-wider mb-3">
              <Lock className="w-3.5 h-3.5" />
              <span>Güvenli Sipariş Takibi</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Siparişinizi Canlı Takip Edin
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2.5">
              Sipariş takip numaranızı girerek kıyafetlerinizin temizlik ve teslimat durumunu size özel canlı takip sayfasında anlık görüntüleyin.
            </p>
          </div>

          {/* Focused Single Input Console Card */}
          <div className="bg-zinc-50 dark:bg-zinc-900/80 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
            >
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value.toUpperCase());
                    if (searchError) setSearchError(null);
                  }}
                  placeholder="Takip kodunu yazınız (Örn: TK-7K9M-2X4V)"
                  className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm sm:text-base font-mono font-bold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#1475bc] uppercase tracking-wider shadow-inner transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSearching || !searchInput.trim()}
                className="px-6 py-3.5 rounded-2xl bg-[#1475bc] hover:bg-[#10629e] text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-md shadow-[#1475bc]/25 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
              >
                {isSearching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Doğrulanıyor...</span>
                  </>
                ) : (
                  <>
                    <span>Sorgula & Takip Et</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Error Message */}
            {searchError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{searchError}</span>
              </div>
            )}

            {/* Subtle Guidance / Security Footer */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 border-t border-zinc-200/60 dark:border-zinc-800">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1475bc] dark:text-[#38a3f5]" />
                <span>Kodunuz doğrulandığında siparişinize özel gizli canlı takip sayfasına yönlendirileceksiniz.</span>
              </div>
              <span className="text-[10px] text-zinc-400 hidden sm:inline">Kişiye Özel & Şifrelenmiş Takip</span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. DEDICATED SECRET TRACKING PAGE OVERLAY (Ayrı Gizli Takip Sayfası)       */}
      {/*    Açıldığında tam sayfa özel konsol sunar; geri dönüşle kapanır.         */}
      {/* ========================================================================= */}
      {isDedicatedOpen && currentOrder && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-zinc-100/95 dark:bg-zinc-950/95 backdrop-blur-xl overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Top Sticky Command Bar */}
          <div className="sticky top-0 z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-8 py-3">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
              
              {/* Left Back Button */}
              <button
                type="button"
                onClick={handleCloseDedicated}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Farklı Kod Sorgula</span>
              </button>

              {/* Center Brand Identity */}
              <div className="flex items-center gap-2">
                <TechLogo size="sm" showSubtitle={false} />
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-[#1475bc]/10 text-[#1475bc] dark:text-[#38a3f5] text-[10px] font-bold border border-[#1475bc]/20">
                  Gizli Sipariş Takip Portalı
                </span>
              </div>

              {/* Right Refresh & Close */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Durumu Yenile"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#1475bc]' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={handleCloseDedicated}
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Kapat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

            </div>
          </div>

          {/* Main Tracking Page Body */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
            
            {/* Live Indicator Pill */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Canlı Sipariş Bağlantısı Aktif</span>
              </div>

              <span className="text-xs text-zinc-400">
                Kayıt Tarihi: {currentOrder.createdAt ? new Date(currentOrder.createdAt).toLocaleString('tr-TR') : 'Bugün'}
              </span>
            </div>

            {/* Order Code Hero Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5">
                <div>
                  <span className="text-[11px] font-bold text-[#1475bc] dark:text-[#38a3f5] uppercase tracking-wider block">
                    Müşteri Takip Numarası
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-2xl sm:text-4xl font-mono font-black text-zinc-900 dark:text-white tracking-wider">
                      {currentOrder.orderCode}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-[#1475bc] hover:text-white transition-all cursor-pointer shadow-xs active:scale-90"
                      title="Kodu Kopyala"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-1">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                    Aşama Durumu
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#1475bc]/10 dark:bg-[#1475bc]/20 text-[#1475bc] dark:text-[#38a3f5] border border-[#1475bc]/30">
                    {trackingSteps[Math.min(3, activeStep)].title}
                  </span>
                </div>
              </div>

              {/* WhatsApp Confirmation Banner on the Secret Page */}
              {currentOrder.isWhatsAppConfirmed ? (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Bu siparişin satışı WhatsApp üzerinden onaylanmış ve teslim fişi sisteme işlenmiştir.</span>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                  <MessageCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>Sipariş talebiniz sistemdedir; işletmemizin WhatsApp onay kutusunda onay beklenmektedir.</span>
                </div>
              )}

              {/* Stepper Timeline */}
              <div className="pt-4 pb-2">
                <div className="relative">
                  {/* Background Line */}
                  <div className="absolute top-5 left-0 right-0 h-1 bg-zinc-200 dark:bg-zinc-800 -translate-y-1/2 rounded-full" />
                  
                  {/* Active Fill Line */}
                  <div 
                    className="absolute top-5 left-0 h-1 bg-[#1475bc] -translate-y-1/2 rounded-full transition-all duration-500 shadow-sm shadow-[#1475bc]/30"
                    style={{ width: `${Math.min(100, (activeStep / 3) * 100)}%` }}
                  />

                  {/* Steps */}
                  <div className="relative flex justify-between">
                    {trackingSteps.map((step) => {
                      const Icon = step.icon;
                      const isDone = activeStep >= step.id;
                      const isCurrent = activeStep === step.id;

                      return (
                        <div
                          key={step.id}
                          className="flex flex-col items-center"
                        >
                          <div 
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                              isCurrent
                                ? 'bg-[#1475bc] text-white ring-4 ring-[#1475bc]/25 shadow-md shadow-[#1475bc]/30 scale-110'
                                : isDone
                                ? 'bg-[#1475bc] text-white shadow-xs shadow-[#1475bc]/20'
                                : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-400'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className="text-center mt-3 max-w-[70px] sm:max-w-[130px]">
                            <span className={`text-xs font-semibold block ${isCurrent ? 'text-zinc-900 dark:text-white font-bold' : isDone ? 'text-zinc-800 dark:text-zinc-200' : 'text-zinc-400'}`}>
                              {step.title}
                            </span>
                            <span className="text-[10px] text-zinc-500 block mt-0.5 truncate">
                              {step.time}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>

            {/* Detailed Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Card 1: Randevu & Teslimat Bilgileri (KVKK Korumalı) */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#1475bc] dark:text-[#38a3f5]" />
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                      Randevu & Adres Bilgileri
                    </h3>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>KVKK Gizlilik Korumalı</span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-300">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Müşteri Adı:</span>
                    <span className="font-semibold text-zinc-900 dark:text-white font-mono">
                      {maskCustomerName(currentOrder.customerName)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Telefon:</span>
                    <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                      {maskCustomerPhone(currentOrder.customerPhone)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Semt / İlçe:</span>
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      {currentOrder.district}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
                    <span className="text-zinc-400 shrink-0">Açık Adres:</span>
                    <span className="text-right text-zinc-800 dark:text-zinc-200 font-medium">
                      {maskCustomerAddress(currentOrder.address, currentOrder.district)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
                    <span className="text-zinc-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Alım Randevusu:</span>
                    </span>
                    <span className="font-semibold text-[#1475bc] dark:text-[#38a3f5]">
                      {currentOrder.pickupDate} ({currentOrder.timeSlot})
                    </span>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                    <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Veri gizliliğiniz gereği ad, telefon ve bina numaraları şifreli olarak maskelenmiştir.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Giysiler & Ödeme Özeti */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <Shirt className="w-4 h-4 text-[#1475bc] dark:text-[#38a3f5]" />
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                    Giysi & Ödeme Özeti
                  </h3>
                </div>

                <div className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-300">
                  <div>
                    <span className="text-zinc-400 block mb-1">Seçilen Giysiler / Hizmet:</span>
                    <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium text-[11px] leading-relaxed">
                      {currentOrder.itemsSummary || 'Kapıda sayım ile belirlenecek'}
                    </div>
                  </div>

                  {currentOrder.notes && (
                    <div>
                      <span className="text-zinc-400 block mb-1">Müşteri Notu:</span>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 italic">
                        "{currentOrder.notes}"
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                    <span className="text-zinc-400">Ödeme Şekli:</span>
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      Kapıda Nakit / POS Kredi Kartı
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800/80 text-sm font-bold text-zinc-900 dark:text-white">
                    <span>Toplam Tutar:</span>
                    <span className="text-lg text-[#1475bc] dark:text-[#38a3f5]">
                      {currentOrder.totalAmount > 0 ? `₺${currentOrder.totalAmount}` : 'Kapıda Giysi Sayımında'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Direct Support & Action Buttons */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                  Siparişinizle İlgili Bir Değişiklik mi İstiyorsunuz?
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Randevu saati, adres güncelleme veya ilave giysi talepleriniz için doğrudan WhatsApp hattımıza yazabilirsiniz.
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <a
                  href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
                    `Merhaba, ${currentOrder.orderCode} takip kodlu siparişim hakkında bilgi almak / güncelleme yapmak istiyorum.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp ile Yaz</span>
                </a>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
                  title="Yazdır"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Slip Container (Visible only when window.print() is executed) */}
            <div id="printable-receipt" className="hidden">
              <div className="text-center border-b border-zinc-200 pb-3 space-y-1">
                <img src={temizLogoBlue} alt="TEMİZ Logo" className="w-12 h-12 mx-auto mb-1 object-contain" />
                <h2 className="font-extrabold text-base tracking-widest uppercase">TEMİZ KURU TEMİZLEME</h2>
                <p className="text-[10px] text-zinc-600 uppercase tracking-wide">Müşteri Canlı Takip Fişi</p>
                <p className="text-[10px] text-zinc-500">Tel: {settings.phone} • WhatsApp: {settings.whatsapp}</p>
              </div>
              <div className="py-3 border-b border-zinc-200 space-y-1 text-xs">
                <p><strong>Takip Kodu:</strong> {currentOrder.orderCode}</p>
                <p><strong>Müşteri:</strong> {maskCustomerName(currentOrder.customerName)}</p>
                <p><strong>Telefon:</strong> {maskCustomerPhone(currentOrder.customerPhone)}</p>
                <p><strong>Randevu:</strong> {currentOrder.pickupDate} ({currentOrder.timeSlot})</p>
                <p><strong>Adres:</strong> {maskCustomerAddress(currentOrder.address, currentOrder.district)}</p>
                <p><strong>Ürünler:</strong> {currentOrder.itemsSummary}</p>
                <p><strong>Tutar:</strong> ₺{currentOrder.totalAmount}</p>
              </div>
            </div>

            {/* Trust Footer */}
            <div className="pt-4 border-t border-zinc-200/80 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Kıyafetleriniz teslim alındığı andan itibaren sigortalı ve barkodludur.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-zinc-400" />
                <span>Standart teslimat döngüsü: 24 - 48 Saat</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

