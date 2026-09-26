import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { MENU_PRODUCTS } from "@/src/data/menu";
import loqumProducts from "@/src/data/loqum-products.json";

const file = path.join(process.cwd(), "data", "live_restaurant.json");
const getDb = () => {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return { calls: [], resolvedCalls: [], orders: [], inventory: {}, feedbacks: [] };
  }
};
const saveDb = (d: any) => fs.writeFileSync(file, JSON.stringify(d, null, 2), "utf8");

const getDepartment = (slug?: string) => {
  if (!slug) return "kitchen";
  if (slug === "steak") return "steak";
  if (slug === "firin-etler" || slug === "kebaplar" || slug === "lahmacun-ve-pide") return "grill_oven";
  if (slug === "tatlilar") return "dessert";
  if (slug === "icecekler") return "bar";
  return "kitchen";
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tableNo = searchParams.get("tableNo");
  const orders = getDb().orders || [];

  if (tableNo) {
    const formatted = tableNo.toUpperCase().includes("MASA") ? tableNo.toUpperCase() : `MASA ${tableNo.padStart(2, "0")}`;
    const filtered = orders.filter((o: any) => o.tableNo === formatted);
    return NextResponse.json(filtered);
  }

  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const body = await req.json();
  const db = getDb();
  const rawItems = body.items || [];

  // Map products to ensure department and image integrity
  const items = rawItems.map((it: any) => {
    const loqumMatch = (loqumProducts as any[]).find((p) => p.id === it.id);
    const menuMatch = MENU_PRODUCTS.find((p) => p.id === it.id);
    const matched = loqumMatch || menuMatch;
    const dept = it.department || (loqumMatch ? getDepartment(loqumMatch.categorySlug) : (menuMatch ? menuMatch.department : "kitchen"));
    return {
      id: it.id,
      name: it.name || (matched ? matched.name : "Özel Sipariş"),
      price: it.price !== undefined ? it.price : (matched ? matched.price : 0),
      quantity: it.quantity || 1,
      selectedOptions: it.selectedOptions || (it.option ? { "Pişme Derecesi": it.option } : {}),
      note: it.note || "",
      department: dept,
      portion: it.portion || (loqumMatch ? loqumMatch.gramaj : (menuMatch ? menuMatch.portion : "")),
      isComped: false,
      isCancelled: false
    };
  });

  // Inventory deduction
  db.inventory = db.inventory || {};
  items.forEach((it: any) => {
    if (db.inventory[it.id] && !db.inventory[it.id].isUnlimited) {
      db.inventory[it.id].count = Math.max(0, (db.inventory[it.id].count || 0) - (it.quantity || 1));
      if (db.inventory[it.id].count === 0) {
        db.inventory[it.id].isLocked = true;
      }
    }
  });

  const formattedTableNo = body.tableNo
    ? (body.tableNo.toUpperCase().includes("MASA") ? body.tableNo.toUpperCase() : `MASA ${String(body.tableNo).padStart(2, "0")}`)
    : "MASA 01";

  const order = {
    id: "ord_" + Date.now(),
    tableNo: formattedTableNo,
    items,
    totalAmount: body.totalAmount || items.reduce((sum: number, it: any) => sum + it.price * it.quantity, 0),
    time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
    timestamp: Date.now(),
    status: "hazirlaniyor", // hazirlaniyor -> servise_hazir -> masa_teslim -> kapandi
    paymentMethod: null,
    compAmount: 0
  };

  db.orders = [order, ...(db.orders || [])].slice(0, 300);
  saveDb(db);
  return NextResponse.json({ success: true, order, inventory: db.inventory });
}

export async function PATCH(req: Request) {
  const { id, status, paymentMethod, isComped, isCancelled, compAmount } = await req.json();
  const db = getDb();
  db.orders = (db.orders || []).map((o: any) => {
    if (o.id === id) {
      return {
        ...o,
        status: status || o.status,
        paymentMethod: paymentMethod !== undefined ? paymentMethod : o.paymentMethod,
        isComped: isComped !== undefined ? isComped : o.isComped,
        isCancelled: isCancelled !== undefined ? isCancelled : o.isCancelled,
        compAmount: compAmount !== undefined ? compAmount : (isComped ? o.totalAmount : o.compAmount || 0),
        closedAt: (status === "kapandi" || isCancelled) ? Date.now() : o.closedAt
      };
    }
    return o;
  });
  saveDb(db);
  return NextResponse.json({ success: true });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, action, status, paymentMethod } = body;
  const targetStatus = action === "complete" ? "kapandi" : (status || "kapandi");
  const db = getDb();
  db.orders = (db.orders || []).map((o: any) => {
    if (o.id === id) {
      return {
        ...o,
        status: targetStatus,
        paymentMethod: paymentMethod || o.paymentMethod || "Nakit",
        closedAt: Date.now()
      };
    }
    return o;
  });
  saveDb(db);
  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const db = getDb();
  db.orders = [
    {
      id: "ord_demo_1",
      tableNo: "MASA 12",
      items: [
        {
          id: "kebap-1",
          name: "Zırh Kıyma Kebabı (Adana/Urfa)",
          price: 460,
          quantity: 2,
          department: "kitchen"
        },
        {
          id: "up-1",
          name: "Yayık Ayran & Diyarbakır Şalgamı",
          price: 80,
          quantity: 2,
          department: "bar"
        }
      ],
      totalAmount: 1080,
      time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      timestamp: Date.now(),
      status: "hazirlaniyor",
      paymentMethod: null,
      compAmount: 0
    }
  ];
  saveDb(db);
  return NextResponse.json({ success: true, message: "Demo siparişleri sıfırlandı." });
}
