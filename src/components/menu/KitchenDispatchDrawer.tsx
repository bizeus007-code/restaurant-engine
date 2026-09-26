'use client';

import React, { useState } from 'react';
import { ChefHat, ShoppingBag, X, SendHorizontal, CheckCircle2, Trash2 } from 'lucide-react';
import { CartItem } from '@/types/loqum';
import confetti from 'canvas-confetti';

interface KitchenDispatchDrawerProps {
  tableNumber: string;
  cart: CartItem[];
  onUpdateQuantity: (index: number, delta: number) => void;
  onClearCart: () => void;
}

export function KitchenDispatchDrawer({
  tableNumber,
  cart,
  onUpdateQuantity,
  onClearCart
}: KitchenDispatchDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  if (cart.length === 0) return null;

  const handleSendToKitchen = async () => {
    setIsSent(true);

    // Also dispatch to /api/orders so admin KDS updates in real-time
    try {
      const itemsPayload = cart.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        note: item.notes,
        department: item.product.categorySlug === 'steak' ? 'steak' : item.product.categorySlug === 'kebaplar' || item.product.categorySlug === 'lahmacun-ve-pide' ? 'grill_oven' : item.product.categorySlug === 'tatlilar' ? 'dessert' : 'kitchen'
      }));

      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNo: `MASA ${tableNumber.padStart(2, '0')}`,
          items: itemsPayload,
          totalAmount: totalPrice,
        }),
      });
    } catch {}

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

    setTimeout(() => {
      onClearCart();
      setIsSent(false);
      setIsOpen(false);
    }, 2500);
  };

  return (
    <>
      {/* Ekranın Altındaki Sabit Yüzen Çubuk */}
      <aside aria-label="Sipariş Özeti" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-2xl">
        <div className="bg-[#121212]/95 border border-[#D4AF37]/40 backdrop-blur-md rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 pl-2">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <ChefHat className="w-5 h-5"/>
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span className="text-[#D4AF37] uppercase tracking-wide">Masa {tableNumber}</span>
                <span className="w-1 h-1 rounded-full bg-stone-600" />
                <span>{totalItems} Adet Ürün</span>
              </div>
              <div className="text-xs text-stone-400">Toplam: <strong className="text-white">₺{totalPrice}</strong></div>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F24] hover:from-[#E5C158] hover:to-[#D4AF37] text-stone-950 font-bold text-xs tracking-wider uppercase transition-all shadow-md flex items-center gap-2 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4"/>
            Siparişi Gör & Mutfağa Gönder
          </button>
        </div>
      </aside>

      {/* Mutfak Onay Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full max-w-lg bg-[#121212] border border-stone-800 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl max-h-[85vh] flex flex-col animate-slideUp">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <ChefHat className="w-6 h-6 text-[#D4AF37]"/>
                <h3 className="text-lg font-serif font-bold text-white">Masa {tableNumber} - Mutfak Siparişi</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 text-stone-400 hover:text-white">
                <X className="w-5 h-5"/>
              </button>
            </div>

            {isSent ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce"/>
                <h4 className="text-xl font-bold text-white">Sipariş Mutfağa İletildi!</h4>
                <p className="text-xs text-stone-400 max-w-xs mx-auto">
                  Masa {tableNumber} siparişiniz şefe aktarıldı. Hazırlanma süresi ortalama 15-20 dakikadır.
                </p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {cart.map((item, idx) => (
                    <div key={idx} className="bg-stone-900/90 border border-stone-800 p-3 rounded-xl flex items-center justify-between gap-3">
                      <img src={item.product.image} alt={item.product.name} className="w-14 h-14 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{item.product.name}</h4>
                        <div className="text-[11px] text-[#D4AF37] font-semibold">₺{item.product.price * item.quantity}</div>
                        {item.notes && (
                          <div className="text-[10px] text-stone-400 italic truncate">Not: {item.notes}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 bg-stone-950 border border-stone-800 rounded-lg p-1">
                        <button onClick={() => onUpdateQuantity(idx, -1)} className="px-1.5 text-stone-400 hover:text-white text-xs font-bold">-</button>
                        <span className="px-1 text-xs text-white font-bold">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(idx, 1)} className="px-1.5 text-stone-400 hover:text-white text-xs font-bold">+</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-stone-800 pt-4 mt-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-stone-400">Toplam Tutar:</span>
                    <span className="text-lg font-bold text-[#D4AF37]">₺{totalPrice}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={onClearCart}
                      className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-stone-400 hover:text-red-400 transition-colors"
                      title="Sepeti Temizle"
                    >
                      <Trash2 className="w-4 h-4"/>
                    </button>
                    <button
                      onClick={handleSendToKitchen}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F24] hover:from-[#E5C158] hover:to-[#D4AF37] text-stone-950 font-bold text-xs tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
                    >
                      <SendHorizontal className="w-4 h-4"/>
                      Mutfak Ekranına Gönder
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

