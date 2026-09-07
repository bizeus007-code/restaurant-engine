import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const file = path.join(process.cwd(), "data", "live_restaurant.json");
const getDb = () => {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return { calls: [], resolvedCalls: [], orders: [], inventory: {} };
  }
};
const saveDb = (d: any) => fs.writeFileSync(file, JSON.stringify(d, null, 2), "utf8");

export async function GET() {
  return NextResponse.json(getDb().orders || []);
}

export async function POST(req: Request) {
  const body = await req.json();
  const db = getDb();
  const items = body.items || [];

  db.inventory = db.inventory || {};
  items.forEach((it: any) => {
    if (db.inventory[it.id] && !db.inventory[it.id].isUnlimited) {
      db.inventory[it.id].count = Math.max(0, (db.inventory[it.id].count || 0) - (it.quantity || 1));
      if (db.inventory[it.id].count === 0) {
        db.inventory[it.id].isLocked = true;
      }
    }
  });

  const order = {
    id: "ord_" + Date.now(),
    tableNo: body.tableNo || "MASA 07",
    items,
    totalAmount: body.totalAmount || 0,
    time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
    timestamp: Date.now(),
    status: "hazirlaniyor", // hazirlaniyor -> servis_edildi -> kapandi
    paymentMethod: null
  };

  db.orders = [order, ...(db.orders || [])].slice(0, 300);
  saveDb(db);
  return NextResponse.json({ success: true, order, inventory: db.inventory });
}

export async function PATCH(req: Request) {
  const { id, status, paymentMethod } = await req.json();
  const db = getDb();
  db.orders = (db.orders || []).map((o: any) => {
    if (o.id === id) {
      return {
        ...o,
        status: status || o.status,
        paymentMethod: paymentMethod !== undefined ? paymentMethod : o.paymentMethod,
        closedAt: status === "kapandi" ? Date.now() : o.closedAt
      };
    }
    return o;
  });
  saveDb(db);
  return NextResponse.json({ success: true });
}
