import fs from "fs";
import path from "path";
import https from "https";
import crypto from "crypto";

const rawData = JSON.parse(fs.readFileSync("scratch/qrall-menu.json", "utf8"));
const publicMenuDir = path.join(process.cwd(), "public", "menu");

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function cleanName(name) {
  return name.trim().replace(/\s+/g, " ");
}

const CATEGORY_SLUG_MAP = {
  "3a17ab56-767d-dd5b-9c1a-afed6010a898": { slug: "yoresel", label: "Yöresel", order: 1 },
  "3a17ab56-73da-c207-9d3d-a5460566b81f": { slug: "spesiyaller", label: "Spesiyaller", order: 2 },
  "3a17ab56-7f90-9564-8911-13104a58c1f0": { slug: "firin-urunleri", label: "Fırın & Pide", order: 3 },
  "3a17ab56-8099-073e-cab3-882f45b9c163": { slug: "sac-tava", label: "Sac Tava", order: 4 },
  "3a17ab56-75f5-4d43-80d8-c739ab670a88": { slug: "tavuk", label: "Tavuk Çeşitleri", order: 5 },
  "3a17ab56-71f8-49d1-a101-270a35cc36be": { slug: "ara-sicaklar", label: "Ara Sıcaklar", order: 6 },
  "3a17ab56-7bb1-2ae0-3f01-c8c3cf4675a8": { slug: "tatlilar", label: "Tatlılar", order: 7 },
  "3a17ab56-7b93-a5d9-9872-38b8e0b27f56": { slug: "soguklar", label: "Soğuklar & Meze", order: 8 },
  "3a17ab56-7ed2-9468-f168-72d1fb93fffe": { slug: "cocuk-menusu", label: "Çocuk Menüsü", order: 9 },
  "3a17ab56-7a19-b6d6-1d14-5a1e6eb31f69": { slug: "soguk-icecekler", label: "Soğuk İçecekler", order: 10 },
  "3a17ab56-7cfd-c3f2-0334-677b565d5cca": { slug: "sicak-icecekler", label: "Sıcak İçecekler", order: 11 }
};

function downloadImage(url, destPath) {
  return new Promise((resolve) => {
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 5000) {
      const fileBuffer = fs.readFileSync(destPath);
      const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
      return resolve({ ok: true, hash, cached: true });
    }

    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const file = fs.createWriteStream(destPath);
    const req = https.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
      }
    }, (res) => {
      if (res.statusCode === 200) {
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          const fileBuffer = fs.readFileSync(destPath);
          const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
          resolve({ ok: true, hash, cached: false });
        });
      } else {
        file.close();
        fs.unlink(destPath, () => {});
        resolve({ ok: false, error: `HTTP ${res.statusCode}` });
      }
    });

    req.on("error", (err) => {
      file.close();
      fs.unlink(destPath, () => {});
      resolve({ ok: false, error: err.message });
    });
  });
}

