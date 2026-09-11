import mongoose, { Schema, Document, Model } from 'mongoose';

// ──────────────────────────────────────────────
// ORDER
// ──────────────────────────────────────────────
export interface IOrder extends Document {
  orderCode: string;
  customerName: string;
  customerPhone: string;
  district: string;
  address: string;
  services: string[];
  pickupDate: string;
  timeSlot: string;
  notes?: string;
  itemsSummary?: string;
  totalAmount: number;
  discountAmount?: number;
  couponCode?: string;
  status: 'pending' | 'confirmed' | 'pickup_scheduled' | 'picked_up' | 'washing' | 'ironing' | 'ready' | 'delivered' | 'cancelled';
  isWhatsAppConfirmed?: boolean;
  whatsAppConfirmedAt?: string;
  orderSource?: string;
  createdAt: string;
}

const OrderSchema = new Schema<IOrder>({
  orderCode: { type: String, required: true, unique: true, index: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  district: { type: String, required: true },
  address: { type: String, required: true },
  services: [{ type: String }],
  pickupDate: { type: String, required: true },
  timeSlot: { type: String, required: true },
  notes: String,
  itemsSummary: String,
  totalAmount: { type: Number, required: true },
  discountAmount: Number,
  couponCode: String,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'pickup_scheduled', 'picked_up', 'washing', 'ironing', 'ready', 'delivering', 'completed', 'cancelled'],
    default: 'pending'
  },
  isWhatsAppConfirmed: { type: Boolean, default: false },
  whatsAppConfirmedAt: String,
  orderSource: { type: String, default: 'web' },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: false });

export const OrderModel: Model<IOrder> =
  (mongoose.models.Order as Model<IOrder>) || mongoose.model<IOrder>('Order', OrderSchema);

// ──────────────────────────────────────────────
// SITE SETTINGS (singleton)
// ──────────────────────────────────────────────
export interface ISiteSettings extends Document {
  _key: string; // always 'singleton'
  phone: string;
  phoneRaw: string;
  whatsapp: string;
  email: string;
  address: string;
  workingHoursWeekday: string;
  workingHoursWeekend: string;
  freeShippingLimit: number;
  districts: string[];
  adminGateSlug: string;
  brandColor: string;
  customLogoUrl: string;
  announcementText: string;
  announcementActive: boolean;
}

const SiteSettingsSchema = new Schema<ISiteSettings>({
  _key: { type: String, default: 'singleton', index: true },
  phone: String,
  phoneRaw: String,
  whatsapp: String,
  email: String,
  address: String,
  workingHoursWeekday: String,
  workingHoursWeekend: String,
  freeShippingLimit: Number,
  districts: [String],
  adminGateSlug: String,
  brandColor: String,
  customLogoUrl: String,
  announcementText: String,
  announcementActive: Boolean
}, { timestamps: true });

export const SiteSettingsModel: Model<ISiteSettings> =
  (mongoose.models.SiteSettings as Model<ISiteSettings>) ||
  mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);

// ──────────────────────────────────────────────
// COUPON
// ──────────────────────────────────────────────
export interface ICoupon extends Document {
  code: string;
  discountPercent: number;
  minOrderAmount: number;
  active: boolean;
  description: string;
  expiryDate: string;
}

const CouponSchema = new Schema<ICoupon>({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountPercent: { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  description: String,
  expiryDate: String
}, { timestamps: true });

export const CouponModel: Model<ICoupon> =
  (mongoose.models.Coupon as Model<ICoupon>) || mongoose.model<ICoupon>('Coupon', CouponSchema);

// ──────────────────────────────────────────────
// PRICING ITEM
// ──────────────────────────────────────────────
export interface IPricingItem extends Document {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  active?: boolean;
}

const PricingItemSchema = new Schema<IPricingItem>({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  unit: String,
  category: String,
  active: { type: Boolean, default: true }
}, { timestamps: true });

export const PricingItemModel: Model<IPricingItem> =
  (mongoose.models.PricingItem as Model<IPricingItem>) ||
  mongoose.model<IPricingItem>('PricingItem', PricingItemSchema);
