import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { ReservationRecord } from "@/src/types/loqum";

const file = path.join(process.cwd(), "data", "live_restaurant.json");

interface RestaurantDb {
  calls?: any[];
  resolvedCalls?: any[];
  orders?: any[];
  inventory?: Record<string, any>;
  feedbacks?: any[];
  reservations?: ReservationRecord[];
  settings?: {
    businessWhatsapp?: string;
  };
}

const getDb = (): RestaurantDb => {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return {
      calls: [],
      resolvedCalls: [],
      orders: [],
      inventory: {},
      reservations: [],
      settings: { businessWhatsapp: "904125030405" }
    };
  }
};

const saveDb = (d: RestaurantDb) => {
  try {
    fs.writeFileSync(file, JSON.stringify(d, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write to live_restaurant.json:", err);
  }
};

export async function GET() {
  const db = getDb();
  return NextResponse.json({
    reservations: db.reservations || [],
    businessWhatsapp: db.settings?.businessWhatsapp || "904125030405"
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDb();

    // Ayar Güncelleme
    if (body.action === "save_settings") {
      const raw = body.businessWhatsapp || "";
      let digits = raw.replace(/\D/g, "");
      if (digits.startsWith("0090")) digits = digits.substring(4);
      else if (digits.startsWith("90")) digits = digits.substring(2);
      else if (digits.startsWith("0")) digits = digits.substring(1);
      const cleanPhone = digits ? "90" + digits : "904125030405";
      db.settings = {
        ...(db.settings || {}),
        businessWhatsapp: cleanPhone
      };
      saveDb(db);
      return NextResponse.json({
        success: true,
        businessWhatsapp: db.settings.businessWhatsapp
      });
    }

    // Yeni Rezervasyon Kaydı
    const newReservation: ReservationRecord = {
      id: body.id || `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: (body.name || "").trim(),
      phone: (body.phone || "").trim(),
      date: body.date || new Date().toISOString().split("T")[0],
      time: body.time || "20:00",
      guests: body.guests || "2 Kişi",
      notes: (body.notes || "").trim() || undefined,
      branch: body.branch || "LOQUM ET Diyarbakır",
      status: (body.status as any) || "beklemede",
      createdAt: body.createdAt || new Date().toISOString()
    };

    db.reservations = [newReservation, ...(db.reservations || [])].slice(0, 200);
    saveDb(db);

    return NextResponse.json({
      success: true,
      reservation: newReservation
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Rezervasyon kaydedilemedi" },
      { status: 400 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    const db = getDb();

    db.reservations = (db.reservations || []).map((r) =>
      r.id === id ? { ...r, status: status || r.status } : r
    );

    saveDb(db);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Durum güncellenemedi" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const db = getDb();

    if (!id || id === "all") {
      db.reservations = [];
    } else {
      db.reservations = (db.reservations || []).filter((r) => r.id !== id);
    }

    saveDb(db);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Silme işlemi başarısız" },
      { status: 400 }
    );
  }
}

