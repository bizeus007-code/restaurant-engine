import fs from "fs";
import path from "path";
import https from "https";

// Beroş gerçek menüsüne uygun lezzet görsel haritası
const realDishes = [
  // Yöresel Lezzetler (Kavurma, Güveç, Haşlama, Kol Dolması vb.)
  { file: "kol-dolmasi.png", url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80" },
  { file: "diyarbakir-kavurma.png", url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&auto=format&fit=crop&q=80" }, // Döküm tavada et kavurma
  { file: "firin-guvec.png", url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80" },
  { file: "kuzu-haslama.png", url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=900&auto=format&fit=crop&q=80" },
  { file: "mumbar.png", url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80" },
  { file: "sac-tava.png", url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&auto=format&fit=crop&q=80" },
  { file: "kasarli-pide.png", url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&auto=format&fit=crop&q=80" },
  { file: "kusbasi-kasarli-pide.png", url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&auto=format&fit=crop&q=80" },
  { file: "findik-lahmacun.png", url: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=900&auto=format&fit=crop&q=80" },
  { file: "fistikli-kadayif.png", url: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=900&auto=format&fit=crop&q=80" },
  { file: "fistikli-baklava.png", url: "https://images.unsplash.com/photo-1519676867240-f03562e64548?w=900&auto=format&fit=crop&q=80" },
  { file: "acik-ayran.png", url: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=900&auto=format&fit=crop&q=80" },
  { file: "walnut-table.jpg", url: "https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?w=1600&auto=format&fit=crop&q=85" }
];

const targetDir = path.join(process.cwd(), "public", "dishes");
const textDir = path.join(process.cwd(), "public", "textures");
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
if (!fs.existsSync(textDir)) fs.mkdirSync(textDir, { recursive: true });

function download(item) {
  return new Promise((resolve) => {
    const dest = item.file.endsWith(".jpg") ? path.join(textDir, item.file) : path.join(targetDir, item.file);
    const f = fs.createWriteStream(dest);
    function get(u, count = 0) {
      if (count > 5) {
        f.close();
        return resolve();
      }
      https.get(u, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          get(res.headers.location, count + 1);
        } else if (res.statusCode === 200) {
          res.pipe(f);
          f.on("finish", () => { f.close(); resolve(); });
        } else {
          f.close();
          resolve();
        }
      }).on("error", () => { f.close(); resolve(); });
    }
    get(item.url);
  });
}

async function run() {
  for (const item of realDishes) await download(item);
  console.log("Fotoğraflar güncellendi.");
}
run();
