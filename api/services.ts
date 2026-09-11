import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './db.js';

function isAdminAuthed(req: VercelRequest): boolean {
  const token = req.headers['x-admin-token'];
  return typeof token === 'string' && token.startsWith('auth_') && token.length === 69;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('services').select('*');
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    if (!isAdminAuthed(req)) return res.status(401).json({ error: 'Yetkisiz erişim.' });
    const { item } = req.body as { item: any };
    const { data, error } = await supabase.from('services').insert([item]).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ success: true, item: data });
  }

  if (req.method === 'PUT') {
    if (!isAdminAuthed(req)) return res.status(401).json({ error: 'Yetkisiz erişim.' });
    const item = req.body as any;
    const { data, error } = await supabase.from('services').update(item).eq('id', item.id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true, item: data });
  }

  if (req.method === 'DELETE') {
    if (!isAdminAuthed(req)) return res.status(401).json({ error: 'Yetkisiz erişim.' });
    const id = req.query.id as string;
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Desteklenmeyen metod.' });
}
