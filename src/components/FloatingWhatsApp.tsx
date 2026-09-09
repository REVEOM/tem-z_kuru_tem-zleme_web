import React from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { useSettings } from '../context/useSettings';
import { useCart } from '../context/useCart';

export const FloatingWhatsApp: React.FC = () => {
  const { settings } = useSettings();
  const { totalCount } = useCart();

  // Provide fallback for phoneRaw in case settings haven't loaded yet
  const phoneHref = settings.phoneRaw || settings.phone?.replace(/\s/g, '').replace(/[()]/g, '') || '#';

  return (
    <aside 
      aria-label="Hızlı İletişim Butonları" 
      className={`fixed ${totalCount > 0 ? 'bottom-[132px]' : 'bottom-20'} lg:bottom-6 right-4 lg:right-6 z-40 flex flex-col gap-2 items-end transition-all duration-300`}
    >
      {/* Quick Phone Call Button */}
      <a
        href={`tel:${phoneHref}`}
        className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 shadow-md flex items-center justify-center hover:scale-105 transition-transform border border-zinc-200 dark:border-zinc-800"
        title={settings.phone}
      >
        <Phone className="w-4 h-4" />
      </a>

      {/* WhatsApp Floating Button */}
      <a
        href={`https://wa.me/${settings.whatsapp}?text=Merhaba,%20kuru%20temizleme%20sipari%C5%9Fi%20vermek%20istiyorum.`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2.5 rounded-full shadow-md hover:scale-105 transition-all text-xs font-medium"
        title="WhatsApp Sipariş Hattı"
      >
        <MessageCircle className="w-4 h-4" />
        <span className="hidden sm:inline">WhatsApp Destek</span>
      </a>
    </aside>
  );
};
