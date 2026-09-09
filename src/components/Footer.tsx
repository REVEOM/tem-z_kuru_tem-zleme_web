import React from 'react';
import { Phone, MapPin, Lock } from 'lucide-react';
import { TechLogo } from './TechLogo';
import { useSettings } from '../context/useSettings';

interface FooterProps {
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  const { settings } = useSettings();

  return (
    <footer className="bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 text-xs border-t border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-3">
            <TechLogo size="md" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">
              15 yılı aşkın tecrübemizle hassas giysilerinizi, abiyelerinizi ve ev tekstillerinizi ekolojik yöntemlerle ilk günkü temizliğine kavuşturuyoruz.
            </p>
            <div className="text-[11px] text-zinc-500 space-y-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <a href={`tel:${settings.phoneRaw}`} className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  {settings.phone}
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-white">
              Hızlı Menü
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#hizmetler" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Hizmetlerimiz</a></li>
              <li><a href="#fiyatlar" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Fiyat Listesi</a></li>
              <li><a href="#takip" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Sipariş Takibi</a></li>
              <li><a href="#nasil-calisir" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Nasıl Çalışır?</a></li>
              <li><a href="#siparis" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Sipariş Ver</a></li>
            </ul>
          </div>

          {/* Col 3: Services */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-white">
              Hizmet Alanları
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#hizmetler" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Kuru Temizleme</a></li>
              <li><a href="#hizmetler" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Buharlı Pres Ütü</a></li>
              <li><a href="#hizmetler" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Yorgan & Ev Tekstili</a></li>
              <li><a href="#hizmetler" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Gelinlik & Abiye Bakımı</a></li>
              <li><a href="#hizmetler" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Terzi & Giysi Tadilatı</a></li>
            </ul>
          </div>

          {/* Col 4: Quality Standard */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-white">
              Hizmet Güvencesi
            </h4>
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
              <div className="font-semibold text-zinc-900 dark:text-white text-xs">
                Barkodlu Giysi Sigortası
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Tüm parçalar teslim anında barkodlanarak kayıp ve karışma riskine karşı sigortalanır.
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-400">
          <div>
            © {new Date().getFullYear()} TEMİZ Kuru Temizleme. Tüm hakları saklıdır.
          </div>
          <div className="flex items-center gap-4">
            <span>Kapıdan alım & kapıya teslimat servisi</span>
            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="opacity-40 hover:opacity-100 flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer"
                title="Yönetici Paneli"
              >
                <Lock className="w-2.5 h-2.5" />
                <span>Yönetici Portalı</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
};
