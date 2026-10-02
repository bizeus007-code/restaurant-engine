import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CACHE_CONTROL = "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
const localFile = path.join(process.cwd(), "data", "live_restaurant.json");

const getLocalDb = () => {
  try {
    return JSON.parse(fs.readFileSync(localFile, "utf8"));
  } catch {
    return { reservations: [], settings: { businessWhatsapp: "904125030405" } };
  }
};

const saveLocalDb = (d: any) => {
  try {
    fs.writeFileSync(localFile, JSON.stringify(d, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write to live_restaurant.json:", err);
  }
};

// Helper: Fetch all reservations from Supabase or fallback
async function fetchAllReservations(): Promise<any[]> {
  // 1. Try public.reservations table
  try {
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      return data;
    }
  } catch {}

  // 2. Try products table under id: 'reservations'
  try {
    const { data, error } = await supabase
      .from("products")
      .select("data")
      .eq("id", "reservations")
      .single();

    if (!error && data?.data && Array.isArray(data.data)) {
      return data.data;
    }
  } catch {}

  // 3. Fallback to local DB
  const localDb = getLocalDb();
  return localDb.reservations || [];
}

// Helper: Save all reservations to Supabase and local DB
async function persistReservations(reservations: any[]) {
  // 1. Local DB
  const localDb = getLocalDb();
  localDb.reservations = reservations.slice(0, 300);
  saveLocalDb(localDb);

  // 2. Supabase products table (id: 'reservations')
  try {
    await supabase.from("products").upsert({
      id: "reservations",
      data: localDb.reservations,
      updated_at: new Date().toISOString(),
    });
  } catch {}

  // 3. Supabase reservations table (if exists)
  try {
    // Only attempt if table exists
    const check = await supabase.from("reservations").select("id").limit(1);
    if (!check.error) {
      // Table exists
    }
  } catch {}
}

export async function GET() {
  try {
    const list = await fetchAllReservations();
    return NextResponse.json(list, {
      headers: { "Cache-Control": CACHE_CONTROL },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500, headers: { "Cache-Control": CACHE_CONTROL } });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, guests, time, date, notes, branch, status } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Eksik bilgi girdiniz (İsim ve telefon zorunludur)." },
        { status: 400, headers: { "Cache-Control": CACHE_CONTROL } }
      );
    }

    const numGuests = parseInt(String(guests || 1).replace(/\D/g, "")) || 1;
    const newReservation = {
      id: body.id || `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: String(name).trim(),
      phone: String(phone).trim(),
      guests: `${numGuests} Kişi`,
      date: date || new Date().toISOString().split("T")[0],
      time: time || "20:00",
      notes: notes ? String(notes).trim() : undefined,
      branch: branch || "LOQUM ET Diyarbakır",
      status: status || "pending",
      created_at: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Try inserting directly to Supabase reservations table if it exists
    let insertedInTable = false;
    try {
      const { data, error } = await supabase
        .from("reservations")
        .insert([
          {
            name: newReservation.name,
            phone: newReservation.phone,
            guests: numGuests,
            time: newReservation.time,
            date: newReservation.date,
            status: "pending",
            created_at: newReservation.created_at,
          },
        ])
        .select();

      if (!error && data && data.length > 0) {
        insertedInTable = true;
        newReservation.id = String(data[0].id || newReservation.id);
      }
    } catch {}

    // Persist to document storage & local DB
    const existing = await fetchAllReservations();
    const updated = [newReservation, ...existing.filter((r) => r.id !== newReservation.id)];
    await persistReservations(updated);

    return NextResponse.json(
      {
        success: true,
        message: "Rezervasyon alindi, onay bekleniyor.",
        data: newReservation,
      },
      { headers: { "Cache-Control": CACHE_CONTROL } }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500, headers: { "Cache-Control": CACHE_CONTROL } });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Eksik parametre (id ve status gereklidir)." },
        { status: 400, headers: { "Cache-Control": CACHE_CONTROL } }
      );
    }

    // Try updating Supabase reservations table
    try {
      await supabase
        .from("reservations")
        .update({ status })
        .eq("id", id);
    } catch {}

    // Update document storage & local DB
    const existing = await fetchAllReservations();
    const updated = existing.map((r) => (r.id === id ? { ...r, status } : r));
    await persistReservations(updated);

    return NextResponse.json(
      { success: true, message: "Rezervasyon durumu güncellendi." },
      { headers: { "Cache-Control": CACHE_CONTROL } }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500, headers: { "Cache-Control": CACHE_CONTROL } });
  }
}

export async function PATCH(request: Request) {
  return PUT(request);
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Eksik parametre (id gereklidir)." },
        { status: 400, headers: { "Cache-Control": CACHE_CONTROL } }
      );
    }

    // Try deleting from Supabase reservations table
    try {
      await supabase.from("reservations").delete().eq("id", id);
    } catch {}

    // Update document storage & local DB
    const existing = await fetchAllReservations();
    const updated = id === "all" ? [] : existing.filter((r) => r.id !== id);
    await persistReservations(updated);

    return NextResponse.json(
      { success: true, message: "Rezervasyon silindi." },
      { headers: { "Cache-Control": CACHE_CONTROL } }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500, headers: { "Cache-Control": CACHE_CONTROL } });
  }
}
