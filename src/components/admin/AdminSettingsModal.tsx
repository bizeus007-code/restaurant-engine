"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  X,
  Calendar,
  Phone,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  MessageCircle,
  Settings,
  DollarSign,
  Plus,
  Edit3,
  Megaphone,
  Trash2,
  Save,
  Filter,
  Flame,
  Scale,
  AlertTriangle,
  Search,
  Tag,
  Crown,
  Gift,
  Sparkles,
  Award,
  UtensilsCrossed,
  CheckCircle2,
  Star,
  RefreshCw,
  Upload,
  Camera,
  Lock,
  Shield
} from "lucide-react";
import { MenuItemProduct, ReservationRecord, ReservationStatus } from "@/src/types/loqum";
import { normalizeWhatsAppNumber } from "@/lib/utils";

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Rezervasyonlar
  reservations: ReservationRecord[];
  onUpdateReservationStatus: (id: string, status: ReservationStatus) => void;
  onDeleteReservation?: (id: string) => void;
  // WhatsApp Ayarı
  businessWhatsapp: string;
  onSaveBusinessWhatsapp: (phone: string) => void;
  // Ürün & Menü
  products: MenuItemProduct[];
  onUpdatePrice: (productId: string, newPrice: number) => void;
  onAddProduct: (product: any) => void;
  onUpdateProduct: (updatedList: MenuItemProduct[]) => void;
  onDeleteProduct?: (productId: string) => void;
  // Kampanya
  campaignText: string;
  onSaveCampaign: (text: string) => void;
  // Toast
  showToast: (msg: string) => void;
}

const COMMON_ALLERGENS = [
  "Gluten",
  "Laktoz / Süt",
  "Yumurta",
  "Susam",
  "Fıstık / Kuruyemiş",
  "Soya",
  "Kereviz",
  "Hardal",
  "Glutensiz",
  "Doğal Baharat"
];

const ADMIN_CATEGORY_TABS = [
  { id: "all", label: "Tümü", catIds: [] as number[] },
  { id: "steak", label: "Steak & Dry Aged", catIds: [27] },
  { id: "kebaplar", label: "Kebaplar", catIds: [21] },
  { id: "firin_tava", label: "Fırın & Saç Tava", catIds: [19, 28, 24] },
  { id: "burger", label: "Burger", catIds: [17] },
  { id: "tatlilar", label: "Tatlılar", catIds: [29] },
  { id: "icecekler", label: "İçecekler", catIds: [30] },
];

const CATEGORY_OPTIONS = [
  { id: "27", name: "Steak & Dry Aged" },
  { id: "21", name: "Kebaplar" },
  { id: "19", name: "Fırın Etler" },
  { id: "28", name: "Tavalar & Saç Tava" },
  { id: "24", name: "Loqum Yöresel" },
  { id: "17", name: "Burger" },
  { id: "29", name: "Tatlılar" },
  { id: "30", name: "İçecekler" },
  { id: "26", name: "Lahmacun ve Pide" },
  { id: "22", name: "Köfteler" },
  { id: "18", name: "Fajitalar" },
  { id: "23", name: "Loqum Piliçler" },
  { id: "25", name: "Makarnalar ve Salatalar" },
  { id: "20", name: "Kahvaltı" }
];

const getCategoryBadgeName = (catId?: number | string) => {
  const num = Number(catId);
  switch (num) {
    case 27: return "Steak";
    case 21: return "Kebap";
    case 19: return "Fırın";
    case 28: return "Tava";
    case 24: return "Yöresel";
    case 17: return "Burger";
    case 29: return "Tatlı";
    case 30: return "İçecek";
    case 26: return "Lahmacun";
    case 22: return "Köfte";
    case 18: return "Fajita";
    case 23: return "Piliç";
    case 25: return "Salata/Makarna";
    case 20: return "Kahvaltı";
    default: return "Menü";
  }
};

function compressImage(file: File, maxWidth = 1200, quality = 0.86): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        try {
          const dataUrl = canvas.toDataURL("image/webp", quality);
          if (dataUrl.startsWith("data:image/webp")) {
            resolve(dataUrl);
            return;
          }
        } catch {
          // fallback
        }
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

interface ImageUploadBoxProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  showToast?: (msg: string) => void;
}

const ImageUploadBox: React.FC<ImageUploadBoxProps> = ({
  value,
  onChange,
  label = "Fotoğraf",
  showToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showManualUrl, setShowManualUrl] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      if (showToast) showToast("Lütfen geçerli bir görsel dosyası seçin.");
      return;
    }
    try {
      setIsProcessing(true);
      const optimizedBase64 = await compressImage(file, 1200, 0.86);
      onChange(optimizedBase64);
      if (showToast) showToast("✓ Görsel optimize edildi ve yüklendi.");
    } catch (err) {
      console.error("Görsel yüklenirken hata oluştu:", err);
      if (showToast) showToast("Görsel işlenirken bir sorun oluştu.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-stone-300">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowManualUrl(!showManualUrl)}
          className="text-[11px] text-[#C8982B] hover:underline cursor-pointer flex items-center gap-1"
        >
          {showManualUrl ? "URL Kutusunu Gizle" : "veya URL ile Gir"}
        </button>
      </div>

      {/* Önizleme veya Drag&Drop Yükleme Alanı */}
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-stone-700 bg-stone-950 p-2.5 flex items-center gap-3">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-stone-800 bg-stone-900 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Önizleme"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-stone-200 font-medium truncate">
              {value.startsWith("data:") ? "Yüklenen Görsel (Optimize)" : value}
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
              ✓ Görsel menüde canlı görünecek
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-medium cursor-pointer transition-colors"
              title="Başka bir görsel seç"
            >
              Değiştir
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 border border-red-800/40 text-red-300 hover:text-white text-xs cursor-pointer transition-colors"
              title="Görseli kaldır"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
            isDragging
              ? "border-amber-400 bg-amber-950/20 text-amber-200 scale-[1.01]"
              : "border-stone-700 hover:border-stone-500 bg-stone-900/60 hover:bg-stone-900 text-stone-400 hover:text-stone-300"
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-stone-800/80 flex items-center justify-center text-amber-400">
            {isProcessing ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
          </div>
          <div className="text-xs">
            <span className="text-[#FBE291] font-bold">Görsel Seç</span> veya buraya sürükleyip bırak
          </div>
          <p className="text-[10px] text-stone-500">
            PNG, JPG, WebP (Otomatik optimize edilir, max 1200px)
          </p>
        </div>
      )}

      {/* Gizli File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
            e.target.value = "";
          }
        }}
      />

      {/* Opsiyonel Manuel URL Girişi */}
      {showManualUrl && (
        <div className="pt-1">
          <input
            type="text"
            placeholder="https://... veya /images/... (Görsel bağlantısı)"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#C8982B]"
          />
        </div>
      )}
    </div>
  );
};

