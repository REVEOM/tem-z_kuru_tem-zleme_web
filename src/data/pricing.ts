export interface PriceItem {
  id: string;
  name: string;
  category: 'erkek' | 'kadin' | 'ev' | 'deri' | 'tadilat';
  dryCleanPrice: number; // Kuru Temizleme + Ütü fiyatı
  ironOnlyPrice?: number; // Sadece Ütü fiyatı
  unit: string;
  popular?: boolean;
}

export const CATEGORIES = [
  { id: 'all', label: 'Tüm Hizmetler' },
  { id: 'erkek', label: 'Erkek Giyim' },
  { id: 'kadin', label: 'Kadın Giyim' },
  { id: 'ev', label: 'Ev & Tekstil' },
  { id: 'deri', label: 'Deri & Lostra' },
  { id: 'tadilat', label: 'Terzi & Tadilat' },
] as const;

export const PRICING_ITEMS: PriceItem[] = [
  // Erkek Giyim
  { id: 'e-takim', name: 'Takım Elbise (2 Parça)', category: 'erkek', dryCleanPrice: 320, ironOnlyPrice: 160, unit: 'Adet', popular: true },
  { id: 'e-ceket', name: 'Ceket / Blazer', category: 'erkek', dryCleanPrice: 200, ironOnlyPrice: 100, unit: 'Adet' },
  { id: 'e-pantolon', name: 'Pantolon (Kumaş / Jean)', category: 'erkek', dryCleanPrice: 130, ironOnlyPrice: 70, unit: 'Adet', popular: true },
  { id: 'e-gomlek', name: 'Gömlek', category: 'erkek', dryCleanPrice: 90, ironOnlyPrice: 50, unit: 'Adet', popular: true },
  { id: 'e-kaban', name: 'Kaban / Palto', category: 'erkek', dryCleanPrice: 340, ironOnlyPrice: 170, unit: 'Adet' },
  { id: 'e-mont', name: 'Mont / Şişme Mont', category: 'erkek', dryCleanPrice: 290, ironOnlyPrice: 140, unit: 'Adet' },
  { id: 'e-kazak', name: 'Kazak / Triko', category: 'erkek', dryCleanPrice: 110, ironOnlyPrice: 60, unit: 'Adet' },
  { id: 'e-yelek', name: 'Yelek', category: 'erkek', dryCleanPrice: 100, ironOnlyPrice: 50, unit: 'Adet' },
  { id: 'e-kravat', name: 'Kravat / Papyon', category: 'erkek', dryCleanPrice: 70, ironOnlyPrice: 40, unit: 'Adet' },

  // Kadın Giyim
  { id: 'k-elbise', name: 'Günlük Elbise', category: 'kadin', dryCleanPrice: 220, ironOnlyPrice: 110, unit: 'Adet', popular: true },
  { id: 'k-abiye', name: 'Abiye / Gece Elbisesi', category: 'kadin', dryCleanPrice: 490, ironOnlyPrice: 250, unit: 'Adet' },
  { id: 'k-gelinlik', name: 'Gelinlik (Özel İşlem)', category: 'kadin', dryCleanPrice: 1200, unit: 'Adet' },
  { id: 'k-etek', name: 'Etek / Pileli Etek', category: 'kadin', dryCleanPrice: 130, ironOnlyPrice: 70, unit: 'Adet' },
  { id: 'k-bluz', name: 'Bluz / İpek Gömlek', category: 'kadin', dryCleanPrice: 110, ironOnlyPrice: 60, unit: 'Adet', popular: true },
  { id: 'k-trenckot', name: 'Trençkot / Pardösü', category: 'kadin', dryCleanPrice: 310, ironOnlyPrice: 160, unit: 'Adet' },
  { id: 'k-tulum', name: 'Tulum', category: 'kadin', dryCleanPrice: 240, ironOnlyPrice: 120, unit: 'Adet' },
  { id: 'k-sal', name: 'İpek Şal / Eşarp', category: 'kadin', dryCleanPrice: 90, ironOnlyPrice: 50, unit: 'Adet' },

  // Ev Tekstili
  { id: 'ev-yorgan-tek', name: 'Yorgan (Tek Kişilik Elyaf)', category: 'ev', dryCleanPrice: 240, unit: 'Adet' },
  { id: 'ev-yorgan-cift', name: 'Yorgan (Çift Kişilik / Yün / Kaz Tüyü)', category: 'ev', dryCleanPrice: 320, unit: 'Adet', popular: true },
  { id: 'ev-battaniye', name: 'Battaniye (Çift Kişilik)', category: 'ev', dryCleanPrice: 220, unit: 'Adet' },
  { id: 'ev-tul-perde', name: 'Tül / Fon Perde (m²)', category: 'ev', dryCleanPrice: 55, ironOnlyPrice: 30, unit: 'm²' },
  { id: 'ev-yastik', name: 'Yastık (Elyaf / Yün)', category: 'ev', dryCleanPrice: 110, unit: 'Adet' },
  { id: 'ev-masa-ortusu', name: 'Masa Örtüsü', category: 'ev', dryCleanPrice: 140, ironOnlyPrice: 70, unit: 'Adet' },

  // Deri & Lostra
  { id: 'deri-mont', name: 'Deri Mont / Ceket', category: 'deri', dryCleanPrice: 650, unit: 'Adet' },
  { id: 'deri-kaban', name: 'Deri / Süet Kaban', category: 'deri', dryCleanPrice: 850, unit: 'Adet' },
  { id: 'deri-canta', name: 'Deri Çanta Bakım & Boyama', category: 'deri', dryCleanPrice: 420, unit: 'Adet' },
  { id: 'deri-ayakkabi', name: 'Lostra / Ayakkabı Boya & Bakım', category: 'deri', dryCleanPrice: 240, unit: 'Çift' },

  // Terzi & Tadilat
  { id: 'tadilat-paca', name: 'Pantolon Paça Kısaltma', category: 'tadilat', dryCleanPrice: 100, unit: 'Adet', popular: true },
  { id: 'tadilat-daraltma', name: 'Beden / Bel Daraltma', category: 'tadilat', dryCleanPrice: 160, unit: 'Adet' },
  { id: 'tadilat-fermuar', name: 'Fermuar Değişimi', category: 'tadilat', dryCleanPrice: 140, unit: 'Adet' },
  { id: 'tadilat-kol-boyu', name: 'Ceket Kol Boyu Ayarlama', category: 'tadilat', dryCleanPrice: 220, unit: 'Adet' },
];
