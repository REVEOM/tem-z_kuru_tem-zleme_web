-- 1. Site Ayarları (Settings) Tablosu
CREATE TABLE IF NOT EXISTS public.site_settings (
  _key TEXT PRIMARY KEY,
  phone TEXT,
  "phoneRaw" TEXT,
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  "workingHoursWeekday" TEXT,
  "workingHoursWeekend" TEXT,
  "freeShippingLimit" NUMERIC,
  districts JSONB,
  "adminGateSlug" TEXT,
  "brandColor" TEXT,
  "customLogoUrl" TEXT,
  "announcementText" TEXT,
  "announcementActive" BOOLEAN
);

-- 2. Ürün ve Fiyatlar (Pricing) Tablosu
CREATE TABLE IF NOT EXISTS public.pricing_items (
  id TEXT PRIMARY KEY,
  name TEXT,
  category TEXT,
  "dryCleanPrice" NUMERIC,
  "ironOnlyPrice" NUMERIC,
  unit TEXT,
  popular BOOLEAN
);

-- 3. Siparişler (Orders) Tablosu
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "orderCode" TEXT UNIQUE NOT NULL,
  "customerName" TEXT NOT NULL,
  "customerPhone" TEXT NOT NULL,
  district TEXT,
  address TEXT,
  "pickupDate" TEXT,
  "timeSlot" TEXT,
  "itemsSummary" TEXT,
  services JSONB,
  "totalAmount" NUMERIC,
  status TEXT DEFAULT 'pending',
  "isWhatsAppConfirmed" BOOLEAN DEFAULT false,
  "whatsAppConfirmedAt" TEXT,
  "orderSource" TEXT,
  "createdAt" TEXT NOT NULL,
  notes TEXT,
  "discountAmount" NUMERIC,
  "couponCode" TEXT
);

-- Zaten oluşturulmuşsa Eksik Kolonları Eklemek İçin Alter (Güvenlik Önlemi)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "discountAmount" NUMERIC;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "couponCode" TEXT;

-- 4. Hizmetler (Services) Tablosu
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  title TEXT,
  "shortDesc" TEXT,
  "longDesc" TEXT,
  icon TEXT,
  features JSONB,
  tag TEXT,
  "startingPrice" TEXT
);

ALTER TABLE public.services ADD COLUMN IF NOT EXISTS "startingPrice" TEXT;

-- 5. Kuponlar (Coupons) Tablosu
CREATE TABLE IF NOT EXISTS public.coupons (
  code TEXT PRIMARY KEY,
  "discountPercent" NUMERIC,
  "minOrderAmount" NUMERIC,
  active BOOLEAN,
  description TEXT,
  "expiryDate" TEXT
);

-- Bütün tabloların okuma/yazma izinlerini ayarlayalım (Güvenlik Kalkanı)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read and write access" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE public.pricing_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read and write access" ON public.pricing_items FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read and write access" ON public.orders FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read and write access" ON public.services FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read and write access" ON public.coupons FOR ALL USING (true) WITH CHECK (true);
