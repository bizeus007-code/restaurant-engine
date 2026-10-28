import fs from "fs";
import { createClient } from "@supabase/supabase-js";

// 1. .env okuma
const env = {};
for (const f of [".env.local", ".env", ".env.production"]) {
  if (fs.existsSync(f)) {
    for (const line of fs.readFileSync(f, "utf8").split("\n")) {
      const idx = line.indexOf("=");
      if (idx > 0) {
        env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
      }
    }
  }
}

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 2. .backup klasöründeki işletmeci yedeğini bul
const backupFiles = fs.readdirSync(".backup")
  .filter((f) => f.startsWith("supabase-") && f.endsWith(".json"))
  .sort();

if (backupFiles.length === 0) {
  console.log("❌ .backup klasöründe yedek bulunamadı, kontrol ediliyor...");
  process.exit(1);
}

const latestBackupFile = `.backup/${backupFiles[backupFiles.length - 1]}`;
console.log("📂 Bulunan işletmeci yedeği:", latestBackupFile);

const ownerList = JSON.parse(fs.readFileSync(latestBackupFile, "utf8"));
const masterList = JSON.parse(fs.readFileSync("src/data/loqum-products.json", "utf8"));
const masterMap = new Map(masterList.map((m) => [m.id, m]));

// 3. İşletmecinin listesini esas al (Sildikleri geri gelmez, yeni ekledikleri korunur, mevcutların fotoğraf/gramaj/kategorisi tamamlanır)
const mergedList = ownerList.map((item) => {
  const orig = masterMap.get(item.id);
  if (orig) {
    // Orijinal menüde olan bir ürün (fiyat ve isim işletmecinin bıraktığı gibi kalır, silinen görsel/gramaj/kategori/alerjen geri gelir)
    return {
      ...orig,
      ...item,
      name: item.name || orig.name,
      price: Number(item.price) > 0 ? Number(item.price) : Number(orig.price),
      categoryId: Number(item.categoryId) > 0 ? Number(item.categoryId) : Number(orig.categoryId),
      image: item.image && String(item.image).trim() !== "" ? item.image : orig.image,
      gramaj: item.gramaj && String(item.gramaj).trim() !== "" ? item.gramaj : (orig.gramaj || "250 gr"),
      calories: Number(item.calories) > 0 ? Number(item.calories) : Number(orig.calories || 650),
      description: item.description && String(item.description).trim() !== "" ? item.description : (orig.description || ""),
      allergens: Array.isArray(item.allergens) && item.allergens.length > 0 ? item.allergens : (orig.allergens || []),
    };
  } else {
    // İşletmecinin YENİ EKLEDİĞİ ürün (custom-...)
    return {
      ...item,
      name: item.name,
      price: Number(item.price) || 0,
      categoryId: Number(item.categoryId) || 27,
      image: item.image || "/images/menu/steak/loqum.jpg",
      gramaj: item.gramaj || "250 gr",
      calories: Number(item.calories) || 650,
      description: item.description || "Şefin taze seçimi ile sunulur.",
      allergens: Array.isArray(item.allergens) ? item.allergens : [],
      tag: item.tag || "Yeni",
    };
  }
});

const deletedCount = masterList.filter((m) => !ownerList.some((o) => o.id === m.id)).length;
const addedItems = ownerList.filter((o) => !masterMap.has(o.id));

console.log(`📊 Analiz Özeti:`);
console.log(`   - İşletmecinin toplam ürün sayısı: ${mergedList.length}`);
console.log(`   - İşletmecinin sildiği ürün sayısı (menüden kaldırıldı): ${deletedCount}`);
console.log(`   - İşletmecinin yeni eklediği ürün sayısı: ${addedItems.length}`);
if (addedItems.length > 0) {
  console.log(`   - Yeni eklenen ürünler:`, addedItems.map((a) => `${a.name} (₺${a.price})`).join(", "));
}

const { error } = await sb.from("products").upsert({
  id: "main",
  data: mergedList,
  updated_at: new Date().toISOString(),
});

if (error) {
  console.error("❌ Supabase kayıt hatası:", error.message);
  process.exit(1);
}

let page = fs.readFileSync("src/app/page.tsx", "utf8");
page = page.split("2026_10_28_restored_v15").join("2026_10_28_owner_v16");
fs.writeFileSync("src/app/page.tsx", page, "utf8");

console.log("✅ İşletme sahibinin tüm eklediği/sildiği ürünler ve fiyat değişiklikleri fotoğraflarıyla birlikte geri yüklendi!");
