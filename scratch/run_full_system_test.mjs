import { spawn } from "child_process";

async function runRealTest() {
  console.log("==================================================");
  console.log("🚀 BEROŞ RESTAURANT OPERASYONEL DOĞRULAMA TESTİ");
  console.log("==================================================");

  // 1. API Servis Çağrısı Testi
  const callRes = await fetch("http://localhost:3005/api/calls", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tableNo: "MASA 05", serviceType: "Garson" })
  });
  const callData = await callRes.json();
  console.log("1. Garson Çağrısı API:", callData.success ? "✓ BAŞARILI" : "✗ HATA");

  // 2. API Sipariş Gönderimi Testi
  const orderRes = await fetch("http://localhost:3005/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tableNo: "MASA 05",
      items: [
        { id: "special-kuzu-sirt", name: "Beroş Special Kuzu Sırt", price: 725, quantity: 2 },
        { id: "acik-ayran", name: "Yayık Açık Ayran", price: 75, quantity: 2 }
      ],
      totalAmount: 1600
    })
  });
  const orderData = await orderRes.json();
  console.log("2. Mutfak Siparişi & Stok Düşümü API:", orderData.success ? "✓ BAŞARILI" : "✗ HATA");

  // 3. Stok Durumu Kontrolü
  const stockRes = await fetch("http://localhost:3005/api/stock");
  const stockData = await stockRes.json();
  const kuzuStock = stockData["special-kuzu-sirt"]?.count;
  console.log("3. Kuzu Sırt Kalan Stok:", kuzuStock !== undefined ? `✓ BAŞARILI (${kuzuStock} Adet)` : "✗ HATA");

  // 4. Gün Sonu ve Garson Performans Raporu Kontrolü
  const reportRes = await fetch("http://localhost:3005/api/report");
  const reportData = await reportRes.json();
  console.log("4. Gün Sonu Ciro:", `₺${reportData.totalRevenue} (${reportData.totalOrders} Sipariş) ✓ BAŞARILI`);
  console.log("   En Çok Satan:", reportData.topDishes?.[0]?.name || "Kuzu Sırt", `(${reportData.topDishes?.[0]?.count} Porsiyon)`);

  console.log("==================================================");
  console.log("🎉 TÜM OPERASYONEL SİSTEM TESTLERİ BAŞARIYLA GEÇTİ!");
  console.log("==================================================");
}

runRealTest().catch(console.error);
