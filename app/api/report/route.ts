import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const file = path.join(process.cwd(), "data", "live_restaurant.json");
const getDb = () => {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return { calls: [], resolvedCalls: [], orders: [], inventory: {}, feedbacks: [], zReports: [] };
  }
};
const saveDb = (d: any) => fs.writeFileSync(file, JSON.stringify(d, null, 2), "utf8");

export async function GET() {
  try {
    const db = getDb();
    const orders = db.orders || [];
    const resolved = db.resolvedCalls || [];
    const calls = db.calls || [];
    const inventory = db.inventory || {};

    const closedOrders = orders.filter((o: any) => o.status === "kapandi" && !o.isCancelled);
    const activeOrders = orders.filter((o: any) => o.status !== "kapandi" && !o.isCancelled);
    const cancelledOrders = orders.filter((o: any) => o.isCancelled);

    // Revenue calculations
    const closedRevenue = closedOrders.reduce((s: number, o: any) => s + (o.totalAmount || 0), 0);
    const openRevenue = activeOrders.reduce((s: number, o: any) => s + (o.totalAmount || 0), 0);
    const totalRevenue = closedRevenue + openRevenue;

    const cashRevenue = closedOrders
      .filter((o: any) => o.paymentMethod === "nakit")
      .reduce((s: number, o: any) => s + (o.totalAmount || 0), 0);
    const cardRevenue = closedOrders
      .filter((o: any) => o.paymentMethod === "kart" || !o.paymentMethod)
      .reduce((s: number, o: any) => s + (o.totalAmount || 0), 0);

    const compAmount = orders.reduce((s: number, o: any) => s + (o.compAmount || (o.isComped ? o.totalAmount : 0) || 0), 0);

    // Unique tables count
    const uniqueTables = new Set(orders.map((o: any) => o.tableNo)).size;
    const averageBasket = orders.length > 0 ? Math.round(totalRevenue / Math.max(1, uniqueTables)) : 0;

    // Department breakdown
    const deptTotals = {
      steak: 0,       // Steak & Kuru Dinlendirme
      grill_oven: 0,   // Taş Fırın, Kebap & Lahmacun
      kitchen: 0,      // Sıcak Mutfak, Tava & Burger
      bar: 0,          // Bar & Soğuk İçecekler
      dessert: 0       // Fırın & Tatlı Reyonu
    };

    const dishMap: Record<string, { id: string; name: string; count: number; total: number }> = {};

    orders.forEach((o: any) => {
      if (o.isCancelled) return;
      (o.items || []).forEach((it: any) => {
        const qty = it.quantity || 1;
        const lineTotal = (it.price || 0) * qty;

        // Map department
        const dept = (it.department as keyof typeof deptTotals) || "kitchen";
        if (deptTotals[dept] !== undefined) {
          deptTotals[dept] += lineTotal;
        } else {
          deptTotals.kitchen += lineTotal;
        }

        if (!dishMap[it.id]) {
          dishMap[it.id] = { id: it.id, name: it.name, count: 0, total: 0 };
        }
        dishMap[it.id].count += qty;
        dishMap[it.id].total += lineTotal;
      });
    });

    const topDishes = Object.values(dishMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Critical stock list
    const criticalStockItems = Object.entries(inventory)
      .filter(([_, item]: any) => !item.isUnlimited && (item.count <= (item.criticalThreshold || 5) || item.isLocked))
      .map(([id, item]: any) => ({
        id,
        name: item.name,
        count: item.count,
        isLocked: item.isLocked
      }));

    const avgSec = resolved.length > 0
      ? Math.round(resolved.reduce((s: number, c: any) => s + (c.durationSec || 0), 0) / resolved.length)
      : 0;

    return NextResponse.json({
      totalRevenue,
      closedRevenue,
      openRevenue,
      cashRevenue,
      cardRevenue,
      compAmount,
      totalOrders: orders.length,
      activeOrders: activeOrders.length,
      closedOrders: closedOrders.length,
      cancelledOrders: cancelledOrders.length,
      totalTables: uniqueTables,
      averageBasket,
      deptTotals,
      topDishes,
      criticalStockItems,
      totalCalls: calls.length + resolved.length,
      activeCalls: calls.length,
      avgResponseSec: avgSec
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST endpoint to freeze End-of-Day (Z-Report)
export async function POST(req: Request) {
  try {
    const db = getDb();
    const orders = db.orders || [];
    const calls = db.calls || [];
    const inventory = db.inventory || {};

    const closedOrders = orders.filter((o: any) => !o.isCancelled);
    const closedRevenue = closedOrders.reduce((s: number, o: any) => s + (o.totalAmount || 0), 0);
    const cashRevenue = closedOrders
      .filter((o: any) => o.paymentMethod === "nakit")
      .reduce((s: number, o: any) => s + (o.totalAmount || 0), 0);
    const cardRevenue = closedOrders
      .filter((o: any) => o.paymentMethod === "kart" || !o.paymentMethod)
      .reduce((s: number, o: any) => s + (o.totalAmount || 0), 0);
    const compAmount = orders.reduce((s: number, o: any) => s + (o.compAmount || (o.isComped ? o.totalAmount : 0) || 0), 0);
    const uniqueTables = new Set(orders.map((o: any) => o.tableNo)).size;
    const averageBasket = orders.length > 0 ? Math.round(closedRevenue / Math.max(1, uniqueTables)) : 0;

    const deptTotals = {
      steak: 0,
      grill_oven: 0,
      kitchen: 0,
      bar: 0,
      dessert: 0
    };

    const dishMap: Record<string, { id: string; name: string; count: number }> = {};
    orders.forEach((o: any) => {
      if (o.isCancelled) return;
      (o.items || []).forEach((it: any) => {
        const qty = it.quantity || 1;
        const dept = (it.department as keyof typeof deptTotals) || "kitchen";
        if (deptTotals[dept] !== undefined) deptTotals[dept] += (it.price || 0) * qty;

        if (!dishMap[it.id]) dishMap[it.id] = { id: it.id, name: it.name, count: 0 };
        dishMap[it.id].count += qty;
      });
    });

    const topDishes = Object.values(dishMap).sort((a, b) => b.count - a.count).slice(0, 3);
    const criticalNotes = Object.entries(inventory)
      .filter(([_, item]: any) => !item.isUnlimited && item.count <= 5)
      .map(([_, item]: any) => `${item.name} (${item.count} adet)`)
      .join(", ") || "Stoklar normal";

    const zReport = {
      id: "z_" + Date.now(),
      date: new Date().toLocaleDateString("tr-TR"),
      time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      timestamp: Date.now(),
      totalRevenue: closedRevenue,
      cardRevenue,
      cashRevenue,
      totalTables: uniqueTables,
      averageBasket,
      deptTotals,
      topDishes,
      compAmount,
      criticalStockNotes: criticalNotes,
      archivedOrdersCount: orders.length
    };

    // Close all open orders and store Z-report
    db.orders = (db.orders || []).map((o: any) => ({ ...o, status: "kapandi", closedAt: Date.now() }));
    db.calls = [];
    db.zReports = [zReport, ...(db.zReports || [])];
    saveDb(db);

    return NextResponse.json({ success: true, zReport });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
