import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import initialProducts from "@/src/data/loqum-products.json";
export const dynamic = "force-dynamic";
const mMap = new Map((initialProducts as any[]).map(p => [p.id, p]));
function heal(curr: any[], inc: any[]) {
  const cMap = new Map(curr.map(p => [p?.id, p]));
  return inc.map(x => {
    const m = mMap.get(x?.id) || {};
    const c = cMap.get(x?.id) || {};
    return {
      ...m, ...c, ...x,
      price: Number(x?.price) > 0 ? Number(x.price) : Number(c.price || m.price || 0),
      categoryId: Number(x?.categoryId) > 0 ? Number(x.categoryId) : Number(c.categoryId || m.categoryId || 27),
      image: x?.image || c.image || m.image || "/images/menu/steak/loqum.jpg",
      gramaj: x?.gramaj || c.gramaj || m.gramaj || "250 gr",
      calories: Number(x?.calories) > 0 ? Number(x.calories) : Number(c.calories || m.calories || 650),
      description: x?.description || c.description || m.description || "",
      allergens: Array.isArray(x?.allergens) ? x.allergens : (c.allergens || m.allergens || [])
    };
  });
}
export async function GET() {
  const { data } = await supabase.from("products").select("data").eq("id", "main").single();
  const list = Array.isArray(data?.data) ? data.data : (data?.data?.items || []);
  return NextResponse.json(list.length ? heal(list, list) : initialProducts, { headers: { "Cache-Control": "no-store" } });
}
export async function POST(req: Request) {
  const body = await req.json();
  const inc = Array.isArray(body) ? body : (body?.items || []);
  if (!inc.length) return NextResponse.json({ error: "Bos veri" }, { status: 400 });
  const { data } = await supabase.from("products").select("data").eq("id", "main").single();
  const curr = Array.isArray(data?.data) ? data.data : (data?.data?.items || []);
  const saved = heal(curr, inc);
  await supabase.from("products").upsert({ id: "main", data: saved, updated_at: new Date().toISOString() });
  return NextResponse.json({ success: true, items: saved });
}
