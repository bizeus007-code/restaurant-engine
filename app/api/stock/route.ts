import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import loqumProducts from "@/src/data/loqum-products.json";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CACHE_CONTROL = "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";

const liveFile = path.join(process.cwd(), "data", "live_restaurant.json");
const productsFile = path.join(process.cwd(), "src", "data", "loqum-products.json");
const dataProductsFile = path.join(process.cwd(), "data", "loqum-products.json");

const getDb = () => {
  try {
    return JSON.parse(fs.readFileSync(liveFile, "utf8"));
  } catch {
    return { calls: [], resolvedCalls: [], orders: [], inventory: {}, feedbacks: [] };
  }
};
const saveDb = (d: any) => fs.writeFileSync(liveFile, JSON.stringify(d, null, 2), "utf8");

export async function GET() {
  const db = getDb();
  db.inventory = db.inventory || {};

  let changed = false;
  // Initialize inventory for all products from loqum-products.json
  (loqumProducts as any[]).forEach((prod) => {
    if (!db.inventory[prod.id]) {
      db.inventory[prod.id] = {
        id: prod.id,
        name: prod.name,
        categorySlug: prod.categorySlug,
        price: prod.price,
        count: prod.stock !== undefined ? prod.stock : 25,
        criticalThreshold: 5,
        isUnlimited: false,
        isLocked: false,
        gramaj: prod.gramaj,
        image: prod.image,
        tag: prod.tag,
        allergens: prod.allergens || []
      };
      changed = true;
    } else {
      // Sync metadata
      db.inventory[prod.id].id = prod.id;
      db.inventory[prod.id].name = prod.name;
      db.inventory[prod.id].categorySlug = prod.categorySlug;
      if (db.inventory[prod.id].price === undefined) {
        db.inventory[prod.id].price = prod.price;
        changed = true;
      }
      db.inventory[prod.id].gramaj = prod.gramaj;
      db.inventory[prod.id].image = prod.image;
      db.inventory[prod.id].tag = prod.tag;
      if (prod.allergens) {
        db.inventory[prod.id].allergens = prod.allergens;
      }
    }
  });

  if (changed) {
    saveDb(db);
  }

  return NextResponse.json(db.inventory, {
    headers: { "Cache-Control": CACHE_CONTROL },
  });
}

export async function POST(req: Request) {
  try {
    const { dishId, count, isLocked, isUnlimited, price } = await req.json();
    const db = getDb();
    db.inventory = db.inventory || {};

    if (!db.inventory[dishId]) {
      const prod = (loqumProducts as any[]).find((p) => p.id === dishId);
      db.inventory[dishId] = {
        id: dishId,
        name: prod ? prod.name : dishId,
        categorySlug: prod ? prod.categorySlug : "diger",
        price: prod ? prod.price : 0,
        count: 25,
        criticalThreshold: 5,
        isUnlimited: false,
        isLocked: false,
        gramaj: prod ? prod.gramaj : "",
        image: prod ? prod.image : "",
        allergens: prod ? prod.allergens : []
      };
    }

    if (count !== undefined) db.inventory[dishId].count = Math.max(0, count);
    if (isLocked !== undefined) db.inventory[dishId].isLocked = isLocked;
    if (isUnlimited !== undefined) db.inventory[dishId].isUnlimited = isUnlimited;
    if (price !== undefined) {
      const numericPrice = Number(price);
      db.inventory[dishId].price = numericPrice;
      try {
        if (fs.existsSync(productsFile)) {
          const raw = JSON.parse(fs.readFileSync(productsFile, "utf8"));
          const updated = raw.map((p: any) => p.id === dishId ? { ...p, price: numericPrice } : p);
          fs.writeFileSync(productsFile, JSON.stringify(updated, null, 2), "utf8");
        }
        if (fs.existsSync(dataProductsFile)) {
          const raw = JSON.parse(fs.readFileSync(dataProductsFile, "utf8"));
          const updated = raw.map((p: any) => p.id === dishId ? { ...p, price: numericPrice } : p);
          fs.writeFileSync(dataProductsFile, JSON.stringify(updated, null, 2), "utf8");
        }
      } catch (e) {
        console.error("Failed to sync price to loqum-products.json:", e);
      }
    }

    saveDb(db);

    try {
      revalidatePath("/", "layout");
      revalidatePath("/menu");
    } catch (e) {
      console.error("revalidatePath error in POST /api/stock:", e);
    }

    return NextResponse.json(
      { success: true, item: db.inventory[dishId] },
      { headers: { "Cache-Control": CACHE_CONTROL } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: { "Cache-Control": CACHE_CONTROL } }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dishId = searchParams.get("id");
    if (!dishId) {
      return NextResponse.json(
        { error: "Missing dish id" },
        { status: 400, headers: { "Cache-Control": CACHE_CONTROL } }
      );
    }

    const db = getDb();
    if (db.inventory && db.inventory[dishId]) {
      delete db.inventory[dishId];
      saveDb(db);
    }

    try {
      if (fs.existsSync(productsFile)) {
        const raw = JSON.parse(fs.readFileSync(productsFile, "utf8"));
        const updated = raw.filter((p: any) => p.id !== dishId);
        fs.writeFileSync(productsFile, JSON.stringify(updated, null, 2), "utf8");
      }
      if (fs.existsSync(dataProductsFile)) {
        const raw = JSON.parse(fs.readFileSync(dataProductsFile, "utf8"));
        const updated = raw.filter((p: any) => p.id !== dishId);
        fs.writeFileSync(dataProductsFile, JSON.stringify(updated, null, 2), "utf8");
      }
    } catch (e) {
      console.error("Failed to delete product from products JSON:", e);
    }

    try {
      revalidatePath("/", "layout");
      revalidatePath("/menu");
    } catch (e) {
      console.error("revalidatePath error in DELETE /api/stock:", e);
    }

    return NextResponse.json(
      { success: true, deletedId: dishId },
      { headers: { "Cache-Control": CACHE_CONTROL } }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: 500, headers: { "Cache-Control": CACHE_CONTROL } }
    );
  }
}
