import React from 'react';
import { ArrowRight, Clock, ShieldCheck, Check, Truck, Sparkles } from 'lucide-react';
import { useSettings } from '../context/useSettings';
import { CleaningFoamEffect } from './CleaningFoamEffect';
import temizLogo from '../assets/temiz-logo.svg';

interface HeroProps {
  onOpenOrder: () => void;
  onOpenPrices?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenOrder, onOpenPrices }) => {
  const { settings } = useSettings();
  return (
    <section className="relative overflow-hidden bg-white dark:bg-zinc-950 pt-12 pb-20 lg:pt-20 lg:pb-28 transition-colors">
      {/* Interactive Soap Bubbles & Cleaning Foam Animation */}
      <CleaningFoamEffect onOpenOrder={onOpenOrder} />

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* Left Column: Minimalist Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Subtle Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Kapıdan Kapıya Kuru Temizleme & Ütü</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white leading-[1.12]">
              Kıyafetleriniz için <br className="hidden sm:inline" />
              özenli bakım, <span className="text-[#1475bc] dark:text-[#38a3f5]">kapınızda.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Evinizden veya ofisinizden randevuyla teslim alıyor, kumaş yapısına uygun ekolojik yöntemlerle temizleyip <strong className="text-zinc-900 dark:text-white font-medium">24 saatte</strong> askılı olarak teslim ediyoruz.
            </p>

            {/* Clean Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 max-w-lg mx-auto lg:mx-0 text-left text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#1475bc] dark:text-[#38a3f5] shrink-0" />
                <span>Kumaş lifini yıpratmayan ekolojik temizlik</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#1475bc] dark:text-[#38a3f5] shrink-0" />
                <span>{settings.freeShippingLimit} ₺ ve üzeri ücretsiz kapıdan servis</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#1475bc] dark:text-[#38a3f5] shrink-0" />
                <span>Buharlı pres ile pürüzsüz form</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#1475bc] dark:text-[#38a3f5] shrink-0" />
                <span>Barkodlu takip & giysi sigortası</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={onOpenOrder}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#1475bc] hover:bg-[#10629e] text-white font-semibold text-sm tracking-wide transition-all shadow-md shadow-[#1475bc]/25 active:scale-98 cursor-pointer"
              >
                <span>Hemen Sipariş Ver</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('trigger-foam-clean'))}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#1475bc]/10 hover:bg-[#1475bc]/15 dark:bg-[#1475bc]/20 dark:hover:bg-[#1475bc]/30 border border-[#1475bc]/30 text-[#1475bc] dark:text-[#38a3f5] font-semibold text-sm transition-all active:scale-98 shadow-xs cursor-pointer"
                title="Ekranı köpürt ve sipariş ekranına geç!"
              >
                <span className="text-base animate-pulse">🧼</span>
                <span>Köpürt & Temizle</span>
                <Sparkles className="w-4 h-4 text-[#1475bc] dark:text-[#38a3f5]" />
              </button>

              <a
                href="#fiyatlar"
                onClick={(e) => {
                  if (onOpenPrices) {
                    e.preventDefault();
                    onOpenPrices();
                  }
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-semibold text-sm transition-all cursor-pointer"
              >
                <span>Fiyatları İncele</span>
              </a>
            </div>

            {/* Trust Indicator */}
            <div className="pt-3 flex items-center justify-center lg:justify-start gap-6 text-xs text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>%100 Memnuniyet Garantisi</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-zinc-400" />
                <span>Zamanında Teslim</span>
              </div>
            </div>

          </div>

          {/* Right Column: Minimalist Structured Service Card */}
          <div className="lg:col-span-5">
            <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded-3xl p-6 sm:p-7 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <div className="flex items-center gap-3">
                  <img src={temizLogo} alt="TEMİZ" className="w-9 h-9 rounded-xl shadow-sm shrink-0" />
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-white text-base">Hızlı Servis Süreci</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Siz yorulmayın, kapınızdan alalım</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                  Aktif Servis
                </span>
              </div>

              {/* Steps */}
              <div className="space-y-3.5">
                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800">
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-900 dark:text-white">Randevunuzu Belirleyin</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Adresinizi ve size uygun alım saatini seçin.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800">
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-900 dark:text-white">Kapınızdan Alalım</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Servisimiz eşyalarınızı özel koruma kılıflarında teslim alır.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800">
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-900 dark:text-white">Ekolojik Temizleme & Ütü</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Kumaşa özel leke çıkarma ve buharlı pres işlemi.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800">
                  <div className="w-7 h-7 rounded-lg bg-[#1475bc] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs shadow-[#1475bc]/30">
                    4
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-900 dark:text-white">Askılı Teslimat</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">24 saatte tertemiz ve ütülü kapınızda.</div>
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#1475bc] dark:text-[#38a3f5]" />
                  <span>{settings.freeShippingLimit} ₺ üzeri ücretsiz servis</span>
                </div>
                <button
                  onClick={onOpenOrder}
                  className="font-semibold text-zinc-900 dark:text-white hover:underline"
                >
                  Talep Oluştur →
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
