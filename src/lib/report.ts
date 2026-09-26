// src/lib/report.ts

export interface DailyReportData {
  date: string;
  totalRevenue: number;
  cashRevenue: number;
  cardRevenue: number;
  totalTables: number;
  topItems: { name: string; count: number }[];
}

export function formatDailyReportText(data: DailyReportData): string {
  const topDishesText = (data.topItems || [])
    .map((item) => `- ${item.name}: ${item.count} Adet`)
    .join("\n");

  return `📊 GÜN SONU KASA RAPORU - ${data.date}
Toplam Ciro: ${data.totalRevenue.toLocaleString("tr-TR")} ₺
Nakit: ${data.cashRevenue.toLocaleString("tr-TR")} ₺ | Kredi Kartı: ${data.cardRevenue.toLocaleString("tr-TR")} ₺
Toplam Adisyon: ${data.totalTables} Masa

Öne Çıkan Satışlar:
${topDishesText || "- Veri bulunmuyor"}`;
}

export function createWhatsAppReportUrl(data: DailyReportData, patronPhone: string = "904125030405"): string {
  const message = formatDailyReportText(data);
  const cleanPhone = patronPhone.replace(/[^0-9]/g, "");
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
}

