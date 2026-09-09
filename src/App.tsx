import { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';
import { CartProvider } from './context/CartContext';
import { useCart } from './context/useCart';
import { useSettings } from './context/useSettings';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { UnifiedOrderSection } from './components/UnifiedOrderSection';
import { StickyCartBar } from './components/StickyCartBar';
import { OrderTracking } from './components/OrderTracking';
import { HowItWorks } from './components/HowItWorks';
import { WhyUs } from './components/WhyUs';
import { ReviewsSection } from './components/ReviewsSection';
import { FaqSection } from './components/FaqSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { MobileAppDock, type MobileTab } from './components/MobileAppDock';
import { MobileAppCategories } from './components/MobileAppCategories';
import { AdminPortal } from './components/admin/AdminPortal';
import { ChevronLeft } from 'lucide-react';

function AppContent() {
  const { settings } = useSettings();
  const { totalCount } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('home');

  // Obfuscated / Encrypted Gate URL check
  // Public strings like #admin or /admin do NOT open the panel.
  // Only the secret gate slug works: e.g. #gate_7f9a8b1c4e2d309 or ?gate=gate_7f9a8b1c4e2d309
  useEffect(() => {
    const checkAdminTrigger = () => {
      const hash = window.location.hash.replace(/^#/, '');
      const search = new URLSearchParams(window.location.search);
      const gateQuery = search.get('gate');
      const expectedSlug = settings.adminGateSlug || 'gate_7f9a8b1c4e2d309';

      if (hash === expectedSlug || gateQuery === expectedSlug) {
        setIsAdminOpen(true);
      }
    };

    checkAdminTrigger();
    window.addEventListener('hashchange', checkAdminTrigger);
    return () => window.removeEventListener('hashchange', checkAdminTrigger);
  }, [settings.adminGateSlug]);

  // Keyboard shortcut (Ctrl+Shift+A or Cmd+Shift+A) for discrete admin access
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenOrder = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileTab('order');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById('siparis') || document.getElementById('kurye-cagir');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleOpenPrices = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileTab('prices');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById('fiyatlar');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileTab('prices');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById('fiyatlar');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleSelectMobileTab = (tab: MobileTab) => {
    setMobileTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    const expectedSlug = settings.adminGateSlug || 'gate_7f9a8b1c4e2d309';
    if (window.location.hash.replace(/^#/, '') === expectedSlug) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const getMobileTabTitle = () => {
    switch (mobileTab) {
      case 'prices': return 'Fiyat Listesi & Sepet';
      case 'order': return 'Sipariş Randevusu';
      case 'track': return 'Canlı Sipariş Takibi';
      case 'support': return 'Destek & İletişim';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-blue-500 selection:text-white transition-colors duration-200">
      {/* Navigation */}
      <Navbar 
        onOpenOrder={handleOpenOrder} 
        onOpenAdmin={() => setIsAdminOpen(true)}
        activeMobileTab={mobileTab}
        onSelectMobileTab={handleSelectMobileTab}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* DESKTOP VIEW: Continuous High-End Landing Page With Side-by-Side Unified Pricing & Order */}
        <div className="hidden lg:block">
          <Hero onOpenOrder={handleOpenOrder} onOpenPrices={handleOpenPrices} />
          <Services onSelectService={() => handleOpenOrder()} />
          <HowItWorks onOpenOrder={handleOpenOrder} />
          <WhyUs />
          
          {/* MASTER UNIFIED PRICING & COURIER ORDERING SECTION */}
          <UnifiedOrderSection 
            initialCategory={selectedCategory}
            onViewTracking={() => {
              const el = document.getElementById('takip');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          <OrderTracking />
          <ReviewsSection />
          <FaqSection />
          <ContactSection />
        </div>

        {/* MOBILE VIEW: True Native Mobile App Experience */}
        <div className="lg:hidden pb-20">
          {/* Subtle Sticky App Sub-Bar (When inside an inner tab) */}
          {mobileTab !== 'home' && (
            <div className="sticky top-[53px] z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 py-2.5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleSelectMobileTab('home')}
                className="flex items-center gap-1 text-xs font-semibold text-[#1475bc] dark:text-[#38a3f5] py-1 px-2 -ml-2 rounded-lg active:bg-[#1475bc]/10 dark:active:bg-zinc-800 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anasayfa</span>
              </button>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate px-2">
                {getMobileTabTitle()}
              </span>
              <div className="w-10" />
            </div>
          )}

          {/* TAB 1: HOME (Story Bubbles, Hero, Quick Highlights) */}
          {mobileTab === 'home' && (
            <div className="animate-in fade-in duration-200">
              {/* Category Story Bubbles */}
              <MobileAppCategories
                onSelectCategory={(categoryId) => handleSelectCategory(categoryId)}
                onTriggerFoam={() => {
                  window.dispatchEvent(new CustomEvent('trigger-foam-clean'));
                }}
              />

              <Hero onOpenOrder={handleOpenOrder} onOpenPrices={handleOpenPrices} />
              <Services onSelectService={() => handleOpenOrder()} />
              <HowItWorks onOpenOrder={handleOpenOrder} />
              <WhyUs />
              <ReviewsSection />
              <Footer onOpenAdmin={() => setIsAdminOpen(true)} />
            </div>
          )}

          {/* TAB 2: PRICES (Unified Order Section focused on Product Picker) */}
          {mobileTab === 'prices' && (
            <div className="animate-in fade-in duration-200">
              <UnifiedOrderSection 
                defaultTab="products"
                initialCategory={selectedCategory}
                onViewTracking={() => handleSelectMobileTab('track')}
              />
            </div>
          )}

          {/* TAB 3: ORDER (Unified Order Section focused on Courier Booking Form) */}
          {mobileTab === 'order' && (
            <div className="animate-in fade-in duration-200">
              <UnifiedOrderSection 
                defaultTab="checkout"
                initialCategory={selectedCategory}
                onViewTracking={() => handleSelectMobileTab('track')}
              />
            </div>
          )}

          {/* TAB 4: TRACK (Direct Realistic Tracking Screen at Top) */}
          {mobileTab === 'track' && (
            <div className="animate-in fade-in duration-200">
              <OrderTracking />
            </div>
          )}

          {/* TAB 5: SUPPORT (Support Contact & FAQ) */}
          {mobileTab === 'support' && (
            <div className="animate-in fade-in duration-200 space-y-4">
              <ContactSection />
              <FaqSection />
              <Footer onOpenAdmin={() => setIsAdminOpen(true)} />
            </div>
          )}
        </div>
      </main>

      {/* Desktop Footer */}
      <div className="hidden lg:block">
        <Footer onOpenAdmin={() => setIsAdminOpen(true)} />
      </div>

      {/* Native-Style Mobile Bottom App Dock */}
      <MobileAppDock
        activeTab={mobileTab}
        onSelectTab={handleSelectMobileTab}
        cartCount={totalCount}
      />

      {/* Floating WhatsApp Action */}
      <FloatingWhatsApp />

      {/* Global Sticky Cart Floating Island (Visible whenever cart has items) */}
      <StickyCartBar onOpenOrder={handleOpenOrder} />

      {/* Admin Portal Modal */}
      {isAdminOpen && <AdminPortal onClose={handleCloseAdmin} />}
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;
