import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './db.js';

function isAdminAuthed(req: VercelRequest): boolean {
  const token = req.headers['x-admin-token'];
  return typeof token === 'string' && token.startsWith('auth_') && token.length === 69;
}

const DEFAULT_SETTINGS = {
  _key: 'singleton',
  phone: '0 (555) 123 45 67',
  phoneRaw: '+905551234567',
  whatsapp: '905551234567',
  email: 'info@temizkurutemizleme.com',
  address: 'Bağdat Caddesi No: 184/A Erenköy, Kadıköy / İstanbul',
  workingHoursWeekday: '08:30 – 20:00',
  workingHoursWeekend: 'Kapalı (Online Siparişler Açıktır)',
  freeShippingLimit: 350,
  districts: ['Kadıköy', 'Ataşehir', 'Üsküdar', 'Maltepe', 'Kartal', 'Beşiktaş', 'Şişli', 'Sarıyer', 'Bakırköy', 'Beyoğlu'],
  adminGateSlug: 'gate_7f9a8b1c4e2d309',
  brandColor: 'blue',
  customLogoUrl: '',
  announcementText: '350 ₺ ve üzeri siparişlerde ücretsiz kapıdan alım & teslimat',
  announcementActive: true
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');

  // ── GET /api/settings  (public — returns site settings for UI)
  if (req.method === 'GET') {
    let { data: doc, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('_key', 'singleton')
      .single();
      
    if (error || !doc) {
      // Seed defaults on first fetch
      const { data: newDoc, error: insertError } = await supabase
        .from('site_settings')
        .insert([DEFAULT_SETTINGS])
        .select()
        .single();
        
      if (!insertError && newDoc) {
        doc = newDoc;
      } else {
        doc = DEFAULT_SETTINGS;
      }
    }
    
    // Remove internal fields before returning
    const { id, _key, ...publicSettings } = doc;
    void id; void _key;
    return res.status(200).json(publicSettings);
  }

  // ── PUT /api/settings  (admin only)
  if (req.method === 'PUT') {
    if (!isAdminAuthed(req)) {
      return res.status(401).json({ error: 'Yetkisiz erişim.' });
    }
    const body = req.body as Record<string, unknown>;
    
    // UPSERT singleton
    const { data: updated, error } = await supabase
      .from('site_settings')
      .upsert({ _key: 'singleton', ...body }, { onConflict: '_key' })
      .select()
      .single();
      
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    return res.status(200).json({ success: true, settings: updated });
  }

  return res.status(405).json({ error: 'Desteklenmeyen HTTP metodu.' });
}
