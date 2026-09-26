import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CACHE_CONTROL = "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";

const file = path.join(process.cwd(), "data", "live_restaurant.json");

const getDb = () => {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return { calls: [], resolvedCalls: [], orders: [], inventory: {}, feedbacks: [], settings: {} };
  }
};

const saveDb = (d: any) => {
  try {
    fs.writeFileSync(file, JSON.stringify(d, null, 2), "utf8");
  } catch (e) {
    console.error("Failed to save settings:", e);
  }
};

export async function GET() {
  const db = getDb();
  const settings = db.settings || {
    isServiceOpen: true,
    campaignText: "",
    businessWhatsapp: "904125030405",
    adminPin: "1234"
  };
  return NextResponse.json(settings, {
    headers: { "Cache-Control": CACHE_CONTROL },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDb();
    if (body.businessWhatsapp) {
      let digits = String(body.businessWhatsapp).replace(/\D/g, "");
      if (digits.startsWith("0090")) digits = digits.substring(4);
      else if (digits.startsWith("90")) digits = digits.substring(2);
      else if (digits.startsWith("0")) digits = digits.substring(1);
      body.businessWhatsapp = digits ? "90" + digits : "904125030405";
    }
    db.settings = {
      ...(db.settings || {}),
      ...body
    };
    saveDb(db);

    try {
      revalidatePath("/", "layout");
      revalidatePath("/menu");
    } catch (e) {
      console.error("revalidatePath error in POST /api/settings:", e);
    }

    return NextResponse.json(
      { success: true, settings: db.settings },
      { headers: { "Cache-Control": CACHE_CONTROL } }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Ayar kaydedilemedi" },
      { status: 400, headers: { "Cache-Control": CACHE_CONTROL } }
    );
  }
}
