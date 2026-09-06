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
  return NextResponse.json(store.orders || []);
}

export async function POST(req: Request) {
  const body = await req.json();
  const store = getStore();
  const items = body.items || [];

  store.inventory = store.inventory || {};
  for (const item of items) {
    const dishStock = store.inventory[item.id];
    if (dishStock && !dishStock.isUnlimited) {
      dishStock.count = Math.max(0, (dishStock.count || 0) - (item.quantity || 1));
      if (dishStock.count === 0) {
        dishStock.isLocked = true;
      }
    }
  }

  const newOrder = {
    id: "ord_" + Date.now(),
    tableNo: body.tableNo || "MASA 07",
    items: items,
    totalAmount: body.totalAmount || 0,
    time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
    timestamp: Date.now(),
    status: "hazirlaniyor"
  };

  store.orders = [newOrder, ...(store.orders || [])].slice(0, 100);
  saveStore(store);
  return NextResponse.json({ success: true, order: newOrder, inventory: store.inventory });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const store = getStore();
  store.orders = (store.orders || []).map((ord: any) => {
    if (ord.id === body.id) {
      return { ...ord, status: body.status || "teslim_edildi" };
    }
    return ord;
  });
  saveStore(store);
  return NextResponse.json({ success: true });
}
