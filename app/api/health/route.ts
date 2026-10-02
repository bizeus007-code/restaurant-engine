
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase.from("products").select("id").limit(1);
    if (error) throw error;
    return NextResponse.json({ status: "healthy", database: "connected", timestamp: new Date().toISOString() });
  } catch (e: any) {
    return NextResponse.json({ status: "unhealthy", error: e.message }, { status: 500 });
  }
}
