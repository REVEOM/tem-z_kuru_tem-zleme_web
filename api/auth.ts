import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

/**
 * POST /api/auth
 * Body: { key: string }
 * Returns: { token: string } on success, 401 on failure
 *
 * The admin key ONLY lives in process.env.ADMIN_SECRET_KEY (server-side).
 * It is NEVER sent to the browser, never in localStorage, never in source code.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Yalnızca POST istekleri kabul edilir.' });
  }

  const serverKey = process.env.ADMIN_SECRET_KEY;

  if (!serverKey) {
    console.error('[AUTH] ADMIN_SECRET_KEY tanımlanmamış — lütfen Vercel ortam değişkenlerine ekleyin.');
    return res.status(503).json({ error: 'Sunucu yapılandırması eksik. Lütfen yöneticiyle iletişime geçin.' });
  }

  const { key } = req.body as { key?: string };

  if (!key || typeof key !== 'string' || !key.trim()) {
    return res.status(400).json({ error: 'Güvenlik anahtarı boş olamaz.' });
  }

  // Constant-time comparison to prevent timing attacks
  const provided = Buffer.from(key.trim());
  const expected = Buffer.from(serverKey);

  let match = false;
  if (provided.length === expected.length) {
    try {
      match = crypto.timingSafeEqual(provided, expected);
    } catch {
      match = false;
    }
  }

  if (!match) {
    // Artificial delay to slow down brute force
    await new Promise<void>((resolve) => setTimeout(() => {
      res.status(401).json({ error: 'Geçersiz güvenlik anahtarı. Erişim reddedildi.' });
      resolve();
    }, 800)); return;
  }

  // Generate a cryptographically secure session token
  const token = 'auth_' + crypto.randomBytes(32).toString('hex');

  // Token lives in the response only — client stores it in sessionStorage (tab-scoped)
  return res.status(200).json({ token });
}
