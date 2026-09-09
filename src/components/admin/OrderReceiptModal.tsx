import React, { useState } from 'react';
import { X, Printer, MapPin, Phone, Calendar, Clock, CheckCircle, MessageCircle } from 'lucide-react';
import type { Order } from '../../context/SettingsContext';
import { useSettings } from '../../context/useSettings';
import temizLogoBlue from '../../assets/temiz-logo-blue.svg';
import temizLogo from '../../assets/temiz-logo.svg';

interface OrderReceiptModalProps {
  order: Order;
  onClose: () => void;
  onOrderUpdated?: (order: Order) => void;
}

export const OrderReceiptModal: React.FC<OrderReceiptModalProps> = ({ order, onClose, onOrderUpdated }) => {
  const { settings, confirmWhatsAppSale } = useSettings();
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const [isApproving, setIsApproving] = useState(false);

  const handleApproveAndPrint = async () => {
    setIsApproving(true);
    try {
      await confirmWhatsAppSale(currentOrder.orderCode);
      const updated: Order = {
        ...currentOrder,
        isWhatsAppConfirmed: true,
        whatsAppConfirmedAt: new Date().toISOString(),
        status: 'confirmed'
      };
      setCurrentOrder(updated);
      if (onOrderUpdated) onOrderUpdated(updated);
      setTimeout(() => {
        window.print();
      }, 150);
    } catch {
      alert('Sipariş onaylanırken bir hata oluştu.');
    } finally {
      setIsApproving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isConfirmed = currentOrder.isWhatsAppConfirmed || currentOrder.status !== 'pending';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 my-auto">
        
        {/* Modal Header Actions */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <img src={temizLogo} alt="TEMİZ" className="w-8 h-8 rounded-lg shadow-xs" />
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                Müşteri Fişi & Takip Kodu
              </h3>
              <span className="text-[10px] text-zinc-400">
                Resmi sipariş teslim ve takip makbuzu
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pending Approval Warning / Action Banner */}
        {!isConfirmed && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
              <MessageCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Bu sipariş henüz WhatsApp üzerinden onaylanmadı.</span>
            </div>
            <button
              type="button"
              disabled={isApproving}
              onClick={handleApproveAndPrint}
              className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shrink-0 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isApproving ? 'Onaylanıyor...' : '✅ Onayla & Yazdır'}
            </button>
          </div>
        )}

        {/* Printable Receipt Paper Container */}
        <div 
          id="printable-receipt" 
          className="bg-white text-zinc-900 p-6 rounded-2xl border border-dashed border-zinc-300 font-mono text-xs space-y-4 shadow-inner"
        >
          {/* Receipt Brand Header */}
          <div className="text-center border-b border-zinc-200 pb-3 space-y-1">
            <img src={temizLogoBlue} alt="TEMİZ Logo" className="w-12 h-12 mx-auto mb-1 object-contain" />
            <h2 className="font-extrabold text-base tracking-widest uppercase">TEMİZ KURU TEMİZLEME</h2>
            <p className="text-[10px] text-zinc-600 uppercase tracking-wide">Ekolojik Kuru Temizleme & Buharlı Ütü Evi</p>
            <p className="text-[10px] text-zinc-500">{settings.address}</p>
            <p className="text-[10px] text-zinc-500">Tel: {settings.phone} • WhatsApp: {settings.whatsapp}</p>
            <p className="text-[9px] text-zinc-400">Web: temizkurutemizleme.com</p>
          </div>

          {/* SİPARİŞ TAKİP KODU VURGUSU */}
          <div className="border-2 border-zinc-900 bg-zinc-50 p-3 rounded-xl text-center space-y-1">
            <span className="text-[10px] font-sans uppercase font-extrabold tracking-wider text-zinc-600 block">
              MÜŞTERİ SİPARİŞ TAKİP KODU
            </span>
            <span className="text-2xl font-mono font-black tracking-widest text-zinc-950 block">
              {currentOrder.orderCode}
            </span>
            <p className="text-[9px] font-sans text-zinc-600">
              Canlı Takip: <strong>temizkurutemizleme.com/#takip</strong>
            </p>
          </div>

          {/* WhatsApp Confirmation Status Badge on Slip */}
          <div className="text-center border-y border-zinc-200 py-1.5">
            {isConfirmed ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 font-sans">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WHATSAPP SATIŞI ONAYLANDI — RESMİ TESLİM FİŞİ</span>
              </span>
            ) : (
              <span className="text-[11px] font-bold text-amber-800 font-sans">
                WHATSAPP ONAYI BEKLEYEN ÖN SİPARİŞ FİŞİ
              </span>
            )}
            <div className="text-[9px] text-zinc-500 mt-0.5">
              Fiş Düzenlenme: {new Date().toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
            </div>
          </div>

          {/* Customer & Delivery Information */}
          <div className="grid grid-cols-2 gap-2 text-[11px] border-b border-zinc-200 pb-3">
            <div>
              <span className="text-zinc-500 block text-[9px] uppercase font-bold">MÜŞTERİ</span>
              <strong className="text-zinc-900 text-xs">{currentOrder.customerName}</strong>
              <div className="flex items-center gap-1 text-zinc-700 mt-0.5 font-sans">
                <Phone className="w-3 h-3" />
                <span>{currentOrder.customerPhone}</span>
              </div>
            </div>

            <div>
              <span className="text-zinc-500 block text-[9px] uppercase font-bold">RANDEVU ZAMANI</span>
              <div className="flex items-center gap-1 text-zinc-800 font-semibold font-sans">
                <Calendar className="w-3 h-3" />
                <span>{currentOrder.pickupDate}</span>
              </div>
              <div className="flex items-center gap-1 text-zinc-600 font-sans">
                <Clock className="w-3 h-3" />
                <span>{currentOrder.timeSlot}</span>
              </div>
            </div>

            <div className="col-span-2 pt-1">
              <span className="text-zinc-500 block text-[9px] uppercase font-bold">TESLİMAT ADRESİ</span>
              <div className="flex items-start gap-1 text-zinc-800 font-sans">
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-zinc-500" />
                <span className="font-medium">{currentOrder.district} — {currentOrder.address}</span>
              </div>
            </div>
          </div>

          {/* Garment / Items Breakdown */}
          <div className="border-b border-zinc-200 pb-3 space-y-2">
            <span className="text-zinc-500 block text-[9px] uppercase font-bold">ÜRÜN VE HİZMET DETAYI</span>
            {currentOrder.itemsSummary ? (
              <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200 text-zinc-800 text-[11px] leading-relaxed whitespace-pre-line font-mono">
                {currentOrder.itemsSummary}
              </div>
            ) : (
              <div className="text-zinc-700 font-medium">
                {currentOrder.services.join(', ')}
              </div>
            )}

            {currentOrder.notes && (
              <div className="text-[10px] text-zinc-600 italic bg-amber-50/50 p-2 rounded border border-amber-200 font-sans">
                <strong>Müşteri Notu:</strong> {currentOrder.notes}
              </div>
            )}
          </div>

          {/* Financial Info */}
          <div className="space-y-1.5 text-[11px] border-b border-zinc-200 pb-3">

            {currentOrder.couponCode && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Kupon İndirimi ({currentOrder.couponCode}):</span>
                <span>-₺{currentOrder.discountAmount || 0}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm font-extrabold text-zinc-950 pt-1 border-t border-zinc-200">
              <span>TOPLAM TUTAR:</span>
              <span className="text-base">₺{currentOrder.totalAmount}</span>
            </div>
          </div>

          {/* Barcode & Security */}
          <div className="pt-2 text-center flex flex-col items-center justify-center space-y-1">
            <svg className="w-48 h-10" viewBox="0 0 160 30" fill="currentColor">
              <rect x="0" y="0" width="3" height="30" />
              <rect x="5" y="0" width="2" height="30" />
              <rect x="10" y="0" width="5" height="30" />
              <rect x="18" y="0" width="1" height="30" />
              <rect x="22" y="0" width="4" height="30" />
              <rect x="29" y="0" width="2" height="30" />
              <rect x="34" y="0" width="6" height="30" />
              <rect x="43" y="0" width="2" height="30" />
              <rect x="48" y="0" width="4" height="30" />
              <rect x="55" y="0" width="1" height="30" />
              <rect x="59" y="0" width="5" height="30" />
              <rect x="67" y="0" width="3" height="30" />
              <rect x="73" y="0" width="2" height="30" />
              <rect x="78" y="0" width="4" height="30" />
              <rect x="85" y="0" width="6" height="30" />
              <rect x="94" y="0" width="2" height="30" />
              <rect x="99" y="0" width="4" height="30" />
              <rect x="106" y="0" width="2" height="30" />
              <rect x="111" y="0" width="5" height="30" />
              <rect x="119" y="0" width="3" height="30" />
              <rect x="125" y="0" width="2" height="30" />
              <rect x="130" y="0" width="4" height="30" />
              <rect x="137" y="0" width="6" height="30" />
              <rect x="146" y="0" width="2" height="30" />
              <rect x="151" y="0" width="4" height="30" />
              <rect x="158" y="0" width="2" height="30" />
            </svg>
            <span className="text-[11px] text-zinc-900 font-mono font-bold tracking-widest">{currentOrder.orderCode}</span>
          </div>

          {/* Signature Boxes */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-200 text-[10px] text-zinc-500 font-sans">
            <div>
              <span className="block font-bold text-zinc-700">Teslim Eden Müşteri:</span>
              <div className="h-9 border-b border-zinc-400 mt-2" />
            </div>
            <div>
              <span className="block font-bold text-zinc-700">Teslim Alan Yetkili:</span>
              <div className="h-9 border-b border-zinc-400 mt-2" />
            </div>
          </div>

          <p className="text-[9px] text-zinc-400 text-center font-sans">
            Bizi tercih ettiğiniz için teşekkür ederiz. Bu fiş teslimat garantisi taşır.
          </p>
        </div>

        {/* Modal Footer Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
          <div className="text-xs text-zinc-500">
            {isConfirmed ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Satış Onaylandı</span>
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                Onay Bekliyor
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Kapat
            </button>

            {!isConfirmed ? (
              <button
                type="button"
                disabled={isApproving}
                onClick={handleApproveAndPrint}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{isApproving ? 'Onaylanıyor...' : 'Satışı Onayla & Yazdır'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Fişi Yazdır (Print)</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
