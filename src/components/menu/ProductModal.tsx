import React from 'react';
import { X, Flame, Clock, AlertCircle, CalendarCheck } from 'lucide-react';
import { MenuItemProduct } from '@/types/loqum';

interface ProductModalProps {
  product: MenuItemProduct | null;
  onClose: () => void;
  onSelectForReservation?: (product: MenuItemProduct) => void;
}

export function ProductModal({ product, onClose, onSelectForReservation }: ProductModalProps) {
  if (!product) return null;

  const handleReservationClick = () => {
    if (onSelectForReservation) {
      onSelectForReservation(product);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#121212] border border-[#C8982B]/60 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Kapat Butonu */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/70 border border-white/20 text-stone-300 hover:text-white hover:border-[#C8982B] transition-all cursor-pointer"
          title="Kapat"
        >
          <X className="w-5 h-5"/>
        </button>

        {/* Görsel */}
        <div className="relative h-60 w-full overflow-hidden bg-stone-950 shrink-0">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-md text-xs font-semibold text-[#FBE291] border border-[#C8982B]/40">
            {product.tag || 'Şefin İmzası'}
          </div>
          <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-md text-xs font-mono font-bold text-[#FBE291] border border-[#C8982B]/40">
            ₺{product.price}
          </div>
        </div>

        {/* İçerik ve Detaylar */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-serif font-bold text-white tracking-wide">{product.name}</h3>
              <span className="text-xs text-stone-400 font-medium">LOQUM ET</span>
            </div>
            <p className="text-xs text-stone-300 mt-1.5 leading-relaxed font-light">{product.description}</p>
          </div>

          {/* Besin & Gramaj Bilgileri */}
          <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-stone-800/80 text-xs">
            <div className="flex items-center gap-1.5 text-stone-300">
              <Flame className="w-4 h-4 text-amber-500 shrink-0"/>
              <span><strong className="text-white">{product.calories || 650}</strong> kcal</span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-300">
              <Clock className="w-4 h-4 text-[#C8982B] shrink-0"/>
              <span><strong className="text-white">{product.prepTime || '20-25 dk'}</strong></span>
            </div>
            <div className="text-right text-stone-400">
              Porsiyon: <strong className="text-stone-200">{product.gramaj || '250 gr'}</strong>
            </div>
          </div>

          {/* Alerjen Uyarıları */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mb-2">
              <AlertCircle className="w-4 h-4 shrink-0"/>
              <span>Alerjen & İçerik Bilgisi:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.allergens && product.allergens.length > 0 ? (
                product.allergens.map((allergen, idx) => {
                  const isMantar = allergen.toLowerCase().includes('mantar');
                  return (
                    <span
                      key={idx}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                        isMantar
                          ? 'bg-amber-950/80 border border-yellow-500/70 text-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                          : 'bg-amber-950/50 border border-amber-600/40 text-amber-200'
                      }`}
                    >
                      {isMantar ? '▲ Mantar' : `⚠️ ${allergen}`}
                    </span>
                  );
                })
              ) : (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-700/40 text-emerald-300 text-xs font-medium">
                  ✓ Alerjen Uyarısı Bulunmamaktadır
                </span>
              )}
            </div>
          </div>



          {/* Rezervasyon Eylem Butonu */}
          <div className="pt-1">
            <button
              onClick={handleReservationClick}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#C8982B] via-[#FBE291] to-[#C8982B] text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-98 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4 stroke-[2.5]"/>
              <span>Masa Rezervasyonu Yap</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

