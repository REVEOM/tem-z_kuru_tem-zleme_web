export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'genel' | 'teslimat' | 'bakim' | 'odeme';
}

export const FAQS: FaqItem[] = [
  {
    id: 'f-1',
    question: 'Ürünlerim ne kadar sürede teslim edilir?',
    answer: 'Standart kuru temizleme ve ütü siparişleriniz 24 ila 48 saat içerisinde teslim edilir. Gelinlik, deri, perde ve yoğun leke işlemi gerektiren özel parçalar için süre 3-4 iş günü sürebilmektedir. Acil ihtiyaçlarınız için ekspres (aynı gün) servisimiz de mevcuttur.',
    category: 'teslimat'
  },
  {
    id: 'f-2',
    question: 'Kapıdan alım ve teslimat için servis ücreti alıyor musunuz?',
    answer: 'Hizmet bölgelerimiz içinde belirlenen minimum sepet tutarını (örneğin 350 ₺) aşan tüm siparişlerde kapıdan alım ve kapıya teslimat tamamen ücretsizdir.',
    category: 'teslimat'
  },
  {
    id: 'f-3',
    question: 'Zorlu lekeler (şarap, yağ, kahve, mürekkep) tamamen çıkar mı?',
    answer: 'Uzman ekibimiz lekeye kumaş türüne özel profesyonel leke sökücülerle ön müdahale uygular. Yeni oluşmuş ve daha önce evde kimyasal/sıcak suyla müdahale edilmemiş lekelerde başarı oranımız %95\'in üzerindedir. Kumaş lifine zarar vermeden mümkün olan en yüksek sonucu hedefleriz.',
    category: 'bakim'
  },
  {
    id: 'f-4',
    question: 'Kullandığınız temizlik malzemeleri giysilere veya sağlığa zararlı mı?',
    answer: 'Kesinlikle hayır. Tesisimizde AB standartlarına uygun, dermatolojik olarak test edilmiş, kanserojen perkloroetilen içermeyen ekolojik ve kokusuz hidrokarbon temizleme sistemleri kullanılmaktadır. Bebek kıyafetleri ve alerjik bünyeler için de tamamen güvenlidir.',
    category: 'bakim'
  },
  {
    id: 'f-5',
    question: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
    answer: 'Kapıda nakit, kapıda temassız kredi kartı / banka kartı ve online havale/EFT seçenekleriyle rahatlıkla ödeme yapabilirsiniz.',
    category: 'odeme'
  },
  {
    id: 'f-6',
    question: 'Giysilerim kaybolur ya da zarar görürse ne olur?',
    answer: 'Tüm giysileriniz teslim alındığı andan itibaren barkodlu takip sistemiyle izlenir ve sigorta kapsamındadır. Herhangi bir olumsuzluk durumunda kurumsal garanti protokolümüz devreye girer ve zararınız telafi edilir.',
    category: 'genel'
  }
];
