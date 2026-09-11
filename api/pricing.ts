import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from './db';
import { PricingItemModel } from './models';

function isAdminAuthed(req: VercelRequest): boolean {
  const token = req.headers['x-admin-token'];
  return typeof token === 'string' && token.startsWith('auth_') && token.length === 69;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');

  try {
    await connectDB();
  } catch {
    return res.status(503).json({ error: 'Veritabanına bağlanılamadı.' });
  }

  // ── GET /api/pricing  (public)
  if (req.method === 'GET') {
    const items = await PricingItemModel.find({ active: { $ne: false } }).sort({ category: 1, name: 1 }).lean();
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
    const created = await PricingItemModel.findOneAndUpdate(
      { id: item.id },
      { $set: item },
      { new: true, upsert: true }
    ).lean();
    return res.status(201).json({ success: true, item: created });
  }

  // ── PUT /api/pricing  (admin only — update item)
  if (req.method === 'PUT') {
    if (!isAdminAuthed(req)) {
      return res.status(401).json({ error: 'Yetkisiz erişim.' });
    }
    const item = req.body as Record<string, unknown>;
    if (!item.id) {
      return res.status(400).json({ error: 'id alanı zorunludur.' });
    }
    const updated = await PricingItemModel.findOneAndUpdate(
      { id: item.id },
      { $set: item },
      { new: true }
    ).lean();
    if (!updated) {
      return res.status(404).json({ error: 'Fiyat kalemi bulunamadı.' });
    }
    return res.status(200).json({ success: true, item: updated });
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
    await PricingItemModel.deleteOne({ id });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Desteklenmeyen HTTP metodu.' });
}
