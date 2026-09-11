import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './db';

function isAdminAuthed(req: VercelRequest): boolean {
  const token = req.headers['x-admin-token'];
  return typeof token === 'string' && token.startsWith('auth_') && token.length === 69;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');

  // ── GET /api/pricing  (public)
  if (req.method === 'GET') {
    const { data: items, error } = await supabase
      .from('pricing_items')
      .select('*')
      .neq('active', false)
      .order('category')
      .order('name');
      
    if (error) return res.status(500).json({ error: error.message });
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
  if (req.method === 'PUT') {
    if (!isAdminAuthed(req)) {
      return res.status(401).json({ error: 'Yetkisiz erişim.' });
    }
    const item = req.body as Record<string, unknown>;
    if (!item.id) {
      return res.status(400).json({ error: 'id alanı zorunludur.' });
    }

    const { data: updated, error } = await supabase
      .from('pricing_items')
      .update(item)
      .eq('id', item.id)
      .select()
      .single();
      
    if (error || !updated) {
      return res.status(404).json({ error: 'Fiyat kalemi bulunamadı veya güncellenemedi.' });
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
    const { error } = await supabase.from('pricing_items').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Desteklenmeyen HTTP metodu.' });
}
