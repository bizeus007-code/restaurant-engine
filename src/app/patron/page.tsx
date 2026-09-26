"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp, Banknote, CreditCard, Users, Send,
  RefreshCw, CheckCircle2, ShieldAlert, Award, Calendar,
  MessageCircle, Copy, Check
} from "lucide-react";
import Link from "next/link";
import { formatDailyReportText, createWhatsAppReportUrl } from "@/src/lib/report";
import { RESTAURANT_CONFIG } from "@/src/config/restaurant.config";

export default function PatronCockpitPage() {
  const [report, setReport] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [patronPhone, setPatronPhone] = useState("904125030405");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/report");
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    const interval = setInterval(fetchReport, 5000);
    return () => clearInterval(interval);
  }, []);

  const todayStr = new Date().toLocaleDateString("tr-TR");

  const reportPayload = {
    date: todayStr,
    totalRevenue: report.totalRevenue || 0,
    cashRevenue: report.cashRevenue || 0,
    cardRevenue: report.cardRevenue || 0,
    totalTables: report.totalTables || 0,
    topItems: (report.topDishes || []).map((d: any) => ({
      name: d.name,
      count: d.count,
    })),
  };

  const handleCloseDay = async () => {
    if (!confirm("GÜNÜ KAPATMAK VE RAPORLAMAK İSTEDİĞİNİZE EMİN MİSİNİZ?\nTüm açık masalar kapatılacak ve arşivlenecektir.")) {
      return;
    }

    try {
      const res = await fetch("/api/report", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setStatusMessage("Gün sonu başarıyla kapatıldı! WhatsApp raporu hazırlanıyor...");
        setTimeout(() => {
          window.open(createWhatsAppReportUrl(reportPayload, patronPhone), "_blank");
        }, 600);
      }
      fetchReport();
    } catch {
      alert("Gün sonu kapatılırken hata oluştu.");
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-stone-100 font-sans p-4 sm:p-6 lg:p-8 selection:bg-amber-500 selection:text-black">
      {/* Üst Bar */}
      <header className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
              YÖNETİM & PATRON PANELİ
            </span>
            <span className="text-xs text-stone-500">• {todayStr}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-white tracking-wide">
            LOQUM ET GÜN SONU KOKPİTİ
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Diyarbakır Şubesi anlık ciro, tahsilat, ürün analizleri ve WhatsApp otomasyonu.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/kasa"
            className="py-2.5 px-4 rounded-xl bg-stone-900 border border-stone-800 hover:border-amber-400/50 text-xs font-semibold text-stone-300 transition-colors"
          >
            ← Kasa / Mutfak Ekranı
          </Link>
          <button
            onClick={fetchReport}
            className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white"
            title="Yenile"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
          </button>
        </div>
      </header>

      {statusMessage && (
        <div className="max-w-6xl mx-auto mb-6 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Ciro Sayaç Kartları */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Toplam Ciro */}
        <div className="p-5 rounded-2xl bg-[#121212] border border-stone-800 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold mb-2">
            <span>TOPLAM CİRO</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-serif font-black text-white">
            ₺{(report.totalRevenue || 0).toLocaleString("tr-TR")}
          </div>
          <div className="text-[11px] text-stone-500 mt-2">
            {report.totalTables || 0} Masadan elde edilen brüt tutar
          </div>
        </div>

        {/* Nakit */}
        <div className="p-5 rounded-2xl bg-[#121212] border border-stone-800 shadow-xl">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-2">
            <span>NAKİT TAHSİLAT</span>
            <Banknote className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-serif font-black text-emerald-200">
            ₺{(report.cashRevenue || 0).toLocaleString("tr-TR")}
          </div>
          <div className="text-[11px] text-stone-500 mt-2">
            Kasaya giren sıcak nakit
          </div>
        </div>

        {/* Kredi Kartı */}
        <div className="p-5 rounded-2xl bg-[#121212] border border-stone-800 shadow-xl">
          <div className="flex items-center justify-between text-xs text-cyan-400 font-semibold mb-2">
            <span>KREDİ KARTI / POS</span>
            <CreditCard className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-serif font-black text-cyan-200">
            ₺{(report.cardRevenue || 0).toLocaleString("tr-TR")}
          </div>
          <div className="text-[11px] text-stone-500 mt-2">
            POS terminallerinden çekilen
          </div>
        </div>

        {/* Masa Doluluk */}
        <div className="p-5 rounded-2xl bg-[#121212] border border-stone-800 shadow-xl">
          <div className="flex items-center justify-between text-xs text-purple-400 font-semibold mb-2">
            <span>TOPLAM ADİSYON</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-serif font-black text-purple-200">
            {report.totalTables || 0} Masa
          </div>
          <div className="text-[11px] text-stone-500 mt-2">
            Ort. Masa Sepeti: ₺{(report.averageBasket || 0).toLocaleString("tr-TR")}
          </div>
        </div>
      </div>

      {/* İki Kolonlu Grid: Ürün Analizi ve WhatsApp Raporu */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sol Kolon: Ürün Satış Analizleri (7 Cols) */}
        <section className="lg:col-span-7 bg-[#121212] border border-stone-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-4">
            <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Ürün Satış Analizi (Öne Çıkanlar)
            </h2>
            <span className="text-xs text-stone-400">Porsiyon Bazında</span>
          </div>

          <div className="space-y-3">
            {(report.topDishes && report.topDishes.length > 0) ? (
              report.topDishes.map((dish: any, idx: number) => (
                <div
                  key={dish.id || idx}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-stone-900/70 border border-stone-800"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-stone-800 text-amber-400 text-xs font-bold flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-white">{dish.name}</div>
                      <div className="text-[11px] text-stone-500">Ürün Toplam Ciro Katkısı: ₺{(dish.total || 0).toLocaleString("tr-TR")}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold text-amber-400 font-mono">
                      {dish.count} Adet
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-xs text-stone-500">
                Bugün henüz satış verisi kaydedilmedi.
              </div>
            )}
          </div>
        </section>

        {/* Sağ Kolon: WhatsApp Gün Sonu Otomasyonu (5 Cols) */}
        <section className="lg:col-span-5 bg-[#121212] border border-stone-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-4">
              <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                WhatsApp Gün Sonu Servisi
              </h2>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                CANLI ENTEGRASYON
              </span>
            </div>

            <div className="mb-4">
              <label className="block text-xs text-stone-400 mb-1.5 font-medium">
                Patron WhatsApp Telefon Numarası:
              </label>
              <input
                type="text"
                value={patronPhone}
                onChange={(e) => setPatronPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                placeholder="905xxxxxxxxx"
              />
            </div>

            {/* Rapor Metni Önizleme */}
            <div className="p-4 rounded-xl bg-black/80 border border-stone-800 text-xs font-mono text-stone-300 whitespace-pre-wrap leading-relaxed mb-4 max-h-56 overflow-y-auto">
              {formatDailyReportText(reportPayload)}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={handleCloseDay}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
            >
              <Send className="w-4 h-4" />
              Günü Kapat ve WhatsApp'a Raporla
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(formatDailyReportText(reportPayload));
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? "Metin Kopyalandı!" : "Rapor Metnini Kopyala"}</span>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

