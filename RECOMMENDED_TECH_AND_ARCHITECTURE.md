# TEMİZ KURU TEMİZLEME — İLERİ TEKNOLOJİ VE GÜVENLİK YOL HARİTASI
**Doküman Sürümü:** 2.0.0 | **Tarih:** 2026-09-08 | **Motto:** Sıfır Maliyet, Sıfır Açık, Maksimum Güvenlik

---

## 1. TÜM LİNKLERİ ŞİFRELEME (URL ENCRYPTION / OBFUSCATION) ANALİZİ

Kullanıcılarımızın ve sipariş verilerimizin güvenliğini sağlamak amacıyla değerlendirilen **"Tüm site linklerini şifreleme/gizleme"** analizi:

### 1.1. Kamusal (Public) Sayfa Linkleri İçin (Hizmetler, Fiyatlar, İletişim)
* **Karar:** Kamusal sayfalarda tam URL şifrelemesi **uygulanmamalıdır**.
* **Nedenleri:**
  1. **SEO (Arama Motoru Sıralaması):** Google ve diğer arama motorları semantik URL'lere (`#hizmetler`, `#fiyatlar`, `#iletisim`) bakar. Şifreli dizgiler (`#enc_9f82ab41...`) sitenin arama motorlarındaki yerel bulunabilirliğini yok eder.
  2. **Müşteri Güveni:** Ziyaretçiler anlaşılmaz adres çubuğu gördüklerinde zararlı/güvensiz site endişesi yaşarlar.

### 1.2. Sipariş Takip ve Fiş Linkleri İçin (UYGULANAN ÇİFT KATMANLI KORUMA)
* **Uygulanan Çözüm:**
  1. **Aşama 1 — KVKK / GDPR Veri Maskeleme:** Takip portalında müşterinin adı (`A*** K***`), telefonu (`0 (532) *** ** 90`) ve bina/kapı numarası şifreli olarak maskelenir. Dışarıdan hiç kimse müşteri kimliğini ve açık ev adresini ifşa edemez.
  2. **Aşama 2 — Tahmin Edilemez Kriptografik Sipariş Kodları (`TK-XXXX-XXXX`):** Kodlar 32 karakterlik güvenli alfabe ve `crypto.getRandomValues` ile 8 haneli parçalı formatta üretilir. 32^8 = 1.099.511.627.776 (1,1 Trilyon) kombinasyona sahiptir; brute-force denemeleriyle bir siparişe denk gelinmesi matematiksel olarak imkansızdır.
  3. **Esnek Arama:** Müşteri kodu büyük/küçük harfle, tiresiz veya öneksiz yazsa bile sistem güvenli normalize ederek siparişi doğrular.

### 1.3. Yönetim Paneli (Admin Portal) Gizliliği
* **Aktif Koruma:** Admin paneline standart `/admin` üzerinden ulaşılamaz. Yalnızca işletme sahibinin bildiği rastgele anahtar parametresi (`#gate_7f9a8b1c4e2d309` veya `?gate=...`) ile açılır. Botlar ve yetkisiz kişiler panele erişemez.

---

## 2. SIFIR MALİYETLİ VE MAKSİMUM GÜVENLİKLİ TEKNOLOJİ YIĞINI

Kullanıcımızın kesin direktifleri doğrultusunda **ek hiçbir ücret çıkarmayan**, **internetten ödeme gerektirmeyen (yalnızca kapıda ödeme)** ve kurye modülleriyle şişirilmemiş sade ve güçlü mimari:

```
┌─────────────────────────────────────────────────────────────┐
│              EKONOMİK VE GÜVENLİ MİMARİ PLANI              │
├─────────────────┬──────────────────────┬────────────────────┤
│ BİLEŞEN         │ MEVCUT SİSTEM        │ SIFIR MALİYETLİ GEÇİŞ│
├─────────────────┼──────────────────────┼────────────────────┤
│ Veritabanı      │ Browser + MongoDB API│ MongoDB Atlas M0   │
│                 │                      │ (Ömür boyu ÜCRETSİZ)│
│ Kimlik Doğrulama│ TimingSafe + Crypto  │ 32 Bayt Güvenli Env│
│ Sipariş Akışı   │ Doğrudan WhatsApp    │ WhatsApp Web/App   │
│ Ödeme Türü      │ Kapıda Nakit / POS   │ Kapıda Nakit / POS │
│ Güvenlik Duvarı │ Vercel HTTP Headers  │ CSP + HSTS (Aktif) │
└─────────────────┴──────────────────────┴────────────────────┘
```

### 2.1. Sıfır Maliyetli Veritabanı: MongoDB Atlas (M0 Free Forever - 512 MB)
* **Maliyet:** 0 ₺ (Kredi kartı dahi gerektirmez, ömür boyu ücretsiz).
* **Kapasite:** 512 MB depolama yaklaşık **250.000 adet sipariş ve müşteri kaydını** rahatlıkla saklayabilir.
* **Yedeklilik:** Otomatik replikasyon ve şifreli veri saklama (TLS 1.3).

### 2.2. Sıfır Maliyetli WhatsApp Sipariş Operasyonu
* Harici bir üçüncü parti SMS veya ücretli WhatsApp Business gateway ücreti ödemeden; müşterinin seçtiği ürünler şifreli bir doğrulama koduyla doğrudan işletme WhatsApp hattına formatlı olarak düşer.
* İşletme sahibi WhatsApp üzerinden müşteriye onay verip, admin panelindeki onay kutusundan tek tıkla fiş ve takip kodunu yazdırabilir.

### 2.3. Üst Seviye Kimlik Doğrulama & Güvenlik Duvarı
* **Timing-Safe Equality:** `crypto.timingSafeEqual` ile şifre denemelerindeki milisaniyelik zaman farklarını okuyan robotik saldırılar engellendi.
* **Kriptografik Token:** Giriş yapıldığında üretilen oturum anahtarları `crypto.randomBytes(32)` ile üretilir; şifre içeriği asla token'da taşınmaz.
* **Sıfır Hardcoded Şifre:** Sistemde kod içine gömülü hiçbir gizli anahtar bulunmaz. Yönetici anahtarı sunucuda `.env` üzerinden `ADMIN_SECRET_KEY` ile okunur.
* **HTTP Firewall Başlıkları (`vercel.json`):**
  - `X-Frame-Options: DENY` (Clickjacking engellendi)
  - `X-Content-Type-Options: nosniff` (MIME sniffing engellendi)
  - `Strict-Transport-Security: max-age=63072000` (Zorunlu HTTPS)
  - `Referrer-Policy: strict-origin-when-cross-origin`

---

## 3. KURULUM VE CANLIYA ALMA REHBERİ

1. `.env.example` dosyasını `.env` olarak kopyalayın:
   ```bash
   cp .env.example .env
   ```
2. İçerisine işletmenize özel güçlü bir gizli anahtar ve ücretsiz MongoDB bağlantı dizesini ekleyin:
   ```env
   ADMIN_SECRET_KEY=buraya_en_az_32_karakterli_guclu_bir_sifre_yazin
   MONGODB_URI=mongodb+srv://kullanici:sifre@cluster0.xxxxx.mongodb.net/temizkurutemizleme
   ```
3. `npm run build` komutu ile projeyi hatasız derleyin.
