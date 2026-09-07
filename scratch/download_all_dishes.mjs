import fs from "fs";
import path from "path";
import https from "https";

const dishesToDownload = [
  // Yöresel (Fotoğrafsız olanlar)
  { file: "asci-tabagi.png", url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80" },
  { file: "pilav-ustu-kol-dolmasi.png", url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&auto=format&fit=crop&q=80" },
  { file: "pilav-ustu-tandir.png", url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80" },
  { file: "sade-tandir.png", url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80" },
  { file: "keci-kavurmasi.png", url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80" },
  { file: "eksili-kofte.png", url: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=900&auto=format&fit=crop&q=80" },
  { file: "sebze-yemegi.png", url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=900&auto=format&fit=crop&q=80" },
  { file: "az-kavurma.png", url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&auto=format&fit=crop&q=80" },
  { file: "az-guvec.png", url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80" },
  { file: "az-tandir.png", url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80" },

  // Tavuk
  { file: "kremali-tavuk.png", url: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=900&auto=format&fit=crop&q=80" },
  { file: "acili-tavuk.png", url: "https://images.unsplash.com/photo-1562967914-608f82629710?w=900&auto=format&fit=crop&q=80" },

  // Tatlılar
  { file: "fistik-sarma.png", url: "https://images.unsplash.com/photo-1597843786411-a7fa8ad44a9f?w=900&auto=format&fit=crop&q=80" },
  { file: "soguk-baklava.png", url: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=900&auto=format&fit=crop&q=80" },
  { file: "kunefe.png", url: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=900&auto=format&fit=crop&q=80" },
  { file: "kabak-tatlisi.png", url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&auto=format&fit=crop&q=80" },
  { file: "dondurma-top.png", url: "https://images.unsplash.com/photo-1560008511-11c63416e52d?w=900&auto=format&fit=crop&q=80" },

  // Soğuklar & İçecekler
  { file: "serpme-kahvalti.png", url: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=900&auto=format&fit=crop&q=80" },
  { file: "kahvalti-tabagi.png", url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=900&auto=format&fit=crop&q=80" },
  { file: "kasik-salatasi.png", url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=900&auto=format&fit=crop&q=80" },
  { file: "salgam.png", url: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=900&auto=format&fit=crop&q=80" },
  { file: "limonata.png", url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=900&auto=format&fit=crop&q=80" }
];

const targetDir = path.join(process.cwd(), "public", "dishes");
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

function downloadFile(item) {
  return new Promise((resolve) => {
    const filePath = path.join(targetDir, item.file);
    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 1000) {
      console.log(`Zaten var: ${item.file}`);
      return resolve();
    }
    const file = fs.createWriteStream(filePath);
    const getUrl = (url) => {
      https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          getUrl(res.headers.location);
        } else if (res.statusCode === 200) {
          res.pipe(file);
          file.on("finish", () => {
            file.close();
            console.log(`İndirildi: ${item.file}`);
            resolve();
          });
        } else {
          console.error(`Hata (${res.statusCode}): ${item.file}`);
          fs.unlink(filePath, () => {});
          resolve();
        }
      }).on("error", (err) => {
        console.error(`İndirme hatası: ${item.file}`, err.message);
        fs.unlink(filePath, () => {});
        resolve();
      });
    };
    getUrl(item.url);
  });
}

async function run() {
  console.log("=== BEROŞ MENÜ FOTOĞRAFLARI İNDİRİLİYOR ===");
  for (const item of dishesToDownload) {
    await downloadFile(item);
  }
  console.log("=== TÜM GÖRSELLER TAMAMLANDI ===");
}
run();
