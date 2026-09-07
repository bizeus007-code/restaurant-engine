import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const file = path.join(process.cwd(), "data", "live_restaurant.json");

export async function GET() {
  try {
    const db = JSON.parse(fs.readFileSync(file, "utf8"));
    const orders = db.orders || [];
    const resolved = db.resolvedCalls || [];
    const calls = db.calls || [];

    const totalRevenue = orders.reduce((s: number, o: any) => s + (o.totalAmount || 0), 0);
    const closedRevenue = orders
      .filter((o: any) => o.status === "kapandi")
      .reduce((s: number, o: any) => s + (o.totalAmount || 0), 0);
    const openRevenue = totalRevenue - closedRevenue;

    const dishMap: Record<string, { name: string; count: number; total: number }> = {};
    orders.forEach((o: any) => {
      (o.items || []).forEach((it: any) => {
        if (!dishMap[it.id]) dishMap[it.id] = { name: it.name, count: 0, total: 0 };
        dishMap[it.id].count += it.quantity || 1;
        dishMap[it.id].total += (it.price || 0) * (it.quantity || 1);
      });
    });

    const topDishes = Object.values(dishMap).sort((a, b) => b.count - a.count).slice(0, 5);
    const avgSec = resolved.length > 0
      ? Math.round(resolved.reduce((s: number, c: any) => s + (c.durationSec || 0), 0) / resolved.length)
      : 0;

    return NextResponse.json({
      totalRevenue,
      closedRevenue,
      openRevenue,
      totalOrders: orders.length,
      activeOrders: orders.filter((o: any) => o.status !== "kapandi").length,
      closedOrders: orders.filter((o: any) => o.status === "kapandi").length,
      topDishes,
      totalCalls: calls.length + resolved.length,
      activeCalls: calls.length,
      avgResponseSec: avgSec
    });
  } catch {
    return NextResponse.json({
      totalRevenue: 0,
      closedRevenue: 0,
      openRevenue: 0,
      totalOrders: 0,
      activeOrders: 0,
      closedOrders: 0,
      topDishes: [],
      totalCalls: 0,
      activeCalls: 0,
      avgResponseSec: 0
    });
  }
}

