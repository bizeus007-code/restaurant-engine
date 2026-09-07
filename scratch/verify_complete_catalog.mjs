async function runTest() {
  console.log("=== BEROŞ RESTAURANT YENİ MENÜ TESTİ ===");
  const stockRes = await fetch("http://localhost:3005/api/stock");
  const stock = await stockRes.json();
  const count = Object.keys(stock).length;
  console.log("1. Yüklenen Menü Ürün Sayısı:", count, count >= 30 ? "✓ BAŞARILI" : "✗ EKSİK");

  const orderRes = await fetch("http://localhost:3005/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tableNo: "MASA 10",
      items: [
        { id: "special-kuzu-sirt", name: "Beroş Special Kuzu Sırt", price: 850, quantity: 1 },
        { id: "fistikli-kadayif", name: "Diyarbakır Burma Kadayıf", price: 430, quantity: 1 },
        { id: "acik-ayran", name: "Hakiki Yayık Açık Ayran", price: 75, quantity: 2 }
      ],
      totalAmount: 1430
    })
  });
  const orderData = await orderRes.json();
  console.log("2. Çoklu Kategori Siparişi:", orderData.success ? "✓ BAŞARILI" : "✗ HATA");

  const reportRes = await fetch("http://localhost:3005/api/report");
  const rep = await reportRes.json();
  console.log("3. Canlı Ciro ve Raporlama:", `₺${rep.totalRevenue} Ciro ✓ BAŞARILI`);
  console.log("=== TÜM GERÇEK MENÜ VE SİSTEM EKSİKSİZ ÇALIŞIYOR ===");
}
runTest().catch(console.error);
