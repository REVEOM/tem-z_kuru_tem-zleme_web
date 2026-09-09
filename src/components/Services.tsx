import React from 'react';
import type { ServiceItem } from '../data/services';
import { useSettings } from '../context/useSettings';
import { Sparkles, Shirt, BedDouble, Scissors, Footprints, Crown, Check, ArrowRight } from 'lucide-react';

interface ServicesProps {
  onSelectService: (serviceName: string) => void;
}

export const Services: React.FC<ServicesProps> = ({ onSelectService }) => {
  const { services, settings } = useSettings();
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-[#1475bc] dark:text-[#38a3f5]" />;
      case 'Shirt':
        return <Shirt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'BedDouble':
        return <BedDouble className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
      case 'Scissors':
        return <Scissors className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'Footprints':
        return <Footprints className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'Crown':
        return <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#1475bc] dark:text-[#38a3f5]" />;
    }
  };

  return (
    <section id="hizmetler" className="py-20 bg-zinc-50/50 dark:bg-zinc-950/50 border-t border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold text-[#1475bc] dark:text-[#38a3f5] uppercase tracking-wider">
            Hizmetlerimiz
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mt-2">
            Özenle Sunulan Kuru Temizleme Çözümleri
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed">
            Hassas kumaşlardan ev tekstiline kadar her giysi kendi yapısına en uygun ekolojik yöntemlerle temizlenir.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((item: ServiceItem) => (
            <div
              key={item.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    {getIcon(item.icon)}
                  </div>
                  {item.tag && (
                    <span className="text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-2.5 py-0.5 rounded-full">
                      {item.tag}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  {item.title}
                </h3>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                  {item.shortDesc}
                </p>

                <ul className="mt-4 space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-3 text-xs text-zinc-600 dark:text-zinc-400">
                  {item.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-3.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#1475bc] dark:text-[#38a3f5]">
                  Kapıdan Alım & Askılı Teslim
                </span>

                <button
                  type="button"
                  onClick={() => onSelectService(item.title)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <span>Sipariş Randevusu Al</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Kurumsal Banner */}
        <div className="mt-12 rounded-2xl p-6 sm:p-8 bg-zinc-900 dark:bg-zinc-900 border border-zinc-800 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <h3 className="text-lg font-bold">Kurumsal veya Toplu Temizleme Talepleri</h3>
            <p className="text-xs text-zinc-400 max-w-xl">
              Restoranlar, ofisler, klinikler ve özel atölyeler için düzenli servis rotası ve kurumsal fiyat avantajı sağlıyoruz.
            </p>
          </div>

          <a
            href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent('Merhaba, kurumsal kuru temizleme teklifi almak istiyorum.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-xs transition-colors"
          >
            Kurumsal Teklif Al
          </a>
        </div>

      </div>
    </section>
  );
};
