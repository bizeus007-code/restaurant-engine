import fs from "fs";
import path from "path";
import crypto from "crypto";

const manifestPath = path.join(process.cwd(), "src", "data", "menu-manifest.json");
if (!fs.existsSync(manifestPath)) {
  console.error("HATA: menu-manifest.json bulunamadı. Önce asset pipeline çalıştırılmalı.");
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const { totalCategories, totalProducts, categories, products } = manifest;

console.log("==================================================");
console.log("🔍 BEROŞ RESTAURANT MENÜ & ASSET DOĞRULAMA RAPORU");
console.log("==================================================");

let missingIdCount = 0;
let duplicateIdCount = 0;
let brokenImageCount = 0;
let missingImageCount = 0;
let verifiedImageCount = 0;

const idSet = new Set();
const hashMap = new Map();

products.forEach((p) => {
  // 1. ID Kontrolü
  if (!p.id || p.id.trim() === "") {
    missingIdCount++;
    console.error(`❌ Eksik ID: "${p.name}"`);
  } else if (idSet.has(p.id)) {
    duplicateIdCount++;
    console.error(`❌ Mükerrer ID: ${p.id} ("${p.name}")`);
  } else {
    idSet.add(p.id);
  }

  // 2. Görsel Durumu Kontrolü
  if (p.imageStatus === "verified") {
    verifiedImageCount++;
    if (!p.localImage) {
      brokenImageCount++;
      console.error(`❌ verified ama localImage boş: "${p.name}"`);
    } else {
      const fullPath = path.join(process.cwd(), "public", p.localImage.replace(/^\//, ""));
      if (!fs.existsSync(fullPath)) {
        brokenImageCount++;
        console.error(`❌ Dosya eksik (Broken): ${fullPath} ("${p.name}")`);
      } else {
        const buf = fs.readFileSync(fullPath);
        const calcHash = crypto.createHash("sha256").update(buf).digest("hex");
        if (!hashMap.has(calcHash)) {
          hashMap.set(calcHash, []);
        }
        hashMap.get(calcHash).push(p);
      }
    }
  } else {
    missingImageCount++;
  }
});

// 3. Hash Analizi (Kaynak Sistemi Mükerrerliği vs Kazara Mükerrerlik)
let accidentalDuplicates = 0;
let sourceDuplicates = 0;

for (const [h, prods] of hashMap.entries()) {
  if (prods.length > 1) {
    const isSourceDup = prods.every((x) => x.sourceDuplicate);
    if (isSourceDup) {
      sourceDuplicates += prods.length;
    } else {
      accidentalDuplicates += prods.length;
      console.warn(`⚠️ Kazara Mükerrer Görsel Uyarısı (Hash: ${h.slice(0, 8)}...):`, prods.map(p => p.name));
    }
  }
}

// 4. Yetim Dosya (Orphan Asset) Kontrolü
const publicMenuDir = path.join(process.cwd(), "public", "menu");
let orphanFiles = 0;
if (fs.existsSync(publicMenuDir)) {
  const catDirs = fs.readdirSync(publicMenuDir);
  for (const c of catDirs) {
    const cPath = path.join(publicMenuDir, c);
    if (fs.statSync(cPath).isDirectory()) {
      const files = fs.readdirSync(cPath);
      for (const f of files) {
        const rel = `/menu/${c}/${f}`;
        const used = products.some((p) => p.localImage === rel);
        if (!used) {
          orphanFiles++;
          console.warn(`⚠️ Yetim dosya (Katalogda kullanılmıyor): ${rel}`);
        }
      }
    }
  }
}

console.log("\n--------------------------------------------------");
console.log("📊 KATALOG METRİKLERİ");
console.log("--------------------------------------------------");
console.log(`TOTAL CATEGORIES:           ${totalCategories}`);
console.log(`TOTAL PRODUCTS:             ${totalProducts}`);
console.log(`PRODUCTS WITH IMAGE:        ${verifiedImageCount}`);
console.log(`PRODUCTS WITHOUT IMAGE:     ${missingImageCount}`);
console.log(`BROKEN IMAGE URLS:          ${brokenImageCount}`);
console.log(`SOURCE DUPLICATE IMAGES:    ${sourceDuplicates}`);
console.log(`ACCIDENTAL DUPLICATE IMAGES:${accidentalDuplicates}`);
console.log(`UNUSED (ORPHAN) IMAGES:     ${orphanFiles}`);
console.log("--------------------------------------------------");

if (missingIdCount === 0 && duplicateIdCount === 0 && brokenImageCount === 0 && accidentalDuplicates === 0) {
  console.log("✅ TÜM VERİ VE GÖRSEL MAPPING TESTLERİ BAŞARIYLA GEÇTİ!");
} else {
  console.error("❌ DOĞRULAMA HATALARI MEVCUT!");
  process.exit(1);
}
