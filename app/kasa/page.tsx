"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bell, Check, Utensils, RefreshCw, Volume2, VolumeX,
  CreditCard, Banknote, CheckCircle2, TrendingUp, Package, ArrowLeft,
  BarChart3, Lock, Unlock
} from "lucide-react";
import Link from "next/link";

export default function UnifiedKasaTerminal() {
  const [calls, setCalls] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<Record<string, any>>({});
  const [report, setReport] = useState<any>({});
  const [sound, setSound] = useState(true);
  const [tab, setTab] = useState<"adisyonlar" | "stok" | "rapor">("adisyonlar");

  const lastCallId = useRef<string | null>(null);
  const lastOrderId = useRef<string | null>(null);

  const notify = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try { navigator.vibrate([200, 100, 200]); } catch {}
    }
    if (!sound) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.85);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.85);
    } catch {}
  };

  const sync = async () => {
    try {
      const [cRes, oRes, sRes, rRes] = await Promise.all([
        fetch("/api/calls"),
        fetch("/api/orders"),
        fetch("/api/stock"),
        fetch("/api/report")
      ]);
      const [cData, oData, sData, rData] = await Promise.all([
        cRes.json(),
        oRes.json(),
        sRes.json(),
        rRes.json()
      ]);

      if (cData.length > 0 && cData[0].id !== lastCallId.current) {
        if (lastCallId.current !== null) notify();
        lastCallId.current = cData[0].id;
      }
      if (oData.length > 0 && oData[0].id !== lastOrderId.current) {
        if (lastOrderId.current !== null) notify();
        lastOrderId.current = oData[0].id;
      }

      setCalls(cData || []);
      setOrders(oData || []);
      setInventory(sData || {});
      setReport(rData || {});
    } catch {}
  };

  useEffect(() => {
    sync();
    const interval = setInterval(sync, 2500);
    return () => clearInterval(interval);
  }, [sound]);

  const updateOrderStatus = async (id: string, status: string, paymentMethod?: string) => {
    await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, paymentMethod })
    });
    sync();
  };

  const dismissCall = async (id: string) => {
    await fetch(`/api/calls?id=${id}`, { method: "DELETE" });
    sync();
  };

  const updateStockNumber = async (dishId: string, count: number) => {
    await fetch("/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dishId, count: Math.max(0, count) })
    });
    sync();
  };

  const toggleStockLock = async (dishId: string) => {
    const item = inventory[dishId] || {};
    await fetch("/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dishId, isLocked: !item.isLocked })
    });
    sync();
  };

  return (
    <div className="min-h-screen bg-[#070504] text-white p-3 sm:p-6 font-sans select-none">
      {/* BAŞLIK & CİRO */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-4 mb-6 gap-3">
        <div className="flex items-center gap-3">
          <Link className="p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/70" href="/">
            <ArrowLeft className="w-4 h-4"/>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-[0.25em] text-[#d4af37] uppercase">BEROŞ RESTAURANT</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-2xl font-serif text-white">Canlı Yönetici & Kasa Terminali</h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
            <TrendingUp className="w-3.5 h-3.5"/>
            <span>Ciro: ₺{(report.totalRevenue || 0).toLocaleString("tr-TR")}</span>
          </div>
          <button
            onClick={() => setSound(!sound)}
            className={`p-2 rounded-full border transition-all ${
              sound ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-white/5 text-white/40"
            }`}
            title="Sesli Uyarı Aç/Kapat"
          >
            {sound ? <Volume2 className="w-4 h-4"/> : <VolumeX className="w-4 h-4"/>}
          </button>
          <button onClick={sync} className="p-2 rounded-full border border-white/10 bg-white/5 text-white/80">
            <RefreshCw className="w-4 h-4"/>
          </button>
        </div>
      </div>

      {/* SEKME SEÇİMİ */}
      <div className="max-w-7xl mx-auto flex gap-2 mb-6">
        <button
          onClick={() => setTab("adisyonlar")}
          className={`px-4 py-2 rounded-xl text-xs font-mono tracking-wider transition-all ${
            tab === "adisyonlar" ? "bg-[#d4af37] text-black font-bold" : "bg-white/5 text-white/60"
          }`}
        >
          SİPARİŞ & ÇAĞRILAR ({orders.filter(o => o.status !== "kapandi").length + calls.length})
        </button>
        <button
          onClick={() => setTab("stok")}
          className={`px-4 py-2 rounded-xl text-xs font-mono tracking-wider transition-all flex items-center gap-1.5 ${
            tab === "stok" ? "bg-[#d4af37] text-black font-bold" : "bg-white/5 text-white/60"
          }`}
        >
          <Package className="w-3.5 h-3.5"/>
          <span>STOK KONTROL</span>
        </button>
        <button
          onClick={() => setTab("rapor")}
          className={`px-4 py-2 rounded-xl text-xs font-mono tracking-wider transition-all flex items-center gap-1.5 ${
            tab === "rapor" ? "bg-[#d4af37] text-black font-bold" : "bg-white/5 text-white/60"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5"/>
          <span>GÜN SONU RAPORU</span>
        </button>
      </div>

      {/* 1. SEKME: ADİSYONLAR VE ÇAĞRILAR */}
      {tab === "adisyonlar" && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-xs font-mono tracking-wider text-amber-400 flex items-center gap-1.5 border-b border-white/10 pb-2">
              <Bell className="w-4 h-4"/> BEKLEYEN MASA ÇAĞRILARI ({calls.length})
            </h2>
            {calls.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-white/30 border border-white/5 rounded-2xl">
                Bekleyen çağrı bulunmuyor.
              </div>
            ) : (
              calls.map((c) => (
                <div key={c.id} className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/50 flex justify-between items-center animate-pulse">
                  <div>
                    <span className="text-lg font-serif font-bold text-white mr-2">{c.tableNo}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500 text-black font-mono font-bold">{c.serviceType}</span>
                    <span className="text-[11px] font-mono text-white/50 block mt-1">{c.time}</span>
                  </div>
                  <button onClick={() => dismissCall(c.id)} className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-black font-mono text-xs font-bold hover:bg-amber-400">
                    Gidildi ✓
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="lg:col-span-8 space-y-3">
            <h2 className="text-xs font-mono tracking-wider text-emerald-400 flex items-center gap-1.5 border-b border-white/10 pb-2">
              <Utensils className="w-4 h-4"/> AKTİF MASALAR & SİPARİŞLER
            </h2>
            {orders.filter(o => o.status !== "kapandi").length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-white/30 border border-white/5 rounded-2xl">
                Aktif sipariş bulunmuyor.
              </div>
            ) : (
              orders.filter(o => o.status !== "kapandi").map((ord) => (
                <div key={ord.id} className="p-4 rounded-2xl bg-[#14100c] border border-white/10 space-y-3">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
                    <div>
                      <span className="text-2xl font-serif text-[#d4af37] font-semibold">{ord.tableNo}</span>
                      <span className="text-xs font-mono text-white/50 ml-3">{ord.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-mono font-bold text-white">₺{ord.totalAmount}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        ord.status === "servis_edildi" ? "bg-blue-500/20 text-blue-400" : "bg-amber-500/20 text-amber-400"
                      }`}>
                        {ord.status === "servis_edildi" ? "SERVİS EDİLDİ" : "HAZIRLANIYOR"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 font-mono text-xs">
                    {ord.items.map((it: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-white/80">
                        <span><b className="text-emerald-400">{it.quantity}x</b> {it.name}</span>
                        <span className="text-white/40">₺{it.price * it.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                    {ord.status === "hazirlaniyor" && (
                      <button
                        onClick={() => updateOrderStatus(ord.id, "servis_edildi")}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5"/> Masaya Servis Et
                      </button>
                    )}
                    {ord.status === "servis_edildi" && (
                      <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10">
                        <CheckCircle2 className="w-3.5 h-3.5"/> Masada Tüketiliyor
                      </span>
                    )}

                    <div className="ml-auto flex items-center gap-2">
                      <button
                        onClick={() => updateOrderStatus(ord.id, "kapandi", "Nakit")}
                        className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-xs font-bold flex items-center gap-1"
                      >
                        <Banknote className="w-3.5 h-3.5"/> Nakit Kapat
                      </button>
                      <button
                        onClick={() => updateOrderStatus(ord.id, "kapandi", "Kredi Kartı")}
                        className="px-3 py-1.5 rounded-xl bg-sky-700 hover:bg-sky-600 text-white font-mono text-xs font-bold flex items-center gap-1"
                      >
                        <CreditCard className="w-3.5 h-3.5"/> Kart Kapat
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 2. SEKME: STOK KONTROLÜ */}
      {tab === "stok" && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(inventory).map(([key, item]: [string, any]) => (
            <div key={key} className={`p-4 rounded-2xl border ${item.count <= 0 || item.isLocked ? "bg-red-950/20 border-red-500/40" : "bg-[#120e0b] border-white/10"}`}>
              <div className="flex items-start justify-between mb-2">
                <span className="font-serif text-sm text-white capitalize">{key.replace(/-/g, " ")}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${item.count <= 0 || item.isLocked ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                  {item.isLocked ? "KİLİTLİ" : item.isUnlimited ? "SINIRSIZ" : `${item.count} ADET`}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <button onClick={() => updateStockNumber(key, item.count - 1)} className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center font-bold text-sm">-</button>
                  <span className="font-mono text-xs w-8 text-center">{item.count}</span>
                  <button onClick={() => updateStockNumber(key, item.count + 1)} className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center font-bold text-sm">+</button>
                </div>
                <button onClick={() => toggleStockLock(key)} className="p-2 rounded-lg border border-white/10 text-xs">
                  {item.isLocked ? <Lock className="w-4 h-4 text-red-400"/> : <Unlock className="w-4 h-4 text-white/50"/>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. SEKME: GÜN SONU VE RAPORLAR */}
      {tab === "rapor" && (
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#120e0b] border border-white/10">
              <span className="text-xs font-mono text-white/50 block">GÜNLÜK TOPLAM CİRO</span>
              <span className="text-3xl font-serif text-[#d4af37] font-bold mt-1 block">₺{(report.totalRevenue || 0).toLocaleString("tr-TR")}</span>
              <span className="text-[11px] font-mono text-emerald-400 mt-1 block">Kapanan: ₺{(report.closedRevenue || 0).toLocaleString("tr-TR")}</span>
            </div>
            <div className="p-5 rounded-2xl bg-[#120e0b] border border-white/10">
              <span className="text-xs font-mono text-white/50 block">TOPLAM ADİSYON</span>
              <span className="text-3xl font-serif text-white font-bold mt-1 block">{report.totalOrders || 0} Adet</span>
              <span className="text-[11px] font-mono text-amber-400 mt-1 block">Açık: {report.activeOrders || 0} / Kapanan: {report.closedOrders || 0}</span>
            </div>
            <div className="p-5 rounded-2xl bg-[#120e0b] border border-white/10">
              <span className="text-xs font-mono text-white/50 block">GARSON ORTALAMA YANIT</span>
              <span className="text-3xl font-serif text-emerald-400 font-bold mt-1 block">{report.avgResponseSec || 0} Saniye</span>
              <span className="text-[11px] font-mono text-white/40 mt-1 block">Hızlı servis standardı</span>
            </div>
            <div className="p-5 rounded-2xl bg-[#120e0b] border border-white/10">
              <span className="text-xs font-mono text-white/50 block">TOPLAM SERVİS ÇAĞRISI</span>
              <span className="text-3xl font-serif text-amber-400 font-bold mt-1 block">{report.totalCalls || 0} Çağrı</span>
              <span className="text-[11px] font-mono text-white/40 mt-1 block">Bekleyen: {report.activeCalls || 0}</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#120e0b] border border-white/10 space-y-3">
            <h3 className="text-xs font-mono tracking-wider text-[#d4af37] uppercase">🏆 EN ÇOK SATAN LEZZETLER</h3>
            <div className="divide-y divide-white/5">
              {(report.topDishes || []).length === 0 ? (
                <div className="text-xs font-mono text-white/40 py-4">Henüz sipariş kaydı oluşmadı.</div>
              ) : (
                report.topDishes.map((d: any, idx: number) => (
                  <div key={idx} className="py-3 flex justify-between items-center text-xs font-mono">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[#d4af37] font-bold">{idx + 1}</span>
                      <span className="text-white text-sm font-serif">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-emerald-400 font-bold">{d.count} Porsiyon</span>
                      <span className="text-white/70 w-24 text-right">₺{d.total?.toLocaleString("tr-TR")}</span>
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
