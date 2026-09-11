import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from './db';
import { OrderModel } from './models';

// Verify admin token header
function isAdminAuthed(req: VercelRequest): boolean {
  const token = req.headers['x-admin-token'];
  // A valid token starts with 'auth_' and is 69 chars (auth_ + 64 hex)
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

  // ── GET /api/orders?code=TK-XXXX-XXXX  (public — single order tracking)
  if (req.method === 'GET' && req.query.code) {
    const code = (req.query.code as string).trim().toUpperCase();
    const order = await OrderModel.findOne({ orderCode: code }).lean();
    if (!order) {
      return res.status(404).json({ error: 'Sipariş bulunamadı.' });
    }
    // Return only safe fields for public tracking (no PII raw data for non-admins)
    return res.status(200).json(order);
  }

  // ── GET /api/orders  (admin only — all orders)
  if (req.method === 'GET') {
    if (!isAdminAuthed(req)) {
      return res.status(401).json({ error: 'Yetkisiz erişim.' });
    }
    const orders = await OrderModel.find({}).sort({ createdAt: -1 }).lean();
    return res.status(200).json(orders);
  }

  // ── POST /api/orders  (public — create new order)
  if (req.method === 'POST') {
    const body = req.body as Record<string, unknown>;
    if (!body.orderCode || !body.customerName || !body.customerPhone || !body.address) {
      return res.status(400).json({ error: 'Zorunlu alanlar eksik.' });
    }

    // Check for duplicate order code
    const existing = await OrderModel.findOne({ orderCode: body.orderCode });
    if (existing) {
      return res.status(409).json({ error: 'Bu sipariş kodu zaten kayıtlı.' });
    }

    const order = await OrderModel.create(body);
    return res.status(201).json({ success: true, order });
  }

  // ── PUT /api/orders  (admin only — update status / confirm)
  if (req.method === 'PUT') {
    if (!isAdminAuthed(req)) {
      return res.status(401).json({ error: 'Yetkisiz erişim.' });
    }
    const { orderCode, ...updateFields } = req.body as { orderCode: string; [key: string]: unknown };
    if (!orderCode) {
      return res.status(400).json({ error: 'orderCode gerekli.' });
    }
    const updated = await OrderModel.findOneAndUpdate(
      { orderCode },
      { $set: updateFields },
      { new: true }
    ).lean();
    if (!updated) {
      return res.status(404).json({ error: 'Sipariş bulunamadı.' });
    }
    return res.status(200).json({ success: true, order: updated });
  }

  // ── DELETE /api/orders?code=TK-XXXX-XXXX  (admin only)
  // ── DELETE /api/orders?clearAll=true  (admin only)
  if (req.method === 'DELETE') {
    if (!isAdminAuthed(req)) {
      return res.status(401).json({ error: 'Yetkisiz erişim.' });
    }
    if (req.query.clearAll === 'true') {
      await OrderModel.deleteMany({});
      return res.status(200).json({ success: true, message: 'Tüm siparişler silindi.' });
    }
    const code = (req.query.code as string | undefined)?.trim().toUpperCase();
    if (!code) {
      return res.status(400).json({ error: 'Silinecek sipariş kodu gerekli.' });
    }
    await OrderModel.deleteOne({ orderCode: code });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Desteklenmeyen HTTP metodu.' });
}
