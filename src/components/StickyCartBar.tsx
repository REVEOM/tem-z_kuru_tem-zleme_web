import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowRight, Truck, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { useCart } from '../context/useCart';
import { useSettings } from '../context/useSettings';

interface StickyCartBarProps {
  onOpenOrder: () => void;
}

export const StickyCartBar: React.FC<StickyCartBarProps> = ({ onOpenOrder }) => {
  const { cart, totalCount, subtotalAmount, updateQuantity, clearCart, lastUpdated } = useCart();
  const { settings } = useSettings();
  const [isExpanded, setIsExpanded] = useState(false);
  const [justBumped, setJustBumped] = useState(false);

  const FREE_SHIPPING_LIMIT = settings.freeShippingLimit || 350;
  const isFreeCourier = subtotalAmount >= FREE_SHIPPING_LIMIT;
  const remainingForFree = Math.max(0, FREE_SHIPPING_LIMIT - subtotalAmount);

  // Bump bounce effect when an item is added or quantity changes
  useEffect(() => {
    if (totalCount > 0) {
      setJustBumped(true);
      const timer = setTimeout(() => setJustBumped(false), 450);
      return () => clearTimeout(timer);
    }
  }, [lastUpdated, totalCount]);

  if (totalCount === 0) return null;

  return (
    <>
      {/* ========================================================================= */}
      {/* DESKTOP FIXED STICKY CART PILL (Bottom Right Island)                     */}
      {/* ========================================================================= */}
      <div 
        className={`hidden lg:flex fixed bottom-6 right-20 z-40 items-center transition-all duration-300 select-none ${
          justBumped ? 'scale-105' : 'scale-100'
        }`}
      >
        <div className="bg-zinc-950/92 dark:bg-white/95 text-white dark:text-zinc-950 p-2.5 pl-4 rounded-2xl shadow-2xl backdrop-blur-xl border border-zinc-700/60 dark:border-zinc-200/80 flex items-center gap-4.5 ring-4 ring-[#1475bc]/20">
          
          {/* Cart Icon & Item Count */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-[#1475bc] text-white flex items-center justify-center shadow-xs">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center">
                {totalCount}
              </span>
            </div>

            <div>
              <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium leading-none">
                Sepet Tutarı
              </div>
              <div className="text-base font-extrabold text-white dark:text-zinc-950 tracking-tight leading-tight mt-0.5">
                ₺{subtotalAmount}
              </div>
            </div>
          </div>

          {/* Delivery Status Tag */}
          <div className="hidden xl:flex flex-col border-l border-zinc-800 dark:border-zinc-200 pl-3.5">
            {isFreeCourier ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 dark:text-emerald-600">
                <Truck className="w-3.5 h-3.5" />
                <span>ÜCRETSİZ Servis!</span>
              </span>
            ) : (
              <span className="text-[10px] text-zinc-400 dark:text-zinc-600">
                Ücretsiz teslime: <strong>₺{remainingForFree}</strong>
              </span>
            )}
            <span className="text-[9px] text-zinc-500 dark:text-zinc-400">
              Kapıdan alım & 24 saatte teslim
            </span>
          </div>

          {/* Action CTA */}
          <button
            type="button"
            onClick={onOpenOrder}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1475bc] hover:bg-[#10629e] text-white text-xs font-bold transition-all shadow-md shadow-[#1475bc]/25 active:scale-95 cursor-pointer"
          >
            <span>Sipariş Ver</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE FIXED STICKY CART BAR (Pinned above Mobile Dock)                  */}
      {/* ========================================================================= */}
      <div 
        className={`lg:hidden fixed bottom-[64px] left-3 right-3 z-40 transition-all duration-300 select-none ${
          justBumped ? 'scale-[1.02]' : 'scale-100'
        }`}
      >
        {/* Expanded mini-drawer on mobile if user wants to see/edit items */}
        {isExpanded && (
          <div className="mb-2 bg-white dark:bg-zinc-900 rounded-2xl p-3.5 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-2 animate-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <span className="text-xs font-bold text-zinc-900 dark:text-white">Sepetteki Ürünler</span>
              <button
                type="button"
                onClick={clearCart}
                className="text-zinc-400 hover:text-rose-500 text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Boşalt</span>
              </button>
            </div>

            <div className="max-h-36 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
              {Object.entries(cart).map(([key, entry]) => {
                const unitPrice = entry.serviceType === 'iron' && entry.item.ironOnlyPrice
                  ? entry.item.ironOnlyPrice
                  : entry.item.dryCleanPrice;
                return (
                  <div key={key} className="py-1.5 flex items-center justify-between">
                    <span className="text-zinc-800 dark:text-zinc-200 truncate max-w-[160px]">
                      {entry.item.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(key, -1)}
                        className="w-5 h-5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold flex items-center justify-center text-xs"
                      >
                        -
                      </button>
                      <span className="font-bold text-[11px]">{entry.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(key, 1)}
                        className="w-5 h-5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold flex items-center justify-center text-xs"
                      >
                        +
                      </button>
                      <span className="font-bold text-zinc-900 dark:text-white w-10 text-right">
                        ₺{unitPrice * entry.quantity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Floating Capsule */}
        <div className="bg-zinc-950/95 dark:bg-white/95 text-white dark:text-zinc-950 px-3.5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-xl border border-zinc-800/80 dark:border-zinc-200/90 flex items-center justify-between ring-2 ring-[#1475bc]/20">
          
          <div 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2.5 cursor-pointer flex-1 py-0.5"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-[#1475bc] text-white flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] font-extrabold flex items-center justify-center">
                {totalCount}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-white dark:text-zinc-950">
                  ₺{subtotalAmount}
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-600">
                  ({totalCount} Parça)
                </span>
                {isExpanded ? <ChevronDown className="w-3 h-3 text-zinc-400" /> : <ChevronUp className="w-3 h-3 text-zinc-400" />}
              </div>
              <div className="text-[9px] text-emerald-400 dark:text-emerald-600 font-semibold leading-none">
                {isFreeCourier ? '🎉 Teslimat Ücretsiz' : `Ücretsiz teslime: ₺${remainingForFree}`}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenOrder}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1475bc] active:bg-[#10629e] text-white text-xs font-extrabold shadow-sm shadow-[#1475bc]/25 active:scale-95 transition-transform cursor-pointer"
          >
            <span>Sipariş Ver</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

        </div>
      </div>
    </>
  );
};
