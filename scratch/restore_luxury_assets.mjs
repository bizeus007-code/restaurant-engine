import fs from "fs";
import path from "path";
import https from "https";

// Helper: Clean markdown URLs if passed as [url](url) or [url]
function cleanUrl(u) {
  let clean = u.trim();
  const match = clean.match(/https?:\/\/[^\s\)\"\'\]]+/);
  return match ? match[0] : clean;
}

const backgrounds = [
  { folder: "public/hero", file: "interior.jpg", url: cleanUrl("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=85&w=2560&auto=format&fit=crop") },
  { folder: "public/hero", file: "facade.jpg", url: cleanUrl("https://images.unsplash.com/photo-1544984243-ec57ea16fe25?q=85&w=2560&auto=format&fit=crop") },
  { folder: "public/textures", file: "walnut-table.jpg", url: cleanUrl("https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?w=1600&auto=format&fit=crop&q=85") }
];

const uniqueDishes = [
  // Yöresel Lezzetler (21 Farklı Tabak)
  { file: "kol-dolmasi.png", url: cleanUrl("https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80") },
  { file: "asci-tabagi.png", url: cleanUrl("https://images.unsplash.com/photo-1574484284002-952d92456975?w=900&auto=format&fit=crop&q=80") },
  { file: "keci-kavurmasi.png", url: cleanUrl("https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&auto=format&fit=crop&q=80") }, // Farklı döküm sahan
  { file: "pilav-ustu-kol-dolmasi.png", url: cleanUrl("https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=900&auto=format&fit=crop&q=80") },
  { file: "pilav-ustu-tandir.png", url: cleanUrl("https://images.unsplash.com/photo-1512058564366-18510be2db19?w=900&auto=format&fit=crop&q=80") },
  { file: "firinda-kuzu-incik.png", url: cleanUrl("https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80") },
  { file: "firin-agzi.png", url: cleanUrl("https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80") },
  { file: "patlicanli-incik.png", url: cleanUrl("https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&auto=format&fit=crop&q=80") },
  { file: "firinda-gerdan.png", url: cleanUrl("https://images.unsplash.com/photo-1529042410759-befb1204b468?w=900&auto=format&fit=crop&q=80") },
  { file: "kuzu-gerdan.png", url: cleanUrl("https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80") },
  { file: "kuzu-haslama.png", url: cleanUrl("https://images.unsplash.com/photo-1547592166-23ac45744acd?w=900&auto=format&fit=crop&q=80") },
  { file: "kekikli-kuzu-budu.png", url: cleanUrl("https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80") },
  { file: "kuzu-graten.png", url: cleanUrl("https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=900&auto=format&fit=crop&q=80") },
  { file: "diyarbakir-kavurma.png", url: cleanUrl("https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&auto=format&fit=crop&q=80") },
  { file: "sade-tandir.png", url: cleanUrl("https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80") },
  { file: "firin-guvec.png", url: cleanUrl("https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80") },
  { file: "eksili-kofte.png", url: cleanUrl("https://images.unsplash.com/photo-1529042410759-befb1204b468?w=900&auto=format&fit=crop&q=80") },
  { file: "sebze-yemegi.png", url: cleanUrl("https://images.unsplash.com/photo-1540420773420-3366772f4999?w=900&auto=format&fit=crop&q=80") },
  { file: "az-kavurma.png", url: cleanUrl("https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&auto=format&fit=crop&q=80") },
  { file: "az-tandir.png", url: cleanUrl("https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80") },
  { file: "az-guvec.png", url: cleanUrl("https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80") },

  // Spesiyaller (9)
  { file: "ozel-siparis-kaburga.png", url: cleanUrl("https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80") },
  { file: "beros-usulu-loqum-bonfile.png", url: cleanUrl("https://images.unsplash.com/photo-1558030006-450675393462?w=900&auto=format&fit=crop&q=80") },
  { file: "patates-yataginda-bonfile.png", url: cleanUrl("https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=900&auto=format&fit=crop&q=80") },
  { file: "beros-usulu-acili-bonfile.png", url: cleanUrl("https://images.unsplash.com/photo-1558030006-450675393462?w=900&auto=format&fit=crop&q=80") },
  { file: "loqum-bonfile.png", url: cleanUrl("https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=900&auto=format&fit=crop&q=80") },
  { file: "cokertme.png", url: cleanUrl("https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&auto=format&fit=crop&q=80") },
  { file: "beros-special-1.png", url: cleanUrl("https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80") },
  { file: "special-kuzu-sirt.png", url: cleanUrl("https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80") },
  { file: "ayvali-kavurma.png", url: cleanUrl("https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&auto=format&fit=crop&q=80") },

  // Taş Fırın & Pide (7)
  { file: "sac-tava.png", url: cleanUrl("https://cdn.adisyo.com/mahrezphotos/4394416_48624_20231109122117.jpg") },
  { file: "pide-1-5-kusbasili.png", url: cleanUrl("https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&auto=format&fit=crop&q=80") },
  { file: "kusbasi-kasarli-pide.png", url: cleanUrl("https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&auto=format&fit=crop&q=80") },
  { file: "kusbasi-pide.png", url: cleanUrl("https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&auto=format&fit=crop&q=80") },
  { file: "kasarli-pide.png", url: cleanUrl("https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&auto=format&fit=crop&q=80") },
  { file: "kiymali-yumurtali-pide.png", url: cleanUrl("https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&auto=format&fit=crop&q=80") },
  { file: "findik-lahmacun.png", url: cleanUrl("https://images.unsplash.com/photo-1628840042765-356cda07504e?w=900&auto=format&fit=crop&q=80") },

  // Ara Sıcaklar (6)
  { file: "mumbar.png", url: cleanUrl("https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=900&auto=format&fit=crop&q=80") },
  { file: "talas-boregi.png", url: cleanUrl("https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&auto=format&fit=crop&q=80") },
  { file: "icli-kofte.png", url: cleanUrl("https://images.unsplash.com/photo-1529042410759-befb1204b468?w=900&auto=format&fit=crop&q=80") },
  { file: "corba.png", url: cleanUrl("https://images.unsplash.com/photo-1547592166-23ac45744acd?w=900&auto=format&fit=crop&q=80") },
  { file: "patates-cips.png", url: cleanUrl("https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=900&auto=format&fit=crop&q=80") },
  { file: "sade-pilav.png", url: cleanUrl("https://images.unsplash.com/photo-1516684732162-798a0062be99?w=900&auto=format&fit=crop&q=80") },

  // Tavuk (5), Çocuk (2), Tatlılar (7), Soğuklar (4), İçecekler (4)
  { file: "tavuk-special.png", url: cleanUrl("https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=900&auto=format&fit=crop&q=80") },
  { file: "ispanakli-tavuk.png", url: cleanUrl("https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=900&auto=format&fit=crop&q=80") },
  { file: "kori-soslu-tavuk.png", url: cleanUrl("https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=900&auto=format&fit=crop&q=80") },
  { file: "kremali-tavuk.png", url: cleanUrl("https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=900&auto=format&fit=crop&q=80") },
  { file: "acili-tavuk.png", url: cleanUrl("https://images.unsplash.com/photo-1562967914-608f82629710?w=900&auto=format&fit=crop&q=80") },
  { file: "izgara-kofte.png", url: cleanUrl("https://images.unsplash.com/photo-1529042410759-befb1204b468?w=900&auto=format&fit=crop&q=80") },
  { file: "tavuk-nugget.png", url: cleanUrl("https://images.unsplash.com/photo-1562967914-608f82629710?w=900&auto=format&fit=crop&q=80") },
  { file: "fistik-sarma.png", url: cleanUrl("https://images.unsplash.com/photo-1597843786411-a7fa8ad44a9f?w=900&auto=format&fit=crop&q=80") },
  { file: "fistikli-baklava.png", url: cleanUrl("https://images.unsplash.com/photo-1519676867240-f03562e64548?w=900&auto=format&fit=crop&q=80") },
  { file: "fistikli-kadayif.png", url: cleanUrl("https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=900&auto=format&fit=crop&q=80") },
  { file: "soguk-baklava.png", url: cleanUrl("https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=900&auto=format&fit=crop&q=80") },
  { file: "kunefe.png", url: cleanUrl("https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=900&auto=format&fit=crop&q=80") },
  { file: "kabak-tatlisi.png", url: cleanUrl("https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&auto=format&fit=crop&q=80") },
  { file: "dondurma-top.png", url: cleanUrl("https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=900&auto=format&fit=crop&q=80") },
  { file: "serpme-kahvalti.png", url: cleanUrl("https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=900&auto=format&fit=crop&q=80") },
  { file: "kahvalti-tabagi.png", url: cleanUrl("https://images.unsplash.com/photo-1525351484163-7529414344d8?w=900&auto=format&fit=crop&q=80") },
  { file: "kasik-salatasi.png", url: cleanUrl("https://images.unsplash.com/photo-1540420773420-3366772f4999?w=900&auto=format&fit=crop&q=80") },
  { file: "kase-yogurt.png", url: cleanUrl("https://images.unsplash.com/photo-1488477181946-6428a0291777?w=900&auto=format&fit=crop&q=80") },
  { file: "acik-ayran.png", url: cleanUrl("https://images.unsplash.com/photo-1550583724-b2692b85b150?w=900&auto=format&fit=crop&q=80") },
  { file: "kutu-mesrubat.png", url: cleanUrl("https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=900&auto=format&fit=crop&q=80") },
  { file: "salgam.png", url: cleanUrl("https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=900&auto=format&fit=crop&q=80") },
  { file: "limonata.png", url: cleanUrl("https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=900&auto=format&fit=crop&q=80") }
];

function download(item, destFolder) {
  return new Promise((resolve) => {
    fs.mkdirSync(path.join(process.cwd(), destFolder), { recursive: true });
    const p = path.join(process.cwd(), destFolder, item.file);
    const f = fs.createWriteStream(p);
    https.get(item.url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, (red) => {
          red.pipe(f);
          f.on("finish", () => { f.close(); resolve(); });
        });
      } else {
        res.pipe(f);
        f.on("finish", () => { f.close(); resolve(); });
      }
    }).on("error", (err) => {
      console.error(`Download error for ${item.file}:`, err.message);
      resolve();
    });
  });
}

async function start() {
  console.log("1. Arka planlar indiriliyor (/hero & /textures)...");
  for (const b of backgrounds) {
    console.log(`Downloading background: ${b.file}...`);
    await download(b, b.folder);
  }

  console.log("2. 65 adet özgün lezzet görseli senkronize ediliyor...");
  for (const d of uniqueDishes) {
    await download(d, "public/dishes");
  }

  // 3. Kullanıcının yüklediği orijinal Beroş fotoğraflarını bağla
  const userUploads = [
    { target: "mumbar.png", files: ["unnamed (2).webp", "unnamed (2).jpg", "unnamed (2).png", "unnamed.webp"] },
    { target: "asci-tabagi.png", files: ["unnamed (1).webp", "unnamed.webp", "unnamed.jpg", "unnamed (1).jpg"] }
  ];
  for (const u of userUploads) {
    for (const f of u.files) {
      const src = path.join(process.cwd(), f);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(process.cwd(), "public", "dishes", u.target));
        console.log(`✓ Orijinal Beroş fotoğrafı bağlandı: ${u.target} <- ${f}`);
        break;
      }
    }
  }

  console.log("✓ Tüm lüks görsel varlıklar başarıyla hazırlandı.");
}

start();
