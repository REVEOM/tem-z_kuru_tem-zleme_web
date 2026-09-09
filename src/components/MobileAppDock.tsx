import React from 'react';
import { Home, Calculator, Sparkles, Clock, Headphones } from 'lucide-react';

export type MobileTab = 'home' | 'prices' | 'order' | 'track' | 'support';

interface MobileAppDockProps {
  activeTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  cartCount?: number;
}

export const MobileAppDock: React.FC<MobileAppDockProps> = ({ 
  activeTab, 
  onSelectTab,
  cartCount = 0
}) => {
  return (
    <nav 
      aria-label="Mobil Uygulama Menüsü" 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-200/90 dark:border-zinc-800/90 px-3 pb-2 pt-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
    >
      <div className="max-w-md mx-auto flex items-center justify-between relative">
        
        {/* TAB 1: HOME */}
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center transition-colors cursor-pointer select-none ${
            activeTab === 'home'
              ? 'text-[#1475bc] dark:text-[#38a3f5] font-bold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <div className="relative">
            <Home className="w-5 h-5" />
            {activeTab === 'home' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1475bc] dark:bg-[#38a3f5]" />
            )}
          </div>
          <span className="text-[10px] mt-1 font-medium tracking-tight">Ana Sayfa</span>
        </button>

        {/* TAB 2: PRICES (Product Catalog & Pricing) */}
        <button
          type="button"
          onClick={() => onSelectTab('prices')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center transition-colors cursor-pointer select-none ${
            activeTab === 'prices'
              ? 'text-[#1475bc] dark:text-[#38a3f5] font-bold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <div className="relative">
            <Calculator className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-[#1475bc] text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
            {activeTab === 'prices' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1475bc] dark:bg-[#38a3f5]" />
            )}
          </div>
          <span className="text-[10px] mt-1 font-medium tracking-tight">Fiyatlar</span>
        </button>

        {/* TAB 3: CENTER PROMINENT ACTION (SİPARİŞ VER) */}
        <div className="flex-1 flex justify-center -mt-5">
          <button
            type="button"
            onClick={() => onSelectTab('order')}
            className={`w-13 h-13 rounded-2xl flex flex-col items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer ${
              activeTab === 'order'
                ? 'bg-gradient-to-tr from-[#1475bc] to-[#2995e6] text-white shadow-[#1475bc]/40 ring-4 ring-[#1475bc]/20'
                : 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-black/20 hover:scale-105'
            }`}
            title="Sipariş Ver"
          >
            <Sparkles className="w-5 h-5 fill-current" />
            <span className="text-[8px] font-bold tracking-tighter uppercase mt-0.5">Sipariş</span>
          </button>
        </div>

        {/* TAB 4: TRACK */}
        <button
          type="button"
          onClick={() => onSelectTab('track')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center transition-colors cursor-pointer select-none ${
            activeTab === 'track'
              ? 'text-[#1475bc] dark:text-[#38a3f5] font-bold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <div className="relative">
            <Clock className="w-5 h-5" />
            {activeTab === 'track' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1475bc] dark:bg-[#38a3f5]" />
            )}
          </div>
          <span className="text-[10px] mt-1 font-medium tracking-tight">Takip</span>
        </button>

        {/* TAB 5: SUPPORT / MORE */}
        <button
          type="button"
          onClick={() => onSelectTab('support')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center transition-colors cursor-pointer select-none ${
            activeTab === 'support'
              ? 'text-[#1475bc] dark:text-[#38a3f5] font-bold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <div className="relative">
            <Headphones className="w-5 h-5" />
            {activeTab === 'support' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1475bc] dark:bg-[#38a3f5]" />
            )}
          </div>
          <span className="text-[10px] mt-1 font-medium tracking-tight">Destek</span>
        </button>

      </div>
    </nav>
  );
};
