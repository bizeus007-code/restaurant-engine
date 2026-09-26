import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CACHE_CONTROL = "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";

const productsFile = path.join(process.cwd(), "src", "data", "loqum-products.json");
const dataProductsFile = path.join(process.cwd(), "data", "loqum-products.json");
const liveFile = path.join(process.cwd(), "data", "live_restaurant.json");

function normalizeTurkish(s: string): string {
  if (!s) return "";
  return s
    .toUpperCase()
    .trim()
    .replace(/İ/g, "I")
    .replace(/Ş/g, "S")
    .replace(/Ğ/g, "G")
    .replace(/Ü/g, "U")
    .replace(/Ö/g, "O")
    .replace(/Ç/g, "C")
    .replace(/[^A-Z0-9]/g, "");
}

// Common aliases for dish name variations
const DISH_ALIASES: Record<string, string[]> = {
  "steak-satoburyan": ["SATOBURYAN", "SATOBURYANIKIKISILIK", "CHATEAUBRIAND"],
  "firin-etler-kuzu-gerdan": ["KUZUGERDAN", "KUZUGERDANKG"],
  "steak-kuzu-kafes": ["KUZUKAFES", "KUZUKAFESIKIKISILIK"],
  "steak-hardal-soslu-loqum": ["HARDALSOSLULOQUM", "LOQUMHARDALSOSLU"],
  "steak-kasap-sucuk-250gr": ["KASAPSUCUK", "KASAPSUCUK250GR", "SUCUKPORS", "SUCUKPORSİYON", "SUCUKPORS."],
  "steak-cheddar-soslu-antrikot": ["CHEDDARSOSLUANTRIKOT", "CHEDARLIANTRIKOT", "CHEDDARLIANTRIKOT"],
  "steak-mantar-soslu-steak": ["MANTARSOSLUSTEAK", "MANTARSOSLULOQUM", "MANTARKREMALISTEAK"],
  "kebaplar-domatesli-kebap": ["DOMATESLIKEBAP", "DOMATESLI"],
  "kebaplar-alti-ezmeli-kebap": ["ALTIEZMELIKEBAP", "ALTIEZMELI"],
  "kebaplar-firinda-kasarli-sarma-beyti": ["FIRINDAKASARLISARMABEYTI", "FIRINDASARMABEYTI", "SARMABEYTIKASARLI"],
  "kebaplar-karisik-karnaval-3-kisilik": ["KARISIKKARNAVAL", "KARISIKKARNAVAL3KISILIK", "KARNAVAL3KISILIK", "KARNAVAL"],
  "kebaplar-cizir-cizir-tavada-kuzu-sirt": ["CIZIRCIZIRTAVADAKUZUSIRT", "CIZIRKUZUSIRT", "TAVADAKUZUSIRT"],
  "tavalar-cheddar-soslu-bonfile-tava": ["CHEDDARSOSLUBONFILETAVA", "CHEDARSOSLUBONFILETAVA"],
  "tavalar-kontrafile-sasa": ["KONTRAFILESASA", "KONTROFILESASA"],
  "loqum-yoresel-pilav-ustu-kuzu-tandir": ["PILAVUSTUKUZUTANDIR", "PILAVUSTUTANDIR"],
  "loqum-yoresel-begendi-incik": ["BEGENDIINCIK", "BEGENDILIINCIK"],
  "kofteler-begendili-izgara-kofte": ["BEGENDILIIZGARAKOFTE", "BEGENDILIIZGARALIKOFTE"],
  "kofteler-yarim-kasap-kofte-3-adet": ["YARIMKASAPKOFTE", "YARIMKASAPKOFTE3ADET"],
  "makarnalar-ve-salatalar-fettuccine-alfredo-etli": ["FETTUCCINEALFREDOETLI", "FETTUCINIALFREDOETLI"],
  "makarnalar-ve-salatalar-fettuccine-alfredo-tavuklu": ["FETTUCCINEALFREDOTAVUKLU", "FETTUCINIALFREDOTAVUKLU"],
  "makarnalar-ve-salatalar-tavuklu-sezar-salata": ["TAVUKLUSEZARSALATA", "TAVUKLUSEZARSALATASI"],
  "makarnalar-ve-salatalar-izgara-hellim-peynirli-salata": ["IZGARAHELLIMPEYNIRLISALATA", "HELLIMPEYNIRLISALATA"],
  "lahmacun-ve-pide-lahmacun-1-adet": ["LAHMACUN", "LAHMACUN1ADET", "LAHMACUNADET"],
  "lahmacun-ve-pide-kusbasi-pide": ["KUSBASIPIDE", "KUSBASILIPIDE"],
  "lahmacun-ve-pide-kasarli-kusbasi-pide": ["KASARLIKUSBASIPIDE", "KUSBASILIKASARLIPIDE"],
  "lahmacun-ve-pide-cevizli-citir-lahmacun": ["CEVIZLICITIRLAHMACUN", "CEVIZLIKARISIKLAHMACUN", "CEVIZLILAHMACUN"],
  "burgerler-loqum-klasik-burger": ["LOQUMKLASIKBURGER", "KLASIKBURGER"],
  "burgerler-loqum-double-burger": ["LOQUMDOUBLEBURGER", "DOUBLEBURGER"],
  "burgerler-enfes-loqum-burger": ["ENFESLOQUMBURGER", "LOQUMBURGER"],
  "burgerler-loqum-cheese-burger": ["LOQUMCHEESEBURGER", "CHESEBURGER", "CHEESEBURGER"],
  "icecekler-karisik-meyve-suyu": ["KARISIKMEYVESUYU", "MEYVESUYU"],
  "icecekler-kapali-ayran": ["KAPALIAYRAN", "KAPALIACIKAYRAN", "ACIKAYRAN"],
  "icecekler-salgam": ["SALGAM", "SALGAMACILI", "ACILISALGAM"],
};

