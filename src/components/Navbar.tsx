import React, { useState } from 'react';
import { Phone, MessageCircle, Menu, X, Sun, Moon, Sparkles, MapPin, ShoppingBag } from 'lucide-react';
import { TechLogo } from './TechLogo';
import { useTheme } from '../context/useTheme';
import { useSettings } from '../context/useSettings';
import { useCart } from '../context/useCart';
import type { MobileTab } from './MobileAppDock';

interface NavbarProps {
  onOpenOrder: () => void;
  onOpenAdmin?: () => void;
  activeMobileTab?: MobileTab;
  onSelectMobileTab?: (tab: MobileTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenOrder, 
  onOpenAdmin,
  activeMobileTab = 'home',
  onSelectMobileTab
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { settings } = useSettings();
  const { totalCount, subtotalAmount } = useCart();
  const [logoClicks, setLogoClicks] = useState(0);

  const logoClickTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoSecretClick = (e: React.MouseEvent) => {
    const next = logoClicks + 1;
    setLogoClicks(next);
    // Reset counter after 2 seconds of inactivity
    if (logoClickTimerRef.current) clearTimeout(logoClickTimerRef.current);
    logoClickTimerRef.current = setTimeout(() => setLogoClicks(0), 2000);
    if (next >= 7) {
      e.preventDefault();
      setLogoClicks(0);
      if (logoClickTimerRef.current) clearTimeout(logoClickTimerRef.current);
      if (onOpenAdmin) onOpenAdmin();
    }
  };

  const navLinks: { label: string; href: string; mobileTab: MobileTab }[] = [
    { label: 'Hizmetler', href: '#hizmetler', mobileTab: 'home' },
    { label: 'Fiyatlar', href: '#fiyatlar', mobileTab: 'prices' },
    { label: 'Sipariş Takibi', href: '#takip', mobileTab: 'track' },
    { label: 'Nasıl Çalışır?', href: '#nasil-calisir', mobileTab: 'home' },
    { label: 'Neden Biz?', href: '#neden-biz', mobileTab: 'home' },
    { label: 'İletişim & Destek', href: '#iletisim', mobileTab: 'support' },
  ];

  const handleNavLinkClick = (link: { href: string; mobileTab: MobileTab }, e: React.MouseEvent) => {
    if (onSelectMobileTab && typeof window !== 'undefined' && window.innerWidth < 1024) {
      e.preventDefault();
      onSelectMobileTab(link.mobileTab);
      setMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const primaryDistrict = settings.districts?.[0] || 'Kadıköy';

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Subtle Top Notification Bar */}
      {settings.announcementActive !== false && (
        <div className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs py-1.5 px-3 transition-colors">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-2 text-[11px] sm:text-xs">
              <span className="inline-flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#1475bc] dark:text-[#38a3f5] shrink-0" />
                <span>{settings.announcementText || `${settings.freeShippingLimit} ₺ ve üzeri siparişlerde ücretsiz kapıdan alım & teslimat`}</span>
              </span>
              <span className="hidden md:inline text-zinc-400 dark:text-zinc-600">|</span>
              <span className="hidden md:inline text-zinc-500 dark:text-zinc-400">
                Pzt — Cmt: {settings.workingHoursWeekday}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-4 text-xs font-medium">
              <a 
                href={`tel:${settings.phoneRaw || (settings.phone || '').replace(/\D/g, '')}`} 
                className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 hover:text-[#1475bc] dark:hover:text-[#38a3f5] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-zinc-500" />
                <span>{settings.phone}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Clean Navigation */}
      <nav className="bg-white/85 dark:bg-zinc-950/85 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 py-2.5 sm:py-3.5 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Brand Logo with 4-click secret admin door */}
          <div className="flex items-center gap-2.5">
            <div 
              onClick={handleLogoSecretClick} 
              className="flex items-center cursor-pointer select-none"
              title="TEMİZ"
            >
              <TechLogo size="md" />
            </div>

            {/* Mobile Location Chip */}
            <div className="lg:hidden flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-semibold text-zinc-600 dark:text-zinc-300">
              <MapPin className="w-3 h-3 text-[#1475bc] dark:text-[#38a3f5] shrink-0" />
              <span>{primaryDistrict}</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Action Buttons & Theme Switcher */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Açık Mod' : 'Karanlık Mod'}
              aria-label="Temayı Değiştir"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-700" />
              )}
            </button>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/${settings.whatsapp}?text=Merhaba,%20kuru%20temizleme%20siparişi%20vermek%20istiyorum.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-semibold transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>WhatsApp</span>
            </a>

            {/* Live Cart Widget (Desktop) */}
            {totalCount > 0 && (
              <button
                type="button"
                onClick={onOpenOrder}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1475bc]/10 hover:bg-[#1475bc]/15 dark:bg-[#1475bc]/20 dark:hover:bg-[#1475bc]/30 border border-[#1475bc]/30 text-[#1475bc] dark:text-[#38a3f5] text-xs font-bold transition-all cursor-pointer shadow-xs animate-in zoom-in-95"
                title="Sepetim & Sipariş Ver"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#1475bc] dark:text-[#38a3f5]" />
                <span>{totalCount} Parça</span>
                <span className="text-[#1475bc]/40">•</span>
                <span>₺{subtotalAmount}</span>
              </button>
            )}

            {/* Desktop CTA */}
            <button
              onClick={onOpenOrder}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1475bc] hover:bg-[#10629e] text-white text-xs font-semibold tracking-wide transition-all cursor-pointer shadow-sm shadow-[#1475bc]/20 active:scale-95"
            >
              <span>Sipariş Ver</span>
            </button>
          </div>

          {/* Mobile Actions Bar */}
          <div className="lg:hidden flex items-center gap-1.5">
            {/* Live Cart Pill (Mobile Header) */}
            {totalCount > 0 && (
              <button
                type="button"
                onClick={onOpenOrder}
                className="relative p-2 rounded-xl text-[#1475bc] dark:text-[#38a3f5] bg-[#1475bc]/10 dark:bg-[#1475bc]/20 border border-[#1475bc]/30 transition-colors cursor-pointer"
                aria-label="Sepeti Gör"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs">
                  {totalCount}
                </span>
              </button>
            )}

            {/* Quick Call */}
            <a
              href={`tel:${settings.phoneRaw || settings.phone.replace(/\D/g, '')}`}
              className="p-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Telefonla Ara"
            >
              <Phone className="w-4 h-4" />
            </a>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Temayı Değiştir"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-700" />
              )}
            </button>

            {/* Mobile Hamburger Menu */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Menüyü Aç"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu with Quick App Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-4 pt-3 pb-5 space-y-3 animate-in slide-in-from-top-2">
            <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 px-3">
              Uygulama Sayfaları
            </div>
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavLinkClick(link, e)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-between ${
                    activeMobileTab === link.mobileTab
                      ? 'bg-[#1475bc]/10 dark:bg-[#1475bc]/20 text-[#1475bc] dark:text-[#38a3f5]'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                  }`}
                >
                  <span>{link.label}</span>
                  <span className="text-xs text-zinc-400">→</span>
                </a>
              ))}
            </div>

            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-2">
              <a
                href={`https://wa.me/${settings.whatsapp}?text=Merhaba,%20kuru%20temizleme%20siparişi%20vermek%20istiyorum.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Sipariş Hattı</span>
              </a>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onSelectMobileTab) {
                    onSelectMobileTab('order');
                  } else {
                    onOpenOrder();
                  }
                }}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#1475bc] to-[#2995e6] hover:from-[#10629e] hover:to-[#1475bc] text-white text-xs font-bold shadow-md shadow-[#1475bc]/25 cursor-pointer"
              >
                <span>Hızlı Sipariş Randevusu Al</span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
