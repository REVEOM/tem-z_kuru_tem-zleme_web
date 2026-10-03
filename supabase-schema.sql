-- ============================================================
-- TAM SCHEMA DÜZELTME + EKSİK KOLON EKLEME
-- Supabase → SQL Editor → Bu dosyanın içeriğini yapıştır → Run
-- ============================================================

-- 1. Site Ayarları Tablosu
CREATE TABLE IF NOT EXISTS public.site_settings (
  _key TEXT PRIMARY KEY,
  phone TEXT,
  "phoneRaw" TEXT,
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  "workingHoursWeekday" TEXT,
  "workingHoursWeekend" TEXT,
  "workingHours" JSONB,
  "freeShippingLimit" NUMERIC,
  districts JSONB,
  "adminGateSlug" TEXT,
  "brandColor" TEXT,
  "customLogoUrl" TEXT,
  "announcementText" TEXT,
  "announcementActive" BOOLEAN
);
-- Tablo zaten varsa eksik kolonları ekle
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS "workingHours" JSONB;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS "customLogoUrl" TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS "announcementText" TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS "announcementActive" BOOLEAN;

-- 2. Fiyat Listesi Tablosu
CREATE TABLE IF NOT EXISTS public.pricing_items (
  id TEXT PRIMARY KEY,
  name TEXT,
  category TEXT,
  "dryCleanPrice" NUMERIC,
  "ironOnlyPrice" NUMERIC,
  unit TEXT,
  popular BOOLEAN
);
-- Tablo zaten varsa eksik kolonları ekle (camelCase)
ALTER TABLE public.pricing_items ADD COLUMN IF NOT EXISTS "dryCleanPrice" NUMERIC;
ALTER TABLE public.pricing_items ADD COLUMN IF NOT EXISTS "ironOnlyPrice" NUMERIC;
ALTER TABLE public.pricing_items ADD COLUMN IF NOT EXISTS popular BOOLEAN;
ALTER TABLE public.pricing_items ADD COLUMN IF NOT EXISTS unit TEXT;
ALTER TABLE public.pricing_items ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.pricing_items ADD COLUMN IF NOT EXISTS name TEXT;

-- 3. Siparişler Tablosu
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
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "discountAmount" NUMERIC;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "couponCode" TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "itemsSummary" TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "orderSource" TEXT;

-- 4. Hizmetler Tablosu
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
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS "shortDesc" TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS "longDesc" TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS features JSONB;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS tag TEXT;

-- 5. Kuponlar Tablosu
CREATE TABLE IF NOT EXISTS public.coupons (
  code TEXT PRIMARY KEY,
  "discountPercent" NUMERIC,
  "minOrderAmount" NUMERIC,
  active BOOLEAN,
  description TEXT,
  "expiryDate" TEXT
);
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS "discountPercent" NUMERIC;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS "minOrderAmount" NUMERIC;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS "expiryDate" TEXT;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — Yetki API katmanında kontrol edilir
-- ============================================================
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read and write access" ON public.site_settings;
CREATE POLICY "Public read and write access" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.pricing_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read and write access" ON public.pricing_items;
CREATE POLICY "Public read and write access" ON public.pricing_items FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read and write access" ON public.orders;
CREATE POLICY "Public read and write access" ON public.orders FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read and write access" ON public.services;
CREATE POLICY "Public read and write access" ON public.services FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read and write access" ON public.coupons;
CREATE POLICY "Public read and write access" ON public.coupons FOR ALL USING (true) WITH CHECK (true);
