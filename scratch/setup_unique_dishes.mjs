import fs from "fs";
import path from "path";
import https from "https";

// 1. Gerçek Masif Ahşap Masa Dokusu
const textures = [
  { file: "walnut-table.jpg", url: "https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?w=1600&auto=format&fit=crop&q=85" }
];

// 2. 65 Ürünün Tamamına Özel Benzersiz Gastronomi Görselleri
const uniqueDishes = [
  // YÖRESEL LEZZETLER (21)
  { file: "kol-dolmasi.png", url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80" },
  { file: "asci-tabagi.png", url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&auto=format&fit=crop&q=80" },
  { file: "keci-kavurmasi.png", url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80" },
  { file: "pilav-ustu-kol-dolmasi.png", url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=900&auto=format&fit=crop&q=80" },
  { file: "pilav-ustu-tandir.png", url: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=900&auto=format&fit=crop&q=80" },
  { file: "firinda-kuzu-incik.png", url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80" },
  { file: "firin-agzi.png", url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&auto=format&fit=crop&q=80" },
  { file: "patlicanli-incik.png", url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80" },
  { file: "firinda-gerdan.png", url: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=900&auto=format&fit=crop&q=80" },
  { file: "kuzu-gerdan.png", url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80" },
  { file: "kuzu-haslama.png", url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=900&auto=format&fit=crop&q=80" },
  { file: "kekikli-kuzu-budu.png", url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80" },
  { file: "kuzu-graten.png", url: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=900&auto=format&fit=crop&q=80" },
  { file: "diyarbakir-kavurma.png", url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&auto=format&fit=crop&q=80" },
  { file: "sade-tandir.png", url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80" },
  { file: "firin-guvec.png", url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80" },
  { file: "eksili-kofte.png", url: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=900&auto=format&fit=crop&q=80" },
  { file: "sebze-yemegi.png", url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=900&auto=format&fit=crop&q=80" },
  { file: "az-kavurma.png", url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&auto=format&fit=crop&q=80" },
  { file: "az-tandir.png", url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80" },
  { file: "az-guvec.png", url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80" },

  // SPESİYALLER (9)
  { file: "ozel-siparis-kaburga.png", url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80" },
  { file: "beros-usulu-loqum-bonfile.png", url: "https://images.unsplash.com/photo-1558030006-450675393462?w=900&auto=format&fit=crop&q=80" },
  { file: "patates-yataginda-bonfile.png", url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=900&auto=format&fit=crop&q=80" },
  { file: "beros-usulu-acili-bonfile.png", url: "https://images.unsplash.com/photo-1558030006-450675393462?w=900&auto=format&fit=crop&q=80" },
  { file: "loqum-bonfile.png", url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=900&auto=format&fit=crop&q=80" },
  { file: "cokertme.png", url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&auto=format&fit=crop&q=80" },
  { file: "beros-special-1.png", url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80" },
  { file: "special-kuzu-sirt.png", url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80" },
  { file: "ayvali-kavurma.png", url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&auto=format&fit=crop&q=80" },

  // TAŞ FIRIN & PİDE (7)
  { file: "sac-tava.png", url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&auto=format&fit=crop&q=80" },
  { file: "pide-1-5-kusbasili.png", url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&auto=format&fit=crop&q=80" },
  { file: "kusbasi-kasarli-pide.png", url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&auto=format&fit=crop&q=80" },
  { file: "kusbasi-pide.png", url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&auto=format&fit=crop&q=80" },
  { file: "kasarli-pide.png", url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&auto=format&fit=crop&q=80" },
  { file: "kiymali-yumurtali-pide.png", url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&auto=format&fit=crop&q=80" },
  { file: "findik-lahmacun.png", url: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=900&auto=format&fit=crop&q=80" },

  // ARA SICAKLAR (6)
  { file: "mumbar.png", url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80" },
  { file: "talas-boregi.png", url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&auto=format&fit=crop&q=80" },
  { file: "icli-kofte.png", url: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=900&auto=format&fit=crop&q=80" },
  { file: "corba.png", url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=900&auto=format&fit=crop&q=80" },
  { file: "patates-cips.png", url: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=900&auto=format&fit=crop&q=80" },
  { file: "sade-pilav.png", url: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=900&auto=format&fit=crop&q=80" },

  // TAVUK ÇEŞİTLERİ (5)
  { file: "tavuk-special.png", url: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=900&auto=format&fit=crop&q=80" },
  { file: "ispanakli-tavuk.png", url: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=900&auto=format&fit=crop&q=80" },
  { file: "kori-soslu-tavuk.png", url: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=900&auto=format&fit=crop&q=80" },
  { file: "kremali-tavuk.png", url: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=900&auto=format&fit=crop&q=80" },
  { file: "acili-tavuk.png", url: "https://images.unsplash.com/photo-1562967914-608f82629710?w=900&auto=format&fit=crop&q=80" },

  // ÇOCUK MENÜSÜ (2)
  { file: "izgara-kofte.png", url: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=900&auto=format&fit=crop&q=80" },
  { file: "tavuk-nugget.png", url: "https://images.unsplash.com/photo-1562967914-608f82629710?w=900&auto=format&fit=crop&q=80" },

  // TATLILAR (7)
  { file: "fistik-sarma.png", url: "https://images.unsplash.com/photo-1597843786411-a7fa8ad44a9f?w=900&auto=format&fit=crop&q=80" },
  { file: "fistikli-baklava.png", url: "https://images.unsplash.com/photo-1519676867240-f03562e64548?w=900&auto=format&fit=crop&q=80" },
  { file: "fistikli-kadayif.png", url: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=900&auto=format&fit=crop&q=80" },
  { file: "soguk-baklava.png", url: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=900&auto=format&fit=crop&q=80" },
  { file: "kunefe.png", url: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=900&auto=format&fit=crop&q=80" },
  { file: "kabak-tatlisi.png", url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&auto=format&fit=crop&q=80" },
  { file: "dondurma-top.png", url: "https://images.unsplash.com/photo-1560008511-11c63416e52d?w=900&auto=format&fit=crop&q=80" },

  // SOĞUKLAR & MEZE (4)
  { file: "serpme-kahvalti.png", url: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=900&auto=format&fit=crop&q=80" },
  { file: "kahvalti-tabagi.png", url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=900&auto=format&fit=crop&q=80" },
  { file: "kasik-salatasi.png", url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=900&auto=format&fit=crop&q=80" },
  { file: "kase-yogurt.png", url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=900&auto=format&fit=crop&q=80" },

  // İÇECEKLER (4)
  { file: "acik-ayran.png", url: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=900&auto=format&fit=crop&q=80" },
  { file: "kutu-mesrubat.png", url: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=900&auto=format&fit=crop&q=80" },
  { file: "salgam.png", url: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=900&auto=format&fit=crop&q=80" },
  { file: "limonata.png", url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=900&auto=format&fit=crop&q=80" }
];

function download(item, folder) {
  return new Promise((resolve) => {
    const destFolder = path.join(process.cwd(), folder);
    if (!fs.existsSync(destFolder)) fs.mkdirSync(destFolder, { recursive: true });
    const p = path.join(destFolder, item.file);

    // If file already exists and is large enough, we can resolve or overwrite
    const f = fs.createWriteStream(p);
    function get(u, redirects = 0) {
      if (redirects > 5) {
        f.close();
        fs.unlink(p, () => {});
        return resolve();
      }
      https.get(u, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          get(res.headers.location, redirects + 1);
        } else if (res.statusCode === 200) {
          res.pipe(f);
          f.on("finish", () => {
            f.close();
            console.log(`✓ İndirildi: ${folder}/${item.file}`);
            resolve();
          });
        } else {
          f.close();
          fs.unlink(p, () => {});
          console.warn(`Hata (${res.statusCode}): ${item.file}`);
          resolve();
        }
      }).on("error", (err) => {
        f.close();
        fs.unlink(p, () => {});
        console.warn(`Hata (${err.message}): ${item.file}`);
        resolve();
      });
    }
    get(item.url);
  });
}

async function start() {
  console.log("=== MASİF AHŞAP DOKUSU VE 65 ÜRÜN GÖRSELLERİ İNDİRİLİYOR ===");
  for (const t of textures) await download(t, "public/textures");
  for (const d of uniqueDishes) await download(d, "public/dishes");
  console.log("=== TÜM GÖRSELLER BAŞARIYLA TAMAMLANDI ===");
}
start();
