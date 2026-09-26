// src/utils/whatsappReport.ts

export interface ZReportData {
  date?: string;
  time?: string;
  totalRevenue: number;
  cardRevenue: number;
  cashRevenue: number;
  totalTables: number;
  averageBasket: number;
  deptTotals: {
    steak: number;
    grill_oven: number;
    kitchen: number;
    bar: number;
    dessert: number;
  };
  topDishes: { name: string; count: number }[];
  compAmount: number;
  criticalStockNotes?: string;
}

export function generateZReportText(data: ZReportData): string {
  const dateStr = data.date || new Date().toLocaleDateString("tr-TR");
  const timeStr = data.time || new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

  const topItem1 = data.topDishes?.[0]
    ? `1. ${data.topDishes[0].name} (${data.topDishes[0].count} porsiyon)`
    : "1. Tomahawk Steak (0 porsiyon)";
  const topItem2 = data.topDishes?.[1]
    ? `2. ${data.topDishes[1].name} (${data.topDishes[1].count} porsiyon)`
    : "2. Loqum Bonfile (0 porsiyon)";
  const topItem3 = data.topDishes?.[2]
    ? `3. ${data.topDishes[2].name} (${data.topDishes[2].count} porsiyon)`
    : "3. Diyarbakır Saç Tava (0 porsiyon)";

  const criticalStock = data.criticalStockNotes || "Tüm reçete stokları yeterli seviyede.";

  return `🥩 *LOQUM ET STEAKHOUSE DİYARBAKIR* 🥩
📊 *GÜN SONU KAPANIŞ VE Z-RAPORU*
Tarih: ${dateStr} | Saat: ${timeStr}
----------------------------------------
💰 *TOPLAM CİRO:* ₺${data.totalRevenue.toLocaleString("tr-TR")}
💳 *Kredi Kartı Tahsilat:* ₺${data.cardRevenue.toLocaleString("tr-TR")}
💵 *Nakit Tahsilat:* ₺${data.cashRevenue.toLocaleString("tr-TR")}
🧾 *Toplam Masa/Adisyon:* ${data.totalTables}
👥 *Ortalama Masa Sepeti:* ₺${data.averageBasket.toLocaleString("tr-TR")}

🏢 *DEPARTMAN CİRO DAĞILIMI:*
• Steak & Dry-Aged: ₺${(data.deptTotals?.steak || 0).toLocaleString("tr-TR")}
• Taş Fırın & Kebap: ₺${(data.deptTotals?.grill_oven || 0).toLocaleString("tr-TR")}
• Mutfak & Tavalar: ₺${(data.deptTotals?.kitchen || 0).toLocaleString("tr-TR")}
• Bar & İçecek: ₺${(data.deptTotals?.bar || 0).toLocaleString("tr-TR")}
• Tatlı & Fırın: ₺${(data.deptTotals?.dessert || 0).toLocaleString("tr-TR")}

⭐ *EN ÇOK SATAN İMZA LEZZETLER:*
${topItem1}
${topItem2}
${topItem3}

⚠️ *İkram / İptal Tutarı:* ₺${data.compAmount.toLocaleString("tr-TR")}
📦 *Kritik Stok Uyarısı:* ${criticalStock}
----------------------------------------
Rapor Loqum Et Restaurant Engine tarafından otomatik üretilmiştir.`;
}

export function generateWhatsAppLink(data: ZReportData, recipientPhone: string = "904125030405"): string {
  const message = generateZReportText(data);
  const cleanPhone = recipientPhone.replace(/[^0-9]/g, "");
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
}

