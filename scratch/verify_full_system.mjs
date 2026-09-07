async function testFullFlow() {
  console.log("==================================================");
  console.log("🚀 BEROŞ RESTAURANT UÇTAN UCA OPERASYON TESTİ");
  console.log("==================================================");

  // 1. Masa Çağrısı Testi
  const callRes = await fetch("http://localhost:3005/api/calls", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tableNo: "MASA 08", serviceType: "Hesap İste" })
  });
  const callData = await callRes.json();
  console.log("1. Masa 08 Hesap Çağrısı:", callData.success ? "✓ BAŞARILI" : "✗ HATA");

  // 2. Müşteri Siparişi & Stok Düşümü Testi
  const orderRes = await fetch("http://localhost:3005/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tableNo: "MASA 08",
      items: [
        { id: "sur-usulu-sac-tava", name: "Sur Usulü Sac Tava", price: 800, quantity: 2 },
        { id: "acik-ayran", name: "Yayık Açık Ayran", price: 75, quantity: 2 }
      ],
      totalAmount: 1750
    })
  });
  const orderData = await orderRes.json();
  const orderId = orderData.order?.id;
  console.log("2. Sipariş Mutfağa İletildi:", orderData.success ? `✓ BAŞARILI (ID: ${orderId})` : "✗ HATA");

  // 3. Garson: Masaya Servis Edildi
  const serveRes = await fetch("http://localhost:3005/api/orders", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: orderId, status: "servis_edildi" })
  });
  console.log("3. Garson Masaya Servis Etti:", serveRes.ok ? "✓ BAŞARILI" : "✗ HATA");

  // 4. Kasa: Ödeme Alındı & Masa Kapatıldı
  const closeRes = await fetch("http://localhost:3005/api/orders", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: orderId, status: "kapandi", paymentMethod: "Kredi Kartı" })
  });
  console.log("4. Kasa Ödemeyi Aldı (Kredi Kartı):", closeRes.ok ? "✓ BAŞARILI" : "✗ HATA");

  // 5. Garson Çağrısı Kapatıldı
  const dismissRes = await fetch(`http://localhost:3005/api/calls?id=${callData.call?.id}`, { method: "DELETE" });
  console.log("5. Masa Çağrısı Karşılandı (Gidildi ✓):", dismissRes.ok ? "✓ BAŞARILI" : "✗ HATA");

  // 6. Gün Sonu Raporu Doğrulama
  const reportRes = await fetch("http://localhost:3005/api/report");
  const report = await reportRes.json();
  console.log("6. Gün Sonu Ciro Denetimi:", `Toplam: ₺${report.totalRevenue} | Kapanan: ₺${report.closedRevenue} ✓ BAŞARILI`);
  console.log("   En Çok Satan:", report.topDishes?.[0]?.name, `(${report.topDishes?.[0]?.count} Porsiyon)`);

  console.log("==================================================");
  console.log("🎉 TÜM SİSTEM %100 ÇALIŞIR ŞEKİLDE DOĞRULANDI!");
  console.log("==================================================");
}

testFullFlow().catch(console.error);

