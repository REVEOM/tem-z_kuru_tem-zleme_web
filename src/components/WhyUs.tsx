import { Leaf, Sparkles, Clock, QrCode, CreditCard, Award } from 'lucide-react';

export const WhyUs: React.FC = () => {
  const reasons = [
    {
      icon: Leaf,
      title: 'Ekolojik Kuru Temizleme',
      desc: 'Giysilerin liflerini ve rengini koruyan kokusuz, çevre dostu solventlerle yıkama.',
    },
    {
      icon: Sparkles,
      title: 'Özenli Leke İncelemesi',
      desc: 'Her kumaş tipine özel leke çıkarma yöntemleriyle dokuya zarar vermeden müdahale.',
    },
    {
      icon: Clock,
      title: 'Zamanında Alım & Teslimat',
      desc: 'Seçtiğiniz saat aralığına sadık kalan kapıdan teslimat servisiyle vakit kaybetmeyin.',
    },
    {
      icon: QrCode,
      title: 'Barkodlu Giysi Takibi',
      desc: 'Her parça teslim alındığı andan itibaren barkodlanır; karışma riski sıfırdır.',
    },
    {
      icon: Award,
      title: 'Bireysel Hijyen Standartları',
      desc: 'Çamaşır ve ev tekstili ürünleriniz asla başka müşterilerin eşyalarıyla temas etmez.',
    },
    {
      icon: CreditCard,
      title: 'Kapıda Kolay Ödeme',
      desc: 'Teslimatta kapıda nakit veya temassız kredi kartı ile güvenle ödeme yapın.',
    }
  ];

  return (
    <section id="neden-biz" className="py-20 bg-zinc-50/50 dark:bg-zinc-950/50 border-t border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold text-[#1475bc] dark:text-[#38a3f5] uppercase tracking-wider">
            Neden Biz?
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mt-2">
            Özenli Hizmet, Güvenilir Sonuç
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2.5">
            Sadece temizlemiyoruz; kıyafetlerinizin ömrünü ve formunu ilk günkü gibi koruyoruz.
          </p>
        </div>

        {/* Reasons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white">
                  <Icon className="w-5 h-5" />
                </div>
                
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  {item.title}
                </h3>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Minimalist Metrics */}
        <div className="mt-14 pt-10 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">50.000+</div>
            <div className="text-xs text-zinc-500 mt-1">Yıllık Temizlenen Parça</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">%99</div>
            <div className="text-xs text-zinc-500 mt-1">Leke Çıkarma Başarısı</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">15+ Yıl</div>
            <div className="text-xs text-zinc-500 mt-1">Sektör Tecrübesi</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">24 Saat</div>
            <div className="text-xs text-zinc-500 mt-1">Ortalama Teslimat</div>
          </div>
        </div>

      </div>
    </section>
  );
};
