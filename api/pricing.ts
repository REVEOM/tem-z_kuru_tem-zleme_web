import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './db.js';

function isAdminAuthed(req: VercelRequest): boolean {
  const token = req.headers['x-admin-token'];
  return typeof token === 'string' && token.startsWith('auth_') && token.length === 69;
}

// Statik varsayılan fiyatlar — DB boşsa buradan seed atılır
const SEED_PRICING: Record<string, unknown>[] = [
  { id: 'e-takim', name: 'Takım Elbise (2 Parça)', category: 'erkek', dryCleanPrice: 320, ironOnlyPrice: 160, unit: 'Adet', popular: true },
  { id: 'e-ceket', name: 'Ceket / Blazer', category: 'erkek', dryCleanPrice: 200, ironOnlyPrice: 100, unit: 'Adet', popular: false },
  { id: 'e-pantolon', name: 'Pantolon (Kumaş / Jean)', category: 'erkek', dryCleanPrice: 130, ironOnlyPrice: 70, unit: 'Adet', popular: true },
  { id: 'e-gomlek', name: 'Gömlek', category: 'erkek', dryCleanPrice: 90, ironOnlyPrice: 50, unit: 'Adet', popular: true },
  { id: 'e-kaban', name: 'Kaban / Palto', category: 'erkek', dryCleanPrice: 340, ironOnlyPrice: 170, unit: 'Adet', popular: false },
  { id: 'e-mont', name: 'Mont / Şişme Mont', category: 'erkek', dryCleanPrice: 290, ironOnlyPrice: 140, unit: 'Adet', popular: false },
  { id: 'e-kazak', name: 'Kazak / Triko', category: 'erkek', dryCleanPrice: 110, ironOnlyPrice: 60, unit: 'Adet', popular: false },
  { id: 'e-yelek', name: 'Yelek', category: 'erkek', dryCleanPrice: 100, ironOnlyPrice: 50, unit: 'Adet', popular: false },
  { id: 'e-kravat', name: 'Kravat / Papyon', category: 'erkek', dryCleanPrice: 70, ironOnlyPrice: 40, unit: 'Adet', popular: false },
  { id: 'k-elbise', name: 'Günlük Elbise', category: 'kadin', dryCleanPrice: 220, ironOnlyPrice: 110, unit: 'Adet', popular: true },
  { id: 'k-abiye', name: 'Abiye / Gece Elbisesi', category: 'kadin', dryCleanPrice: 490, ironOnlyPrice: 250, unit: 'Adet', popular: false },
  { id: 'k-gelinlik', name: 'Gelinlik (Özel İşlem)', category: 'kadin', dryCleanPrice: 1200, ironOnlyPrice: null, unit: 'Adet', popular: false },
  { id: 'k-etek', name: 'Etek / Pileli Etek', category: 'kadin', dryCleanPrice: 130, ironOnlyPrice: 70, unit: 'Adet', popular: false },
  { id: 'k-bluz', name: 'Bluz / İpek Gömlek', category: 'kadin', dryCleanPrice: 110, ironOnlyPrice: 60, unit: 'Adet', popular: true },
  { id: 'k-trenckot', name: 'Trençkot / Pardösü', category: 'kadin', dryCleanPrice: 310, ironOnlyPrice: 160, unit: 'Adet', popular: false },
  { id: 'k-tulum', name: 'Tulum', category: 'kadin', dryCleanPrice: 240, ironOnlyPrice: 120, unit: 'Adet', popular: false },
  { id: 'k-sal', name: 'İpek Şal / Eşarp', category: 'kadin', dryCleanPrice: 90, ironOnlyPrice: 50, unit: 'Adet', popular: false },
  { id: 'ev-yorgan-tek', name: 'Yorgan (Tek Kişilik Elyaf)', category: 'ev', dryCleanPrice: 240, ironOnlyPrice: null, unit: 'Adet', popular: false },
  { id: 'ev-yorgan-cift', name: 'Yorgan (Çift Kişilik / Yün / Kaz Tüyü)', category: 'ev', dryCleanPrice: 320, ironOnlyPrice: null, unit: 'Adet', popular: true },
  { id: 'ev-battaniye', name: 'Battaniye (Çift Kişilik)', category: 'ev', dryCleanPrice: 220, ironOnlyPrice: null, unit: 'Adet', popular: false },
  { id: 'ev-tul-perde', name: 'Tül / Fon Perde (m²)', category: 'ev', dryCleanPrice: 55, ironOnlyPrice: 30, unit: 'm²', popular: false },
  { id: 'ev-yastik', name: 'Yastık (Elyaf / Yün)', category: 'ev', dryCleanPrice: 110, ironOnlyPrice: null, unit: 'Adet', popular: false },
  { id: 'ev-masa-ortusu', name: 'Masa Örtüsü', category: 'ev', dryCleanPrice: 140, ironOnlyPrice: 70, unit: 'Adet', popular: false },
  { id: 'deri-mont', name: 'Deri Mont / Ceket', category: 'deri', dryCleanPrice: 650, ironOnlyPrice: null, unit: 'Adet', popular: false },
  { id: 'deri-kaban', name: 'Deri / Süet Kaban', category: 'deri', dryCleanPrice: 850, ironOnlyPrice: null, unit: 'Adet', popular: false },
  { id: 'deri-canta', name: 'Deri Çanta Bakım & Boyama', category: 'deri', dryCleanPrice: 420, ironOnlyPrice: null, unit: 'Adet', popular: false },
  { id: 'deri-ayakkabi', name: 'Lostra / Ayakkabı Boya & Bakım', category: 'deri', dryCleanPrice: 240, ironOnlyPrice: null, unit: 'Çift', popular: false },
  { id: 'tadilat-paca', name: 'Pantolon Paça Kısaltma', category: 'tadilat', dryCleanPrice: 100, ironOnlyPrice: null, unit: 'Adet', popular: true },
  { id: 'tadilat-daraltma', name: 'Beden / Bel Daraltma', category: 'tadilat', dryCleanPrice: 160, ironOnlyPrice: null, unit: 'Adet', popular: false },
  { id: 'tadilat-fermuar', name: 'Fermuar Değişimi', category: 'tadilat', dryCleanPrice: 140, ironOnlyPrice: null, unit: 'Adet', popular: false },
  { id: 'tadilat-kol-boyu', name: 'Ceket Kol Boyu Ayarlama', category: 'tadilat', dryCleanPrice: 220, ironOnlyPrice: null, unit: 'Adet', popular: false },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');

  // ── GET /api/pricing  (public)
  if (req.method === 'GET') {
    const { data: items, error } = await supabase
      .from('pricing_items')
      .select('*')
      .order('category')
      .order('name');
      
    if (error) return res.status(500).json({ error: error.message });

    // Tablo boşsa statik verilerden seed at
    if (!items || items.length === 0) {
      const { data: seeded, error: seedError } = await supabase
        .from('pricing_items')
        .upsert(SEED_PRICING, { onConflict: 'id' })
        .select();
      if (seedError) {
        // Seed başarısız olsa bile statik veriyi döndür
        return res.status(200).json(SEED_PRICING);
      }
      return res.status(200).json(seeded ?? SEED_PRICING);
    }

    return res.status(200).json(items);
  }

  // ── POST /api/pricing  (admin only — add new item)
  if (req.method === 'POST') {
    if (!isAdminAuthed(req)) {
      return res.status(401).json({ error: 'Yetkisiz erişim.' });
    }
    const { item } = req.body as { item: Record<string, unknown> };
    if (!item?.id || !item?.name) {
      return res.status(400).json({ error: 'id ve name alanları zorunludur.' });
    }
    
    // UPSERT
    const { data: created, error } = await supabase
      .from('pricing_items')
      .upsert(item, { onConflict: 'id' })
      .select()
      .single();
      
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ success: true, item: created });
  }

  // ── PUT /api/pricing  (admin only — update item)
  // UPDATE yerine UPSERT kullanıyoruz — kayıt yoksa oluşturur, varsa günceller
  if (req.method === 'PUT') {
    if (!isAdminAuthed(req)) {
      return res.status(401).json({ error: 'Yetkisiz erişim.' });
    }
    const item = req.body as Record<string, unknown>;
    if (!item.id) {
      return res.status(400).json({ error: 'id alanı zorunludur.' });
    }

    const { data: upserted, error } = await supabase
      .from('pricing_items')
      .upsert(item, { onConflict: 'id' })
      .select()
      .single();
      
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ success: true, item: upserted });
  }

  // ── DELETE /api/pricing?id=xxx  (admin only)
  if (req.method === 'DELETE') {
    if (!isAdminAuthed(req)) {
      return res.status(401).json({ error: 'Yetkisiz erişim.' });
    }
    const id = req.query.id as string | undefined;
    if (!id) {
      return res.status(400).json({ error: 'id parametresi gerekli.' });
    }
    const { error } = await supabase.from('pricing_items').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Desteklenmeyen HTTP metodu.' });
}
