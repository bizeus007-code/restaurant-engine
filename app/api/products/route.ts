import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function normalizeProducts(value: unknown): any[] {
  if (Array.isArray(value)) return value;

  if (
    value &&
    typeof value === "object" &&
    Array.isArray((value as { items?: unknown[] }).items)
  ) {
    return (value as { items: unknown[] }).items as any[];
  }

  return [];
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("data")
      .eq("id", "main")
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const products = normalizeProducts(data?.data);

    return NextResponse.json(products, {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        "CDN-Cache-Control": "no-store",
        "Vercel-CDN-Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const products = normalizeProducts(body);

    if (!products.length) {
      return NextResponse.json(
        {
          error:
            "Geçersiz ürün verisi. Array veya {items:[...]} gönderilmelidir.",
        },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("products")
      .upsert({
        id: "main",
        data: products,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        count: products.length,
        message: "Ürün listesi Supabase'e kaydedildi.",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: 500 }
    );
  }
}
