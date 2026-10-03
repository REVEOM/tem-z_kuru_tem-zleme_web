import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './db.js';

function isAdminAuthed(req: VercelRequest): boolean {
  const token = req.headers['x-admin-token'];
  return typeof token === 'string' && token.startsWith('auth_') && token.length === 69;
}

// Statik varsayılan kuponlar — DB boşsa buradan seed atılır
const SEED_COUPONS = [
  {
    code: 'TEMIZ20',
    discountPercent: 20,
    minOrderAmount: 250,
    active: true,
    description: 'Yeni müşterilere özel %20 kuru temizleme indirimi',
    expiryDate: '2026-12-31'
  },
  {
    code: 'BAHAR15',
    discountPercent: 15,
    minOrderAmount: 200,
    active: true,
    description: 'Bahar temizliği %15 indirim',
    expiryDate: '2026-06-30'
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('coupons').select('*');
    if (error) return res.status(500).json({ error: error.message });

    // Tablo boşsa seed at
    if (!data || data.length === 0) {
      const { data: seeded, error: seedError } = await supabase
        .from('coupons')
        .upsert(SEED_COUPONS, { onConflict: 'code' })
        .select();
      if (seedError) return res.status(200).json(SEED_COUPONS);
      return res.status(200).json(seeded ?? SEED_COUPONS);
    }

    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    if (!isAdminAuthed(req)) return res.status(401).json({ error: 'Yetkisiz erişim.' });
    const { item } = req.body as { item: Record<string, unknown> };
    if (!item?.code) return res.status(400).json({ error: 'code alanı zorunludur.' });
    // UPSERT — aynı kodlu kupon varsa günceller, yoksa oluşturur
    const { data, error } = await supabase
      .from('coupons')
      .upsert(item, { onConflict: 'code' })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ success: true, item: data });
  }

  if (req.method === 'PUT') {
    if (!isAdminAuthed(req)) return res.status(401).json({ error: 'Yetkisiz erişim.' });
    const item = req.body as Record<string, unknown>;
    if (!item?.code) return res.status(400).json({ error: 'code alanı zorunludur.' });
    // UPSERT — kayıt yoksa oluşturur, varsa günceller
    const { data, error } = await supabase
      .from('coupons')
      .upsert(item, { onConflict: 'code' })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true, item: data });
  }

  if (req.method === 'DELETE') {
    if (!isAdminAuthed(req)) return res.status(401).json({ error: 'Yetkisiz erişim.' });
    const code = req.query.code as string;
    if (!code) return res.status(400).json({ error: 'code parametresi gerekli.' });
    const { error } = await supabase.from('coupons').delete().eq('code', code);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Desteklenmeyen metod.' });
}
