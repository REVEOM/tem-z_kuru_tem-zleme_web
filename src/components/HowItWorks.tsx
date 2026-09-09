import React from 'react';
import { Calendar, Truck, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface HowItWorksProps {
  onOpenOrder: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onOpenOrder }) => {
  const steps = [
    {
      number: '01',
      title: 'Sipariş Talebi Verin',
      desc: 'Adresinizi ve uygun olduğunuz zaman aralığını seçin.',
      icon: Calendar,
    },
    {
      number: '02',
      title: 'Kapınızdan Alalım',
      desc: 'Servisimiz eşyalarınızı özel koruma kılıflarında teslim alsın.',
      icon: Truck,
    },
    {
      number: '03',
      title: 'Ekolojik Temizleme',
      desc: 'Kumaş türüne özel leke çıkarma ve buharlı pres ütüleme.',
      icon: Sparkles,
    },
    {
      number: '04',
      title: 'Askılı Teslimat',
      desc: '24 saat içinde kapınıza ütülenmiş ve korumalı şekilde teslim.',
      icon: CheckCircle2,
    }
  ];

  return (
    <section id="nasil-calisir" className="py-20 bg-white dark:bg-zinc-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold text-[#1475bc] dark:text-[#38a3f5] uppercase tracking-wider">
            Nasıl Çalışır?
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mt-2">
            4 Kolay Adımda Kuru Temizleme
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2.5">
            Kuru temizlemeci aramakla ya da eşya taşımakla vakit kaybetmeyin.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.number}
                className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-900 dark:text-white">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-bold font-mono text-zinc-300 dark:text-zinc-700">
                    {step.number}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={onOpenOrder}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 font-semibold text-xs tracking-wide transition-all shadow-sm"
          >
            <span>Sipariş Randevusu Al</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </section>
  );
};
