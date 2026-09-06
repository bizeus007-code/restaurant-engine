import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "live_restaurant.json");

function getStore() {
  try {
    return JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
  } catch {
    return { calls: [], orders: [], inventory: {} };
  }
}

function saveStore(data: any) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}

export async function GET() {
  const store = getStore();
  return NextResponse.json(store.inventory || {});
}

export async function POST(req: Request) {
  const body = await req.json();
  const store = getStore();
  store.inventory = store.inventory || {};

  const { dishId, count, isUnlimited, isLocked } = body;
  if (dishId) {
    store.inventory[dishId] = {
      count: typeof count === "number" ? Math.max(0, count) : (store.inventory[dishId]?.count ?? 50),
      isUnlimited: typeof isUnlimited === "boolean" ? isUnlimited : (store.inventory[dishId]?.isUnlimited ?? false),
      isLocked: typeof isLocked === "boolean" ? isLocked : (store.inventory[dishId]?.isLocked ?? false)
    };
    saveStore(store);
  }

  return NextResponse.json({ success: true, inventory: store.inventory });
}

