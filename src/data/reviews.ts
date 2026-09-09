export interface ReviewItem {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  service: string;
}

export const REVIEWS: ReviewItem[] = [
  {
    id: 'r-1',
    name: 'Ahmet Yılmaz',
    role: 'Yönetici / Kurumsal Müşteri',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Haftalık takım elbise ve gömleklerimi düzenli veriyorum. Ütü çizgileri kusursuz, kokusuz ve zamanında kapıma teslim ediliyor. Teslimat ekibinin nezaketi de takdire şayan.',
    date: '2 gün önce',
    service: 'Takım Elbise & Gömlek'
  },
  {
    id: 'r-2',
    name: 'Selin Karaca',
    role: 'Mimar',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'İpek elbisemdeki kırmızı şarap lekesini hiçbir zarar vermeden çıkardılar. Başka yer kumaş yanar demişti, burada ilk günkü haline döndü. Gerçekten işinin ehli bir yer!',
    date: 'Geçen hafta',
    service: 'İpek Elbise Leke Çıkarma'
  },
  {
    id: 'r-3',
    name: 'Murat & Gizem Çetinkaya',
    role: 'Ev Sahibi',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Tüm kışlık yorgan ve battaniyelerimizi teslim ettik. Vakumlu ve mis kokulu ambalajlarda geldi. Evden alıp eve teslim etmeleri büyük konfor.',
    date: '2 hafta önce',
    service: 'Yorgan & Ev Tekstili'
  },
  {
    id: 'r-4',
    name: 'Ebru Demirtaş',
    role: 'Avukat',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Gelinliğimi teslim ederken çok tereddüt etmiştim ama sonuç büyüleyici. Tüm tül ve dantel detaylar pırıl pırıl korunmuş, özel kılıfında teslim ettiler.',
    date: '1 ay önce',
    service: 'Gelinlik Kuru Temizleme'
  }
];
