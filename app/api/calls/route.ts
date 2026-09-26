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
  return NextResponse.json(getDb().calls || []);
}

export async function POST(req: Request) {
  const { tableNo, serviceType, reason, paymentMethod, billAmount } = await req.json();
  const db = getDb();
  const call = {
    id: "call_" + Date.now(),
    tableNo: tableNo || "MASA 01",
    serviceType: serviceType || "Garson", // "Garson" | "Hesap"
    reason: reason || (serviceType === "Hesap" ? `Hesap İste (${paymentMethod || 'Belirtilmedi'})` : "Genel Garson Talebi"),
    paymentMethod: paymentMethod || null,
    billAmount: billAmount || 0,
    status: "bekliyor", // "bekliyor" | "yoldayim" | "tamamlandi"
    time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
    timestamp: Date.now()
  };
  db.calls = [call, ...(db.calls || [])].slice(0, 60);
  saveDb(db);
  return NextResponse.json({ success: true, call });
}

export async function PATCH(req: Request) {
  const { id, status } = await req.json();
  const db = getDb();
  db.calls = (db.calls || []).map((c: any) =>
    c.id === id ? { ...c, status: status || c.status } : c
  );
  saveDb(db);
  return NextResponse.json({ success: true });
}

export async function PUT(req: Request) {
  const { id, action, status } = await req.json();
  const targetStatus = action === "complete" ? "tamamlandi" : (status || "tamamlandi");
  const db = getDb();
  db.calls = (db.calls || []).map((c: any) =>
    c.id === id ? { ...c, status: targetStatus } : c
  );
  saveDb(db);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const db = getDb();

  if (!id) {
    db.calls = [
      {
        id: "call_demo_1",
        tableNo: "MASA 12",
        serviceType: "Garson",
        reason: "Masaya Garson İstendi",
        paymentMethod: null,
        billAmount: 0,
        status: "bekliyor",
        time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
        timestamp: Date.now()
      }
    ];
    db.resolvedCalls = [];
    saveDb(db);
    return NextResponse.json({ success: true, message: "Demo çağrıları sıfırlandı." });
  }

  const c = (db.calls || []).find((x: any) => x.id === id);
  if (c) {
    db.resolvedCalls = [
      { ...c, status: "tamamlandi", durationSec: Math.round((Date.now() - c.timestamp) / 1000), resolvedAt: Date.now() },
      ...(db.resolvedCalls || [])
    ].slice(0, 150);
  }
  db.calls = (db.calls || []).filter((x: any) => x.id !== id);
  saveDb(db);
  return NextResponse.json({ success: true });
}
