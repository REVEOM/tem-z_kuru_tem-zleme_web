import React from 'react';
import { Phone, Mail, MapPin, Clock, Truck, MessageCircle } from 'lucide-react';
import { useSettings } from '../context/useSettings';

export const ContactSection: React.FC = () => {
  const { settings } = useSettings();

  return (
    <section id="iletisim" className="py-20 bg-zinc-50/50 dark:bg-zinc-950/50 border-t border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold text-zinc-900 dark:text-white uppercase tracking-wider px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            İletişim & Lokasyon
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mt-3">
            Bize Ulaşın
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2.5">
            Dilerseniz şubemizi ziyaret edebilir, dilerseniz kapıdan teslimat randevusu oluşturabilirsiniz.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Direct Channels */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h3 className="font-bold text-zinc-900 dark:text-white text-base border-b border-zinc-100 dark:border-zinc-800 pb-3">
              İletişim Bilgileri
            </h3>

            <div className="space-y-3 text-xs">
              <a 
                href={`tel:${settings.phoneRaw}`} 
                className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                </div>
                <div>
                  <div className="text-[11px] text-zinc-400">Müşteri Hizmetleri</div>
                  <div className="font-semibold text-zinc-900 dark:text-white">{settings.phone}</div>
                </div>
              </a>

              <a 
                href={`https://wa.me/${settings.whatsapp}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="text-[11px] text-zinc-400">WhatsApp Hattı</div>
                  <div className="font-semibold text-zinc-900 dark:text-white">{settings.phone}</div>
                </div>
              </a>

              <a 
                href={`mailto:${settings.email}`} 
                className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                </div>
                <div>
                  <div className="text-[11px] text-zinc-400">E-Posta</div>
                  <div className="font-semibold text-zinc-900 dark:text-white">{settings.email}</div>
                </div>
              </a>
            </div>

            <div className="pt-2 text-xs text-zinc-500 dark:text-zinc-400 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-zinc-700 dark:text-zinc-300 shrink-0 mt-0.5" />
              <span>{settings.address}</span>
            </div>
          </div>

          {/* Card 2: Hours & Coverage */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h3 className="font-bold text-zinc-900 dark:text-white text-base border-b border-zinc-100 dark:border-zinc-800 pb-3">
              Çalışma Saatleri & Servis Bölgeleri
            </h3>

            <div className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-300">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-zinc-400" />
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-white">Pazartesi — Cumartesi</div>
                  <div className="text-[11px] text-zinc-500">{settings.workingHoursWeekday} (Servis Saatleri)</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-zinc-400" />
                <div>
                  <div className="font-semibold text-zinc-500">Pazar Günü</div>
                  <div className="text-[11px] text-zinc-400">{settings.workingHoursWeekend}</div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5 mb-2.5">
                <Truck className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" /> Servis Hizmeti Verilen Semtler:
              </span>
              <div className="flex flex-wrap gap-1.5 text-xs">
                {settings.districts.map((d) => (
                  <span key={d} className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md text-[11px]">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: Courier Callout */}
          <div className="bg-zinc-900 dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-800 text-white flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                Kapıdan Kapıya Servis
              </span>
              <h3 className="text-xl font-bold">
                Giysilerinizi Kapınızdan Teslim Alalım
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Trafikle ya da poşet taşımakla uğraşmayın. Uzman ekibimiz adresinize gelsin, temizleyip askılı geri getirsin.
              </p>
              
              <ul className="text-xs text-zinc-400 space-y-1.5 pt-2">
                <li>• ₺{settings.freeShippingLimit} ve üzeri ücretsiz servis</li>
                <li>• Barkodlu giysi güvencesi</li>
                <li>• Kapıda nakit veya kartla ödeme</li>
              </ul>
            </div>

            <div className="mt-6">
              <a
                href="#siparis"
                className="w-full inline-flex items-center justify-center py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-semibold text-xs transition-colors"
              >
                Hemen Sipariş Ver
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
