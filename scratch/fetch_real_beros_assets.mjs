import fs from "fs";
import path from "path";
import https from "https";

function cleanUrl(u) {
  let clean = u.trim();
  const match = clean.match(/https?:\/\/[^\s\)\"\'\]]+/);
  return match ? match[0] : clean;
}

const siteAssets = [
  { 
    file: "public/hero/real-interior.jpg", 
    url: cleanUrl("https://berosrestaurant.com/wp-content/uploads/2026/02/2.jpg") 
  },
  { 
    file: "public/hero/real-facade.jpg", 
    url: cleanUrl("https://berosrestaurant.com/wp-content/uploads/2026/02/3.jpg") 
  },
  { 
    file: "public/hero/real-facade-alt.jpg", 
    url: cleanUrl("https://berosrestaurant.com/wp-content/uploads/2026/02/1.jpg") 
  }
];

function download(item) {
  return new Promise((resolve) => {
    const dest = path.join(process.cwd(), item.file);
    const folder = path.dirname(dest);
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    
    const f = fs.createWriteStream(dest);
    const req = https.get(item.url, { 
      headers: { 
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" 
      } 
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, { headers: { "User-Agent": "Mozilla/5.0" } }, (red) => { 
          red.pipe(f); 
          f.on("finish", () => { f.close(); console.log(`✓ İndirildi (redirect): ${item.file}`); resolve(); }); 
        });
      } else if (res.statusCode === 200) {
        res.pipe(f);
        f.on("finish", () => { f.close(); console.log(`✓ İndirildi: ${item.file}`); resolve(); });
      } else {
        f.close();
        fs.unlink(dest, () => {});
        console.warn(`Hata (${res.statusCode}): ${item.url}`);
        resolve();
      }
    });
    req.on("error", (err) => {
      console.warn(`İstek Hatası (${item.url}): ${err.message}`);
      resolve();
    });
  });
}

async function start() {
  console.log("=== BEROŞ GERÇEK SİTE GÖRSELLERİ İNDİRİLİYOR ===");
  for (const asset of siteAssets) await download(asset);

  // Kullanıcının yüklediği orijinal Aşçı Tabağı ve Mumbar fotoğraflarını bağla
  const dishes = [
    { target: "mumbar.png", candidates: ["unnamed (2).webp", "unnamed (2).jpg", "unnamed.webp"] },
    { target: "asci-tabagi.png", candidates: ["unnamed (1).webp", "unnamed.webp", "unnamed.jpg"] }
  ];
  for (const d of dishes) {
    for (const cand of d.candidates) {
      const src = path.join(process.cwd(), cand);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(process.cwd(), "public/dishes", d.target));
        console.log(`✓ Orijinal yemek bağlandı: ${d.target}`);
        break;
      }
    }
  }
  console.log("=== ASSET ENTEGRASYONU TAMAMLANDI ===");
}
start();