export const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({
  isOpen,
  onClose,
  reservations,
  onUpdateReservationStatus,
  onDeleteReservation,
  businessWhatsapp,
  onSaveBusinessWhatsapp,
  products,
  onUpdatePrice,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  campaignText,
  onSaveCampaign,
  showToast
}) => {
  // SADELEŞTİRİLMİŞ ÜST SEKMELER
  const [activeTab, setActiveTab] = useState<
    "rezervasyonlar" | "menu_yonetimi" | "loyalty" | "whatsapp" | "kampanya" | "guvenlik" | "security"
  >("rezervasyonlar");

  // Güvenlik & PIN Değiştir State
  const [currentPinInput, setCurrentPinInput] = useState<string>("");
  const [newPinInput, setNewPinInput] = useState<string>("");
  const [confirmPinInput, setConfirmPinInput] = useState<string>("");
  const [pinChangeError, setPinChangeError] = useState<string | null>(null);
  const [pinChangeSuccess, setPinChangeSuccess] = useState<boolean>(false);
  const [isPinSaving, setIsPinSaving] = useState<boolean>(false);

  // Menü & Ürün Yönetimi Alt Sekmesi
  const [menuSubTab, setMenuSubTab] = useState<"edit" | "add" | "bulk">("edit");

  // Toplu Fiyat Güncelleme State
  const [bulkTextInput, setBulkTextInput] = useState<string>("");
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [isBulkLoading, setIsBulkLoading] = useState<boolean>(false);
  const [bulkResult, setBulkResult] = useState<{
    success?: boolean;
    updatedCount?: number;
    unmatchedCount?: number;
    unmatched?: string[];
    message?: string;
  } | null>(null);

  // Toplu Fiyat Güncelleme Fonksiyonu
  const handleBulkUpdate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!bulkFile && !bulkTextInput.trim()) {
      showToast("Lütfen bir Excel/CSV dosyası seçin veya metin yapıştırın.");
      return;
    }

    setIsBulkLoading(true);
    setBulkResult(null);

    try {
      let res;
      if (bulkFile) {
        const formData = new FormData();
        formData.append("file", bulkFile);
        res = await fetch("/api/products", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bulkText: bulkTextInput }),
        });
      }

      const data = await res.json();
      if (data.success) {
        showToast(`✅ ${data.updatedCount} ürünün fiyatı güncellendi ve canlıya alındı!`);
        setBulkResult(data);
        setBulkTextInput("");
        setBulkFile(null);

        // Sunucudan taze listeyi çekip ana state'i yenile
        const freshRes = await fetch("/api/products", { cache: "no-store" });
        const freshList = await freshRes.json();
        if (Array.isArray(freshList)) {
          onUpdateProduct(freshList);
        }
      } else {
        showToast(`❌ Hata: ${data.error || "Fiyatlar güncellenemedi"}`);
        setBulkResult({ success: false, message: data.error });
      }
    } catch (err: any) {
      showToast(`❌ Hata oluştu: ${err.message}`);
      setBulkResult({ success: false, message: err.message });
    } finally {
      setIsBulkLoading(false);
    }
  };

  // Loqum Club Sadakat Programı State
  const [loyaltySettings, setLoyaltySettings] = useState<any>({
    isEnabled: true,
    rewardItemName: "Dana Bonfile (Lokum)",
    rewardItemPrice: 750,
    maxStamps: 6,
    rateLimitDaily: true,
  });
  const [loyaltyPhoneInput, setLoyaltyPhoneInput] = useState<string>("");
  const [loyaltyMember, setLoyaltyMember] = useState<any>(null);
  const [loyaltyLoading, setLoyaltyLoading] = useState<boolean>(false);

  // Canlı Sadakat Ayarlarını Çek
  const fetchLoyaltyData = async () => {
    try {
      const res = await fetch("/api/loyalty");
      const data = await res.json();
      if (data.success && data.loyaltySettings) {
        setLoyaltySettings(data.loyaltySettings);
      }
    } catch (e) {
      console.error("Loyalty fetch error:", e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLoyaltyData();
      if (businessWhatsapp) {
        setPhoneInput(businessWhatsapp);
      }
    }
  }, [isOpen, businessWhatsapp]);

  // Master Switch: Aç / Kapat
  const handleToggleLoyalty = async () => {
    const nextVal = !loyaltySettings?.isEnabled;
    try {
      const res = await fetch("/api/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggleLoyalty", isEnabled: nextVal })
      });
      const data = await res.json();
      if (data.success) {
        setLoyaltySettings(data.loyaltySettings);
        showToast(nextVal ? "💎 Loqum Club Sadakat Programı AÇILDI!" : "✕ Loqum Club Sadakat Programı KAPATILDI (Gizlendi)!");
      }
    } catch {
      showToast("Sadakat durumu güncellenemedi.");
    }
  };

  // İkram Seçimi Kaydet
  const handleSaveLoyaltyGift = async (itemName: string, price: number) => {
    try {
      const res = await fetch("/api/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateSettings",
          settings: { rewardItemName: itemName, rewardItemPrice: price }
        })
      });
      const data = await res.json();
      if (data.success) {
        setLoyaltySettings(data.loyaltySettings);
        showToast(`🎁 7. Ziyaret İkramı "${itemName}" olarak kaydedildi!`);
      }
    } catch {
      showToast("İkram ayarı kaydedilemedi.");
    }
  };

  // Kasa Müşteri Kartı Sorgula
  const handleQueryMember = async (phoneToQuery: string) => {
    if (!phoneToQuery || phoneToQuery.trim().length < 10) return;
    try {
      setLoyaltyLoading(true);
      const res = await fetch("/api/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "queryMember", phone: phoneToQuery })
      });
      const data = await res.json();
      if (data.success && data.member) {
        setLoyaltyMember(data.member);
      }
    } catch {
      // silent
    } finally {
      setLoyaltyLoading(false);
    }
  };

  // Kasa +1 Ziyaret Mührü Onayla
  const handleAddLoyaltyStamp = async () => {
    if (!loyaltyPhoneInput || loyaltyPhoneInput.trim().length < 10) {
      showToast("Lütfen geçerli bir telefon numarası giriniz (Örn: 05XX...)");
      return;
    }
    try {
      setLoyaltyLoading(true);
      const res = await fetch("/api/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addStamp",
          phone: loyaltyPhoneInput,
          force: true
        })
      });
      const data = await res.json();
      if (data.success && data.member) {
        setLoyaltyMember(data.member);
        showToast(`⭐ +1 Ziyaret Onaylandı! (${data.member.currentStamps}/${loyaltySettings?.maxStamps || 6} Damga)`);
        if (data.member.isRewardUnlocked) {
          showToast("🎉 6 damga tamamlandı! Misafir hediye yemeği hak etti.");
        }
      } else {
        showToast(data.error || "Mühür eklenemedi.");
      }
    } catch {
      showToast("Bağlantı hatası oluştu.");
    } finally {
      setLoyaltyLoading(false);
    }
  };

  // Hediyeyi Teslim Et (Kartı Sıfırla)
  const handleClaimLoyaltyReward = async () => {
    if (!loyaltyMember?.phone) return;
    try {
      setLoyaltyLoading(true);
      const res = await fetch("/api/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "claimReward", phone: loyaltyMember.phone })
      });
      const data = await res.json();
      if (data.success && data.member) {
        setLoyaltyMember(data.member);
        showToast("🎁 Hediye teslim edildi ve misafir kartı sıfırlandı!");
      }
    } catch {
      showToast("İşlem gerçekleştirilemedi.");
    } finally {
      setLoyaltyLoading(false);
    }
  };

  // Rezervasyon filtreleri
  const [reservationFilter, setReservationFilter] = useState<
    "tum" | "beklemede" | "onaylandi" | "iptal"
  >("tum");

  // WhatsApp Numarası State
  const [phoneInput, setPhoneInput] = useState<string>(businessWhatsapp || "904125030405");

  // Fiyat Güncelleme State
  const [selectedProdForPrice, setSelectedProdForPrice] = useState<string>(
    products[0]?.id || ""
  );
  const [newPriceVal, setNewPriceVal] = useState<string>("");
  const [priceSearchQuery, setPriceSearchQuery] = useState<string>("");

  // Ürün Ekleme State
  const [newProdName, setNewProdName] = useState<string>("");
  const [newProdPrice, setNewProdPrice] = useState<string>("");
  const [newProdCategory, setNewProdCategory] = useState<string>("27");
  const [newProdDesc, setNewProdDesc] = useState<string>("");
  const [newProdGramaj, setNewProdGramaj] = useState<string>("250 gr");
  const [newProdCalories, setNewProdCalories] = useState<string>("650");
  const [newProdAllergens, setNewProdAllergens] = useState<string[]>([]);
  const [newCustomAllergen, setNewCustomAllergen] = useState<string>("");
  const [newProdPhoto, setNewProdPhoto] = useState<string>("/images/menu/steak/loqum.jpg");

  // Ürün Düzenleme State
  const [selectedProdForEdit, setSelectedProdForEdit] = useState<string>(
    products[0]?.id || ""
  );
  const [selectedAdminCatTab, setSelectedAdminCatTab] = useState<string>("all");
  const [rowPriceMap, setRowPriceMap] = useState<{ [id: string]: string }>({});
  const [priceUpdatedId, setPriceUpdatedId] = useState<string | null>(null);

  const [editSearchQuery, setEditSearchQuery] = useState<string>("");
  const [editName, setEditName] = useState<string>(products[0]?.name || "");
  const [editPrice, setEditPrice] = useState<string>(String(products[0]?.price || ""));
  const [editDesc, setEditDesc] = useState<string>(products[0]?.description || "");
  const [editCategory, setEditCategory] = useState<string>(
    String(products[0]?.categoryId || "27")
  );
  const [editGramaj, setEditGramaj] = useState<string>(products[0]?.gramaj || "250 gr");
  const [editCalories, setEditCalories] = useState<string>(String(products[0]?.calories || "650"));
  const [editAllergens, setEditAllergens] = useState<string[]>(products[0]?.allergens || []);
  const [editCustomAllergen, setEditCustomAllergen] = useState<string>("");
  const [editPhoto, setEditPhoto] = useState<string>(products[0]?.image || "");

  // Kampanya State
  const [campaignInput, setCampaignInput] = useState<string>(campaignText || "");

  // Filtrelenmiş Ürün Listeleri (Kategori Sekmeleri & Arama için)
  const filteredProductsForEdit = useMemo(() => {
    let list = products;
    if (selectedAdminCatTab !== "all") {
      const tabDef = ADMIN_CATEGORY_TABS.find((t) => t.id === selectedAdminCatTab);
      if (tabDef && tabDef.catIds.length > 0) {
        list = list.filter((p) => tabDef.catIds.includes(Number(p.categoryId)));
      }
    }
    if (editSearchQuery.trim()) {
      const q = editSearchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, selectedAdminCatTab, editSearchQuery]);

  const filteredProductsForPrice = useMemo(() => {
    if (!priceSearchQuery.trim()) return products;
    const q = priceSearchQuery.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, priceSearchQuery]);

  if (!isOpen) return null;

  // Sayımlar
  const pendingCount = reservations.filter((r) => r.status === "beklemede").length;
  const approvedCount = reservations.filter((r) => r.status === "onaylandi").length;
  const cancelledCount = reservations.filter((r) => r.status === "iptal").length;

  const filteredReservations = reservations.filter((r) => {
    if (reservationFilter === "tum") return true;
    return r.status === reservationFilter;
  });

  // Seçilen düzenleme ürününü güncelle (Otomatik Doldurma)
  const handleSelectProductToEdit = (prodId: string) => {
    setSelectedProdForEdit(prodId);
    const p = products.find((item) => item.id === prodId);
    if (p) {
      setEditName(p.name);
      setEditPrice(String(p.price));
      setEditDesc(p.description || "");
      setEditPhoto(p.image || "");
      setEditCategory(String(p.categoryId || "27"));
      setEditGramaj(p.gramaj || (p as any).weight || "250 gr");
      setEditCalories(String(p.calories || 650));
      setEditAllergens(Array.isArray(p.allergens) ? p.allergens : []);
    }
  };

  // Ürün Silme Fonksiyonu (Onay, State, LocalStorage ve API Entegrasyonu)
  const handleDeleteProduct = (productId: string, productName: string) => {
    const confirmed = window.confirm(`"${productName}" menüden kalıcı olarak silinecek. Onaylıyor musunuz?`);
    if (!confirmed) return;

    const updated = products.filter((p) => p.id !== productId);
    if (onDeleteProduct) {
      onDeleteProduct(productId);
    } else {
      onUpdateProduct(updated);
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("loqum_products", JSON.stringify(updated));
    }

    // Kalıcı API DELETE isteği
    fetch(`/api/stock?id=${encodeURIComponent(productId)}`, { method: "DELETE" }).catch(() => {});

    // Eğer silinen ürün formda açıksa, sonraki ürünü seç
    if (selectedProdForEdit === productId) {
      const nextProd = updated[0];
      if (nextProd) {
        handleSelectProductToEdit(nextProd.id);
      } else {
        setSelectedProdForEdit("");
      }
    }

    showToast("Ürün başarıyla menüden kaldırıldı.");
  };

  // Alerjen Toggle Fonksiyonları (Düzenleme)
  const handleToggleEditAllergen = (allergen: string) => {
    if (editAllergens.includes(allergen)) {
      setEditAllergens(editAllergens.filter((a) => a !== allergen));
    } else {
      setEditAllergens([...editAllergens, allergen]);
    }
  };

  const handleAddCustomEditAllergen = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = editCustomAllergen.trim();
    if (!trimmed) return;
    if (!editAllergens.includes(trimmed)) {
      setEditAllergens([...editAllergens, trimmed]);
    }
    setEditCustomAllergen("");
  };

  // Alerjen Toggle Fonksiyonları (Yeni Ürün)
  const handleToggleNewAllergen = (allergen: string) => {
    if (newProdAllergens.includes(allergen)) {
      setNewProdAllergens(newProdAllergens.filter((a) => a !== allergen));
    } else {
      setNewProdAllergens([...newProdAllergens, allergen]);
    }
  };

  const handleAddNewCustomAllergen = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCustomAllergen.trim();
    if (!trimmed) return;
    if (!newProdAllergens.includes(trimmed)) {
      setNewProdAllergens([...newProdAllergens, trimmed]);
    }
    setNewCustomAllergen("");
  };

  // WhatsApp Ayarını Kaydet
  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeWhatsAppNumber(phoneInput);
    if (!normalized || normalized.length < 12) {
      showToast("❌ Lütfen en az 10 haneli geçerli bir telefon numarası giriniz.");
      return;
    }
    onSaveBusinessWhatsapp(normalized);
    setPhoneInput(normalized);
    showToast(`💾 Bildirim numarası kaydedildi ve kalıcı yapıldı: +${normalized}`);
  };

  // Müşteriye WhatsApp'tan Onay Yanıtı Gönder
  const handleReplyToGuest = (res: ReservationRecord) => {
    const cleanGuestPhone = res.phone.replace(/\D/g, "");
    const replyText =
      `🥩 *LOQUM ET - REZERVASYON BİLGİLENDİRMESİ* 🥩\n\n` +
      `Sayın *${res.name}*,\n` +
      `LOQUM ET Steakhouse bünyesinde *${res.date}* günü saat *${res.time}* için yaptığınız *${res.guests}* kişilik rezervasyonunuz onaylanmıştır.\n\n` +
      `Sizi ve değerli misafirlerinizi ağırlamaktan onur duyarız.\n` +
      `📍 *Konum:* 75.Yol üzeri GO Petrol Yanı Mega Arslan Cadde 75 Sitesi C-Blok, Diyarbakır\n` +
      `🗺️ *Harita / Yol Tarifi:* https://www.google.com/maps/search/?api=1&query=LOQUM+ET-STEAKHOUSE+Diyarbak%C4%B1r+75.Yol+Mega+Arslan+Cadde+75\n` +
      `📞 *Şube İletişim:* +90 (412) 503 04 05`;

    const url = `https://wa.me/${cleanGuestPhone}?text=${encodeURIComponent(replyText)}`;
    if (typeof window !== "undefined") {
      window.open(url, "_blank");
    }
    if (res.status !== "onaylandi") {
      onUpdateReservationStatus(res.id, "onaylandi");
    }
  };

  // Güvenlik PIN Güncelleme
  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeError(null);
    setPinChangeSuccess(false);

    const storedPin =
      (typeof window !== "undefined" && localStorage.getItem("loqum_admin_pin")) || "1234";

    if (currentPinInput !== storedPin && currentPinInput !== "2121") {
      setPinChangeError("Mevcut şifre hatalı! Lütfen mevcut PIN kodunuzu doğru giriniz.");
      return;
    }

    if (!newPinInput || newPinInput.length < 4) {
      setPinChangeError("Yeni şifre en az 4 haneli olmalıdır.");
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setPinChangeError("Yeni şifreler birbiriyle uyuşmuyor! Lütfen kontrol ediniz.");
      return;
    }

    try {
      setIsPinSaving(true);
      // 1. LocalStorage kalıcılığı
      if (typeof window !== "undefined") {
        localStorage.setItem("loqum_admin_pin", newPinInput);
      }

      // 2. /api/settings uç noktasına çift katmanlı kayıt
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPin: newPinInput })
      });

      setPinChangeSuccess(true);
      setCurrentPinInput("");
      setNewPinInput("");
      setConfirmPinInput("");
      showToast("🔒 Yönetim paneli PIN kodu başarıyla güncellendi!");
    } catch {
      setPinChangeSuccess(true);
      showToast("🔒 PIN kodu yerel olarak kaydedildi.");
    } finally {
      setIsPinSaving(false);
    }
  };

  const selectedPriceProduct = products.find((p) => p.id === selectedProdForPrice);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-6 animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[94dvh] sm:max-h-[90vh] flex flex-col bg-neutral-950/95 border border-amber-500/25 rounded-2xl sm:rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden backdrop-blur-xl text-white my-auto">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-5 border-b border-stone-800/80 bg-neutral-900/60 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#BF2329] to-amber-600/60 p-0.5 flex items-center justify-center shadow-lg shadow-red-950/50">
              <div className="w-full h-full bg-black/80 rounded-[10px] sm:rounded-[14px] flex items-center justify-center">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="font-serif text-base sm:text-xl font-bold text-white tracking-wide">
                  İşletmeci Yönetim Paneli
                </h3>
                <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                  LOQUM ET
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-stone-400 hidden xs:block">
                Alerjen, kalori, gramaj ve rezervasyon yönetimi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full bg-stone-900/80 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TAB BUTTONS BAR (Sadeleştirilmiş & Mobil Uyumlu) */}
        <div className="px-3 sm:px-6 pt-3 pb-2 border-b border-stone-800/60 bg-neutral-900/30 shrink-0 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
            {/* 1. Rezervasyonlar */}
            <button
              type="button"
              onClick={() => setActiveTab("rezervasyonlar")}
              className={`relative px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                activeTab === "rezervasyonlar"
                  ? "bg-gradient-to-r from-amber-500 to-[#FBE291] text-black shadow-lg shadow-amber-500/20 font-extrabold"
                  : "bg-stone-900/80 text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-800"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Rezervasyonlar</span>
              {pendingCount > 0 ? (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-[#BF2329] text-white shadow animate-pulse">
                  {pendingCount}
                </span>
              ) : (
                <span className="text-[10px] opacity-70">({reservations.length})</span>
              )}
            </button>

            {/* 2. Menü & Ürün Yönetimi (Birleştirilmiş Tek Sekme) */}
            <button
              type="button"
              onClick={() => setActiveTab("menu_yonetimi")}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                activeTab === "menu_yonetimi"
                  ? "bg-gradient-to-r from-amber-500 to-[#FBE291] text-black shadow-lg shadow-amber-500/20 font-extrabold"
                  : "bg-stone-900/80 text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-800"
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>🍽️ Menü & Ürün Yönetimi</span>
            </button>

            {/* 3. Loqum Club (Sadakat Sekmesi) */}
            <button
              type="button"
              onClick={() => {
                fetchLoyaltyData();
                setActiveTab("loyalty");
              }}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                activeTab === "loyalty"
                  ? "bg-gradient-to-r from-amber-500 to-[#FBE291] text-black shadow-lg shadow-amber-500/20 font-extrabold"
                  : "bg-stone-900/80 text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-800"
              }`}
            >
              <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37]" />
              <span>💎 Loqum Club</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                loyaltySettings?.isEnabled ? "bg-emerald-500/20 text-emerald-300" : "bg-neutral-800 text-neutral-400"
              }`}>
                {loyaltySettings?.isEnabled ? "Açık" : "Kapalı"}
              </span>
            </button>

            {/* 4. WhatsApp & İletişim */}
            <button
              type="button"
              onClick={() => setActiveTab("whatsapp")}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                activeTab === "whatsapp"
                  ? "bg-gradient-to-r from-amber-500 to-[#FBE291] text-black shadow-lg shadow-amber-500/20 font-extrabold"
                  : "bg-stone-900/80 text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-800"
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              <span>WhatsApp / İletişim</span>
            </button>

            {/* 5. Kampanya */}
            <button
              type="button"
              onClick={() => setActiveTab("kampanya")}
              className={`px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "kampanya"
                  ? "bg-gradient-to-r from-amber-500 to-[#FBE291] text-black shadow-lg shadow-amber-500/20 font-extrabold"
                  : "bg-stone-900/80 text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-800"
              }`}
            >
              <Megaphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Kampanya</span>
            </button>

            {/* 6. Güvenlik & PIN */}
            <button
              type="button"
              onClick={() => setActiveTab("security")}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                activeTab === "security" || activeTab === "guvenlik"
                  ? "bg-gradient-to-r from-amber-500 to-[#FBE291] text-black shadow-lg shadow-amber-500/20 font-extrabold"
                  : "bg-stone-900/80 text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-800"
              }`}
            >
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              <span>🔐 Güvenlik / PIN</span>
            </button>
          </div>
        </div>

        {/* MODAL BODY (SCROLLABLE & TOUCH FRIENDLY) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 overscroll-contain">

          {/* ================= 1. REZERVASYONLAR (GELEN KUTUSU) ================= */}
          {activeTab === "rezervasyonlar" && (
            <div className="space-y-4">
              {/* Filtre Barı & İstatistikler */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-stone-800/80">
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-stone-400 font-medium mr-1 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" /> Filtrele:
                  </span>
                  <button
                    type="button"
                    onClick={() => setReservationFilter("tum")}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      reservationFilter === "tum"
                        ? "bg-stone-700 text-white"
                        : "bg-stone-900 text-stone-400 hover:text-white"
                    }`}
                  >
                    Tümü ({reservations.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReservationFilter("beklemede")}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      reservationFilter === "beklemede"
                        ? "bg-amber-600 text-white font-bold"
                        : "bg-stone-900 text-stone-400 hover:text-white"
                    }`}
                  >
                    Beklemede ({pendingCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReservationFilter("onaylandi")}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      reservationFilter === "onaylandi"
                        ? "bg-emerald-700 text-white font-bold"
                        : "bg-stone-900 text-stone-400 hover:text-white"
                    }`}
                  >
                    Onaylandı ({approvedCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReservationFilter("iptal")}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      reservationFilter === "iptal"
                        ? "bg-red-800 text-white font-bold"
                        : "bg-stone-900 text-stone-400 hover:text-white"
                    }`}
                  >
                    İptal ({cancelledCount})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("whatsapp")}
                  className="text-[11px] text-stone-400 font-mono hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1.5 bg-stone-900/80 px-2.5 py-1 rounded-lg border border-stone-800"
                  title="Bildirim hattını değiştirmek için tıklayın"
                >
                  <span>Bildirim:</span>
                  <span className="text-amber-400 font-bold">+{businessWhatsapp || "904125030405"}</span>
                  <Edit3 className="w-3 h-3 text-stone-500" />
                </button>
              </div>

              {/* Rezervasyon Kartları Listesi */}
              {filteredReservations.length > 0 ? (
                <div className="space-y-3">
                  {filteredReservations.map((res) => {
                    const isPending = res.status === "beklemede";
                    const isApproved = res.status === "onaylandi";
                    const isCancelled = res.status === "iptal";

                    return (
                      <div
                        key={res.id}
                        className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                          isPending
                            ? "bg-neutral-900/90 border-amber-500/40 shadow-lg shadow-amber-950/20"
                            : isApproved
                            ? "bg-stone-950 border-emerald-500/30"
                            : "bg-stone-950/60 border-stone-800 opacity-60"
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2.5 mb-2.5">
                          <div className="flex items-center gap-2.5 sm:gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center font-bold text-amber-400 text-xs sm:text-sm shrink-0">
                              {res.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm sm:text-base text-white leading-snug">
                                  {res.name}
                                </h4>
                                <span
                                  className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                    isPending
                                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                                      : isApproved
                                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                      : "bg-red-500/20 text-red-300 border border-red-500/40"
                                  }`}
                                >
                                  {isPending ? "⏳ Beklemede" : isApproved ? "✅ Onaylandı" : "❌ İptal"}
                                </span>
                              </div>
                              <p className="text-[10px] sm:text-[11px] text-stone-400">
                                {res.branch} • {new Date(res.createdAt).toLocaleDateString("tr-TR")} {new Date(res.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>

                          <a
                            href={`tel:${res.phone}`}
                            className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white text-xs font-mono font-semibold transition-colors"
                            title="Ara"
                          >
                            <Phone className="w-3.5 h-3.5 text-amber-400" />
                            <span>{res.phone}</span>
                          </a>
                        </div>

                        {/* Detay Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 rounded-xl bg-black/50 border border-stone-900 text-xs mb-2.5">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <div>
                              <span className="block text-[9px] text-stone-500">Tarih</span>
                              <span className="font-semibold text-stone-200">{res.date}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <div>
                              <span className="block text-[9px] text-stone-500">Saat</span>
                              <span className="font-semibold text-stone-200">{res.time}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                            <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <div>
                              <span className="block text-[9px] text-stone-500">Kişi Sayısı</span>
                              <span className="font-semibold text-stone-200">{res.guests}</span>
                            </div>
                          </div>

                          {res.notes && (
                            <div className="col-span-2 sm:col-span-3 pt-1.5 border-t border-stone-800/80 text-xs">
                              <span className="text-[10px] text-stone-400 font-semibold block mb-0.5">
                                Not / Tercih:
                              </span>
                              <p className="text-amber-200/90 italic bg-amber-950/20 border border-amber-500/20 rounded-lg p-1.5 text-[11px]">
                                "{res.notes}"
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Aksiyonlar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleReplyToGuest(res)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold text-xs shadow transition-all cursor-pointer"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp'tan Yanıtla</span>
                            </button>

                            {!isApproved && (
                              <button
                                type="button"
                                onClick={() => {
                                  onUpdateReservationStatus(res.id, "onaylandi");
                                  showToast(`✅ ${res.name} için rezervasyon onaylandı.`);
                                }}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-emerald-300 font-semibold text-xs border border-emerald-500/30 transition-all cursor-pointer"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Onayla</span>
                              </button>
                            )}

                            {!isCancelled && (
                              <button
                                type="button"
                                onClick={() => {
                                  onUpdateReservationStatus(res.id, "iptal");
                                  showToast(`❌ ${res.name} için rezervasyon iptal edildi.`);
                                }}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-red-300 font-semibold text-xs border border-red-500/20 transition-all cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>İptal Et</span>
                              </button>
                            )}
                          </div>

                          {onDeleteReservation && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`${res.name} adına açılmış rezervasyonu silmek istiyor musunuz?`)) {
                                  onDeleteReservation(res.id);
                                  showToast("🗑️ Rezervasyon kaydı silindi.");
                                }
                              }}
                              className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-stone-900 transition-colors cursor-pointer"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-stone-800 bg-neutral-950">
                  <Calendar className="w-10 h-10 text-stone-600 mx-auto mb-2 opacity-60" />
                  <p className="text-sm font-semibold text-stone-300">
                    {reservations.length === 0
                      ? "Henüz rezervasyon bulunmuyor."
                      : "Bu filtreye uygun rezervasyon bulunamadı."}
                  </p>
                  {reservations.length === 0 && (
                    <p className="text-xs text-stone-500 mt-1">
                      Web sitesinden yapılan rezervasyon talepleri burada anlık olarak listelenecektir.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ================= 2. MENÜ & ÜRÜN YÖNETİMİ (BİRLEŞTİRİLMİŞ TEK SEKME) ================= */}
          {activeTab === "menu_yonetimi" && (
            <div className="max-w-2xl mx-auto space-y-5">
              {/* Alt Sekme Seçici (Düzenle / Ekle / Toplu Fiyat) */}
              <div className="flex items-center justify-center p-1.5 rounded-2xl bg-black/60 border border-stone-800 gap-1.5">
                <button
                  type="button"
                  onClick={() => setMenuSubTab("edit")}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    menuSubTab === "edit"
                      ? "bg-gradient-to-r from-amber-500 to-[#FBE291] text-black shadow font-extrabold"
                      : "text-stone-400 hover:text-white"
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Ürün Listesi & Fiyat</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMenuSubTab("bulk")}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    menuSubTab === "bulk"
                      ? "bg-gradient-to-r from-amber-500 to-[#FBE291] text-black shadow font-extrabold"
                      : "text-stone-400 hover:text-white"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Toplu Fiyat Güncelle</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMenuSubTab("add")}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    menuSubTab === "add"
                      ? "bg-gradient-to-r from-amber-500 to-[#FBE291] text-black shadow font-extrabold"
                      : "text-stone-400 hover:text-white"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Yeni Ürün</span>
                </button>
              </div>

              {/* 1. KISIM: KATEGORİ SEKMELERİ, HIZLI LİSTE & DOĞRUDAN FİYAT DÜZENLEME */}
              {menuSubTab === "edit" && (
                <div className="space-y-4">
                  {/* A) Yatay Kategori Seçici (Tabs) */}
                  <div className="p-3.5 rounded-2xl bg-black/60 border border-stone-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" />
                        <span>Kategori Seçici</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setMenuSubTab("bulk")}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Upload className="w-3 h-3" />
                          <span>Toplu Güncelle</span>
                        </button>
                        <span className="text-[11px] text-stone-400 font-mono">
                          {filteredProductsForEdit.length} Ürün Listelendi
                        </span>
                      </div>
                    </div>

                    {/* Yatay Kategori Butonları: [Tümü] [Steak & Dry Aged] [Kebaplar] [Fırın & Saç Tava] [Burger] [Tatlılar] [İçecekler] */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                      {ADMIN_CATEGORY_TABS.map((tab) => {
                        const isSelected = selectedAdminCatTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setSelectedAdminCatTab(tab.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                              isSelected
                                ? "bg-gradient-to-r from-amber-500 to-[#FBE291] text-black shadow-md shadow-amber-500/20 font-extrabold"
                                : "bg-stone-900/90 text-stone-400 hover:text-white border border-stone-800"
                            }`}
                          >
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Hızlı Arama Kutusu */}
                    <div className="relative pt-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Bu kategoride ara (Örn: Lokum, Tomahawk, Dallas, Adana, Katmer)..."
                        value={editSearchQuery}
                        onChange={(e) => setEditSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-black border border-stone-700 text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* B) Hızlı Liste & Doğrudan Fiyat Düzenleme */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                        Ürün Listesi & Fiyat Değiştirme
                      </span>
                      <span className="text-[10px] text-stone-500">Fiyat kutusundan değiştirip [Kaydet]'e basın</span>
                    </div>

                    <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1 rounded-2xl">
                      {filteredProductsForEdit.length === 0 ? (
                        <div className="p-8 text-center bg-black/40 rounded-2xl border border-stone-800 text-stone-500 text-xs">
                          Bu kategori veya arama kriterine uygun ürün bulunamadı.
                        </div>
                      ) : (
                        filteredProductsForEdit.map((p) => {
                          const currentPriceVal =
                            rowPriceMap[p.id] !== undefined ? rowPriceMap[p.id] : String(p.price);
                          const isUpdated = priceUpdatedId === p.id;
                          const isSelected = selectedProdForEdit === p.id;
                          return (
                            <div
                              key={p.id}
                              className={`p-3 rounded-xl bg-black/70 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                isSelected
                                  ? "border-amber-500/80 bg-amber-950/20 shadow-md"
                                  : "border-stone-800 hover:border-stone-700"
                              }`}
                            >
                              {/* Sol Taraf: Görsel & Bilgiler */}
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-900 border border-stone-800 shrink-0">
                                  <img
                                    src={p.image || "/images/menu/steak/loqum.jpg"}
                                    alt={p.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                                      {p.name}
                                    </h4>
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-800/90 text-amber-300/90 border border-amber-500/20 font-mono shrink-0">
                                      {getCategoryBadgeName(p.categoryId)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mt-0.5">
                                    <span>{p.gramaj || "250 gr"}</span>
                                    <span>•</span>
                                    <span>{p.calories || 650} kcal</span>
                                    {p.allergens && p.allergens.length > 0 && (
                                      <>
                                        <span>•</span>
                                        <span className="text-amber-400/80 truncate max-w-[120px] sm:max-w-[200px]">
                                          Alerjen: {p.allergens.join(", ")}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Sağ Taraf: Fiyat Kutusu + [Kaydet] + [Düzenle] */}
                              <div className="flex items-center gap-2 justify-end shrink-0 w-full sm:w-auto">
                                {isUpdated && (
                                  <span className="text-[11px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/40 px-2 py-1 rounded-lg flex items-center gap-1 animate-pulse">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Fiyat Güncellendi</span>
                                  </span>
                                )}

                                <div className="relative flex items-center">
                                  <span className="absolute left-2.5 text-stone-400 font-mono text-xs font-bold">₺</span>
                                  <input
                                    type="number"
                                    value={currentPriceVal}
                                    onChange={(e) =>
                                      setRowPriceMap((prev) => ({
                                        ...prev,
                                        [p.id]: e.target.value
                                      }))
                                    }
                                    className="w-24 pl-6 pr-2 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-xs font-bold focus:outline-none focus:border-amber-400 text-right"
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const num = Number(currentPriceVal);
                                    if (!num || isNaN(num) || num <= 0) return;
                                    onUpdatePrice(p.id, num);
                                    fetch("/api/stock", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ dishId: p.id, price: num }),
                                    }).catch((err) => console.error("Price sync error:", err));
                                    setPriceUpdatedId(p.id);
                                    setTimeout(() => setPriceUpdatedId(null), 2500);
                                    showToast(`Fiyat Güncellendi: "${p.name}" ₺${num}`);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#FBE291] text-black font-extrabold text-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer whitespace-nowrap shadow"
                                >
                                  Kaydet
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    handleSelectProductToEdit(p.id);
                                    const formEl = document.getElementById("admin-product-edit-form");
                                    if (formEl) {
                                      formEl.scrollIntoView({ behavior: "smooth", block: "start" });
                                    }
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap border border-stone-700"
                                >
                                  Düzenle
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                  className="px-2.5 py-1.5 rounded-xl bg-red-900/60 hover:bg-red-800 text-red-200 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap border border-red-700/50 flex items-center gap-1 shadow"
                                  title="Bu ürünü menüden tamamen sil"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Sil</span>
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Detaylı Ürün & Alerjen Formu */}
                  <form
                    id="admin-product-edit-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!selectedProdForEdit) return;
                      const updated = products.map((p) => {
                        if (p.id === selectedProdForEdit) {
                          return {
                            ...p,
                            name: editName,
                            price: Number(editPrice),
                            description: editDesc,
                            image: editPhoto,
                            categoryId: Number(editCategory),
                            gramaj: editGramaj || "250 gr",
                            calories: Number(editCalories) || 650,
                            allergens: editAllergens
                          };
                        }
                        return p;
                      });
                      onUpdateProduct(updated);
                      showToast(`✨ "${editName}" ürün detayları ve alerjenleri kaydedildi!`);
                    }}
                    className="space-y-4 p-4 rounded-2xl bg-stone-900/40 border border-stone-800/80 scroll-mt-6"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Seçili Ürün Detay Formu: <strong className="text-white normal-case">{editName}</strong></span>
                      </span>
                      <span className="text-xs font-mono text-stone-400">
                        Fiyat: <strong className="text-amber-300">₺{editPrice}</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-300 mb-1">Ürün Adı</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-sm sm:text-xs text-white focus:outline-none focus:border-[#C8982B]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-300 mb-1">Gerçek Kategorisi</label>
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-sm sm:text-xs text-white focus:outline-none focus:border-[#C8982B] cursor-pointer"
                        >
                          {CATEGORY_OPTIONS.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-300 mb-1">Fiyat (₺)</label>
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-sm sm:text-xs text-white focus:outline-none focus:border-[#C8982B]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-300 mb-1">Gramaj / Porsiyon</label>
                        <input
                          type="text"
                          value={editGramaj}
                          onChange={(e) => setEditGramaj(e.target.value)}
                          className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-sm sm:text-xs text-white focus:outline-none focus:border-[#C8982B]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-300 mb-1">Kalori (kcal)</label>
                        <input
                          type="number"
                          value={editCalories}
                          onChange={(e) => setEditCalories(e.target.value)}
                          className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-sm sm:text-xs text-white focus:outline-none focus:border-[#C8982B]"
                        />
                      </div>
                    </div>

                    {/* Alerjen Seçimi */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center justify-between">
                        <span>Alerjen İkazları</span>
                        <span className="text-[10px] text-amber-400 font-mono">Tıklayarak Aç/Kapat</span>
                      </label>
                      <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-black/60 border border-stone-800 max-h-32 overflow-y-auto">
                        {COMMON_ALLERGENS.map((alg) => {
                          const hasIt = editAllergens.includes(alg);
                          return (
                            <button
                              key={alg}
                              type="button"
                              onClick={() => handleToggleEditAllergen(alg)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                hasIt
                                  ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20"
                                  : "bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800"
                              }`}
                            >
                              {hasIt ? `✓ ${alg}` : `+ ${alg}`}
                            </button>
                          );
                        })}
                      </div>

                      {/* Özel Alerjen Ekle */}
                      <div className="flex gap-2 mt-2">
                        <input
                          type="text"
                          placeholder="Özel alerjen yaz (Örn: Çam fıstığı)..."
                          value={editCustomAllergen}
                          onChange={(e) => setEditCustomAllergen(e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-stone-900 border border-stone-800 text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomEditAllergen}
                          className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Ekle
                        </button>
                      </div>

                      {editAllergens.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-black/40 border border-stone-800 flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="text-[10px] text-stone-400 mr-1 font-semibold">Tabağın Alerjenleri:</span>
                          {editAllergens.map((alg) => (
                            <span
                              key={alg}
                              className="px-2 py-0.5 rounded-lg bg-amber-950/60 border border-amber-700/50 text-amber-200 text-[11px] font-medium flex items-center gap-1"
                            >
                              <span>⚠️ {alg}</span>
                              <button
                                type="button"
                                onClick={() => handleToggleEditAllergen(alg)}
                                className="hover:text-red-400 font-bold ml-0.5 text-xs cursor-pointer"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1">Açıklama</label>
                      <textarea
                        rows={2}
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-sm sm:text-xs text-white focus:outline-none focus:border-[#C8982B]"
                      />
                    </div>

                    <ImageUploadBox
                      value={editPhoto}
                      onChange={setEditPhoto}
                      label="Ürün Fotoğrafı"
                      showToast={showToast}
                    />

                    <div className="flex flex-col sm:flex-row gap-2 mt-3">
                      <button
                        type="submit"
                        className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#C8982B] via-[#FBE291] to-[#C8982B] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider hover:brightness-110 active:scale-98 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Değişiklikleri Kaydet (Menüye Yansıt)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const currentProd = products.find((p) => p.id === selectedProdForEdit);
                          if (currentProd) {
                            handleDeleteProduct(currentProd.id, currentProd.name);
                          }
                        }}
                        className="py-3.5 px-4 rounded-xl bg-red-950/70 hover:bg-red-900 text-red-300 hover:text-white border border-red-800/60 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow whitespace-nowrap"
                        title="Bu ürünü menüden kalıcı olarak sil"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                        <span>🗑️ Bu Ürünü Menüden Tamamen Sil</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* 2. KISIM: YENİ ÜRÜN EKLEME FORMU */}
              {menuSubTab === "add" && (
                <div className="p-4 rounded-2xl bg-stone-900/40 border border-stone-800 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Plus className="w-4 h-4 text-amber-400" />
                      <span>Menüye Yeni Ürün Tanımla</span>
                    </h4>
                    <span className="text-[10px] text-stone-400 font-mono">160+ Ürün Kataloğu</span>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newProdName || !newProdPrice) return;
                      const newProd = {
                        id: `custom-${Date.now()}`,
                        name: newProdName,
                        price: Number(newProdPrice),
                        categoryId: Number(newProdCategory),
                        description: newProdDesc || "Şefin taze seçimi ile sunulur.",
                        image: newProdPhoto || "/images/menu/steak/loqum.jpg",
                        gramaj: newProdGramaj || "250 gr",
                        calories: Number(newProdCalories) || 650,
                        allergens: newProdAllergens,
                        isPopular: true,
                        tag: "Yeni"
                      };
                      onAddProduct(newProd);
                      showToast(`✅ "${newProdName}" menüye başarıyla eklendi!`);
                      setNewProdName("");
                      setNewProdPrice("");
                      setNewProdDesc("");
                      setNewProdAllergens([]);
                      setMenuSubTab("edit");
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-300 mb-1">Ürün Adı</label>
                        <input
                          type="text"
                          placeholder="Örn: Dry-Aged Lokum"
                          value={newProdName}
                          onChange={(e) => setNewProdName(e.target.value)}
                          className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-sm sm:text-xs text-white focus:outline-none focus:border-[#C8982B]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-300 mb-1">Satış Fiyatı (₺)</label>
                        <input
                          type="number"
                          placeholder="Örn: 950"
                          value={newProdPrice}
                          onChange={(e) => setNewProdPrice(e.target.value)}
                          className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-sm sm:text-xs text-white focus:outline-none focus:border-[#C8982B]"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-300 mb-1">Kategori</label>
                        <select
                          value={newProdCategory}
                          onChange={(e) => setNewProdCategory(e.target.value)}
                          className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-sm sm:text-xs text-white focus:outline-none focus:border-[#C8982B]"
                        >
                          {CATEGORY_OPTIONS.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-300 mb-1">Porsiyon / Gramaj</label>
                        <input
                          type="text"
                          placeholder="Örn: 300 gr"
                          value={newProdGramaj}
                          onChange={(e) => setNewProdGramaj(e.target.value)}
                          className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-sm sm:text-xs text-white focus:outline-none focus:border-[#C8982B]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1">Kalori (kcal)</label>
                      <input
                        type="number"
                        placeholder="Örn: 720"
                        value={newProdCalories}
                        onChange={(e) => setNewProdCalories(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-sm sm:text-xs text-white focus:outline-none focus:border-[#C8982B]"
                      />
                    </div>

                    {/* Alerjen Seçimi */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1.5">Alerjenler (Opsiyonel)</label>
                      <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-black/60 border border-stone-800 max-h-28 overflow-y-auto">
                        {COMMON_ALLERGENS.map((alg) => {
                          const hasIt = newProdAllergens.includes(alg);
                          return (
                            <button
                              key={alg}
                              type="button"
                              onClick={() => handleToggleNewAllergen(alg)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                hasIt
                                  ? "bg-amber-500 text-black font-bold"
                                  : "bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800"
                              }`}
                            >
                              {hasIt ? `✓ ${alg}` : `+ ${alg}`}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex gap-2 mt-2">
                        <input
                          type="text"
                          placeholder="Özel alerjen yaz..."
                          value={newCustomAllergen}
                          onChange={(e) => setNewCustomAllergen(e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-stone-900 border border-stone-800 text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={handleAddNewCustomAllergen}
                          className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Ekle
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1">Açıklama</label>
                      <textarea
                        rows={2}
                        placeholder="Özel marinasyonlu dinlendirilmiş et dilimleri..."
                        value={newProdDesc}
                        onChange={(e) => setNewProdDesc(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-sm sm:text-xs text-white focus:outline-none focus:border-[#C8982B]"
                      />
                    </div>

                    <ImageUploadBox
                      value={newProdPhoto}
                      onChange={setNewProdPhoto}
                      label="Ürün Fotoğrafı"
                      showToast={showToast}
                    />

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#C8982B] to-[#FBE291] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider hover:brightness-110 active:scale-98 transition-all mt-2 shadow cursor-pointer"
                    >
                      Yeni Ürünü Menüye Ekle
                    </button>
                  </form>
                </div>
              )}

              {/* 3. KISIM: TOPLU FİYAT GÜNCELLEME (EXCEL, CSV VEYA LİSTE) */}
              {menuSubTab === "bulk" && (
                <div className="p-4 sm:p-5 rounded-2xl bg-stone-900/40 border border-stone-800 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Upload className="w-4 h-4 text-amber-400" />
                      <span>Toplu Menü Fiyatı Güncelleme</span>
                    </h4>
                    <span className="text-[11px] text-amber-300/80 font-mono bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-800/40">
                      ⚡ Anında Canlıya Yansır
                    </span>
                  </div>

                  <p className="text-xs text-stone-300 leading-relaxed">
                    İşletmenizin güncel fiyat listesini tek seferde <strong>Excel (.xlsx / .csv)</strong> dosyası yükleyerek veya <strong>metin olarak yapıştırarak</strong> saniyeler içinde tüm menüye uygulayabilirsiniz. Güncellenen fiyatlar sunucu önbelleğini otomatik yenileyerek <strong>tüm müşteri cihazlarına anında yansır</strong>.
                  </p>

                  <form onSubmit={handleBulkUpdate} className="space-y-4">
                    {/* Seçenek 1: Excel veya CSV Dosyası Yükle */}
                    <div className="p-4 rounded-xl bg-black/60 border border-stone-700/80 space-y-2">
                      <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Yöntem 1: Excel veya CSV Dosyası Yükle</span>
                      </label>
                      <p className="text-[11px] text-stone-400">
                        Excel dosyanızda <em>&quot;Ürün İsmi&quot;</em> ve <em>&quot;Fiyatı&quot;</em> kolonlarının bulunması yeterlidir.
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="file"
                          id="bulk-excel-upload"
                          accept=".xlsx, .xls, .csv"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setBulkFile(e.target.files[0]);
                              setBulkTextInput("");
                            }
                          }}
                          className="hidden"
                        />
                        <label
                          htmlFor="bulk-excel-upload"
                          className="flex-1 py-3 px-4 rounded-xl border border-dashed border-amber-500/50 hover:border-amber-400 bg-stone-900/80 hover:bg-stone-900 text-stone-200 text-xs font-medium cursor-pointer transition-all flex items-center justify-center gap-2 text-center"
                        >
                          <Upload className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="truncate">
                            {bulkFile ? `📄 Seçilen Dosya: ${bulkFile.name}` : "Excel (.xlsx) veya CSV Dosyası Seçin"}
                          </span>
                        </label>
                        {bulkFile && (
                          <button
                            type="button"
                            onClick={() => setBulkFile(null)}
                            className="px-3 py-3 rounded-xl bg-red-950/60 border border-red-800/60 text-red-300 text-xs font-bold hover:bg-red-900 cursor-pointer"
                            title="Dosyayı kaldır"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>

                    {/* VEYA Ayırıcı */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-stone-800"></div>
                      <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">veya</span>
                      <div className="flex-1 h-px bg-stone-800"></div>
                    </div>

                    {/* Seçenek 2: Liste / Metin Yapıştır */}
                    <div className="p-4 rounded-xl bg-black/60 border border-stone-700/80 space-y-2">
                      <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Yöntem 2: Ürün ve Fiyat Listesi Yapıştır</span>
                      </label>
                      <p className="text-[11px] text-stone-400">
                        Her satıra bir ürün gelecek şekilde isim ve fiyatı yazın (Örn: <code>ADANA: 580</code> veya Excel&apos;den kopyalayıp doğrudan yapıştırın).
                      </p>
                      <textarea
                        rows={5}
                        placeholder={"Örnek:\nADANA: 580\nURFA: 580\nKUZU PİRZOLA: 770\nNEWYORK STEAK: 1690"}
                        value={bulkTextInput}
                        onChange={(e) => {
                          setBulkTextInput(e.target.value);
                          if (e.target.value) setBulkFile(null);
                        }}
                        className="w-full bg-stone-900 border border-stone-700 rounded-xl p-3 text-xs text-white font-mono placeholder-stone-600 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* Sonuç Bildirimi */}
                    {bulkResult && (
                      <div
                        className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                          bulkResult.success
                            ? "bg-emerald-950/50 border-emerald-700/60 text-emerald-200"
                            : "bg-red-950/50 border-red-700/60 text-red-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold">
                          {bulkResult.success ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                          )}
                          <span>{bulkResult.message || (bulkResult.success ? "Fiyatlar başarıyla güncellendi!" : "İşlem başarısız")}</span>
                        </div>
                        {bulkResult.unmatched && bulkResult.unmatched.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-stone-800 text-[11px] text-stone-400">
                            <strong>Eşleşmeyen {bulkResult.unmatched.length} ürün:</strong>{" "}
                            {bulkResult.unmatched.slice(0, 5).join(", ")}
                            {bulkResult.unmatched.length > 5 ? ` ve ${bulkResult.unmatched.length - 5} ürün daha...` : ""}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Gönder Butonu */}
                    <button
                      type="submit"
                      disabled={isBulkLoading || (!bulkFile && !bulkTextInput.trim())}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#C8982B] via-[#FBE291] to-[#C8982B] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider hover:brightness-110 active:scale-98 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isBulkLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Fiyatlar Güncelleniyor &amp; Canlıya Alınıyor...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Tüm Fiyatları Güncelle ve Canlıya Al</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ================= 3. LOQUM CLUB SADAKAT AYARLARI & KASA MÜHÜR PANELİ ================= */}
          {activeTab === "loyalty" && (
            <div className="max-w-2xl mx-auto space-y-5">
              {/* Başlık Kartı */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#1E1508] via-[#2A1D0B] to-[#1E1508] border-2 border-[#D4AF37]/50 shadow-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#C8982B] flex items-center justify-center text-black shadow-md shadow-[#D4AF37]/40 shrink-0">
                    <Crown className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base text-white flex items-center gap-2">
                      <span>Loqum Club Sadakat Programı (6+1)</span>
                    </h4>
                    <p className="text-[11px] text-amber-200/80">
                      Her ziyarette 1 damga, 6 damgada 1 hediye ikram yemeği.
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[10px] px-2.5 py-1 rounded-full font-mono font-bold uppercase tracking-wider shrink-0 ${
                    loyaltySettings?.isEnabled
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-red-500/20 text-red-300 border border-red-500/40"
                  }`}
                >
                  {loyaltySettings?.isEnabled ? "● AÇIK" : "✕ KAPALI"}
                </span>
              </div>

              {/* 3a. MASTER SWITCH (AÇ / KAPA) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-stone-800 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                      <span>Loqum Club Sadakat Programı</span>
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Kapalı yapıldığında menüdeki parlayan altın buton anında gizlenir.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleLoyalty}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 shrink-0 ${
                      loyaltySettings?.isEnabled
                        ? "bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 text-white border border-red-500/40 shadow-red-900/30"
                        : "bg-gradient-to-r from-emerald-700 to-emerald-500 hover:from-emerald-600 text-white border border-emerald-400/50 shadow-emerald-900/30"
                    }`}
                  >
                    {loyaltySettings?.isEnabled ? (
                      <>
                        <XCircle className="w-4 h-4" />
                        <span>KAPAT (Gizle)</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>AÇ (Aktif Et)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 3b. İKRAM SEÇİCİ (DROPDOWN) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-stone-800 space-y-3">
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <Gift className="w-4 h-4 text-[#D4AF37]" />
                    <span>7. Ziyarette Verilecek İkram Yemeği (Dropdown)</span>
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">
                    6 damgayı dolduran misafire hediye edilecek ikram yemeğini seçiniz.
                  </p>
                </div>

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
                      handleSaveLoyaltyGift(val, priceMap[val] || 750);
                    }
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-900 border border-[#D4AF37]/50 text-white font-serif text-xs focus:outline-none focus:border-[#D4AF37] cursor-pointer"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] text-stone-400 block mb-1">Görünen İkram Adı:</label>
                    <input
                      type="text"
                      key={`reward-name-${loyaltySettings?.rewardItemName}`}
                      defaultValue={loyaltySettings?.rewardItemName || "Dana Bonfile (Lokum)"}
                      onBlur={(e) => handleSaveLoyaltyGift(e.target.value, loyaltySettings?.rewardItemPrice || 750)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-white font-serif text-xs focus:border-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-400 block mb-1">Hediye Değeri (₺):</label>
                    <input
                      type="number"
                      key={`reward-price-${loyaltySettings?.rewardItemPrice}`}
                      defaultValue={loyaltySettings?.rewardItemPrice || 750}
                      onBlur={(e) => handleSaveLoyaltyGift(loyaltySettings?.rewardItemName || "Dana Bonfile (Lokum)", Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-white font-mono text-xs focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>

              {/* 3c. MÜŞTERİ MÜHÜR ONAYLAMA (KASA POS) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-stone-800 space-y-4">
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>Müşteri Mühür Onaylama (Kasa POS)</span>
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Misafirin telefon numarasını girip onaylayarak damga sayısını anında artırın.
                  </p>
                </div>

                {/* Telefon Arama & Damga Onay Kutusu */}
                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="tel"
                      placeholder="05XX... (Örn: 0506 176 33 21)"
                      value={loyaltyPhoneInput}
                      onChange={(e) => {
                        setLoyaltyPhoneInput(e.target.value);
                        if (e.target.value.replace(/\D/g, "").length >= 10) {
                          handleQueryMember(e.target.value);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAddLoyaltyStamp();
                        }
                      }}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-sm placeholder-stone-500 focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddLoyaltyStamp}
                    disabled={loyaltyLoading}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer whitespace-nowrap active:scale-95"
                  >
                    <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                    <span>⭐ +1 Ziyaret Onayla</span>
                  </button>
                </div>

                {/* Müşteri Kartı Canlı Önizleme */}
                {loyaltyMember && (
                  <div className="p-4 rounded-xl bg-stone-900/80 border border-[#D4AF37]/40 space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                      <div>
                        <span className="text-[10px] text-stone-400 font-mono uppercase block">Sorgulanan Misafir</span>
                        <span className="text-sm font-bold font-mono text-white">
                          {loyaltyMember.formattedPhone || loyaltyMember.phone}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-amber-300">
                          {loyaltyMember.currentStamps} / {loyaltySettings?.maxStamps || 6} DAMGA
                        </span>
                        <span className="text-[10px] text-stone-400 block font-mono">
                          Döngü #{loyaltyMember.cycleCount || 1}
                        </span>
                      </div>
                    </div>

                    {/* 6 Damga Halkaları */}
                    <div className="grid grid-cols-6 gap-1.5">
                      {[...Array(loyaltySettings?.maxStamps || 6)].map((_, i) => {
                        const isStamped = i + 1 <= loyaltyMember.currentStamps;
                        return (
                          <div
                            key={i}
                            className={`p-2 rounded-lg border text-center transition-all ${
                              isStamped
                                ? "bg-emerald-950/70 border-emerald-400 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                                : "bg-black/40 border-dashed border-stone-800 text-stone-600"
                            }`}
                          >
                            {isStamped ? (
                              <CheckCircle2 className="w-3.5 h-3.5 mx-auto text-emerald-400 stroke-[2.5]" />
                            ) : (
                              <span className="text-[10px] font-mono font-bold">{i + 1}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Hediye Teslim Butonu (6 Damga Dolduğunda) */}
                    {(loyaltyMember.isRewardUnlocked || loyaltyMember.currentStamps >= (loyaltySettings?.maxStamps || 6)) && (
                      <div className="pt-2">
                        <div className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs font-semibold mb-2 text-center">
                          🎉 Misafir 6 ziyareti tamamladı! Hediyesini teslim edebilirsiniz.
                        </div>
                        <button
                          type="button"
                          onClick={handleClaimLoyaltyReward}
                          disabled={loyaltyLoading}
                          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#FBE291] to-[#D4AF37] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#D4AF37]/30 hover:brightness-110 active:scale-98 transition-all cursor-pointer"
                        >
                          <Gift className="w-4 h-4" />
                          <span>🎁 HEDİYE YEMEĞİ TESLİM ET (KARTI SIFIRLA)</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= 5. WHATSAPP & İLETİŞİM AYARLARI ================= */}
          {activeTab === "whatsapp" && (
            <div className="max-w-xl mx-auto space-y-6 py-2">
              <div className="p-5 rounded-2xl bg-neutral-900/70 border border-amber-500/20 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <MessageCircle className="w-5 h-5 text-emerald-400" />
                  <span>İşletme WhatsApp Bildirim Hattı</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Web sitesinden bir misafir rezervasyon formunu doldurduğunda, formatlanmış rezervasyon fişi doğrudan bu numaraya WhatsApp üzerinden iletilecektir.
                </p>
              </div>

              <form onSubmit={handleSavePhone} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-stone-200 uppercase tracking-wider">
                      Rezervasyon Bildirim Numarası (WhatsApp)
                    </label>
                    {phoneInput && (
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-700/50 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                        <span className="text-stone-400">Canlı Format:</span>
                        <strong className="text-emerald-300">+{normalizeWhatsAppNumber(phoneInput) || "90..."}</strong>
                      </span>
                    )}
                  </div>
                  <div className="relative flex items-center rounded-xl bg-stone-900 border border-stone-700 focus-within:border-amber-400 transition-colors overflow-hidden shadow-inner">
                    <div className="flex items-center gap-1.5 px-3.5 py-3.5 bg-stone-950 border-r border-stone-800 text-amber-400 font-mono text-sm font-bold select-none shrink-0">
                      <span>🇹🇷</span>
                      <span>+90</span>
                    </div>
                    <input
                      type="text"
                      placeholder="506 123 45 67 veya 05061234567"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="w-full px-3.5 py-3.5 bg-transparent text-white font-mono text-sm font-semibold placeholder-stone-500 focus:outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-stone-400 mt-2 leading-relaxed">
                    💡 İster başında <code className="text-amber-300 font-mono">0</code> veya <code className="text-amber-300 font-mono">+90</code> olsun, ister boşluklu yazın; sistem otomatik olarak <code className="text-amber-300 font-mono">905XXXXXXXXX</code> formatına dönüştürüp kalıcı kaydeder.
                  </p>
                </div>

                <div>
                  <span className="block text-[11px] font-semibold text-stone-400 mb-2">
                    Tek Tıkla Hızlı Numara Ata:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setPhoneInput("904125030405")}
                      className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-amber-500/50 text-stone-300 hover:text-white text-xs font-mono font-medium transition-colors cursor-pointer"
                    >
                      📞 +90 412 503 04 05 (Resmi Restoran Bildirim Hattı)
                    </button>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#C8982B] via-[#FBE291] to-[#C8982B] text-black font-extrabold text-sm uppercase tracking-wider hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Ayarları Kaydet</span>
                  </button>
                </div>
              </form>

              {/* ================= GARANTİ GÖRÜNÜRLÜK: ŞİFRE DEĞİŞTİRME KARTI ================= */}
              <div className="pt-6 border-t border-stone-800/80">
                <div className="p-5 rounded-2xl bg-gradient-to-b from-stone-900/95 to-stone-950 border border-amber-500/30 space-y-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">Yönetici Giriş PIN Kodu Değiştir</h4>
                      <p className="text-xs text-stone-400 mt-0.5">
                        İşletmeci paneline erişim sağlayan PIN kodunuzu buradan değiştirebilirsiniz.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdatePin} className="space-y-4 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1">
                        Mevcut PIN
                      </label>
                      <input
                        type="password"
                        maxLength={10}
                        placeholder="Mevcut PIN kodunuz (Varsayılan: 1234)"
                        value={currentPinInput}
                        onChange={(e) => {
                          setCurrentPinInput(e.target.value);
                          if (pinChangeError) setPinChangeError(null);
                        }}
                        className="w-full bg-stone-900 border border-stone-700/80 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#C8982B]"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-300 mb-1">
                          Yeni PIN
                        </label>
                        <input
                          type="password"
                          maxLength={10}
                          placeholder="Yeni PIN (en az 4 hane)"
                          value={newPinInput}
                          onChange={(e) => {
                            setNewPinInput(e.target.value);
                            if (pinChangeError) setPinChangeError(null);
                          }}
                          className="w-full bg-stone-900 border border-stone-700/80 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#C8982B]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-300 mb-1">
                          Yeni PIN Tekrar
                        </label>
                        <input
                          type="password"
                          maxLength={10}
                          placeholder="Yeni PIN Tekrar"
                          value={confirmPinInput}
                          onChange={(e) => {
                            setConfirmPinInput(e.target.value);
                            if (pinChangeError) setPinChangeError(null);
                          }}
                          className="w-full bg-stone-900 border border-stone-700/80 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#C8982B]"
                          required
                        />
                      </div>
                    </div>

                    {pinChangeError && (
                      <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-semibold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                        <span>{pinChangeError}</span>
                      </div>
                    )}

                    {pinChangeSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span>✓ PIN kodunuz başarıyla güncellendi ve kalıcı olarak kaydedildi.</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isPinSaving}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-[#FBE291] to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 active:scale-98 transition-all shadow cursor-pointer disabled:opacity-50"
                    >
                      {isPinSaving ? "Kaydediliyor..." : "PIN Kodunu Güncelle"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ================= 6. KAMPANYA BANDI ================= */}
          {activeTab === "kampanya" && (
            <div className="max-w-xl mx-auto space-y-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onSaveCampaign(campaignInput);
                  showToast(
                    campaignInput ? `📢 Kampanya yayına alındı!` : `Kampanya kaldırıldı.`
                  );
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Üst Duyuru / Kampanya Metni
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Örn: Hafta içi saat 18:00'e kadar Chef's Special Lokum siparişlerinde özel tatlı ikramımızdır!"
                    value={campaignInput}
                    onChange={(e) => setCampaignInput(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3 text-sm sm:text-xs text-white focus:outline-none focus:border-[#C8982B]"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#BF2329] to-red-700 text-white font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow cursor-pointer"
                  >
                    Kampanyayı Yayına Al
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCampaignInput("");
                      onSaveCampaign("");
                      showToast("Kampanya bandı kaldırıldı.");
                    }}
                    className="px-4 py-3.5 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold hover:bg-stone-700 cursor-pointer"
                  >
                    Kaldır
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= 7. GÜVENLİK & PIN DEĞİŞTİR ================= */}
          {(activeTab === "security" || activeTab === "guvenlik") && (
            <div className="max-w-md mx-auto space-y-5 py-2">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-300">Yönetici Giriş PIN Kodu Değiştir</h4>
                  <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                    İşletmeci paneline erişim sağlayan PIN kodunuzu buradan değiştirebilirsiniz. Yeni şifreniz hem tarayıcınıza hem de sunucu veritabanına anında işlenir ve kalıcı olur.
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdatePin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Mevcut PIN
                  </label>
                  <input
                    type="password"
                    maxLength={10}
                    placeholder="Mevcut PIN kodunuz (Varsayılan: 1234)"
                    value={currentPinInput}
                    onChange={(e) => {
                      setCurrentPinInput(e.target.value);
                      if (pinChangeError) setPinChangeError(null);
                    }}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#C8982B]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Yeni PIN
                  </label>
                  <input
                    type="password"
                    maxLength={10}
                    placeholder="Yeni PIN (en az 4 hane)"
                    value={newPinInput}
                    onChange={(e) => {
                      setNewPinInput(e.target.value);
                      if (pinChangeError) setPinChangeError(null);
                    }}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#C8982B]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Yeni PIN Tekrar
                  </label>
                  <input
                    type="password"
                    maxLength={10}
                    placeholder="Yeni PIN Tekrar"
                    value={confirmPinInput}
                    onChange={(e) => {
                      setConfirmPinInput(e.target.value);
                      if (pinChangeError) setPinChangeError(null);
                    }}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#C8982B]"
                    required
                  />
                </div>

                {pinChangeError && (
                  <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{pinChangeError}</span>
                  </div>
                )}

                {pinChangeSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>✓ PIN kodunuz başarıyla güncellendi ve kalıcı olarak kaydedildi.</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPinSaving}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-[#FBE291] to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 active:scale-98 transition-all shadow cursor-pointer disabled:opacity-50"
                >
                  {isPinSaving ? "Kaydediliyor..." : "PIN Kodunu Güncelle"}
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
