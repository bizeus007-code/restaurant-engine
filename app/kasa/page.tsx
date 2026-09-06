"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  Check,
  Clock,
  Utensils,
  RefreshCw,
  Volume2,
  VolumeX,
  TrendingUp,
  Package,
  ArrowLeft,
  Plus,
  Minus,
  Infinity as InfinityIcon,
  Lock,
  Unlock,
  BarChart3
} from "lucide-react";
import Link from "next/link";

interface InventoryItem {
  count: number;
  isUnlimited: boolean;
  isLocked: boolean;
}

interface ReportData {
  totalRevenue: number;
  totalOrders: number;
  topDishes: Array<{ name: string; count: number; total: number }>;
  totalCalls: number;
  completedCalls: number;
  pendingCalls: number;
  avgResponseSec: number;
}

export default function KasaTerminalPage() {
  const [calls, setCalls] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<Record<string, InventoryItem>>({});
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<"siparisler" | "stok" | "rapor">("siparisler");
  const [reportData, setReportData] = useState<ReportData>({
    totalRevenue: 0,
    totalOrders: 0,
    topDishes: [],
    totalCalls: 0,
    completedCalls: 0,
    pendingCalls: 0,
    avgResponseSec: 0,
  });

  const lastCallIdRef = useRef<string | null>(null);
  const lastOrderIdRef = useRef<string | null>(null);

  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.85);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.85);
    } catch {}
  };

  const fetchData = async () => {
    try {
      const [cRes, oRes, sRes, rRes] = await Promise.all([
        fetch("/api/calls"),
        fetch("/api/orders"),
        fetch("/api/stock"),
        fetch("/api/report"),
      ]);
      const cData = await cRes.json();
      const oData = await oRes.json();
      const sData = await sRes.json();
      const rData = await rRes.json();

      if (cData.length > 0 && cData[0].id !== lastCallIdRef.current) {
        if (lastCallIdRef.current !== null) playChime();
        lastCallIdRef.current = cData[0].id;
      }
      if (oData.length > 0 && oData[0].id !== lastOrderIdRef.current) {
        if (lastOrderIdRef.current !== null) playChime();
        lastOrderIdRef.current = oData[0].id;
      }

      setCalls(cData);
      setOrders(oData);
      setInventory(sData || {});
      setReportData(rData || {
        totalRevenue: 0,
        totalOrders: 0,
        topDishes: [],
        totalCalls: 0,
        completedCalls: 0,
        pendingCalls: 0,
        avgResponseSec: 0,
      });
    } catch {}
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  const dismissCall = async (id: string) => {
    await fetch(`/api/calls?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const updateOrderStatus = async (id: string, status: string) => {
    await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchData();
  };

  const updateStockNumber = async (dishId: string, newCount: number) => {
    const current = inventory[dishId] || { count: 50, isUnlimited: false, isLocked: false };
    const clamped = Math.max(0, newCount);
    await fetch("/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dishId,
        count: clamped,
        isUnlimited: false,
        isLocked: clamped === 0,
      }),
    });
    fetchData();
  };

  const toggleStockLock = async (dishId: string) => {
    const current = inventory[dishId] || { count: 50, isUnlimited: false, isLocked: false };
    await fetch("/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dishId,
        count: current.count,
        isUnlimited: current.isUnlimited,
        isLocked: !current.isLocked,
      }),
    });
    fetchData();
  };

  const toggleStockUnlimited = async (dishId: string) => {
    const current = inventory[dishId] || { count: 50, isUnlimited: false, isLocked: false };
    await fetch("/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dishId,
        count: current.count,
        isUnlimited: !current.isUnlimited,
        isLocked: false,
      }),
    });
    fetchData();
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const activeTablesCount = new Set([
    ...calls.map((c) => c.tableNo),
    ...orders.filter((o) => o.status !== "teslim_edildi").map((o) => o.tableNo),
  ]).size;

  const PRODUCT_LIST = [
    { id: "special-kuzu-sirt", name: "Beroş Special Kuzu Sırt" },
    { id: "sur-kuzu-kol-dolmasi", name: "Sur Kuzu Kol Dolması (2 Kişilik)" },
    { id: "ayvali-kavurma", name: "Diyarbakır Ayvalı Kavurma" },
    { id: "firinda-kuzu-incik", name: "Fırında Kuzu İncik" },
    { id: "kekikli-kuzu-budu", name: "Kekikli Kuzu Budu" },
    { id: "kuzu-gerdan", name: "Kuzu Gerdan" },
    { id: "kuzu-greaten", name: "Kuzu Greaten" },
    { id: "kuzu-haslama", name: "Kuzu Haşlama" },
    { id: "firin-agzi", name: "Fırın Ağzı" },
    { id: "diyarbakir-kavurma", name: "Diyarbakır Kavurma" },
    { id: "patlican-kuzu-incik", name: "Patlıcan Yatağında Kuzu İncik" },
    { id: "firin-guvec", name: "Fırın Güveç" },
    { id: "kusbasi-kasarli-pide", name: "Kuşbaşı Kaşarlı Pide" },
    { id: "kusbasi-pide", name: "Kuşbaşı Pide" },
    { id: "kiymali-yumurtali-pide", name: "Kıymalı Yumurtalı Pide" },
    { id: "findik-lahmacun", name: "Fındık Lahmacun" },
    { id: "kasarli-pide", name: "Kaşarlı Pide" },
    { id: "sur-usulu-sac-tava", name: "Sur Usulü Hakiki Sac Tava" },
    { id: "beros-tavuk-special", name: "Beroş Tavuk Special" },
    { id: "kori-soslu-tavuk", name: "Köri Soslu Tavuk" },
    { id: "ispanak-tavuk-bonfile", name: "Ispanak Yatağında Tavuk Bonfile" },
    { id: "mumbar", name: "Geleneksel Sur Mumbarı" },
    { id: "icli-kofte", name: "Diyarbakır Usulü İçli Köfte" },
    { id: "talas-boregi", name: "Talaş Böreği" },
    { id: "kase-yogurt", name: "Kase Köy Yoğurdu" },
    { id: "fistikli-baklava", name: "Hakiki Fıstıklı Baklava" },
    { id: "fistikli-kadayif", name: "Diyarbakır Burma Kadayıf" },
    { id: "acik-ayran", name: "Yayık Açık Ayran" },
    { id: "kutu-mesrubat", name: "Soğuk Meşrubat Çeşitleri" },
    { id: "turk-kahvesi", name: "Közde Türk Kahvesi" },
  ];

  return (
    <div className="min-h-screen bg-[#070504] text-white p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Link className="p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all" href="/" title="Menüye Dön">
              <ArrowLeft className="w-4 h-4"/>
            </Link>
            <span className="text-xs font-mono tracking-[0.3em] text-[#d4af37] uppercase">
              BEROŞ RESTAURANT • OPERASYON YÖNETİMİ
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-light text-white mt-1 flex items-center gap-3">
            <span>Canlı Kasa & Mutfak Terminali</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-mono text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5"/>
            <span>Ciro: ₺{totalRevenue.toLocaleString("tr-TR")}</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-white/70">
            Aktif Masa: {activeTablesCount}
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-full border transition-all ${
              soundEnabled
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-white/10 bg-white/5 text-white/40"
            }`}
            title="Sesli Servis Zili"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4"/> : <VolumeX className="w-4 h-4"/>}
          </button>
          <button
            onClick={fetchData}
            className="p-2.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 text-white/80 transition-all"
            title="Yenile"
          >
            <RefreshCw className="w-4 h-4"/>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("siparisler")}
          className={`px-5 py-2.5 rounded-full text-xs font-mono tracking-wider transition-all ${
            activeTab === "siparisler"
              ? "bg-[#d4af37] text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)]"
              : "bg-white/5 text-white/60 hover:text-white"
          }`}
        >
          SİPARİŞLER & ÇAĞRILAR ({orders.length + calls.length})
        </button>
        <button
          onClick={() => setActiveTab("stok")}
          className={`px-5 py-2.5 rounded-full text-xs font-mono tracking-wider transition-all flex items-center gap-2 ${
            activeTab === "stok"
              ? "bg-[#d4af37] text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)]"
              : "bg-white/5 text-white/60 hover:text-white"
          }`}
        >
          <Package className="w-3.5 h-3.5"/>
          <span>MUTFAK STOK KONTROLÜ</span>
        </button>
        <button
          onClick={() => setActiveTab("rapor")}
          className={`px-5 py-2.5 rounded-full text-xs font-mono tracking-wider transition-all flex items-center gap-2 ${
            activeTab === "rapor"
              ? "bg-[#d4af37] text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)]"
              : "bg-white/5 text-white/60 hover:text-white"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5"/>
          <span>GÜN SONU & PERFORMANS RAPORU</span>
        </button>
      </div>

      {activeTab === "siparisler" && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* BEKLEYEN MASA ÇAĞRILARI */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h2 className="text-sm font-mono tracking-wider text-amber-400 flex items-center gap-2">
                <Bell className="w-4 h-4"/>
                <span>MASA ÇAĞRILARI ({calls.length})</span>
              </h2>
            </div>

            <div className="space-y-3">
              {calls.length === 0 ? (
                <div className="p-8 text-center text-white/30 border border-white/5 rounded-2xl font-mono text-xs">
                  Bekleyen garson veya hesap çağrısı yok.
                </div>
              ) : (
                calls.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/50 flex items-center justify-between shadow-[0_0_25px_rgba(245,158,11,0.2)] animate-pulse"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-serif font-bold text-white tracking-wide">
                          {c.tableNo}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500 text-black font-mono font-bold">
                          {c.serviceType}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-white/60 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5"/>
                        <span>{c.time}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => dismissCall(c.id)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shadow-md"
                    >
                      <Check className="w-4 h-4"/>
                      <span>Gidildi</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* GELEN SİPARİŞ ADİSYONLARI */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h2 className="text-sm font-mono tracking-wider text-emerald-400 flex items-center gap-2">
                <Utensils className="w-4 h-4"/>
                <span>GELEN SİPARİŞLER ({orders.length})</span>
              </h2>
            </div>

            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="p-8 text-center text-white/30 border border-white/5 rounded-2xl font-mono text-xs">
                  Henüz verilmiş bir sipariş bulunmuyor.
                </div>
              ) : (
                orders.map((ord) => (
                  <div
                    key={ord.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      ord.status === "teslim_edildi"
                        ? "bg-white/[0.02] border-white/10 opacity-50"
                        : "bg-[#14100c] border-[#d4af37]/40 shadow-[0_10px_35px_rgba(0,0,0,0.85)]"
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-serif text-[#d4af37] font-semibold">
                          {ord.tableNo}
                        </span>
                        <span className="text-xs font-mono text-white/50">{ord.time}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-base font-bold text-white">
                          ₺{ord.totalAmount}
                        </span>
                        {ord.status === "teslim_edildi" ? (
                          <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-white/60 font-mono">
                            Teslim Edildi ✓
                          </span>
                        ) : (
                          <button
                            onClick={() => updateOrderStatus(ord.id, "teslim_edildi")}
                            className="px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs font-bold transition-all active:scale-95 shadow-md"
                          >
                            Teslim Et
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 font-mono text-xs">
                      {ord.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-white/85">
                          <span>
                            <strong className="text-emerald-400 font-bold">{item.quantity}x</strong>{" "}
                            {item.name}
                          </span>
                          <span className="text-white/40">₺{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SAYISAL STOK YÖNETİMİ */}
      {activeTab === "stok" && (
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-white/70 font-mono">
            💡 Mutfaktaki adetleri girin. Müşteriler sipariş verdikçe stok otomatik azalır; 0 adede indiğinde menüde doğrudan <strong className="text-red-400 font-bold">&ldquo;TÜKENDİ&rdquo;</strong> olarak kilitlenir.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {PRODUCT_LIST.map((prod) => {
              const item = inventory[prod.id] || { count: 50, isUnlimited: false, isLocked: false };
              const isFinished = !item.isUnlimited && (item.count <= 0 || item.isLocked);

              return (
                <div
                  key={prod.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isFinished
                      ? "bg-red-950/20 border-red-500/40"
                      : "bg-[#120e0b] border-white/10 hover:border-[#d4af37]/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h4 className="font-serif text-sm text-white font-medium">{prod.name}</h4>
                      <span className="text-[11px] font-mono text-white/40">ID: {prod.id}</span>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        isFinished
                          ? "bg-red-500/20 text-red-400 border border-red-500/40"
                          : item.isUnlimited
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      }`}
                    >
                      {isFinished ? "TÜKENDİ" : item.isUnlimited ? "SINIRSIZ" : `${item.count} ADET`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                    {item.isUnlimited ? (
                      <span className="text-xs font-mono text-white/50 flex items-center gap-1.5 py-1">
                        <InfinityIcon className="w-4 h-4 text-blue-400"/>
                        <span>Sipariş Limiti Yok</span>
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateStockNumber(prod.id, item.count - 5)}
                          className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 font-mono text-xs"
                          title="5 Azalt"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => updateStockNumber(prod.id, item.count - 1)}
                          className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                          title="1 Azalt"
                        >
                          <Minus className="w-3.5 h-3.5"/>
                        </button>
                        <input
                          type="number"
                          value={item.count}
                          onChange={(e) => updateStockNumber(prod.id, parseInt(e.target.value) || 0)}
                          className="w-14 bg-black/60 border border-white/20 rounded-lg py-1 text-center font-mono text-xs text-white"
                        />
                        <button
                          onClick={() => updateStockNumber(prod.id, item.count + 1)}
                          className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                          title="1 Arttır"
                        >
                          <Plus className="w-3.5 h-3.5"/>
                        </button>
                        <button
                          onClick={() => updateStockNumber(prod.id, item.count + 10)}
                          className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 font-mono text-xs"
                          title="10 Ekle"
                        >
                          +10
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleStockUnlimited(prod.id)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          item.isUnlimited
                            ? "border-blue-500/40 bg-blue-500/20 text-blue-400"
                            : "border-white/10 bg-white/5 text-white/40 hover:text-white"
                        }`}
                        title="Sınırsız / Adetli Değiştir"
                      >
                        <InfinityIcon className="w-4 h-4"/>
                      </button>
                      <button
                        onClick={() => toggleStockLock(prod.id)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          item.isLocked
                            ? "border-red-500/40 bg-red-500/20 text-red-400"
                            : "border-white/10 bg-white/5 text-white/40 hover:text-white"
                        }`}
                        title={item.isLocked ? "Kilidi Aç" : "Hemen Bitir"}
                      >
                        {item.isLocked ? <Lock className="w-4 h-4"/> : <Unlock className="w-4 h-4"/>}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* GÜN SONU & PERFORMANS RAPORU */}
      {activeTab === "rapor" && (
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Üst Özet Kartları */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#120e0b] border border-white/10">
              <span className="text-xs font-mono text-white/50 block">GÜNLÜK TOPLAM CİRO</span>
              <span className="text-2xl sm:text-3xl font-serif text-[#d4af37] font-bold mt-1 block">
                ₺{reportData.totalRevenue?.toLocaleString("tr-TR") || 0}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#120e0b] border border-white/10">
              <span className="text-xs font-mono text-white/50 block">TOPLAM SİPARİŞ</span>
              <span className="text-2xl sm:text-3xl font-serif text-white font-bold mt-1 block">
                {reportData.totalOrders || 0} Adisyon
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#120e0b] border border-white/10">
              <span className="text-xs font-mono text-white/50 block">GARSON ORT. YANIT SÜRESİ</span>
              <span className="text-2xl sm:text-3xl font-serif text-emerald-400 font-bold mt-1 block">
                {reportData.avgResponseSec > 60
                  ? `${Math.floor(reportData.avgResponseSec / 60)} dk ${reportData.avgResponseSec % 60} sn`
                  : `${reportData.avgResponseSec} sn`}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#120e0b] border border-white/10">
              <span className="text-xs font-mono text-white/50 block">TOPLAM MASA ÇAĞRISI</span>
              <span className="text-2xl sm:text-3xl font-serif text-amber-400 font-bold mt-1 block">
                {reportData.totalCalls || 0} Çağrı
              </span>
            </div>
          </div>

          {/* En Çok Satanlar Lider Tablosu */}
          <div className="p-6 rounded-2xl bg-[#120e0b] border border-white/10 space-y-4">
            <h3 className="text-sm font-mono tracking-wider text-[#d4af37] uppercase flex items-center gap-2">
              <span>🏆 EN ÇOK SATAN LEZZETLER (LİDER TABLOSU)</span>
            </h3>

            <div className="divide-y divide-white/5">
              {(reportData.topDishes || []).length === 0 ? (
                <div className="py-6 text-center text-white/40 font-mono text-xs">
                  Henüz kaydedilmiş sipariş verisi yok.
                </div>
              ) : (
                (reportData.topDishes || []).map((dish: any, idx: number) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[#d4af37] font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-white text-sm font-serif">{dish.name}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-emerald-400 font-bold">{dish.count} Porsiyon Satıldı</span>
                      <span className="text-white/60 font-semibold w-24 text-right">
                        ₺{dish.total?.toLocaleString("tr-TR")}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
