import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const file = path.join(process.cwd(), "data", "live_restaurant.json");
const getDb = () => {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return { calls: [], resolvedCalls: [], orders: [], inventory: {}, feedbacks: [] };
  }
};
const saveDb = (d: any) => fs.writeFileSync(file, JSON.stringify(d, null, 2), "utf8");

export async function GET() {
  const db = getDb();
  return NextResponse.json(db.feedbacks || []);
}

export async function POST(req: Request) {
  try {
    const { tableNo, rating, comment } = await req.json();
    const db = getDb();
    db.feedbacks = db.feedbacks || [];

    const feedback = {
      id: "fb_" + Date.now(),
      tableNo: tableNo || "MASA 01",
      rating: Number(rating) || 1,
      comment: comment || "Detay belirtilmedi",
      time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      timestamp: Date.now(),
      status: "yeni" // yeni -> incelendi
    };

    db.feedbacks = [feedback, ...db.feedbacks].slice(0, 100);
    saveDb(db);

    return NextResponse.json({ success: true, feedback });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    const db = getDb();
    db.feedbacks = (db.feedbacks || []).map((fb: any) =>
      fb.id === id ? { ...fb, status: status || "incelendi" } : fb
    );
    saveDb(db);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

