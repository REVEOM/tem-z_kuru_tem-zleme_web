export interface ServiceItem {
  id: string;
  title: string;
  shortDesc: string;
  longDesc: string;
  icon: string;
  features: string[];
  startingPrice?: string;
  tag?: string;
}

export const SERVICES: ServiceItem[] = [
  {
    id: 'dry-cleaning',
    title: 'Kuru Temizleme',
    shortDesc: 'Takım elbise, kaban, ipek ve hassas giysileriniz için ekolojik ve lif koruyucu temizlik.',
    longDesc: 'Gelişmiş hidrokarbon ve ekolojik temizleme teknolojimizle kumaş dokusunu ve renk canlılığını koruyarak derinlemesine temizlik sağlıyoruz.',
    icon: 'Sparkles',
    features: ['Ekolojik çözücüler', 'Leke ön inceleme ve çıkarma', 'Kumaş koruma garantisi'],
    startingPrice: '₺140',
    tag: 'En Çok Tercih Edilen'
  },
  {
    id: 'ironing',
    title: 'Profesyonel Ütüleme',
    shortDesc: 'Endüstriyel buharlı pres ve manken ütüleme ile pürüzsüz ve uzun ömürlü form.',
    longDesc: 'Kumaşın liflerine zarar vermeyen optimum ısı ve buhar kontrolü ile giysileriniz jilet gibi ve parlama yapmadan teslim edilir.',
    icon: 'Shirt',
    features: ['Parlama yapmayan pres', 'Hassas buhar kontrolü', 'Askılı teslimat'],
    startingPrice: '₺60'
  },
  {
    id: 'home-textile',
    title: 'Ev Tekstili & Yorgan Yıkama',
    shortDesc: 'Yorgan, battaniye, perde, tül ve masa örtüleriniz için hijyenik yıkama.',
    longDesc: 'Büyük kapasiteli antibakteriyel makinelerimizde kişiye özel yıkama programları ile alerjenlerden arındırılmış tertemiz tekstiller.',
    icon: 'BedDouble',
    features: ['Kişiye özel yıkama', 'Antibakteriyel dezenfeksiyon', 'Özel vakumlu paketleme'],
    startingPrice: '₺250',
    tag: 'Hijyen Garantili'
  },
  {
    id: 'tailoring',
    title: 'Terzi & Tadilat',
    shortDesc: 'Paça boyu, daraltma, fermuar değişimi ve profesyonel giysi onarımları.',
    longDesc: 'Usta terzilerimizin dokunuşuyla giysileriniz tam üzerinize göre uyarlanır ve deforme olmuş parçalar orijinalliği bozulmadan onarılır.',
    icon: 'Scissors',
    features: ['Orijinal dikiş kalitesi', 'Hızlı prova ve teslim', 'Fermuar & astar yenileme'],
    startingPrice: '₺100'
  },
  {
    id: 'leather-suede',
    title: 'Deri & Süet & Lostra',
    shortDesc: 'Deri mont, süet ceket ve ayakkabılarınız için özel bakım, boyama ve yenileme.',
    longDesc: 'Doğal derinin elastikiyetini ve yumuşaklığını koruyan özel yağlama ve boyama teknikleriyle yenilenmiş görünüm.',
    icon: 'Footprints',
    features: ['Doğal yağlama ve yumuşatma', 'Renk yenileme ve boyama', 'Su itici koruyucu katman'],
    startingPrice: '₺450'
  },
  {
    id: 'wedding-dress',
    title: 'Gelinlik & Abiye Bakımı',
    shortDesc: 'Taşlı, dantelli, tül ve hassas el işlemeli gece kıyafetlerine özel hassas bakım.',
    longDesc: 'Her boncuk ve dikiş detayına elle müdahale edilerek hazırlanan, özel saklama kılıfında teslim edilen premium hizmet.',
    icon: 'Crown',
    features: ['El işçiliği leke çıkarma', 'Hassas elyaf koruma', 'Özel koruyucu elbise kılıfı'],
    startingPrice: '₺800',
    tag: 'Premium Servis'
  }
];