async function run() {
  console.log("=== BEROŞ RESTAURANT ASSET PIPELINE BAŞLATILIYOR ===");

  const processedProducts = [];
  const processedCategories = [];
  const urlToHash = new Map();
  const hashToProducts = new Map();

  let downloadedCount = 0;
  let cachedCount = 0;
  let missingCount = 0;
  let errorCount = 0;

  // Process categories in defined order
  const sortedCategories = [...rawData.categories].sort((a, b) => {
    const orderA = CATEGORY_SLUG_MAP[a.id]?.order ?? 99;
    const orderB = CATEGORY_SLUG_MAP[b.id]?.order ?? 99;
    return orderA - orderB;
  });

  for (const cat of sortedCategories) {
    const meta = CATEGORY_SLUG_MAP[cat.id] || {
      slug: slugify(cat.name),
      label: cleanName(cat.name),
      order: 99
    };

    processedCategories.push({
      id: cat.id,
      slug: meta.slug,
      name: cleanName(cat.name),
      label: meta.label,
      productCount: cat.products.length
    });

    console.log(`\n📁 Kategori: ${cleanName(cat.name)} (${cat.products.length} ürün)`);

    for (const prod of cat.products) {
      const name = cleanName(prod.name);
      const productSlug = slugify(name);
      const hasSourceImage = Boolean(prod.image && prod.image.trim() !== "");

      let localImage = null;
      let imageHash = null;
      let imageStatus = "missing";

      if (hasSourceImage) {
        const destFileName = `${productSlug}.jpg`;
        const localRelPath = `/menu/${meta.slug}/${destFileName}`;
        const destFullPath = path.join(publicMenuDir, meta.slug, destFileName);

        const res = await downloadImage(prod.image, destFullPath);
        if (res.ok) {
          localImage = localRelPath;
          imageHash = res.hash;
          imageStatus = "verified";

          if (res.cached) cachedCount++;
          else {
            downloadedCount++;
            console.log(`  ✓ İndirildi: ${name} -> ${localRelPath} (${fs.statSync(destFullPath).size} bytes)`);
          }

          // Track hashes for duplicate detection
          if (!hashToProducts.has(res.hash)) {
            hashToProducts.set(res.hash, []);
          }
          hashToProducts.get(res.hash).push({ id: prod.id, name, url: prod.image });
        } else {
          imageStatus = "error";
          errorCount++;
          console.warn(`  ✗ İndirme Hatası: ${name} (${res.error})`);
        }
      } else {
        missingCount++;
      }

      processedProducts.push({
        id: prod.id,
        sourceProductId: prod.id,
        categoryId: cat.id,
        category: cleanName(cat.name),
        categorySlug: meta.slug,
        name,
        description: prod.description ? prod.description.trim() : "",
        price: prod.price || 0,
        currency: prod.currency || "TRY",
        sourceImageUrl: hasSourceImage ? prod.image : null,
        localImage,
        imageHash,
        imageStatus,
        isStockAvailable: prod.isStockAvailable !== false,
        sourceDuplicate: false // will be evaluated next
      });
    }
  }

  // Detect genuine sourceDuplicates (where source API deliberately points to the same photo)
  for (const [hash, prods] of hashToProducts.entries()) {
    if (prods.length > 1) {
      console.log(`\nℹ️ Kaynak Sistemde Aynı Görseli Kullanan Ürünler (Hash: ${hash.slice(0, 8)}...):`);
      prods.forEach(p => console.log(`   - [${p.id}] ${p.name}`));
      prods.forEach(p => {
        const target = processedProducts.find(x => x.id === p.id);
        if (target) target.sourceDuplicate = true;
      });
    }
  }

  // Save menu-manifest.json
  const manifest = {
    generatedAt: new Date().toISOString(),
    totalCategories: processedCategories.length,
    totalProducts: processedProducts.length,
    productsWithImage: downloadedCount + cachedCount,
    productsMissingImage: missingCount,
    downloadErrors: errorCount,
    categories: processedCategories,
    products: processedProducts
  };

  fs.writeFileSync("src/data/menu-manifest.json", JSON.stringify(manifest, null, 2), "utf8");
  console.log("\n✓ src/data/menu-manifest.json kaydedildi.");

  // Generate src/data/menu-data.ts
  const tsContent = `// Beroş Restaurant — Doğrulanmış Resmi Menü Kataloğu (SSOT)
// Kaynak: view.qrall.co / viewapi.qrall.co Telemetrisi
// Üretilme Tarihi: ${new Date().toISOString()}

export interface MenuCategory {
  id: string;
  slug: string;
  name: string;
  label: string;
  productCount: number;
}

export interface MenuItem {
  id: string;
  sourceProductId: string;
  categoryId: string;
  category: string;
  categorySlug: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  sourceImageUrl: string | null;
  localImage: string | null;
  imageHash: string | null;
  imageStatus: "verified" | "missing" | "error";
  isStockAvailable: boolean;
  sourceDuplicate?: boolean;
}

export const MENU_CATEGORIES: MenuCategory[] = ${JSON.stringify(processedCategories, null, 2)};

export const MENU_ITEMS: MenuItem[] = ${JSON.stringify(processedProducts, null, 2)};

export const RESTAURANT_METADATA = {
  name: "Beroş Restaurant",
  tagline: "Mezopotamya'nın Binlerce Yıllık Lezzet Mirası",
  subtitle: "Sur'un ateşinden asırlık konağın sofrasına.",
  address: "Camii Nebi Mah. İnönü Cad. No: 12 Sur / Diyarbakır",
  phone: "05386976353",
  phoneFormatted: "0538 697 63 53",
  whatsappNumber: "905386976353",
  googleMapsReviewUrl: "https://share.google/2P0mhAwLo4XOEs0uQ",
  instagramUrl: "https://instagram.com/berosrestoran",
  mapsDirectionUrl: "https://maps.google.com/?q=Bero%C5%9F+Restaurant+Sur+Diyarbak%C4%B1r",
  wifiName: "Beros_Misafir",
  wifiPass: "beros1982"
};
`;

  fs.writeFileSync("src/data/menu-data.ts", tsContent, "utf8");
  console.log("✓ src/data/menu-data.ts oluşturuldu.");

  console.log("\n==================================================");
  console.log("🎉 ASSET PIPELINE BAŞARIYLA TAMAMLANDI");
  console.log(`Toplam Kategori: ${processedCategories.length}`);
  console.log(`Toplam Ürün: ${processedProducts.length}`);
  console.log(`Doğrulanmış Resmi Fotoğraflar: ${downloadedCount + cachedCount}`);
  console.log(`Fotoğrafı Olmayan (Missing): ${missingCount}`);
  console.log("==================================================");
}

run().catch(console.error);