export async function GET() {
  try {
    let products = [];
    if (fs.existsSync(productsFile)) {
      products = JSON.parse(fs.readFileSync(productsFile, "utf8"));
    }
    if (fs.existsSync(liveFile)) {
      try {
        const live = JSON.parse(fs.readFileSync(liveFile, "utf8"));
        const inv = live.inventory || {};
        products = products.map((p: any) => {
          if (inv[p.id] && inv[p.id].price !== undefined) {
            return {
              ...p,
              price: inv[p.id].price,
              stock: inv[p.id].count !== undefined ? inv[p.id].count : p.stock,
              isLocked: inv[p.id].isLocked || false,
            };
          }
          return p;
        });
      } catch {}
    }

    return NextResponse.json(products, {
      headers: { "Cache-Control": CACHE_CONTROL },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: { "Cache-Control": CACHE_CONTROL } }
    );
  }
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    const rawPriceUpdates: Array<{ nameOrId: string; price: number }> = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          { error: "Dosya bulunamadı." },
          { status: 400, headers: { "Cache-Control": CACHE_CONTROL } }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const wb = XLSX.read(buffer, { type: "buffer" });
      const firstSheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<any>(firstSheet);

      for (const row of rows) {
        // Look for column names like 'Ürün İsmi', 'Urun Ismi', 'name', 'Ürün Adı', 'Fiyat', 'Fiyatı', 'price'
        let name =
          row["Ürün İsmi"] ||
          row["Urun Ismi"] ||
          row["Ürün Adı"] ||
          row["Urun Adi"] ||
          row["name"] ||
          row["Name"] ||
          row["Ürün"] ||
          "";
        let price =
          row["Fiyatı"] ||
          row["Fiyati"] ||
          row["Fiyat"] ||
          row["price"] ||
          row["Price"] ||
          null;

        // If generic columns (e.g. col 0 and col 1)
        if (!name || price === null) {
          const keys = Object.keys(row);
          if (keys.length >= 2) {
            for (const k of keys) {
              const val = row[k];
              if (typeof val === "string" && !name) {
                name = val;
              } else if (typeof val === "number" && price === null) {
                price = val;
              }
            }
          }
        }

        if (name && price !== null && !isNaN(Number(price))) {
          rawPriceUpdates.push({
            nameOrId: String(name).trim(),
            price: Number(price),
          });
        }
      }
    } else {
      const body = await req.json();

      // Case 1: Single item { id, price }
      if (body.id && body.price !== undefined) {
        rawPriceUpdates.push({
          nameOrId: body.id,
          price: Number(body.price),
        });
      }
      // Case 2: Array of items { items: [...] } or array directly
      else if (Array.isArray(body.items) || Array.isArray(body)) {
        const list = Array.isArray(body.items) ? body.items : body;
        for (const item of list) {
          const nameOrId = item.id || item.name || item.dishId;
          const price = item.price !== undefined ? item.price : item.fiyat;
          if (nameOrId && price !== undefined && !isNaN(Number(price))) {
            rawPriceUpdates.push({
              nameOrId: String(nameOrId).trim(),
              price: Number(price),
            });
          }
        }
      }
      // Case 3: Bulk text
      else if (body.bulkText || body.text) {
        const text = String(body.bulkText || body.text);
        const lines = text.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          // Delimiters: TAB, colon, semicolon, comma, or whitespace before price
          // Example: "ADANA: 580" or "ADANA\t580" or "ADANA, 580"
          let matched = false;
          const matchTab = trimmed.split("\t");
          if (matchTab.length >= 2) {
            const p = Number(matchTab[matchTab.length - 1].replace(/[^\d.]/g, ""));
            if (!isNaN(p) && p > 0) {
              rawPriceUpdates.push({ nameOrId: matchTab[0].trim(), price: p });
              matched = true;
            }
          }

          if (!matched) {
            const matchColon = trimmed.split(/[:=;]/);
            if (matchColon.length >= 2) {
              const p = Number(matchColon[1].replace(/[^\d.]/g, ""));
              if (!isNaN(p) && p > 0) {
                rawPriceUpdates.push({ nameOrId: matchColon[0].trim(), price: p });
                matched = true;
              }
            }
          }

          if (!matched) {
            // Regex to find trailing price
            const regex = /^(.*?)(?:[\s,]+)(\d+(?:\.\d+)?)\s*(?:TL|₺)?$/i;
            const m = trimmed.match(regex);
            if (m && m[1] && m[2]) {
              rawPriceUpdates.push({
                nameOrId: m[1].trim(),
                price: Number(m[2]),
              });
            }
          }
        }
      }
    }

    if (rawPriceUpdates.length === 0) {
      return NextResponse.json(
        { error: "Geçerli ürün ve fiyat bilgisi bulunamadı." },
        { status: 400, headers: { "Cache-Control": CACHE_CONTROL } }
      );
    }

    // Load DB files
    let productsList: any[] = [];
    if (fs.existsSync(productsFile)) {
      productsList = JSON.parse(fs.readFileSync(productsFile, "utf8"));
    }

    let liveDb: any = { inventory: {} };
    if (fs.existsSync(liveFile)) {
      try {
        liveDb = JSON.parse(fs.readFileSync(liveFile, "utf8"));
        liveDb.inventory = liveDb.inventory || {};
      } catch {}
    }

    // Map existing products for quick lookup
    const idToProduct = new Map<string, any>();
    const normToProduct = new Map<string, any>();

    for (const p of productsList) {
      idToProduct.set(p.id, p);
      normToProduct.set(normalizeTurkish(p.name), p);
      normToProduct.set(normalizeTurkish(p.id), p);
    }

    // Add alias lookups
    for (const [pId, aliases] of Object.entries(DISH_ALIASES)) {
      const prod = idToProduct.get(pId);
      if (prod) {
        for (const alias of aliases) {
          normToProduct.set(normalizeTurkish(alias), prod);
        }
      }
    }

    let updatedCount = 0;
    const updatedItems: Array<{ id: string; name: string; oldPrice: number; newPrice: number }> = [];
    const unmatched: string[] = [];

    for (const update of rawPriceUpdates) {
      let targetProduct: any = null;

      // 1. Exact ID match
      if (idToProduct.has(update.nameOrId)) {
        targetProduct = idToProduct.get(update.nameOrId);
      } else {
        // 2. Normalized name match
        const norm = normalizeTurkish(update.nameOrId);
        if (normToProduct.has(norm)) {
          targetProduct = normToProduct.get(norm);
        } else {
          // 3. Substring match
          for (const [k, p] of normToProduct.entries()) {
            if (k.length > 4 && (k.includes(norm) || norm.includes(k))) {
              targetProduct = p;
              break;
            }
          }
        }
      }

      if (targetProduct) {
        const oldPrice = targetProduct.price || 0;
        const newPrice = Math.round(update.price);
        targetProduct.price = newPrice;

        // Also update live inventory
        if (liveDb.inventory[targetProduct.id]) {
          liveDb.inventory[targetProduct.id].price = newPrice;
        } else {
          liveDb.inventory[targetProduct.id] = {
            id: targetProduct.id,
            name: targetProduct.name,
            categorySlug: targetProduct.categorySlug,
            price: newPrice,
            count: 25,
            criticalThreshold: 5,
            isUnlimited: false,
            isLocked: false,
            gramaj: targetProduct.gramaj || "",
            image: targetProduct.image || "",
            tag: targetProduct.tag || "",
            allergens: targetProduct.allergens || [],
          };
        }

        updatedCount++;
        updatedItems.push({
          id: targetProduct.id,
          name: targetProduct.name,
          oldPrice,
          newPrice,
        });
      } else {
        unmatched.push(update.nameOrId);
      }
    }

    // Persist changes
    fs.writeFileSync(productsFile, JSON.stringify(productsList, null, 2), "utf8");
    if (fs.existsSync(dataProductsFile)) {
      fs.writeFileSync(dataProductsFile, JSON.stringify(productsList, null, 2), "utf8");
    }
    fs.writeFileSync(liveFile, JSON.stringify(liveDb, null, 2), "utf8");

    // Dynamic cache invalidation
    try {
      revalidatePath("/", "layout");
      revalidatePath("/menu");
    } catch (e) {
      console.error("revalidatePath error:", e);
    }

    return NextResponse.json(
      {
        success: true,
        updatedCount,
        unmatchedCount: unmatched.length,
        updatedItems,
        unmatched,
        message: `Toplam ${updatedCount} ürünün fiyatı başarıyla güncellendi ve canlıya alındı.`,
      },
      { headers: { "Cache-Control": CACHE_CONTROL } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: { "Cache-Control": CACHE_CONTROL } }
    );
  }
}
