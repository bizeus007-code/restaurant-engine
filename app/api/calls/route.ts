import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "live_restaurant.json");

function getStore() {
  try {
    return JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
  } catch {
    return { calls: [], resolvedCalls: [], orders: [], inventory: {} };
  }
}

function saveStore(data: any) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}

export async function GET() {
  const store = getStore();
  return NextResponse.json(store.calls || []);
}

export async function POST(req: Request) {
  const body = await req.json();
  const store = getStore();
  const newCall = {
    id: "call_" + Date.now(),
    tableNo: body.tableNo || "MASA 07",
    serviceType: body.serviceType || "Garson",
    time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
    timestamp: Date.now(),
  };
  store.calls = [newCall, ...(store.calls || [])].slice(0, 50);
  saveStore(store);
  return NextResponse.json({ success: true, call: newCall });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const store = getStore();
  if (id) {
    const callToResolve = (store.calls || []).find((c: any) => c.id === id);
    if (callToResolve) {
      const responseDurationSec = Math.round((Date.now() - (callToResolve.timestamp || Date.now())) / 1000);
      store.resolvedCalls = [
        { ...callToResolve, durationSec: responseDurationSec, resolvedAt: Date.now() },
        ...(store.resolvedCalls || [])
      ].slice(0, 100);
    }
    store.calls = (store.calls || []).filter((c: any) => c.id !== id);
    saveStore(store);
  }
  return NextResponse.json({ success: true });
}
