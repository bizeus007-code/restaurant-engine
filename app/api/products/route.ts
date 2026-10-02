
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("data")
      .eq("id", "main")
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let result = data?.data || [];
    if (!Array.isArray(result) && result && typeof result === "object" && Array.isArray(result.items)) {
      result = result.items;
    }

    return NextResponse.json(Array.isArray(result) ? result : []);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let payload = body;

    if (!Array.isArray(payload) && payload && typeof payload === "object" && Array.isArray(payload.items)) {
      payload = payload.items;
    }

    if (!Array.isArray(payload)) {
      return NextResponse.json({ error: "Gonderilen veri bir urun dizisi olmalidir." }, { status: 400 });
    }

    const { error } = await supabase
      .from("products")
      .upsert({
        id: "main",
        data: payload,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Urunler ve fiyatlar basariyla senkronize edildi." });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
