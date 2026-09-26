import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import menuJson from "@/src/data/loqum-menu.json";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CACHE_CONTROL = "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";

export async function GET() {
  try {
    const productsFile = path.join(process.cwd(), "src", "data", "loqum-products.json");
    const liveFile = path.join(process.cwd(), "data", "live_restaurant.json");

    let products = [];
    if (fs.existsSync(productsFile)) {
      products = JSON.parse(fs.readFileSync(productsFile, "utf8"));
    }

    if (fs.existsSync(liveFile)) {
      try {
        const live = JSON.parse(fs.readFileSync(liveFile, "utf8"));
        const inv = live.inventory || {};
        products = products.map((p: any) => {
          if (inv[p.id] && inv[p.id].price !== undefined) {
            return {
              ...p,
              price: inv[p.id].price,
              stock: inv[p.id].count !== undefined ? inv[p.id].count : p.stock,
              isLocked: inv[p.id].isLocked || false,
            };
          }
          return p;
        });
      } catch (e) {
        console.error("Failed to merge live inventory in /api/menu:", e);
      }
    }

    return NextResponse.json(
      {
        categories: menuJson.categories,
        products,
        updatedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": CACHE_CONTROL,
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      {
        status: 500,
        headers: {
          "Cache-Control": CACHE_CONTROL,
        },
      }
    );
  }
}
