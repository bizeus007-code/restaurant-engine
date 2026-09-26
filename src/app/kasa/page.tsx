'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Volume2, VolumeX, RefreshCw, MessageSquare, 
  Check, Lock, Unlock, Plus, Minus, Trophy, Utensils, CreditCard, DollarSign, CheckCircle2, Receipt, Clock, ChefHat
} from 'lucide-react';
import initialProducts from '@/src/data/loqum-products.json';

interface ActiveOrderTicket {
  id: string;
  tableNo: string;
  time: string;
  items: Array<{ name: string; quantity: number; price: number; note?: string; portion?: string }>;
  totalAmount: number;
  status: 'YENI' | 'HAZIRLANIYOR' | 'SERVIS_EDILDI';
}

export default function LoqumExecutiveTerminal() {
  const [activeTab, setActiveTab] = useState<'siparis' | 'stok' | 'rapor'>('siparis');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [inventory, setInventory] = useState<any[]>(initialProducts);
  const [lockedItems, setLockedItems] = useState<Record<string, boolean>>({});

  // Finansal Sayaçlar
  const [dailyRevenue, setDailyRevenue] = useState<number>(45275);
  const [closedOrdersCount, setClosedOrdersCount] = useState<number>(46);

  // Bekleyen Garson/Hesap Çağrıları
  const [calls, setCalls] = useState([
    { id: 'call-1', tableNo: '11', type: 'Garson', time: '22:55', handled: false }
  ]);

  // Aktif Masalar & Siparişler (İnteraktif)
  const [activeOrders, setActiveOrders] = useState<ActiveOrderTicket[]>([
    {
      id: 'ord-101',
      tableNo: '11',
      time: '23:14',
      items: [{ name: 'Kuzu Pirzola Izgara', quantity: 1, price: 650, note: 'Az pişmiş' }],
      totalAmount: 650,
      status: 'SERVIS_EDILDI'
    },
    {
      id: 'ord-102',
      tableNo: '10',
      time: '23:12',
      items: [{ name: 'Kuzu Tandır Taş Fırın', quantity: 1, price: 650 }],
      totalAmount: 650,
      status: 'HAZIRLANIYOR'
    },
    {
      id: 'ord-103',
      tableNo: '12',
      time: '23:18',
      items: [
        { name: 'Tomahawk Steak (Dry Aged)', quantity: 1, price: 1850, note: 'Orta pişmiş, kaya tuzu ile' },
        { name: 'Diyarbakır Saç Tava', quantity: 1, price: 580 }
      ],
      totalAmount: 2430,
      status: 'YENI'
    }
  ]);

  // Ses Bildirimi (Web Audio API ile Restoran Çağrı Zili)
  const playLuxuryChime = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;

      // Ton 1: Sıcak Gong Zili (D5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.0001, now);
      gain1.gain.linearRampToValueAtTime(0.2, now + 0.04);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.8);

      // Ton 2: Kristal Armonik Çan (A5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.12);
      gain2.gain.setValueAtTime(0.0001, now + 0.12);
      gain2.gain.linearRampToValueAtTime(0.25, now + 0.16);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 1.2);
    } catch {}
  };

  const knownIdsRef = useRef<Set<string>>(new Set(['ord-101', 'ord-102', 'ord-103', 'call-1']));
  const isInitialLoad = useRef(true);

  // Canlı Siparişleri /api/orders ve /api/calls Üzerinden Dinle
  useEffect(() => {
    const fetchData = async () => {
      try {
        let hasNewNotification = false;
        const [ordersRes, callsRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/calls')
        ]);

        if (ordersRes.ok) {
          const data = await ordersRes.json();
          if (Array.isArray(data) && data.length > 0) {
            data.forEach((apiOrd: any) => {
              if (apiOrd.status === 'tamamlandi' || apiOrd.status === 'kapandi') return;
              if (!knownIdsRef.current.has(apiOrd.id)) {
                knownIdsRef.current.add(apiOrd.id);
                if (!isInitialLoad.current) hasNewNotification = true;
              }
              setActiveOrders((prev) => {
                if (prev.some((o) => o.id === apiOrd.id)) return prev;
                return [
                  {
                    id: apiOrd.id || `ord-${Date.now()}`,
                    tableNo: apiOrd.tableNo?.replace(/\D/g, '') || '12',
                    time: apiOrd.time || new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                    items: apiOrd.items || [{ name: 'Özel Sipariş', quantity: 1, price: apiOrd.totalAmount || 500 }],
                    totalAmount: apiOrd.totalAmount || 500,
                    status: 'YENI'
                  },
                  ...prev
                ];
              });
            });
          }
        }

        if (callsRes.ok) {
          const callData = await callsRes.json();
          if (Array.isArray(callData) && callData.length > 0) {
            callData.forEach((ac: any) => {
              if (!knownIdsRef.current.has(ac.id) && ac.status !== 'tamamlandi') {
                knownIdsRef.current.add(ac.id);
                if (!isInitialLoad.current) hasNewNotification = true;
              }
            });

            setCalls((prev) => {
              const map = new Map();
              prev.forEach(c => map.set(c.id, c));
              callData.forEach((ac: any) => {
                const tNo = ac.tableNo?.replace(/\D/g, '') || '12';
                map.set(ac.id, {
                  id: ac.id,
                  tableNo: tNo,
                  type: ac.serviceType || 'Garson',
                  time: ac.time || '22:55',
                  handled: ac.status === 'tamamlandi'
                });
              });
              return Array.from(map.values());
            });
          }
        }

        if (hasNewNotification && audioEnabled) {
          playLuxuryChime();
        }

        isInitialLoad.current = false;
      } catch {}
    };

    fetchData();
    const interval = setInterval(fetchData, 3500);
    return () => clearInterval(interval);
  }, [audioEnabled]);

  // Durum Güncelleme Aksiyonları
  const handleUpdateOrderStatus = (orderId: string, status: 'HAZIRLANIYOR' | 'SERVIS_EDILDI') => {
    setActiveOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId ? { ...ord, status } : ord
      )
    );
  };

  // Adisyon Kapatma Aksiyonu (Nakit / Kredi Kartı / Yemek Kartı)
  const handleCloseOrder = async (orderId: string, method: 'Nakit' | 'Kredi Kartı' | 'Yemek Kartı') => {
    const target = activeOrders.find((o) => o.id === orderId);
    if (!target) return;

    setActiveOrders((prev) => prev.filter((o) => o.id !== orderId));
    setDailyRevenue((prev) => prev + target.totalAmount);
    setClosedOrdersCount((prev) => prev + 1);

    try {
      await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, action: 'complete', paymentMethod: method })
      });
    } catch {}
  };

  // 3. ÇAĞRI TAMAMLAMA
  const handleDismissCall = async (callId: string) => {
    setCalls((prev) =>
      prev.map((c) => (c.id === callId ? { ...c, handled: true } : c))
    );
    try {
      await fetch('/api/calls', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: callId, action: 'complete' })
      });
    } catch {}
  };

  // Stok Artır/Azalt
  const updateStock = (id: string, delta: number) => {
    if (lockedItems[id]) return;
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStock = Math.max(0, (item.stock || 0) + delta);
          return { ...item, stock: newStock };
        }
        return item;
      })
    );
  };

  const toggleLock = (id: string) => {
    setLockedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Sunum Modu: Demo Verilerini Sıfırlama
  const handleResetDemo = async () => {
    const demoOrder: ActiveOrderTicket = {
      id: 'ord-demo-1',
      tableNo: '12',
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      items: [
        { name: 'Tomahawk Steak (Dry Aged)', quantity: 1, price: 1850 },
        { name: 'Yayık Ayran & Diyarbakır Şalgamı', quantity: 2, price: 80 }
      ],
      totalAmount: 2010,
      status: 'HAZIRLANIYOR'
    };

    setActiveOrders([demoOrder]);
    setCalls([
      {
        id: 'call-demo-1',
        tableNo: '12',
        type: 'Garson',
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        handled: false
      }
    ]);
    setDailyRevenue(42850);
    setClosedOrdersCount(38);

    try {
      await Promise.all([
        fetch('/api/orders', { method: 'DELETE' }),
        fetch('/api/calls', { method: 'DELETE' })
      ]);
    } catch {}
  };

  // WhatsApp Rapor İletişimi
  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `*LOQUM ET STEAKHOUSE - GÜN SONU KASA VE FİNANSMAN RAPORU*\n` +
      `Günlük Toplam Ciro: ₺${dailyRevenue.toLocaleString('tr-TR')}\n` +
      `Toplam Kapanan Adisyon: ${closedOrdersCount} Adet\n` +
      `Aktif Masalar: ${activeOrders.length} Masa\n` +
      `Durum: Oturum Başarıyla Arşivlendi.`
    );
    window.open(`https://api.whatsapp.com/send?phone=904125030405&text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-stone-100 font-sans p-4 md:p-6 selection:bg-[#D4AF37] selection:text-black">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ÜST BAR (LOQUM ET OBSIDIAN-GOLD TEMASI) */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-900/90 border border-stone-800 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link 
              className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 hover:border-[#D4AF37] text-stone-300 hover:text-[#D4AF37] transition-all" 
              href="/" 
              title="Misafir QR Ekranına Dön"
            >
              <ArrowLeft className="w-5 h-5"/>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#D4AF37] tracking-widest uppercase">
                  LOQUM ET STEAKHOUSE
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h1 className="text-lg md:text-xl font-serif font-black text-white tracking-wide">
                Canlı Yönetici & Kasa Terminali
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end flex-wrap">
            {/* SUNUM / DEMO SIFIRLAMA BUTONU */}
            <button
              onClick={handleResetDemo}
              className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              title="Sunum öncesi siparişleri ve çağrıları temiz demo durumuna getir"
            >
              <RefreshCw className="w-3.5 h-3.5"/>
              <span>🔄 Demoyu Sıfırla</span>
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="px-3.5 py-2 rounded-xl bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/50 text-[#D4AF37] text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5"/>
              WhatsApp Rapor
            </button>

            <div className="px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs font-bold flex items-center gap-1.5">
              <span className="text-stone-400">📈 Ciro:</span>
              <strong className="text-emerald-400 text-sm">₺{dailyRevenue.toLocaleString('tr-TR')}</strong>
            </div>

            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-300 hover:text-[#D4AF37]"
            >
              {audioEnabled ? <Volume2 className="w-4 h-4 text-[#D4AF37]"/> : <VolumeX className="w-4 h-4 text-stone-500"/>}
            </button>

            <button
              onClick={() => window.location.reload()}
              className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-300 hover:text-white"
            >
              <RefreshCw className="w-4 h-4"/>
            </button>
          </div>
        </header>

        {/* 3 SEKMELİ YÖNETİM ÇUBUĞU (ALTIN/OBSIDIAN) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setActiveTab('siparis')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'siparis'
                ? 'bg-[#D4AF37] text-stone-950 shadow-lg font-black'
                : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
            }`}
          >
            SİPARİŞ & ÇAĞRILAR ({activeOrders.length + calls.filter(c => !c.handled).length})
          </button>

          <button
            onClick={() => setActiveTab('stok')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'stok'
                ? 'bg-[#D4AF37] text-stone-950 shadow-lg font-black'
                : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
            }`}
          >
            📦 STOK KONTROL
          </button>

          <button
            onClick={() => setActiveTab('rapor')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'rapor'
                ? 'bg-[#D4AF37] text-stone-950 shadow-lg font-black'
                : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
            }`}
          >
            📊 GÜN SONU RAPORU
          </button>
        </div>

        {/* SEKME 1: SİPARİŞ & ÇAĞRILAR (İNTERAKTİF SİSTEM) */}
        {activeTab === 'siparis' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Sol: Bekleyen Masa Çağrıları (4 Kolon) */}
            <div className="lg:col-span-4 space-y-3">
              <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                🔔 BEKLEYEN MASA ÇAĞRILARI ({calls.filter(c => !c.handled).length})
              </h3>
              
              {calls.map((call) => (
                <div 
                  key={call.id}
                  className="bg-stone-900 border border-stone-800 p-4 rounded-2xl flex items-center justify-between shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-white">MASA {call.tableNo}</span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                      {call.type}
                    </span>
                    <span className="text-xs text-stone-400">{call.time}</span>
                  </div>

                  <button
                    onClick={() => handleDismissCall(call.id)}
                    disabled={call.handled}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      call.handled
                        ? 'bg-stone-950 text-stone-500 border border-stone-800 cursor-default'
                        : 'bg-[#D4AF37] hover:bg-[#b89528] text-stone-950 shadow-md active:scale-95'
                    }`}
                  >
                    {call.handled ? 'Tamamlandı ✓' : 'Gidildi ✓'}
                  </button>
                </div>
              ))}
            </div>

            {/* Sağ: Aktif Masalar & Siparişler (İnteraktif Kart Yapısı - 8 Kolon) */}
            <div className="lg:col-span-8 space-y-3">
              <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                🍽️ AKTİF MASALAR & SİPARİŞLER ({activeOrders.length})
              </h3>

              {activeOrders.length === 0 ? (
                <div className="bg-stone-900 border border-stone-800 p-8 rounded-2xl text-center text-xs text-stone-500">
                  Şu an açık veya servis bekleyen sipariş bulunmuyor.
                </div>
              ) : (
                activeOrders.map((order) => {
                  return (
                    <div 
                      key={order.id}
                      className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-3.5 shadow-xl hover:border-stone-700 transition-all"
                    >
                      {/* Kart Üst Satır: Masa No, Saat, Tutar ve Durum Rozeti */}
                      <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
                        <div className="flex items-center gap-3">
                          <span className="text-base font-black text-[#D4AF37] tracking-wide font-mono">
                            MASA {order.tableNo}
                          </span>
                          <span className="text-xs text-stone-400 font-mono">{order.time}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-base font-bold text-white font-mono">
                            ₺{order.totalAmount}
                          </span>
                          
                          {order.status === 'YENI' ? (
                            <span className="px-2.5 py-0.5 rounded-md bg-rose-950/90 border border-rose-500/80 text-rose-300 text-[11px] font-bold tracking-wider animate-pulse flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                              YENİ SİPARİŞ
                            </span>
                          ) : order.status === 'HAZIRLANIYOR' ? (
                            <span className="px-2.5 py-0.5 rounded-md bg-amber-950/80 border border-amber-600/70 text-amber-300 text-[11px] font-bold tracking-wider animate-pulse flex items-center gap-1">
                              <ChefHat className="w-3 h-3 text-amber-400" />
                              HAZIRLANIYOR
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-md bg-blue-950/80 border border-blue-600/70 text-blue-300 text-[11px] font-bold tracking-wider flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-blue-400" />
                              SERVİS EDİLDİ
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Kart Orta: Ürün Listesi ve Mutfak Notları */}
                      <div className="space-y-2 py-1">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="bg-stone-950/40 p-2 rounded-xl border border-stone-800/40 space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-stone-200 font-semibold">
                                {it.quantity}x {it.name}
                              </span>
                              <span className="text-stone-300 font-mono font-bold">
                                ₺{it.price * it.quantity}
                              </span>
                            </div>
                            {it.note && (
                              <div className="text-[11px] text-amber-300/90 italic flex items-center gap-1">
                                <span>📝 Not:</span>
                                <span>{it.note}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Kart Finansal Adisyon Özeti (KDV Dahil / Hariç) */}
                      <div className="bg-stone-950/70 border border-stone-800/70 rounded-xl p-2.5 space-y-1 text-[11px]">
                        <div className="flex justify-between text-stone-400">
                          <span>Ara Toplam (KDV Hariç)</span>
                          <span className="font-mono">₺{(order.totalAmount / 1.1).toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between text-stone-400">
                          <span>KDV Tutarı (%10 Dahil)</span>
                          <span className="font-mono">₺{(order.totalAmount - order.totalAmount / 1.1).toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-white pt-1 border-t border-stone-800">
                          <span>Genel Adisyon Toplamı</span>
                          <span className="text-[#FBE291] font-mono text-xs">₺{order.totalAmount}</span>
                        </div>
                      </div>

                      {/* Kart Alt Satır: Servis Aşamaları ve Tahsilat Butonları */}
                      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-2 border-t border-stone-800/80">
                        {/* Sol Aksiyon: Servis Durumu Değiştirici */}
                        <div className="flex items-center gap-2">
                          {order.status === 'YENI' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'HAZIRLANIYOR')}
                              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                            >
                              <ChefHat className="w-3.5 h-3.5" />
                              <span>Mutfak Hazırlıyor</span>
                            </button>
                          )}

                          {order.status === 'HAZIRLANIYOR' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'SERVIS_EDILDI')}
                              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]"/>
                              <span>Masaya Servis Et</span>
                            </button>
                          )}

                          {order.status === 'SERVIS_EDILDI' && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-xs font-bold">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400"/>
                              <span>Masada Tüketiliyor</span>
                            </div>
                          )}
                        </div>

                        {/* Sağ Aksiyon: 3 Tahsilat Butonu (Nakit, Kredi Kartı, Yemek Kartı) */}
                        <div className="flex items-center gap-1.5 w-full lg:w-auto justify-end flex-wrap">
                          <button
                            onClick={() => handleCloseOrder(order.id, 'Nakit')}
                            className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md active:scale-95 transition-all cursor-pointer"
                            title="Nakit Tahsilat & Masayı Kapat"
                          >
                            <DollarSign className="w-3.5 h-3.5"/>
                            <span>Nakit</span>
                          </button>

                          <button
                            onClick={() => handleCloseOrder(order.id, 'Kredi Kartı')}
                            className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md active:scale-95 transition-all cursor-pointer"
                            title="Kredi Kartı Tahsilat & Masayı Kapat"
                          >
                            <CreditCard className="w-3.5 h-3.5"/>
                            <span>Kredi Kartı</span>
                          </button>

                          <button
                            onClick={() => handleCloseOrder(order.id, 'Yemek Kartı')}
                            className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md active:scale-95 transition-all cursor-pointer"
                            title="Yemek Kartı (Sodexo/Multinet) & Masayı Kapat"
                          >
                            <Receipt className="w-3.5 h-3.5"/>
                            <span>Yemek Kartı</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* SEKME 2: STOK KONTROL */}
        {activeTab === 'stok' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {inventory.map((item: any) => {
              const isLocked = lockedItems[item.id];
              return (
                <div 
                  key={item.id}
                  className="bg-stone-900 border border-stone-800 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-md"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                    <span className="text-[11px] text-[#D4AF37] font-semibold">₺{item.price}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-md bg-stone-950 border border-stone-800 text-stone-300 text-[11px] font-bold">
                      {item.stock || 25} ADET
                    </span>

                    <div className="flex items-center bg-stone-950 border border-stone-800 rounded-lg p-0.5">
                      <button 
                        onClick={() => updateStock(item.id, -1)}
                        disabled={isLocked}
                        className="p-1 text-stone-400 hover:text-white disabled:opacity-30"
                      >
                        <Minus className="w-3.5 h-3.5"/>
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-white">
                        {item.stock || 25}
                      </span>
                      <button 
                        onClick={() => updateStock(item.id, 1)}
                        disabled={isLocked}
                        className="p-1 text-stone-400 hover:text-white disabled:opacity-30"
                      >
                        <Plus className="w-3.5 h-3.5"/>
                      </button>
                    </div>

                    <button 
                      onClick={() => toggleLock(item.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isLocked 
                          ? 'bg-red-950/60 border-red-800 text-red-400' 
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-[#D4AF37]'
                      }`}
                    >
                      {isLocked ? <Lock className="w-3.5 h-3.5"/> : <Unlock className="w-3.5 h-3.5"/>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* SEKME 3: GÜN SONU RAPORU */}
        {activeTab === 'rapor' && (
          <div className="space-y-6">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
              <div>
                <span className="px-2.5 py-1 rounded bg-stone-950 border border-stone-800 text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
                  LOQUM ET FİNANS & MUTFAK RAPORU
                </span>
                <h2 className="text-base md:text-lg font-serif font-bold text-white mt-2">
                  Gün Sonu Kasa ve Operasyon Raporu
                </h2>
                <p className="text-xs text-stone-400 mt-1 max-w-xl leading-relaxed">
                  Ciro, adisyon adetleri, ödeme dağılımı ve mutfak kırılımlarını formatlı olarak işletme sahibinin WhatsApp hattına tek tıkla iletin.
                </p>
              </div>

              <button
                onClick={handleWhatsAppShare}
                className="w-full md:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F24] hover:from-[#E5C158] hover:to-[#D4AF37] text-stone-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 whitespace-nowrap"
              >
                <MessageSquare className="w-4 h-4 fill-stone-950"/>
                GÜN SONU RAPORUNU WHATSAPP'A İLET
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
                <span className="text-[11px] font-bold text-stone-400 tracking-wider uppercase block">
                  GÜNLÜK TOPLAM CİRO
                </span>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  ₺{dailyRevenue.toLocaleString('tr-TR')}
                </div>
                <span className="text-[10px] text-stone-500 mt-1 block">
                  Kapanan: ₺{dailyRevenue.toLocaleString('tr-TR')}
                </span>
              </div>

              <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
                <span className="text-[11px] font-bold text-stone-400 tracking-wider uppercase block">
                  TOPLAM ADİSYON
                </span>
                <div className="text-2xl font-black text-white mt-1">
                  {closedOrdersCount} Adet
                </div>
                <span className="text-[10px] text-stone-500 mt-1 block">
                  Açık: {activeOrders.length} / Kapanan: {closedOrdersCount}
                </span>
              </div>

              <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
                <span className="text-[11px] font-bold text-stone-400 tracking-wider uppercase block">
                  GARSON ORTALAMA YANIT
                </span>
                <div className="text-2xl font-black text-[#D4AF37] mt-1">
                  480 Saniye
                </div>
                <span className="text-[10px] text-stone-500 mt-1 block">
                  Lüks steakhouse servis standardı
                </span>
              </div>

              <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
                <span className="text-[11px] font-bold text-stone-400 tracking-wider uppercase block">
                  TOPLAM SERVİS ÇAĞRISI
                </span>
                <div className="text-2xl font-black text-white mt-1">
                  {calls.length} Çağrı
                </div>
                <span className="text-[10px] text-stone-500 mt-1 block">
                  Bekleyen: {calls.filter(c => !c.handled).length}
                </span>
              </div>
            </div>

            {/* En Çok Satanlar */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2 mb-4">
                <Trophy className="w-4 h-4 text-[#D4AF37]"/>
                LOQUM ET EN ÇOK SATAN LEZZETLER
              </h3>

              <div className="space-y-2.5 text-xs">
                {[
                  { rank: 1, name: 'Tomahawk Steak (Dry Aged)', count: '14 Porsiyon', revenue: '₺25.900' },
                  { rank: 2, name: 'Diyarbakır Saç Tava', count: '18 Porsiyon', revenue: '₺10.440' },
                  { rank: 3, name: 'Loqum Bonfile Dilimleri', count: '10 Porsiyon', revenue: '₺9.200' },
                  { rank: 4, name: 'Havuç Dilim Baklava', count: '22 Porsiyon', revenue: '₺6.160' }
                ].map((item) => (
                  <div 
                    key={item.rank}
                    className="flex items-center justify-between p-3 rounded-xl bg-stone-950 border border-stone-800"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 font-bold text-[#D4AF37]">{item.rank}</span>
                      <span className="font-semibold text-white">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-stone-300 font-medium">{item.count}</span>
                      <span className="text-[#D4AF37] font-bold min-w-[70px] text-right">{item.revenue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
