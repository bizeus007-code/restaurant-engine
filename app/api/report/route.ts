import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "live_restaurant.json");

export async function GET() {
  try {
    const raw = fs.readFileSync(dataFilePath, "utf8");
    const store = JSON.parse(raw);
    const orders = store.orders || [];
    const resolvedCalls = store.resolvedCalls || [];

    // Toplam Ciro
    const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
    const totalOrders = orders.length;

    // En Çok Satanlar
    const dishMap: Record<string, { name: string; count: number; total: number }> = {};
    orders.forEach((o: any) => {
      (o.items || []).forEach((item: any) => {
        if (!dishMap[item.id]) {
          dishMap[item.id] = { name: item.name, count: 0, total: 0 };
        }
        dishMap[item.id].count += item.quantity || 1;
        dishMap[item.id].total += (item.price || 0) * (item.quantity || 1);
      });
    });
    const topDishes = Object.values(dishMap).sort((a, b) => b.count - a.count).slice(0, 5);

    // Garson Performansı
    const totalCalls = resolvedCalls.length + (store.calls || []).length;
    const avgResponseSec = resolvedCalls.length > 0
      ? Math.round(resolvedCalls.reduce((s: number, c: any) => s + (c.durationSec || 0), 0) / resolvedCalls.length)
      : 0;

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      topDishes,
      totalCalls,
      completedCalls: resolvedCalls.length,
      pendingCalls: (store.calls || []).length,
      avgResponseSec,
    });
  } catch {
    return NextResponse.json({
      totalRevenue: 0,
      totalOrders: 0,
      topDishes: [],
      totalCalls: 0,
      completedCalls: 0,
      pendingCalls: 0,
      avgResponseSec: 0,
    });
  }
}

