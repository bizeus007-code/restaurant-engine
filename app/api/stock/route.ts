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

async function getProducts(): Promise<any[]> {
  const { data, error } = await supabase
    .from("products")
    .select("data")
    .eq("id", "main")
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(error.message);
  }

  return normalizeProducts(data?.data);
}

async function saveProducts(products: any[]) {
  const { error } = await supabase
    .from("products")
    .upsert({
      id: "main",
      data: products,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    throw new Error(error.message);
  }
}

export async function GET() {
  try {
    const products = await getProducts();

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

    /*
     * Eski frontend { dishId, price } gönderirse:
     * TÜM products.data üzerine yazma.
     * Sadece ilgili ürünün fiyatını güncelle.
     */
    if (
      body &&
      typeof body === "object" &&
      !Array.isArray(body) &&
      typeof body.dishId === "string" &&
      body.price !== undefined
    ) {
      const products = await getProducts();

      const index = products.findIndex(
        (product) => product?.id === body.dishId
      );

      if (index === -1) {
        return NextResponse.json(
          {
            error: `Ürün bulunamadı: ${body.dishId}`,
          },
          { status: 404 }
        );
      }

      products[index] = {
        ...products[index],
        price: Number(body.price),
      };

      await saveProducts(products);

      return NextResponse.json(
        {
          success: true,
          updatedId: body.dishId,
          price: Number(body.price),
          count: products.length,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    /*
     * Tam ürün listesi gelirse onu da kabul et.
     */
    const products = normalizeProducts(body);

    if (!products.length) {
      return NextResponse.json(
        { error: "Geçersiz ürün verisi." },
        { status: 400 }
      );
    }

    await saveProducts(products);

    return NextResponse.json(
      {
        success: true,
        count: products.length,
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
