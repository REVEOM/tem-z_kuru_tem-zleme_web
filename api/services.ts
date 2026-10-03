import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './db.js';

function isAdminAuthed(req: VercelRequest): boolean {
  const token = req.headers['x-admin-token'];
  return typeof token === 'string' && token.startsWith('auth_') && token.length === 69;
}

// Statik varsayılan hizmetler — DB boşsa buradan seed atılır
const SEED_SERVICES = [
  {
    id: 'kuru-temizleme',
    title: 'Kuru Temizleme',
    shortDesc: 'Hassas kumaşlar için profesyonel kuru temizleme',
    longDesc: 'Takım elbise, elbise, kaban ve daha fazlası için özel solventlerle leke çıkarma ve temizleme.',
    icon: 'Shirt',
    features: ['Leke çıkarma', 'Koku giderme', 'Şekil koruma', 'Kapıdan teslim'],
    tag: 'En Popüler',
    startingPrice: '90₺\'den'
  },
  {
    id: 'utu-hizmeti',
    title: 'Ütü Hizmeti',
    shortDesc: 'Profesyonel buharlı ütüleme',
    longDesc: 'Gömlek, pantolon ve her türlü kıyafet için profesyonel buharlı ütüleme hizmeti.',
    icon: 'Wind',
    features: ['Buharlı ütü', 'Kolalama', 'Katlamalı teslimat'],
    tag: null,
    startingPrice: '40₺\'den'
  },
  {
    id: 'ev-tekstili',
    title: 'Ev Tekstili',
    shortDesc: 'Yorgan, battaniye ve perde temizliği',
    longDesc: 'Yorgan, battaniye, kırlent ve perde gibi büyük ev tekstillerinin profesyonel temizliği.',
    icon: 'Home',
    features: ['Yorgan temizleme', 'Perde yıkama', 'Battaniye bakımı'],
    tag: null,
    startingPrice: '55₺\'den'
  },
  {
    id: 'deri-bakim',
    title: 'Deri & Lostra',
    shortDesc: 'Deri mont ve çanta bakımı',
    longDesc: 'Deri ceket, mont, çanta ve ayakkabılar için özel bakım, boyama ve koruma işlemleri.',
    icon: 'Briefcase',
    features: ['Deri temizleme', 'Renk yenileme', 'Su geçirmez kaplama'],
    tag: 'Özel Hizmet',
    startingPrice: '240₺\'den'
  },
  {
    id: 'terzi-tadilat',
    title: 'Terzi & Tadilat',
    shortDesc: 'Kıyafet tadilat ve onarım',
    longDesc: 'Paça kısaltma, beden daraltma, fermuar değişimi ve diğer terzilik hizmetleri.',
    icon: 'Scissors',
    features: ['Paça kısaltma', 'Beden ayarlama', 'Fermuar değişimi'],
    tag: null,
    startingPrice: '100₺\'den'
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('services').select('*');
    if (error) return res.status(500).json({ error: error.message });

    // Tablo boşsa seed at
    if (!data || data.length === 0) {
      const { data: seeded, error: seedError } = await supabase
        .from('services')
        .upsert(SEED_SERVICES, { onConflict: 'id' })
        .select();
      if (seedError) return res.status(200).json(SEED_SERVICES);
      return res.status(200).json(seeded ?? SEED_SERVICES);
    }

    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    if (!isAdminAuthed(req)) return res.status(401).json({ error: 'Yetkisiz erişim.' });
    const { item } = req.body as { item: Record<string, unknown> };
    if (!item?.id) return res.status(400).json({ error: 'id alanı zorunludur.' });
    // UPSERT — kayıt yoksa oluşturur, varsa günceller
    const { data, error } = await supabase
      .from('services')
      .upsert(item, { onConflict: 'id' })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ success: true, item: data });
  }

  if (req.method === 'PUT') {
    if (!isAdminAuthed(req)) return res.status(401).json({ error: 'Yetkisiz erişim.' });
    const item = req.body as Record<string, unknown>;
    if (!item?.id) return res.status(400).json({ error: 'id alanı zorunludur.' });
    // UPSERT — kayıt yoksa oluşturur, varsa günceller
    const { data, error } = await supabase
      .from('services')
      .upsert(item, { onConflict: 'id' })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true, item: data });
  }

  if (req.method === 'DELETE') {
    if (!isAdminAuthed(req)) return res.status(401).json({ error: 'Yetkisiz erişim.' });
    const id = req.query.id as string;
    if (!id) return res.status(400).json({ error: 'id parametresi gerekli.' });
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Desteklenmeyen metod.' });
}
