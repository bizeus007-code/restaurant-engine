"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Flame, Bell, Receipt, Utensils, CheckCircle2, AlertTriangle,
  RefreshCw, Volume2, VolumeX, CreditCard, Banknote, Users,
  Package, ShieldCheck, Copy, Check, MessageCircle, X, Search,
  Phone, Calendar, Clock, Lock, LogOut, ChevronRight, Sparkles,
  Filter, Plus, Minus, Edit3, Trash2, Megaphone, CheckCircle, XCircle,
  Crown, Gift, Award
} from "lucide-react";
import Link from "next/link";
import { RESTAURANT_CONFIG } from "@/src/config/restaurant.config";
import { generateZReportText, generateWhatsAppLink } from "@/src/utils/whatsappReport";

export default function LoqumAdminCockpit() {
  // Authentication / PIN Lock State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinCode, setPinCode] = useState<string>("");
  const [pinError, setPinError] = useState<boolean>(false);
  const [pinShake, setPinShake] = useState<boolean>(false);

  // Active Tab: 'tables' | 'inventory' | 'reservations' | 'loyalty' | 'settings'
  const [activeTab, setActiveTab] = useState<"tables" | "inventory" | "reservations" | "loyalty" | "settings">("tables");

  // Live Data States
  const [calls, setCalls] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<Record<string, any>>({});
  const [report, setReport] = useState<any>({});
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [settings, setSettings] = useState<{
    isServiceOpen?: boolean;
    campaignText?: string;
    businessWhatsapp?: string;
  }>({
    isServiceOpen: true,
    campaignText: "",
    businessWhatsapp: "904125030405"
  });

  // Loyalty Program States (Loqum Club)
  const [loyaltySettings, setLoyaltySettings] = useState<any>({
    isEnabled: true,
    rewardItemId: "bonfile",
    rewardItemName: "Dana Bonfile (Lokum)",
    rewardItemPrice: 750,
    maxStamps: 6,
    adminPin: "2121",
    rateLimitDaily: true
  });
  const [loyaltyMembers, setLoyaltyMembers] = useState<Record<string, any>>({});
  const [loyaltySearchPhone, setLoyaltySearchPhone] = useState<string>("");
  const [selectedLoyaltyMember, setSelectedLoyaltyMember] = useState<any | null>(null);
  const [loyaltySearchQuery, setLoyaltySearchQuery] = useState<string>("");

  // UI Control States
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // KDS Department Filter
  const [kdsFilter, setKdsFilter] = useState<string>("all");

  // Table Modal State
  const [selectedTableForDetail, setSelectedTableForDetail] = useState<string | null>(null);

  // Z-Report Modal State
  const [isZReportModalOpen, setIsZReportModalOpen] = useState<boolean>(false);
  const [zReportData, setZReportData] = useState<any | null>(null);
  const [copiedZReport, setCopiedZReport] = useState<boolean>(false);

  // Inventory Tab Search & Category Filter
  const [inventorySearch, setInventorySearch] = useState<string>("");
  const [inventoryCategory, setInventoryCategory] = useState<string>("all");
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPriceVal, setTempPriceVal] = useState<string>("");

  // Reservation Tab Filter & New Reservation Modal
  const [reservationFilter, setReservationFilter] = useState<"all" | "beklemede" | "onaylandi" | "iptal">("all");
  const [isNewResModalOpen, setIsNewResModalOpen] = useState<boolean>(false);
  const [newResForm, setNewResForm] = useState({
    name: "",
    phone: "",
    date: new Date().toISOString().split("T")[0],
    time: "20:00",
    guests: "2 Kişilik",
    notes: ""
  });

  // Settings inputs
  const [campaignInput, setCampaignInput] = useState<string>("");
  const [whatsappInput, setWhatsappInput] = useState<string>("");

  const prevCallsCount = useRef<number>(0);
  const prevOrdersCount = useRef<number>(0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Sound ping on new alert
  const playAlertSound = () => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.7);
    } catch {}
  };

  // Check initial authentication
  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = sessionStorage.getItem("loqum_admin_pin_authenticated");
      if (auth === "true") {
        setIsAuthenticated(true);
      }
      fetch("/api/settings")
        .then((res) => res.json())
        .then((data) => {
          if (data?.adminPin) {
            localStorage.setItem("loqum_admin_pin", data.adminPin);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Keyboard PIN Listener
  useEffect(() => {
    if (isAuthenticated) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handlePinInput(e.key);
      } else if (e.key === "Backspace") {
        handlePinBackspace();
      } else if (e.key === "Escape") {
        handlePinClear();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthenticated, pinCode]);

  // Data Fetching & Sync
  const syncData = async () => {
    try {
      setIsRefreshing(true);
      const [cRes, oRes, sRes, rRes, fRes, resvRes, setRes, loyRes] = await Promise.all([
        fetch("/api/calls"),
        fetch("/api/orders"),
        fetch("/api/stock"),
        fetch("/api/report"),
        fetch("/api/feedback"),
        fetch("/api/reservations"),
        fetch("/api/settings"),
        fetch("/api/loyalty?all=true")
      ]);

      const [cData, oData, sData, rData, fData, resvData, setData, loyData] = await Promise.all([
        cRes.json(),
        oRes.json(),
        sRes.json(),
        rRes.json(),
        fRes.json(),
        resvRes.json(),
        setRes.json(),
        loyRes.json()
      ]);

      // Detect new incoming calls or orders
      if (Array.isArray(cData) && cData.length > prevCallsCount.current && prevCallsCount.current !== 0) {
        playAlertSound();
      }
      if (Array.isArray(oData) && oData.length > prevOrdersCount.current && prevOrdersCount.current !== 0) {
        playAlertSound();
      }

      if (Array.isArray(cData)) prevCallsCount.current = cData.length;
      if (Array.isArray(oData)) prevOrdersCount.current = oData.length;

      setCalls(Array.isArray(cData) ? cData : []);
      setOrders(Array.isArray(oData) ? oData : []);
      setInventory(sData || {});
      setReport(rData || {});
      setFeedbacks(Array.isArray(fData) ? fData : []);
      if (resvData && Array.isArray(resvData.reservations)) {
        let deletedIds: string[] = [];
        try {
          const s = localStorage.getItem('loqum_deleted_reservations');
          if (s) deletedIds = JSON.parse(s);
        } catch {}
        const isMock = (r: any) => {
          const n = (r.name || '').toLowerCase();
          return (
            n.includes('murat demir') ||
            n.includes('mehmet sarıgül') ||
            n.includes('mehmet sarigul') ||
            (n === 'mehmet' && r.phone === '11111949999') ||
            r.notes === 'Özel kutlama masası'
          );
        };
        const valid = resvData.reservations.filter((r: any) => !deletedIds.includes(r.id) && !isMock(r));
        setReservations(valid);
        if (typeof window !== 'undefined') {
          localStorage.setItem('loqum_reservations', JSON.stringify(valid));
        }
      }
      if (setData) {
        setSettings(setData);
        setCampaignInput(setData.campaignText || "");
        setWhatsappInput(setData.businessWhatsapp || "904125030405");
      }
      if (loyData && loyData.success) {
        if (loyData.loyaltySettings) setLoyaltySettings(loyData.loyaltySettings);
        if (loyData.loyaltyMembers) {
          setLoyaltyMembers(loyData.loyaltyMembers);
          if (selectedLoyaltyMember) {
            const updated = loyData.loyaltyMembers[selectedLoyaltyMember.phone];
            if (updated) setSelectedLoyaltyMember(updated);
          }
        }
      }
    } catch (err) {
      console.error("Cockpit sync failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Loyalty Handlers
  const handleToggleLoyalty = async (overrideValue?: boolean) => {
    const nextStatus = overrideValue !== undefined ? overrideValue : !loyaltySettings?.isEnabled;
    try {
      const res = await fetch("/api/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggleLoyalty", isEnabled: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        setLoyaltySettings(data.loyaltySettings);
        showToast(`👑 Sadakat Programı: ${nextStatus ? "AÇIK (Aktif) ✓" : "KAPALI (Gizlendi) ✕"}`);
      }
    } catch {
      showToast("Sadakat durumu güncellenemedi.");
    }
  };

  const handleSearchLoyaltyMember = async (phoneToSearch?: string) => {
    const target = phoneToSearch || loyaltySearchPhone;
    const clean = target.replace(/\D/g, "");
    if (clean.length < 10) {
      showToast("Lütfen en az 10 haneli telefon numarası giriniz.");
      return;
    }
    try {
      const res = await fetch("/api/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "queryMember", phone: clean })
      });
      const data = await res.json();
      if (data.success && data.member) {
        setSelectedLoyaltyMember(data.member);
        setLoyaltySearchPhone(data.member.formattedPhone || data.member.phone);
        showToast(`✓ Misafir kartı getirildi: ${data.member.formattedPhone || data.member.phone}`);
      } else {
        showToast(data.error || "Misafir kartı bulunamadı.");
      }
    } catch {
      showToast("Sorgulama başarısız.");
    }
  };

  const handleAdminAddStamp = async (phone: string, force: boolean = false) => {
    try {
      const res = await fetch("/api/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addStamp", phone, approvedBy: "Kasa (Yönetici)", force })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "✓ Damga başarıyla vuruldu!");
        playAlertSound();
        if (data.member) {
          setSelectedLoyaltyMember(data.member);
        }
        syncData();
      } else {
        showToast(`İkaz: ${data.error}`);
      }
    } catch {
      showToast("Damga vurma işlemi başarısız.");
    }
  };

  const handleAdminClaimReward = async (phone: string) => {
    if (!confirm("Hediye 'Dana Bonfile (Lokum)' masaya/misafire teslim edildi mi? Kart 0 damgaya sıfırlanacaktır.")) return;
    try {
      const res = await fetch("/api/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "claimReward", phone, approvedBy: "Kasa (Yönetici)" })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "🎉 Hediye Bonfile teslim edildi! Kart sıfırlandı.");
        playAlertSound();
        if (data.member) {
          setSelectedLoyaltyMember(data.member);
        }
        syncData();
      } else {
        showToast(data.error || "Hediye teslim işlemi başarısız.");
      }
    } catch {
      showToast("Hediye teslim işlemi başarısız.");
    }
  };

  const handleSaveLoyaltySettings = async (partial: any) => {
    try {
      const res = await fetch("/api/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateSettings", settings: partial })
      });
      const data = await res.json();
      if (data.success) {
        setLoyaltySettings(data.loyaltySettings);
        showToast("✓ Sadakat ayarları güncellendi.");
      }
    } catch {
      showToast("Sadakat ayarı kaydedilemedi.");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      syncData();
      const interval = setInterval(syncData, 3500);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, soundEnabled]);

  // Handle PIN input
  const handlePinInput = (num: string) => {
    const storedPin =
      (typeof window !== "undefined" && localStorage.getItem("loqum_admin_pin")) || "1234";
    const targetLen = Math.max(4, storedPin.length);
    if (pinCode.length >= targetLen) return;
    const nextPin = pinCode + num;
    setPinCode(nextPin);
    setPinError(false);

    if (nextPin === storedPin || nextPin === "1234" || nextPin === "2121") {
      setIsAuthenticated(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("loqum_admin_pin_authenticated", "true");
      }
      playAlertSound();
      showToast("🔓 Yönetim Kokpiti Açıldı. Hoş geldiniz!");
    } else if (nextPin.length >= targetLen) {
      setPinError(true);
      setPinShake(true);
      setTimeout(() => {
        setPinShake(false);
        setPinCode("");
      }, 600);
    }
  };

  const handlePinBackspace = () => {
    setPinCode((prev) => prev.slice(0, -1));
    setPinError(false);
  };

  const handlePinClear = () => {
    setPinCode("");
    setPinError(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPinCode("");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("loqum_admin_pin_authenticated");
    }
    showToast("🔒 Yönetim Kokpiti Kilitlendi.");
  };

  // Handle Call Status Actions
  const handleUpdateCallStatus = async (id: string, status: string) => {
    if (status === "kapat") {
      await fetch(`/api/calls?id=${id}`, { method: "DELETE" });
    } else {
      await fetch("/api/calls", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
    }
    syncData();
  };

  // Handle Order KDS Status
  const handleUpdateOrderStatus = async (id: string, status: string) => {
    await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    syncData();
  };

  // Handle Order Comp / Cancel
  const handleCompOrder = async (id: string) => {
    await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isComped: true }),
    });
    syncData();
  };

  const handleCancelOrder = async (id: string) => {
    if (!confirm("Bu adisyonu iptal etmek istediğinize emin misiniz?")) return;
    await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isCancelled: true, status: "iptal" }),
    });
    syncData();
  };

  // Handle Stock Count & Lock
  const handleUpdateStock = async (dishId: string, delta: number) => {
    const current = inventory[dishId]?.count ?? 25;
    const nextCount = Math.max(0, current + delta);
    await fetch("/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dishId, count: nextCount }),
    });
    syncData();
  };

  const handleToggleStockLock = async (dishId: string) => {
    const isCurrentlyLocked = Boolean(inventory[dishId]?.isLocked);
    await fetch("/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dishId, isLocked: !isCurrentlyLocked }),
    });
    showToast(!isCurrentlyLocked ? "🚫 Ürün Tükendi olarak işaretlendi." : "✓ Ürün tekrar Stokta açıldı.");
    syncData();
  };

  // Handle Quick Price Update
  const handleSavePrice = async (dishId: string, newPrice: number) => {
    if (isNaN(newPrice) || newPrice <= 0) {
      alert("Lütfen geçerli bir fiyat giriniz.");
      return;
    }
    await fetch("/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dishId, price: newPrice }),
    });
    setEditingPriceId(null);
    setTempPriceVal("");
    showToast(`💰 Fiyat ₺${newPrice} olarak güncellendi!`);
    syncData();
  };

  // Handle Reservation Actions
  const handleUpdateReservationStatus = async (id: string, status: "onaylandi" | "iptal" | "beklemede") => {
    await fetch("/api/reservations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    showToast(status === "onaylandi" ? "✓ Rezervasyon Onaylandı!" : "✕ Rezervasyon İptal Edildi.");
    syncData();
  };

  const handleDeleteReservation = async (id: string) => {
    if (!confirm("Bu rezervasyonu silmek istediğinize emin misiniz?")) return;
    try {
      const s = localStorage.getItem('loqum_deleted_reservations');
      const list: string[] = s ? JSON.parse(s) : [];
      if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem('loqum_deleted_reservations', JSON.stringify(list));
      }
      const saved = localStorage.getItem('loqum_reservations');
      if (saved) {
        const parsed = JSON.parse(saved);
        const filtered = parsed.filter((r: any) => r.id !== id);
        localStorage.setItem('loqum_reservations', JSON.stringify(filtered));
      }
    } catch {}
    setReservations((prev) => prev.filter((r: any) => r.id !== id));
    await fetch(`/api/reservations?id=${id}`, { method: "DELETE" });
    showToast("🗑️ Rezervasyon silindi.");
    syncData();
  };

  const handleSendWhatsAppConfirmation = (resv: any) => {
    const cleanPhone = (resv.phone || "").replace(/\D/g, "");
    if (!cleanPhone) {
      alert("Geçerli bir telefon numarası bulunamadı.");
      return;
    }
    const msg =
      `🥩 *LOQUM ET STEAKHOUSE - REZERVASYON ONAYI* 🥩\n\n` +
      `Sayın *${resv.name}*,\n` +
      `Tarih: *${resv.date}*\n` +
      `Saat: *${resv.time}*\n` +
      `Kişi Sayısı: *${resv.guests}*\n` +
      `Şube: *${resv.branch || "LOQUM ET Diyarbakır"}*\n\n` +
      `Rezervasyonunuz onaylanmıştır. Seçkin lezzetlerimizi deneyimlemeniz için masanız özenle hazırlanmaktadır. Sizi ağırlamaktan onur duyarız. ✨`;

    const url = `https://wa.me/${cleanPhone.startsWith("90") ? cleanPhone : "90" + cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  const handleCreateManualReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResForm.name || !newResForm.phone) {
      alert("Lütfen ad ve telefon alanlarını doldurunuz.");
      return;
    }
    await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newResForm,
        status: "onaylandi"
      })
    });
    setIsNewResModalOpen(false);
    setNewResForm({
      name: "",
      phone: "",
      date: new Date().toISOString().split("T")[0],
      time: "20:00",
      guests: "2 Kişilik",
      notes: ""
    });
    showToast("✓ Manuel rezervasyon oluşturuldu ve onaylandı!");
    syncData();
  };

  // Handle Settings Update
  const handleSaveSettings = async (updates: Partial<typeof settings>) => {
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    showToast("⚙️ Ayarlar başarıyla kaydedildi!");
    syncData();
  };

  // End-of-Day Z-Report
  const handleTriggerZReport = async () => {
    if (!confirm("GÜN SONUNU KAPATMAK ÜZERESİNİZ!\nTüm açık masalar kapatılacak ve Z-Raporu dondurulacaktır. Devam edilsin mi?")) {
      return;
    }
    try {
      const res = await fetch("/api/report", { method: "POST" });
      const data = await res.json();
      if (data.success && data.zReport) {
        setZReportData(data.zReport);
        setIsZReportModalOpen(true);
      }
      syncData();
    } catch {
      alert("Z-Raporu alınırken hata oluştu.");
    }
  };

  // 24 Salon Masası + 8 Bahçe Masası
  const tableNumbers = [
    ...Array.from({ length: 24 }, (_, i) => `MASA ${String(i + 1).padStart(2, "0")}`),
    ...Array.from({ length: 8 }, (_, i) => `BAHÇE ${String(i + 1).padStart(2, "0")}`)
  ];

  const getTableStatus = (tNo: string) => {
    const activeCall = calls.find((c) => c.tableNo === tNo);
    if (activeCall) {
      if (activeCall.serviceType === "Hesap") {
        return { label: "Hesap İstendi", color: "bg-red-900/90 text-red-200 border-red-500 animate-pulse", call: activeCall };
      }
      return { label: "Garson Çağırıyor", color: "bg-amber-900/90 text-amber-200 border-amber-500 animate-pulse", call: activeCall };
    }

    const tableActiveOrders = orders.filter((o) => o.tableNo === tNo && o.status !== "kapandi" && !o.isCancelled);
    if (tableActiveOrders.length > 0) {
      const hasPreparing = tableActiveOrders.some((o) => o.status === "hazirlaniyor");
      const hasReady = tableActiveOrders.some((o) => o.status === "servise_hazir");
      if (hasReady) return { label: "Servise Hazır", color: "bg-emerald-900/80 text-emerald-200 border-emerald-500", orders: tableActiveOrders };
      if (hasPreparing) return { label: "Hazırlanıyor", color: "bg-orange-950/80 text-orange-200 border-orange-500", orders: tableActiveOrders };
      return { label: "Oturum Açık", color: "bg-blue-950/80 text-blue-200 border-blue-500", orders: tableActiveOrders };
    }

    return { label: "Boş", color: "bg-[#141414] text-neutral-500 border-neutral-800", orders: [] };
  };

  // Filter KDS Orders
  const filteredKdsOrders = orders.filter((o) => {
    if (o.status === "kapandi" || o.isCancelled) return false;
    if (kdsFilter === "all") return true;
    return (o.items || []).some((it: any) => it.department === kdsFilter);
  });

  // Filter Inventory Items (160 Products)
  const inventoryList = Object.values(inventory);
  const filteredInventory = inventoryList.filter((item: any) => {
    const matchCategory = inventoryCategory === "all" || item.categorySlug === inventoryCategory;
    const matchSearch =
      !inventorySearch ||
      item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      (item.tag && item.tag.toLowerCase().includes(inventorySearch.toLowerCase()));
    return matchCategory && matchSearch;
  });

  // Filter Reservations
  const filteredReservations = reservations.filter((r: any) => {
    if (reservationFilter === "all") return true;
    return r.status === reservationFilter;
  });

  const pendingResCount = reservations.filter((r: any) => r.status === "beklemede").length;
  const lockedInventoryCount = inventoryList.filter((i: any) => i.isLocked).length;
  const activeOrdersCount = orders.filter((o) => o.status !== "kapandi" && !o.isCancelled).length;

  // ==========================================
  // PIN LOCK SCREEN COMPONENT
  // ==========================================
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#080808] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Background glow effects */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#8B0000]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />

        <div
          className={`w-full max-w-sm bg-[#121212]/95 border border-[#D4AF37]/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-center relative z-10 ${
            pinShake ? "animate-[shake_0.4s_ease-in-out]" : ""
          }`}
        >
          {/* Flame Amblem */}
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#8B0000] to-[#2E1C14] border border-[#D4AF37]/50 flex items-center justify-center shadow-lg shadow-[#8B0000]/40 mb-3">
            <Flame className="w-8 h-8 text-[#D4AF37]" />
          </div>

          <h1 className="text-xl font-serif font-bold text-white tracking-wide">
            LOQUM ET STEAKHOUSE
          </h1>
          <p className="text-xs text-[#D4AF37] font-mono font-semibold tracking-wider mt-0.5 uppercase">
            YÖNETİCİ KOKPİTİ GİRİŞİ
          </p>
          <p className="text-[11px] text-neutral-400 mt-2">
            Lütfen 4 haneli PIN kodunuzu giriniz
          </p>

          {/* PIN Indicator Dots */}
          <div className="flex items-center justify-center gap-3 my-6">
            {[0, 1, 2, 3].map((idx) => {
              const filled = pinCode.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border transition-all duration-200 ${
                    filled
                      ? pinError
                        ? "bg-red-600 border-red-500 scale-110 shadow-lg shadow-red-600/50"
                        : "bg-[#D4AF37] border-[#FBE291] scale-110 shadow-lg shadow-[#D4AF37]/50"
                      : "bg-neutral-800 border-neutral-700"
                  }`}
                />
              );
            })}
          </div>

          {pinError && (
            <div className="text-xs font-semibold text-red-400 mb-3 animate-pulse">
              Hatalı PIN Kodu! Lütfen tekrar deneyiniz.
            </div>
          )}

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handlePinInput(num)}
                className="h-14 rounded-2xl bg-neutral-900/80 hover:bg-[#D4AF37]/20 border border-neutral-800 hover:border-[#D4AF37]/60 text-xl font-serif font-bold text-white transition-all active:scale-95 shadow-md flex items-center justify-center cursor-pointer"
              >
                {num}
              </button>
            ))}

            <button
              type="button"
              onClick={handlePinClear}
              className="h-14 rounded-2xl bg-neutral-900/60 hover:bg-neutral-800 border border-neutral-800 text-xs font-bold text-neutral-400 hover:text-white transition-all active:scale-95 flex items-center justify-center cursor-pointer"
            >
              C
            </button>

            <button
              type="button"
              onClick={() => handlePinInput("0")}
              className="h-14 rounded-2xl bg-neutral-900/80 hover:bg-[#D4AF37]/20 border border-neutral-800 hover:border-[#D4AF37]/60 text-xl font-serif font-bold text-white transition-all active:scale-95 shadow-md flex items-center justify-center cursor-pointer"
            >
              0
            </button>

            <button
              type="button"
              onClick={handlePinBackspace}
              className="h-14 rounded-2xl bg-neutral-900/60 hover:bg-neutral-800 border border-neutral-800 text-xs font-bold text-neutral-400 hover:text-white transition-all active:scale-95 flex items-center justify-center cursor-pointer"
              title="Sil"
            >
              ⌫
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-500">
            <span>PIN: 1234 veya 2121</span>
            <Link href="/" className="text-[#D4AF37] hover:underline">
              ← Menüye Dön
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // MAIN AUTHENTICATED COCKPIT
  // ==========================================
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans selection:bg-[#8B0000] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 bg-[#1A1A1A] border border-[#D4AF37] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl animate-bounce flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP HEADER & COCKPIT CONTROLS */}
      <header className="sticky top-0 z-40 bg-[#121212]/95 border-b border-[#2E1C14] px-4 py-2.5 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B0000] to-[#2E1C14] border border-[#D4AF37]/50 flex items-center justify-center shadow-lg shadow-[#8B0000]/30">
            <Flame className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-serif font-bold text-white tracking-wide">
                LOQUM ET STEAKHOUSE
              </h1>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#8B0000] text-[#FBE291] font-mono font-bold tracking-wider uppercase border border-[#D4AF37]/30">
                KOKPİT
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Diyarbakır • Canlı Senkron</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-colors flex items-center gap-1.5 text-xs ${
              soundEnabled
                ? "bg-black/60 border-[#D4AF37]/50 text-[#D4AF37]"
                : "bg-black/40 border-neutral-800 text-neutral-500"
            }`}
            title="Sesli İkazlar"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? "Ses Açık" : "Sessiz"}</span>
          </button>

          {/* Sync Refresh */}
          <button
            type="button"
            onClick={syncData}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-black/60 border border-neutral-800 hover:border-[#D4AF37]/40 text-neutral-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Yenile"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#D4AF37]" : ""}`} />
            <span className="hidden sm:inline">Senkron</span>
          </button>

          {/* Customer QR View */}
          <Link
            href="/?masa=01"
            target="_blank"
            className="py-1.5 px-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-xs font-medium transition-colors"
          >
            Müşteri Menüsü ↗
          </Link>

          {/* Logout / Lock Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
            title="Güvenli Çıkış"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Çıkış</span>
          </button>
        </div>
      </header>

      {/* 2. LIVE METRIC CARDS STRIP */}
      <section className="px-4 pt-3 pb-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        <div className="bg-[#141414] border border-[#2E1C14] rounded-xl p-3 shadow-lg">
          <div className="text-[10px] uppercase font-mono tracking-wider text-[#D4AF37] font-semibold flex items-center justify-between">
            <span>Toplam Ciro</span>
            <Flame className="w-3.5 h-3.5 text-[#8B0000]" />
          </div>
          <div className="text-xl font-serif font-bold text-white mt-1">
            ₺{(report.totalRevenue || 0).toLocaleString("tr-TR")}
          </div>
        </div>

        <div className="bg-[#141414] border border-[#2E1C14] rounded-xl p-3 shadow-lg">
          <div className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-semibold flex items-center justify-between">
            <span>Açık Masalar</span>
            <Receipt className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-serif font-bold text-amber-200 mt-1">
            ₺{(report.openRevenue || 0).toLocaleString("tr-TR")}
          </div>
          <div className="text-[9px] text-neutral-500">{activeOrdersCount} aktif sipariş</div>
        </div>

        <div className="bg-[#141414] border border-[#2E1C14] rounded-xl p-3 shadow-lg">
          <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-semibold flex items-center justify-between">
            <span>Nakit Tahsilat</span>
            <Banknote className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-serif font-bold text-emerald-200 mt-1">
            ₺{(report.cashRevenue || 0).toLocaleString("tr-TR")}
          </div>
        </div>

        <div className="bg-[#141414] border border-[#2E1C14] rounded-xl p-3 shadow-lg">
          <div className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 font-semibold flex items-center justify-between">
            <span>Kredi Kartı</span>
            <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-serif font-bold text-cyan-200 mt-1">
            ₺{(report.cardRevenue || 0).toLocaleString("tr-TR")}
          </div>
        </div>

        <div className="bg-[#141414] border border-[#2E1C14] rounded-xl p-3 shadow-lg col-span-2 sm:col-span-1">
          <div className="text-[10px] uppercase font-mono tracking-wider text-purple-400 font-semibold flex items-center justify-between">
            <span>Ort. Masa Sepeti</span>
            <Users className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-serif font-bold text-purple-200 mt-1">
            ₺{(report.averageBasket || 0).toLocaleString("tr-TR")}
          </div>
          <div className="text-[9px] text-neutral-500">{report.totalTables || 0} toplam masa</div>
        </div>
      </section>

      {/* 3. 4 MAIN NAVIGATION TABS */}
      <nav className="px-4 py-2 sticky top-[57px] z-30 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-neutral-800/80">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {/* TAB 1: Canlı Masalar & Siparişler */}
          <button
            type="button"
            onClick={() => setActiveTab("tables")}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "tables"
                ? "bg-gradient-to-r from-[#8B0000] to-[#B22222] text-white border border-[#D4AF37]/50 shadow-lg shadow-[#8B0000]/30 font-bold"
                : "bg-[#141414] text-neutral-400 hover:text-white border border-neutral-800"
            }`}
          >
            <Bell className="w-4 h-4 text-[#D4AF37]" />
            <span>Canlı Masalar & Siparişler</span>
            {(calls.length > 0 || activeOrdersCount > 0) && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black font-mono font-bold text-[10px]">
                {calls.length + activeOrdersCount}
              </span>
            )}
          </button>

          {/* TAB 2: Hızlı Fiyat & Stok Düzenleyici */}
          <button
            type="button"
            onClick={() => setActiveTab("inventory")}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "inventory"
                ? "bg-gradient-to-r from-[#8B0000] to-[#B22222] text-white border border-[#D4AF37]/50 shadow-lg shadow-[#8B0000]/30 font-bold"
                : "bg-[#141414] text-neutral-400 hover:text-white border border-neutral-800"
            }`}
          >
            <Package className="w-4 h-4 text-[#D4AF37]" />
            <span>Hızlı Fiyat & Stok (160 Ürün)</span>
            {lockedInventoryCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white font-mono font-bold text-[10px]">
                {lockedInventoryCount} Tükendi
              </span>
            )}
          </button>

          {/* TAB 3: Rezervasyon Yönetimi */}
          <button
            type="button"
            onClick={() => setActiveTab("reservations")}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "reservations"
                ? "bg-gradient-to-r from-[#8B0000] to-[#B22222] text-white border border-[#D4AF37]/50 shadow-lg shadow-[#8B0000]/30 font-bold"
                : "bg-[#141414] text-neutral-400 hover:text-white border border-neutral-800"
            }`}
          >
            <Calendar className="w-4 h-4 text-[#D4AF37]" />
            <span>Rezervasyon Yönetimi</span>
            {pendingResCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black font-mono font-bold text-[10px]">
                {pendingResCount} Bekleyen
              </span>
            )}
          </button>

          {/* TAB 4: Loqum Club Sadakat & Kasa */}
          <button
            type="button"
            onClick={() => setActiveTab("loyalty")}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "loyalty"
                ? "bg-gradient-to-r from-[#8B0000] to-[#B22222] text-white border border-[#D4AF37]/50 shadow-lg shadow-[#8B0000]/30 font-bold"
                : "bg-[#141414] text-neutral-400 hover:text-white border border-neutral-800"
            }`}
          >
            <Crown className="w-4 h-4 text-[#D4AF37]" />
            <span>💎 Loqum Club (Sadakat)</span>
            {loyaltySettings?.isEnabled === false ? (
              <span className="px-1.5 py-0.2 rounded-full bg-neutral-700 text-neutral-400 font-mono text-[10px]">
                Kapalı
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-[10px]">
                {Object.keys(loyaltyMembers).length} Üye
              </span>
            )}
          </button>

          {/* TAB 5: Bildirimler & Ayarlar */}
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "settings"
                ? "bg-gradient-to-r from-[#8B0000] to-[#B22222] text-white border border-[#D4AF37]/50 shadow-lg shadow-[#8B0000]/30 font-bold"
                : "bg-[#141414] text-neutral-400 hover:text-white border border-neutral-800"
            }`}
          >
            <Receipt className="w-4 h-4 text-[#D4AF37]" />
            <span>Bildirimler, Z-Raporu & Ayarlar</span>
          </button>
        </div>
      </nav>

      {/* 4. TAB CONTENTS */}
      <div className="flex-1 p-4">
        {/* ============================================================== */}
        {/* TAB 1: CANLI MASALAR & SİPARİŞLER (SPLIT-SCREEN COCKPIT)       */}
        {/* ============================================================== */}
        {activeTab === "tables" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* LEFT COLUMN: ÇAĞRILAR & MASA KROKİSİ (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* ANLIK ÇAĞRI AKIŞI */}
              <div className="bg-[#141414] border border-[#2E1C14] rounded-2xl p-4 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#D4AF37]" />
                    <h2 className="text-sm font-serif font-bold text-white tracking-wide">
                      Anlık Çağrı & Bildirim Akışı
                    </h2>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#8B0000] text-white font-mono font-bold">
                    {calls.length} Bekleyen
                  </span>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {calls.length > 0 ? (
                    calls.map((call) => (
                      <div
                        key={call.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                          call.serviceType === "Hesap"
                            ? "bg-red-950/40 border-red-800/80"
                            : "bg-amber-950/30 border-amber-800/60"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{call.tableNo}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                                call.serviceType === "Hesap" ? "bg-red-600 text-white" : "bg-amber-500 text-black"
                              }`}
                            >
                              {call.serviceType}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono">{call.time}</span>
                          </div>
                          <div className="text-xs text-neutral-300 mt-1 font-medium">{call.reason}</div>
                          {call.status === "yoldayim" && (
                            <span className="text-[10px] text-cyan-400 font-semibold mt-0.5 block">
                              ⚡ Garson masaya intikal ediyor...
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {call.status !== "yoldayim" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateCallStatus(call.id, "yoldayim")}
                              className="px-2.5 py-1.5 rounded-lg bg-cyan-900/60 hover:bg-cyan-800 border border-cyan-500 text-cyan-200 text-xs font-bold transition-all"
                            >
                              Yoldayım
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleUpdateCallStatus(call.id, "kapat")}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-900/70 hover:bg-emerald-800 border border-emerald-500 text-emerald-200 text-xs font-bold transition-all"
                          >
                            Tamamla
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs text-neutral-500">
                      Bekleyen çağrı veya hesap talebi yok.
                    </div>
                  )}
                </div>
              </div>

              {/* CANLI MASA KROKİSİ (32 Masa) */}
              <div className="bg-[#141414] border border-[#2E1C14] rounded-2xl p-4 shadow-xl flex-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#D4AF37]" />
                    <h2 className="text-sm font-serif font-bold text-white tracking-wide">
                      Salon & Bahçe Masa Krokisi
                    </h2>
                  </div>
                  <span className="text-[11px] text-neutral-400 font-mono">32 Masa (24 Salon + 8 Bahçe)</span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {tableNumbers.map((tNo) => {
                    const status = getTableStatus(tNo);
                    return (
                      <button
                        key={tNo}
                        type="button"
                        onClick={() => setSelectedTableForDetail(tNo)}
                        className={`p-2.5 rounded-xl border text-left transition-all hover:scale-105 active:scale-95 flex flex-col justify-between min-h-[68px] cursor-pointer ${status.color}`}
                      >
                        <div className="text-xs font-bold font-mono tracking-tight">{tNo}</div>
                        <div className="text-[9px] font-semibold leading-tight line-clamp-1">
                          {status.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: CANLI MUTFAK / KDS AKIŞI (7 Cols) */}
            <div className="lg:col-span-7 bg-[#141414] border border-[#2E1C14] rounded-2xl p-4 shadow-xl flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-[#D4AF37]" />
                  <h2 className="text-sm font-serif font-bold text-white tracking-wide">
                    Canlı Mutfak & KDS Akışı
                  </h2>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#2E1C14] text-[#D4AF37] font-mono font-bold">
                  {filteredKdsOrders.length} Sipariş
                </span>
              </div>

              {/* Department Filters */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-3 text-xs">
                {[
                  { id: "all", label: "Tümü" },
                  { id: "steak", label: "Steak / Izgara" },
                  { id: "grill_oven", label: "Taş Fırın & Kebap" },
                  { id: "kitchen", label: "Sıcak Mutfak" },
                  { id: "bar", label: "Bar / İçecek" },
                  { id: "dessert", label: "Gurme Tatlı" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setKdsFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      kdsFilter === tab.id
                        ? "bg-[#8B0000] text-white font-bold"
                        : "bg-black/40 text-neutral-400 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Order Cards */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[620px] pr-1">
                {filteredKdsOrders.length > 0 ? (
                  filteredKdsOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-black/60 border border-neutral-800 rounded-xl p-3 shadow-md"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white px-2 py-0.5 bg-[#8B0000]/60 rounded-md border border-[#8B0000]">
                            {ord.tableNo}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono">{ord.time}</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            ord.status === "servise_hazir"
                              ? "bg-emerald-900 text-emerald-300 border border-emerald-500"
                              : "bg-orange-950 text-orange-300 border border-orange-500"
                          }`}
                        >
                          {ord.status === "servise_hazir" ? "Servise Hazır" : "Hazırlanıyor"}
                        </span>
                      </div>

                      {/* Items list */}
                      <div className="space-y-1.5 mb-3">
                        {(ord.items || []).map((it: any, idx: number) => (
                          <div
                            key={idx}
                            className="text-xs text-neutral-200 flex items-start justify-between gap-2"
                          >
                            <div>
                              <span className="font-bold text-[#D4AF37] mr-1.5">{it.quantity}x</span>
                              <span className="font-semibold text-white">{it.name}</span>
                              {it.portion && (
                                <span className="ml-1 text-[10px] text-neutral-400 font-mono">({it.portion})</span>
                              )}
                              {it.selectedOptions && Object.entries(it.selectedOptions).map(([k, v]: any) => (
                                <span
                                  key={k}
                                  className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded bg-[#8B0000]/60 text-amber-200 border border-[#8B0000]"
                                >
                                  {v}
                                </span>
                              ))}
                              {it.note && (
                                <div className="text-[10px] text-amber-400 italic mt-0.5">Not: {it.note}</div>
                              )}
                            </div>
                            <span className="text-[11px] text-neutral-400 font-mono whitespace-nowrap">
                              ₺{(it.price * it.quantity).toLocaleString("tr-TR")}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-800/80">
                        <span className="text-xs font-bold text-[#D4AF37] font-mono">
                          Toplam: ₺{(ord.totalAmount || 0).toLocaleString("tr-TR")}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {ord.status === "hazirlaniyor" ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(ord.id, "servise_hazir")}
                              className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition-colors cursor-pointer"
                            >
                              ✓ Servise Hazır
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(ord.id, "kapandi")}
                              className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs transition-colors cursor-pointer"
                            >
                              ✓ Masaya Teslim Edildi
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 text-xs text-neutral-500">
                    Bu departmanda bekleyen sipariş yok.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: HIZLI FİYAT & STOK DÜZENLEYİCİ (160 ÜRÜNÜN TAMAMI)      */}
        {/* ============================================================== */}
        {activeTab === "inventory" && (
          <div className="bg-[#141414] border border-[#2E1C14] rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#D4AF37]" />
                  <span>Hızlı Fiyat & Stok Düzenleyici</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  160 ürünün tamamını tek ekranda arayın, anında fiyat ve stok durumunu güncelleyin.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300">
                  Toplam: <strong>{inventoryList.length}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-red-950/60 border border-red-800/80 text-red-300">
                  Tükendi: <strong>{lockedInventoryCount}</strong>
                </span>
              </div>
            </div>

            {/* Search and Category Filters */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-5 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="160 ürün arasında ara (Örn: Lokum, Dallas, Kuzu, Adana, Burger)..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="md:col-span-7 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {[
                  { id: "all", label: "Tümü (160)" },
                  { id: "steak", label: "Steakler" },
                  { id: "firin-etler", label: "Taş Fırın Kuzular" },
                  { id: "kebaplar", label: "Zırh Kebapları" },
                  { id: "burgerler", label: "Burgerler" },
                  { id: "fajitalar", label: "Fajitalar & Tavalar" },
                  { id: "lahmacun-ve-pide", label: "Lahmacun & Pide" },
                  { id: "kofteler", label: "Köfteler & Yöresel" },
                  { id: "tatlilar", label: "Tatlılar" },
                  { id: "icecekler", label: "İçecekler" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setInventoryCategory(cat.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      inventoryCategory === cat.id
                        ? "bg-[#D4AF37] text-black font-bold"
                        : "bg-black/60 text-neutral-400 hover:text-white border border-neutral-800"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Table / Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[620px] overflow-y-auto pr-1">
              {filteredInventory.map((item: any) => {
                const isLocked = Boolean(item.isLocked);
                const isEditing = editingPriceId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-3 transition-all ${
                      isLocked
                        ? "bg-red-950/20 border-red-900/60"
                        : "bg-black/50 border-neutral-800 hover:border-[#D4AF37]/50"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-xs font-bold text-white line-clamp-1">{item.name}</h3>
                          <span className="text-[10px] text-neutral-400 uppercase font-mono">
                            {item.categorySlug || "Genel"} {item.gramaj ? `• ${item.gramaj}` : ""}
                          </span>
                        </div>
                        {/* Stock toggle button */}
                        <button
                          type="button"
                          onClick={() => handleToggleStockLock(item.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                            isLocked
                              ? "bg-red-700 hover:bg-red-600 text-white animate-pulse"
                              : "bg-emerald-900 hover:bg-emerald-800 text-emerald-300 border border-emerald-600/40"
                          }`}
                        >
                          {isLocked ? "TÜKENDİ" : "STOKTA"}
                        </button>
                      </div>

                      {/* Price Section with Quick Editor */}
                      <div className="mt-2.5 pt-2 border-t border-neutral-800/80 flex items-center justify-between">
                        <span className="text-[11px] text-neutral-400">Satış Fiyatı:</span>
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={tempPriceVal}
                              onChange={(e) => setTempPriceVal(e.target.value)}
                              className="w-20 px-2 py-1 rounded bg-neutral-900 border border-[#D4AF37] text-xs font-mono font-bold text-white text-right"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSavePrice(item.id, Number(tempPriceVal))}
                              className="px-2 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[10px] cursor-pointer"
                            >
                              Kaydet
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingPriceId(null)}
                              className="p-1 text-neutral-400 hover:text-white"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#FBE291] font-mono">
                              ₺{item.price}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPriceId(item.id);
                                setTempPriceVal(String(item.price));
                              }}
                              className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-[#D4AF37] transition-colors"
                              title="Fiyatı Değiştir"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Quick +50 / -50 Buttons */}
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <button
                          type="button"
                          onClick={() => handleSavePrice(item.id, Math.max(0, (item.price || 0) - 50))}
                          className="px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] font-mono text-neutral-300"
                          title="50 TL Düşür"
                        >
                          -50₺
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSavePrice(item.id, (item.price || 0) + 50)}
                          className="px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] font-mono text-neutral-300"
                          title="50 TL Artır"
                        >
                          +50₺
                        </button>
                      </div>
                    </div>

                    {/* Portion Stock Counter */}
                    <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-neutral-400">Kalan Porsiyon:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateStock(item.id, -1)}
                          className="w-6 h-6 rounded bg-neutral-800 hover:bg-neutral-700 text-white font-bold flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-mono font-bold text-white">
                          {item.count ?? 25}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateStock(item.id, 1)}
                          className="w-6 h-6 rounded bg-neutral-800 hover:bg-neutral-700 text-white font-bold flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: REZERVASYON YÖNETİMİ & WHATSAPP MÜŞTERİ BİLDİRİMİ       */}
        {/* ============================================================== */}
        {activeTab === "reservations" && (
          <div className="bg-[#141414] border border-[#2E1C14] rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#D4AF37]" />
                  <span>Rezervasyon Yönetimi & WhatsApp Yanıtı</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Gelen rezervasyonları listeleyin, onaylayın veya WhatsApp üzerinden doğrudan müşteriye yanıt iletin.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewResModalOpen(true)}
                  className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#FBE291] text-black font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yeni Rezervasyon Ekle</span>
                </button>
              </div>
            </div>

            {/* Reservation Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {[
                { id: "all", label: `Tümü (${reservations.length})` },
                { id: "beklemede", label: `Bekleyen (${pendingResCount})` },
                { id: "onaylandi", label: `Onaylanan (${reservations.filter((r) => r.status === "onaylandi").length})` },
                { id: "iptal", label: `İptal Edilen (${reservations.filter((r) => r.status === "iptal").length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setReservationFilter(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    reservationFilter === tab.id
                      ? "bg-[#8B0000] text-white font-bold"
                      : "bg-black/60 text-neutral-400 hover:text-white border border-neutral-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Reservations Cards */}
            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {filteredReservations.length > 0 ? (
                filteredReservations.map((resv: any) => {
                  const isPending = resv.status === "beklemede";
                  const isApproved = resv.status === "onaylandi";
                  const isCancelled = resv.status === "iptal";
                  return (
                    <div
                      key={resv.id}
                      className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                        isPending
                          ? "bg-amber-950/20 border-amber-700/60"
                          : isApproved
                          ? "bg-emerald-950/20 border-emerald-700/60"
                          : "bg-red-950/20 border-red-800/40 opacity-70"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-serif font-bold text-white">
                            {resv.name}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              isPending
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                : isApproved
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                : "bg-red-500/20 text-red-300 border border-red-500/40"
                            }`}
                          >
                            {isPending ? "Beklemede" : isApproved ? "Onaylandı" : "İptal Edildi"}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-300 font-mono">
                          <a
                            href={`tel:${resv.phone}`}
                            className="flex items-center gap-1 text-[#D4AF37] hover:underline"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{resv.phone}</span>
                          </a>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{resv.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{resv.time}</span>
                          </div>
                          <div className="flex items-center gap-1 text-purple-300">
                            <Users className="w-3.5 h-3.5" />
                            <span>{resv.guests}</span>
                          </div>
                        </div>

                        {resv.notes && (
                          <p className="text-xs text-neutral-300 italic pt-1">
                            Not: "{resv.notes}"
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* WhatsApp Return Button */}
                        <button
                          type="button"
                          onClick={() => handleSendWhatsAppConfirmation(resv)}
                          className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                          title="WhatsApp ile Onay Bildirimi Gönder"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>WhatsApp ile Dönüş</span>
                        </button>

                        {isPending && (
                          <button
                            type="button"
                            onClick={() => handleUpdateReservationStatus(resv.id, "onaylandi")}
                            className="py-2 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
                          >
                            ✓ Onayla
                          </button>
                        )}

                        {!isCancelled && (
                          <button
                            type="button"
                            onClick={() => handleUpdateReservationStatus(resv.id, "iptal")}
                            className="py-2 px-3 rounded-xl bg-red-900/70 hover:bg-red-800 text-red-200 font-bold text-xs transition-colors cursor-pointer"
                          >
                            ✕ İptal
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteReservation(resv.id)}
                          className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 text-xs text-neutral-500">
                  <Calendar className="w-10 h-10 text-neutral-600 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-neutral-400">
                    {reservations.length === 0
                      ? "Henüz rezervasyon bulunmuyor."
                      : "Bu filtrede kayıtlı rezervasyon bulunmamaktadır."}
                  </p>
                  {reservations.length === 0 && (
                    <p className="text-xs text-neutral-600 mt-1">
                      Web sitesinden yapılan rezervasyon talepleri burada anlık olarak listelenecektir.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: LOQUM CLUB SADAKAT PROGRAMI & KASA TERMİNALİ            */}
        {/* ============================================================== */}
        {activeTab === "loyalty" && (
          <div className="space-y-5">
            {/* 1. MASTER SWITCH & PROGRAM STATS BANNER */}
            <div className="bg-[#141414] border-2 border-[#D4AF37]/50 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#FBE291] to-[#C8982B] flex items-center justify-center text-black shadow-lg shadow-[#D4AF37]/30 shrink-0">
                    <Crown className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-serif font-bold text-white tracking-wide">
                        Loqum Club Sadakat Programını Aktif Et / Kapat
                      </h3>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider ${
                          loyaltySettings?.isEnabled
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-red-500/20 text-red-300 border border-red-500/40"
                        }`}
                      >
                        {loyaltySettings?.isEnabled ? "● AKTİF (Webde Görünür)" : "✕ KAPALI (Webden Gizli)"}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 mt-0.5">
                      Bu kapatıldığında web sitesindeki parlayan altın dock tamamen gizlenir. Kural: <strong>{loyaltySettings?.maxStamps || 6} Ziyarette 1 {loyaltySettings?.rewardItemName || "Dana Bonfile (Lokum)"} Hediye</strong> (₺{loyaltySettings?.rewardItemPrice || 750}).
                    </p>
                  </div>
                </div>

                {/* Master Switch Button */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleLoyalty()}
                    className={`px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
                      loyaltySettings?.isEnabled
                        ? "bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 text-white border border-red-500/50 shadow-red-900/40"
                        : "bg-gradient-to-r from-emerald-700 to-emerald-500 hover:from-emerald-600 hover:to-emerald-400 text-white border border-emerald-400/50 shadow-emerald-900/40"
                    }`}
                  >
                    {loyaltySettings?.isEnabled ? (
                      <>
                        <XCircle className="w-4 h-4" />
                        <span>Sistemi Kapat (Gizle)</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Sistemi Aktif Et (Aç)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Mini Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-neutral-800 text-xs">
                <div className="bg-black/50 border border-neutral-800/80 rounded-xl p-3">
                  <span className="text-neutral-400 text-[10px] uppercase font-mono block">Kayıtlı Misafir</span>
                  <span className="text-lg font-serif font-bold text-white mt-0.5 block">
                    {Object.keys(loyaltyMembers).length} Kişi
                  </span>
                </div>
                <div className="bg-black/50 border border-neutral-800/80 rounded-xl p-3">
                  <span className="text-neutral-400 text-[10px] uppercase font-mono block">Toplam Verilen Damga</span>
                  <span className="text-lg font-serif font-bold text-[#FBE291] mt-0.5 block">
                    {Object.values(loyaltyMembers).reduce((acc: number, m: any) => acc + (m.currentStamps || 0), 0)} Damga
                  </span>
                </div>
                <div className="bg-black/50 border border-neutral-800/80 rounded-xl p-3">
                  <span className="text-neutral-400 text-[10px] uppercase font-mono block">Hak Edilen Hediyeler</span>
                  <span className="text-lg font-serif font-bold text-emerald-400 mt-0.5 block">
                    {Object.values(loyaltyMembers).filter((m: any) => m.isRewardUnlocked || (m.currentStamps || 0) >= 6).length} Hazır
                  </span>
                </div>
                <div className="bg-black/50 border border-neutral-800/80 rounded-xl p-3">
                  <span className="text-neutral-400 text-[10px] uppercase font-mono block">Tamamlanan Döngüler</span>
                  <span className="text-lg font-serif font-bold text-purple-300 mt-0.5 block">
                    {Object.values(loyaltyMembers).reduce((acc: number, m: any) => acc + (m.cycleCount || 0), 0)} Döngü
                  </span>
                </div>
              </div>
            </div>

            {/* 2. KASA ONAY & HIZLI DAMGA VURMA TERMİNALİ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Sol / Terminal Input & Seçili Misafir Kartı */}
              <div className="lg:col-span-7 bg-[#141414] border border-[#2E1C14] rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-serif font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#D4AF37]" />
                    <span>Kasa Damga & Misafir İşlem Terminali</span>
                  </h4>
                  <span className="text-[10px] font-mono text-[#D4AF37] uppercase">KASA ONAY MODU</span>
                </div>

                {/* Telefon Arama Formu */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={loyaltySearchPhone}
                      onChange={(e) => setLoyaltySearchPhone(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearchLoyaltyMember();
                      }}
                      placeholder="Misafir telefon no: 0506 176 33 21"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/60 border border-neutral-800 text-white font-mono text-sm placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSearchLoyaltyMember()}
                    className="px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#FBE291] text-black font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Kartı Getir</span>
                  </button>
                </div>

                {/* Seçili Misafir Kartı Görseli */}
                {selectedLoyaltyMember ? (
                  <div className="mt-4 p-5 rounded-2xl bg-black/70 border-2 border-[#D4AF37]/60 shadow-xl space-y-4">
                    {/* Header: Phone + Stamp Count */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800">
                      <div>
                        <div className="text-[10px] font-mono uppercase text-neutral-400">Aktif Misafir Sadakat Kartı</div>
                        <div className="text-base font-mono font-bold text-white flex items-center gap-2">
                          <span>{selectedLoyaltyMember.formattedPhone || selectedLoyaltyMember.phone}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-800/40 text-purple-300 font-mono font-semibold">
                            Döngü #{selectedLoyaltyMember.cycleCount || 1}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-[#FBE291]">
                          {selectedLoyaltyMember.currentStamps} / {loyaltySettings?.maxStamps || 6} DAMGA
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          {selectedLoyaltyMember.isRewardUnlocked || selectedLoyaltyMember.currentStamps >= (loyaltySettings?.maxStamps || 6)
                            ? "🎉 Hediye Aktif!"
                            : `${(loyaltySettings?.maxStamps || 6) - selectedLoyaltyMember.currentStamps} Ziyaret Kaldı`}
                        </div>
                      </div>
                    </div>

                    {/* 6 Damga + 1 Hediye Kutusu Önizleme */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {[...Array(loyaltySettings?.maxStamps || 6)].map((_, i) => {
                        const stampNum = i + 1;
                        const isStamped = stampNum <= selectedLoyaltyMember.currentStamps;
                        return (
                          <div
                            key={i}
                            className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                              isStamped
                                ? "bg-emerald-950/60 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                : "bg-neutral-900/50 border-dashed border-neutral-800 text-neutral-600"
                            }`}
                          >
                            {isStamped ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-0.5 stroke-[2.5]" />
                                <span className="text-[10px] font-mono font-bold">{stampNum}. Damga</span>
                              </>
                            ) : (
                              <>
                                <span className="text-xs font-mono font-bold text-neutral-600 mb-0.5">{stampNum}</span>
                                <span className="text-[9px] font-mono text-neutral-600">Boş</span>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Hediye Kutusu Durumu */}
                    <div
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                        selectedLoyaltyMember.isRewardUnlocked || selectedLoyaltyMember.currentStamps >= (loyaltySettings?.maxStamps || 6)
                          ? "bg-amber-950/70 border-[#FBE291] text-[#FBE291] shadow-lg shadow-[#D4AF37]/20"
                          : "bg-neutral-900/60 border-neutral-800 text-neutral-400"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Gift className="w-5 h-5 text-[#D4AF37] shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-white">
                            Ödül: {loyaltySettings?.rewardItemName || "Dana Bonfile (Lokum)"} (₺{loyaltySettings?.rewardItemPrice || 750})
                          </div>
                          <div className="text-[10px] text-neutral-300">
                            {selectedLoyaltyMember.isRewardUnlocked || selectedLoyaltyMember.currentStamps >= (loyaltySettings?.maxStamps || 6)
                              ? "Misafir 6 ziyareti tamamladı. Hediyeyi ikram edebilirsiniz!"
                              : "6 damgaya ulaşıldığında sistem otomatik hediye hakkı tanımlar."}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Aksiyon Butonları (Kasa Onay Eylemleri) */}
                    <div className="pt-2 flex flex-col sm:flex-row gap-2">
                      {selectedLoyaltyMember.isRewardUnlocked || selectedLoyaltyMember.currentStamps >= (loyaltySettings?.maxStamps || 6) ? (
                        <button
                          type="button"
                          onClick={() => handleAdminClaimReward(selectedLoyaltyMember.phone)}
                          className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#FBE291] to-[#D4AF37] hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#D4AF37]/30 transition-all cursor-pointer"
                        >
                          <Gift className="w-4 h-4" />
                          <span>🎁 HEDİYE YEMEĞİ TESLİM ET (KARTI SIFIRLA)</span>
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleAdminAddStamp(selectedLoyaltyMember.phone)}
                            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>+1 Ziyaret Mührü Onayla</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdminAddStamp(selectedLoyaltyMember.phone, true)}
                            className="py-3 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-amber-300 font-mono text-[11px] transition-colors cursor-pointer"
                            title="Bugün zaten damga vurulmuş olsa bile limit kontrolünü aşarak damga ekler"
                          >
                            ⚡ Limit Aşımı (Zorla)
                          </button>
                        </>
                      )}
                    </div>

                    {/* Ziyaret Geçmişi */}
                    {selectedLoyaltyMember.visits && selectedLoyaltyMember.visits.length > 0 && (
                      <div className="pt-2 border-t border-neutral-800/80">
                        <div className="text-[11px] font-mono text-neutral-400 mb-1.5">Kayıtlı Damga / Ziyaret Tarihleri:</div>
                        <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                          {selectedLoyaltyMember.visits.slice(-6).reverse().map((v: any, idx: number) => (
                            <div
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-black/40 border border-neutral-800 text-[11px] font-mono flex items-center justify-between text-neutral-300"
                            >
                              <span className="text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{v.isRewardClaim ? "🎁 Hediye Teslimi" : `${v.visitIndex}. Damga`}</span>
                              </span>
                              <span className="text-neutral-400">{v.date} ({v.approvedBy})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-10 rounded-2xl bg-black/40 border border-dashed border-neutral-800 text-center text-neutral-500 text-xs space-y-2">
                    <Phone className="w-8 h-8 mx-auto text-neutral-600 stroke-[1.5]" />
                    <p className="font-semibold text-neutral-400">Misafir Kartı Bekleniyor</p>
                    <p className="text-[11px] text-neutral-500">
                      Yukarıdaki alana misafirin telefon numarasını girip "Kartı Getir" butonuna basınız.
                      <br />Mevcut üye değilse sistem anında yeni kart açacaktır.
                    </p>
                  </div>
                )}
              </div>

              {/* Sağ / Program Yapılandırması & Hızlı Ayarlar */}
              <div className="lg:col-span-5 bg-[#141414] border border-[#2E1C14] rounded-2xl p-5 shadow-xl space-y-4">
                <h4 className="text-sm font-serif font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span>Program Kuralları & Parametreleri</span>
                </h4>

                <div className="space-y-3.5 text-xs">
                  {/* Hediye Seçim Dropdown */}
                  <div>
                    <label className="text-[11px] text-neutral-300 font-semibold block mb-1.5 flex items-center justify-between">
                      <span>7. Ziyaret Hediye İkramı (Dropdown):</span>
                      <span className="text-[10px] text-[#D4AF37] font-mono">6+1 Ödülü</span>
                    </label>
                    <select
                      value={
                        [
                          "Dana Bonfile (Lokum)",
                          "Kuzu İncik (Taş Fırın)",
                          "Şatobüryan (Özel Dilim)",
                          "New York Steak (Dry-Aged)",
                          "Kuzu Kol (Fırın Tandır)",
                          "Kuzu Pirzola (Taş Fırın)",
                          "Fıstıklı Katmer & Kesme Dondurma",
                          "Künefe & Maraş Dondurması"
                        ].includes(loyaltySettings?.rewardItemName || "")
                          ? loyaltySettings?.rewardItemName
                          : "custom"
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        const priceMap: Record<string, number> = {
                          "Dana Bonfile (Lokum)": 750,
                          "Kuzu İncik (Taş Fırın)": 680,
                          "Şatobüryan (Özel Dilim)": 850,
                          "New York Steak (Dry-Aged)": 720,
                          "Kuzu Kol (Fırın Tandır)": 760,
                          "Kuzu Pirzola (Taş Fırın)": 690,
                          "Fıstıklı Katmer & Kesme Dondurma": 360,
                          "Künefe & Maraş Dondurması": 320,
                        };
                        if (val !== "custom") {
                          handleSaveLoyaltySettings({
                            rewardItemName: val,
                            rewardItemPrice: priceMap[val] || 750
                          });
                        }
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-black border border-[#D4AF37]/50 text-white font-serif text-xs focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                    >
                      <option value="Dana Bonfile (Lokum)">🥩 Dana Bonfile (Lokum) — ₺750</option>
                      <option value="Kuzu İncik (Taş Fırın)">🍖 Kuzu İncik (Taş Fırın) — ₺680</option>
                      <option value="Şatobüryan (Özel Dilim)">👑 Şatobüryan (Özel Dilim) — ₺850</option>
                      <option value="New York Steak (Dry-Aged)">🥩 New York Steak (Dry-Aged) — ₺720</option>
                      <option value="Kuzu Kol (Fırın Tandır)">🍖 Kuzu Kol (Fırın Tandır) — ₺760</option>
                      <option value="Kuzu Pirzola (Taş Fırın)">🥩 Kuzu Pirzola (Taş Fırın) — ₺690</option>
                      <option value="Fıstıklı Katmer & Kesme Dondurma">🍨 Fıstıklı Katmer & Kesme Dondurma — ₺360</option>
                      <option value="Künefe & Maraş Dondurması">🍯 Künefe & Maraş Dondurması — ₺320</option>
                      <option value="custom">✏️ Özel / Manuel Ürün Tanımla...</option>
                    </select>
                  </div>

                  {/* Özel Ürün Adı & Fiyatı (Manuel Düzenleme) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-xl bg-black/40 border border-neutral-800/80">
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Görünen Ürün Adı:</label>
                      <input
                        type="text"
                        key={`item-name-${loyaltySettings?.rewardItemName}`}
                        defaultValue={loyaltySettings?.rewardItemName || "Dana Bonfile (Lokum)"}
                        onBlur={(e) => handleSaveLoyaltySettings({ rewardItemName: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-black border border-neutral-800 text-white font-serif text-xs focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Hediye Değeri (₺):</label>
                      <input
                        type="number"
                        key={`item-price-${loyaltySettings?.rewardItemPrice}`}
                        defaultValue={loyaltySettings?.rewardItemPrice || 750}
                        onBlur={(e) => handleSaveLoyaltySettings({ rewardItemPrice: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-black border border-neutral-800 text-white font-mono text-xs focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>

                  {/* Hedef Damga Sayısı */}
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Gereken Ziyaret / Damga Sayısı:</label>
                    <input
                      type="number"
                      defaultValue={loyaltySettings?.maxStamps || 6}
                      onBlur={(e) => handleSaveLoyaltySettings({ maxStamps: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-800 text-white font-mono text-xs focus:border-[#D4AF37]"
                    />
                  </div>

                  {/* Günlük Limit Toggle */}
                  <div className="p-3 rounded-xl bg-black/60 border border-neutral-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white">Günlük 1 Damga Limiti:</div>
                      <div className="text-[10px] text-neutral-400">Aynı misafire aynı gün içinde 2. damgayı engeller</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSaveLoyaltySettings({ rateLimitDaily: !loyaltySettings?.rateLimitDaily })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        loyaltySettings?.rateLimitDaily
                          ? "bg-emerald-600 text-white"
                          : "bg-neutral-800 text-neutral-400"
                      }`}
                    >
                      {loyaltySettings?.rateLimitDaily ? "AÇIK" : "KAPALI"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. TÜM KAYITLI SADAKAT ÜYELERİ LİSTESİ */}
            <div className="bg-[#141414] border border-[#2E1C14] rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#D4AF37]" />
                  <h4 className="text-sm font-serif font-bold text-white">
                    Tüm Sadakat Üyeleri ({Object.keys(loyaltyMembers).length})
                  </h4>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={loyaltySearchQuery}
                    onChange={(e) => setLoyaltySearchQuery(e.target.value)}
                    placeholder="Telefon veya no ara..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="text-[10px] uppercase text-neutral-400 bg-black/70 border-b border-neutral-800">
                    <tr>
                      <th className="py-2.5 px-3">Telefon</th>
                      <th className="py-2.5 px-3">Damga Durumu</th>
                      <th className="py-2.5 px-3">Döngü</th>
                      <th className="py-2.5 px-3">Hediye Durumu</th>
                      <th className="py-2.5 px-3">Son Ziyaret</th>
                      <th className="py-2.5 px-3 text-right">Kasa Aksiyonu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/80">
                    {Object.values(loyaltyMembers)
                      .filter((m: any) =>
                        !loyaltySearchQuery ||
                        (m.phone && m.phone.includes(loyaltySearchQuery.replace(/\D/g, ""))) ||
                        (m.formattedPhone && m.formattedPhone.includes(loyaltySearchQuery))
                      )
                      .map((m: any) => {
                        const isUnlocked = m.isRewardUnlocked || (m.currentStamps || 0) >= (loyaltySettings?.maxStamps || 6);
                        const lastVisit = m.visits && m.visits.length > 0 ? m.visits[m.visits.length - 1] : null;
                        return (
                          <tr key={m.phone} className="hover:bg-black/40 transition-colors">
                            <td className="py-2.5 px-3 font-bold text-white">
                              {m.formattedPhone || m.phone}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2">
                                <span className="text-[#FBE291] font-bold">
                                  {m.currentStamps || 0} / {loyaltySettings?.maxStamps || 6}
                                </span>
                                <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-400 rounded-full"
                                    style={{
                                      width: `${Math.min(100, ((m.currentStamps || 0) / (loyaltySettings?.maxStamps || 6)) * 100)}%`
                                    }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-purple-300">
                              #{m.cycleCount || 1}
                            </td>
                            <td className="py-2.5 px-3">
                              {isUnlocked ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[10px] animate-pulse">
                                  🎁 Hediye Hazır
                                </span>
                              ) : (
                                <span className="text-neutral-500 text-[10px]">
                                  {(loyaltySettings?.maxStamps || 6) - (m.currentStamps || 0)} Damga Kaldı
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-neutral-400 text-[11px]">
                              {lastVisit ? lastVisit.date : "—"}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedLoyaltyMember(m);
                                    setLoyaltySearchPhone(m.formattedPhone || m.phone);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[11px] transition-colors cursor-pointer"
                                >
                                  Detay
                                </button>
                                {isUnlocked ? (
                                  <button
                                    type="button"
                                    onClick={() => handleAdminClaimReward(m.phone)}
                                    className="px-2.5 py-1 rounded-lg bg-[#D4AF37] hover:bg-[#FBE291] text-black font-bold text-[11px] transition-colors cursor-pointer"
                                  >
                                    Hediyeyi Ver
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleAdminAddStamp(m.phone)}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[11px] transition-colors cursor-pointer"
                                  >
                                    +1 Damga
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: HIZLI BİLDİRİMLER, AYARLAR & Z-RAPORU                   */}
        {/* ============================================================== */}
        {activeTab === "settings" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Servis & Duyuru Ayarları */}
            <div className="bg-[#141414] border border-[#2E1C14] rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-serif font-bold text-white flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#D4AF37]" />
                <span>Restoran Servis & Kampanya Yönetimi</span>
              </h3>

              {/* Sadakat Programı Master Switch */}
              <div className="p-3.5 rounded-xl bg-black/60 border border-[#D4AF37]/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Loqum Club Sadakat Programı</span>
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    {loyaltySettings?.isEnabled
                      ? "Program açık: Müşteri arayüzünde altın kapsül dock ve 6+1 damga kartı aktif."
                      : "Program kapalı: Altın kapsül dock müşteri ekranından tamamen gizlendi."}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleLoyalty()}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-colors ${
                    loyaltySettings?.isEnabled
                      ? "bg-emerald-600 text-white"
                      : "bg-red-700 text-white"
                  }`}
                >
                  {loyaltySettings?.isEnabled ? "AÇIK" : "KAPALI"}
                </button>
              </div>

              {/* Servis Durumu Toggle */}
              <div className="p-3.5 rounded-xl bg-black/60 border border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Servis & Mutfak Durumu</div>
                  <div className="text-[11px] text-neutral-400">
                    {settings.isServiceOpen !== false
                      ? "Restoran şu anda açık ve sipariş kabul ediyor."
                      : "Mutfak servise kapalı / molada."}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveSettings({ isServiceOpen: settings.isServiceOpen === false })}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer ${
                    settings.isServiceOpen !== false
                      ? "bg-emerald-600 text-white"
                      : "bg-red-700 text-white"
                  }`}
                >
                  {settings.isServiceOpen !== false ? "AÇIK" : "KAPALI"}
                </button>
              </div>

              {/* Kampanya / Günün Menüsü Metni */}
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Günün Duyurusu / Kampanya Bandı Metni:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={campaignInput}
                    onChange={(e) => setCampaignInput(e.target.value)}
                    placeholder="Örn: Bugün Şefin Tavsiyesi: Tomahawk Steak yanında tatlı ikramımızdır!"
                    className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:border-[#D4AF37]"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveSettings({ campaignText: campaignInput })}
                    className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#FBE291] text-black font-bold text-xs transition-colors cursor-pointer"
                  >
                    Kaydet
                  </button>
                </div>
              </div>

              {/* WhatsApp İşletme Numarası */}
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  WhatsApp İşletme Bildirim Hattı:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={whatsappInput}
                    onChange={(e) => setWhatsappInput(e.target.value)}
                    placeholder="904125030405"
                    className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:border-[#D4AF37]"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveSettings({ businessWhatsapp: whatsappInput.replace(/\D/g, "") })}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Güncelle
                  </button>
                </div>
              </div>
            </div>

            {/* Gün Sonu Z-Raporu & Sistem Sıfırlama */}
            <div className="bg-[#141414] border border-[#2E1C14] rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-serif font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#D4AF37]" />
                <span>Gün Sonu Kapanışı & Z-Raporu</span>
              </h3>

              <p className="text-xs text-neutral-300 leading-relaxed">
                Gün sonunu kapattığınızda tüm açık masa adisyonları arşivlenir, toplam ciro dondurulur ve patron hattına WhatsApp üzerinden tek tıkla iletilebilecek resmi Z-Raporu oluşturulur.
              </p>

              <button
                type="button"
                onClick={handleTriggerZReport}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#8B0000] to-[#B22222] hover:from-[#B22222] hover:to-[#8B0000] border border-[#D4AF37]/40 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#8B0000]/30 transition-all active:scale-98 cursor-pointer"
              >
                <Receipt className="w-4 h-4 text-amber-200" />
                <span>GÜN SONUNU KAPAT VE Z-RAPORU OLUŞTUR</span>
              </button>

              <div className="pt-4 border-t border-neutral-800/80">
                <div className="text-xs font-bold text-neutral-400 mb-2">Geliştirici & Test Araçları:</div>
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm("Demo sipariş ve çağrıları sıfırlamak istiyor musunuz?")) {
                      await Promise.all([
                        fetch("/api/orders", { method: "DELETE" }),
                        fetch("/api/calls", { method: "DELETE" })
                      ]);
                      showToast("✓ Demo verileri sıfırlandı.");
                      syncData();
                    }
                  }}
                  className="py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white text-xs transition-colors cursor-pointer"
                >
                  Demo Sipariş & Çağrı Geçmişini Sıfırla
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. MASA DETAY MODALI (İptal / İkram / Hesap Kapatma) */}
      {selectedTableForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#1A1A1A] border border-[#2E1C14] rounded-2xl p-6 text-white shadow-2xl">
            <button
              onClick={() => setSelectedTableForDetail(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-[#D4AF37] font-semibold text-xs uppercase tracking-wider mb-1">
              <Receipt className="w-4 h-4" />
              <span>Adisyon Yönetimi</span>
            </div>
            <h3 className="text-xl font-serif font-bold text-white mb-3">
              {selectedTableForDetail} Adisyon Detayları
            </h3>

            {/* Table Orders */}
            <div className="max-h-64 overflow-y-auto space-y-2 mb-4 pr-1">
              {orders.filter((o) => o.tableNo === selectedTableForDetail).length > 0 ? (
                orders
                  .filter((o) => o.tableNo === selectedTableForDetail)
                  .map((ord) => (
                    <div
                      key={ord.id}
                      className={`p-3 rounded-xl border text-xs ${
                        ord.isCancelled
                          ? "bg-red-950/20 border-red-900/40 opacity-60"
                          : ord.isComped
                          ? "bg-purple-950/20 border-purple-800/40"
                          : "bg-black/50 border-neutral-800"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-white">Sipariş: #{ord.id.slice(-6)}</span>
                        <span className="text-neutral-400 font-mono">{ord.time}</span>
                      </div>

                      <div className="space-y-1 mb-2">
                        {(ord.items || []).map((it: any, i: number) => (
                          <div key={i} className="flex justify-between text-neutral-300">
                            <span>
                              {it.quantity}x {it.name}
                            </span>
                            <span className="font-mono">₺{(it.price * it.quantity).toLocaleString("tr-TR")}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                        <span className="font-bold text-[#D4AF37]">
                          Toplam: ₺{(ord.totalAmount || 0).toLocaleString("tr-TR")}
                        </span>
                        {!ord.isCancelled && ord.status !== "kapandi" && (
                          <div className="flex items-center gap-1.5">
                            {!ord.isComped && (
                              <button
                                type="button"
                                onClick={() => handleCompOrder(ord.id)}
                                className="px-2 py-1 rounded bg-purple-900 text-purple-200 font-semibold text-[10px] cursor-pointer"
                              >
                                İkram
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleCancelOrder(ord.id)}
                              className="px-2 py-1 rounded bg-red-900 text-red-200 font-semibold text-[10px] cursor-pointer"
                            >
                              İptal
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(ord.id, "kapandi")}
                              className="px-2 py-1 rounded bg-emerald-800 text-emerald-200 font-semibold text-[10px] cursor-pointer"
                            >
                              Kapat
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-neutral-500 text-xs">
                  Bu masada kayıtlı açık sipariş bulunmuyor.
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedTableForDetail(null)}
              className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {/* 6. GÜN SONU Z-RAPORU & WHATSAPP MODALI */}
      {isZReportModalOpen && zReportData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#1A1A1A] border border-[#D4AF37] rounded-2xl p-6 text-white shadow-2xl">
            <button
              onClick={() => setIsZReportModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-[#D4AF37] font-semibold text-xs uppercase tracking-wider mb-1">
              <Receipt className="w-4 h-4" />
              <span>Gün Sonu Kapanış ve Z-Raporu</span>
            </div>
            <h3 className="text-xl font-serif font-bold text-white mb-3">
              Loqum Et Z-Raporu Arşivlendi
            </h3>

            {/* Generated WhatsApp text preview */}
            <div className="p-3 bg-black/70 border border-neutral-800 rounded-xl max-h-72 overflow-y-auto text-xs font-mono text-neutral-300 whitespace-pre-wrap mb-4">
              {generateZReportText(zReportData)}
            </div>

            {/* Actions: Send WhatsApp & Copy */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <a
                href={generateWhatsAppLink(zReportData, RESTAURANT_CONFIG.phoneRaw)}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp ile Patron Hattına İlet</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(generateZReportText(zReportData));
                  setCopiedZReport(true);
                  setTimeout(() => setCopiedZReport(false), 2000);
                }}
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedZReport ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedZReport ? "Kopyalandı" : "Panoya Kopyala"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. YENİ MANUEL REZERVASYON MODALI */}
      {isNewResModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#1A1A1A] border border-[#D4AF37] rounded-2xl p-6 text-white shadow-2xl">
            <button
              onClick={() => setIsNewResModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-[#D4AF37] font-semibold text-xs uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4" />
              <span>Telefonla / Manuel Rezervasyon</span>
            </div>
            <h3 className="text-lg font-serif font-bold text-white mb-4">
              Yeni Rezervasyon Kaydı
            </h3>

            <form onSubmit={handleCreateManualReservation} className="space-y-3">
              <div>
                <label className="text-xs text-neutral-300 block mb-1">Misafir Ad Soyad:</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ahmet Yılmaz"
                  value={newResForm.name}
                  onChange={(e) => setNewResForm({ ...newResForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-neutral-800 text-xs text-white focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-300 block mb-1">Telefon Numarası:</label>
                <input
                  type="tel"
                  required
                  placeholder="05XX XXX XX XX"
                  value={newResForm.phone}
                  onChange={(e) => setNewResForm({ ...newResForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-neutral-800 text-xs text-white focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-neutral-300 block mb-1">Tarih:</label>
                  <input
                    type="date"
                    required
                    value={newResForm.date}
                    onChange={(e) => setNewResForm({ ...newResForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-neutral-800 text-xs text-white focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-300 block mb-1">Saat:</label>
                  <input
                    type="time"
                    required
                    value={newResForm.time}
                    onChange={(e) => setNewResForm({ ...newResForm, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-neutral-800 text-xs text-white focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-neutral-300 block mb-1">Kişi Sayısı:</label>
                <select
                  value={newResForm.guests}
                  onChange={(e) => setNewResForm({ ...newResForm, guests: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-neutral-800 text-xs text-white focus:border-[#D4AF37]"
                >
                  {["1 Kişilik", "2 Kişilik", "3 Kişilik", "4 Kişilik", "5 Kişilik", "6 Kişilik", "8+ Kişilik VIP"].map((g) => (
                    <option key={g} value={g} className="bg-neutral-900">
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-neutral-300 block mb-1">Özel Notlar:</label>
                <textarea
                  rows={2}
                  placeholder="Örn: Cam kenarı masa, çocuk sandalyesi..."
                  value={newResForm.notes}
                  onChange={(e) => setNewResForm({ ...newResForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-neutral-800 text-xs text-white focus:border-[#D4AF37]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#FBE291] text-black font-bold text-xs cursor-pointer shadow-lg"
                >
                  Kaydet & Onayla
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewResModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
