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
  return NextResponse.json(getDb().inventory || {});
}

export async function POST(req: Request) {
  const { dishId, count, isLocked, isUnlimited } = await req.json();
  const db = getDb();
  db.inventory = db.inventory || {};
  if (!db.inventory[dishId]) {
    db.inventory[dishId] = { count: 50, isUnlimited: false, isLocked: false };
  }
  if (count !== undefined) db.inventory[dishId].count = Math.max(0, count);
  if (isLocked !== undefined) db.inventory[dishId].isLocked = isLocked;
  if (isUnlimited !== undefined) db.inventory[dishId].isUnlimited = isUnlimited;
  saveDb(db);
  return NextResponse.json({ success: true, item: db.inventory[dishId] });
}

