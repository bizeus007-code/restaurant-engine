import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const file = path.join(process.cwd(), "data", "live_restaurant.json");

function getDb() {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return {
      calls: [],
      resolvedCalls: [],
      orders: [],
      inventory: {},
      feedbacks: [],
      settings: {},
      loyaltySettings: {
        isEnabled: true,
        rewardItemId: "bonfile",
        rewardItemName: "Dana Bonfile (Lokum)",
        rewardItemPrice: 750,
        maxStamps: 6,
        adminPin: "2121",
        rateLimitDaily: true
      },
      loyaltyMembers: {}
    };
  }
}

function saveDb(d: any) {
  try {
    fs.writeFileSync(file, JSON.stringify(d, null, 2), "utf8");
  } catch (e) {
    console.error("Failed to save loyalty database:", e);
  }
}

function normalizePhone(phoneStr: string): string {
  if (!phoneStr) return "";
  let cleaned = phoneStr.replace(/\D/g, "");
  if (cleaned.startsWith("90") && cleaned.length === 12) {
    cleaned = "0" + cleaned.slice(2);
  } else if (cleaned.length === 10 && !cleaned.startsWith("0")) {
    cleaned = "0" + cleaned;
  }
  return cleaned;
}

function formatPhone(cleanPhone: string): string {
  if (cleanPhone.length === 11) {
    return `${cleanPhone.slice(0, 4)} ${cleanPhone.slice(4, 7)} ${cleanPhone.slice(7, 9)} ${cleanPhone.slice(9, 11)}`;
  }
  return cleanPhone;
}

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getNowDateTimeString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hour = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hour}:${min}`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const phoneParam = searchParams.get("phone");
  const allParam = searchParams.get("all");

  const db = getDb();
  const settings = db.loyaltySettings || {
    isEnabled: true,
    rewardItemId: "bonfile",
    rewardItemName: "Dana Bonfile (Lokum)",
    rewardItemPrice: 750,
    maxStamps: 6,
    adminPin: "2121",
    rateLimitDaily: true
  };

  if (phoneParam) {
    const norm = normalizePhone(phoneParam);
    const member = db.loyaltyMembers?.[norm] || null;
    return NextResponse.json({
      success: true,
      loyaltySettings: settings,
      member
    });
  }

  return NextResponse.json({
    success: true,
    loyaltySettings: settings,
    loyaltyMembers: allParam === "true" ? db.loyaltyMembers || {} : undefined
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;
    const db = getDb();

    if (!db.loyaltySettings) {
      db.loyaltySettings = {
        isEnabled: true,
        rewardItemId: "bonfile",
        rewardItemName: "Dana Bonfile (Lokum)",
        rewardItemPrice: 750,
        maxStamps: 6,
        adminPin: "2121",
        rateLimitDaily: true
      };
    }
    if (!db.loyaltyMembers) {
      db.loyaltyMembers = {};
    }

    // 1. Master Switch Toggle
    if (action === "toggleLoyalty") {
      const isEnabled = Boolean(body.isEnabled);
      db.loyaltySettings.isEnabled = isEnabled;
      saveDb(db);
      return NextResponse.json({
        success: true,
        loyaltySettings: db.loyaltySettings
      });
    }

    // 2. Settings Update
    if (action === "updateSettings") {
      db.loyaltySettings = {
        ...db.loyaltySettings,
        ...(body.settings || {})
      };
      saveDb(db);
      return NextResponse.json({
        success: true,
        loyaltySettings: db.loyaltySettings
      });
    }

    // 3. Query / Auto-register member
    if (action === "queryMember") {
      const norm = normalizePhone(body.phone || "");
      if (!norm || norm.length < 10) {
        return NextResponse.json({ success: false, error: "Geçerli bir telefon numarası giriniz." }, { status: 400 });
      }

      let member = db.loyaltyMembers[norm];
      if (!member) {
        member = {
          phone: norm,
          formattedPhone: formatPhone(norm),
          currentStamps: 0,
          cycleCount: 0,
          isRewardUnlocked: false,
          visits: []
        };
        db.loyaltyMembers[norm] = member;
        saveDb(db);
      }

      return NextResponse.json({
        success: true,
        loyaltySettings: db.loyaltySettings,
        member
      });
    }

    // 4. Kasa Add Stamp
    if (action === "addStamp") {
      const norm = normalizePhone(body.phone || "");
      if (!norm || norm.length < 10) {
        return NextResponse.json({ success: false, error: "Geçerli bir telefon numarası giriniz." }, { status: 400 });
      }

      let member = db.loyaltyMembers[norm];
      if (!member) {
        member = {
          phone: norm,
          formattedPhone: formatPhone(norm),
          currentStamps: 0,
          cycleCount: 0,
          isRewardUnlocked: false,
          visits: []
        };
        db.loyaltyMembers[norm] = member;
      }

      const maxStamps = db.loyaltySettings.maxStamps || 6;

      // Rate limit check (Max 1 stamp per day)
      const today = getTodayString();
      if (db.loyaltySettings.rateLimitDaily && !body.force) {
        const alreadyVisitedToday = (member.visits || []).some((v: any) =>
          v.date && v.date.startsWith(today) && !v.isRewardClaim
        );
        if (alreadyVisitedToday) {
          return NextResponse.json({
            success: false,
            error: "Bu misafirimiz için bugün zaten damga onaylandı! (Günlük limit: 1 damga)",
            member
          }, { status: 400 });
        }
      }

      if (member.isRewardUnlocked || member.currentStamps >= maxStamps) {
        return NextResponse.json({
          success: false,
          error: "Hediye hakkı zaten aktif! Yeni damgaya başlamadan önce hediyeyi teslim ediniz.",
          member
        }, { status: 400 });
      }

      member.currentStamps = (member.currentStamps || 0) + 1;
      if (member.currentStamps >= maxStamps) {
        member.currentStamps = maxStamps;
        member.isRewardUnlocked = true;
      }

      const visitRecord = {
        visitIndex: member.currentStamps,
        date: getNowDateTimeString(),
        approvedBy: body.approvedBy || "Kasa"
      };

      member.visits = member.visits || [];
      member.visits.push(visitRecord);

      saveDb(db);

      return NextResponse.json({
        success: true,
        loyaltySettings: db.loyaltySettings,
        member,
        message: member.isRewardUnlocked
          ? `Tebrikler! ${maxStamps}. damga tamamlandı ve Hediye Bonfile açıldı!`
          : `✓ ${member.currentStamps}. damga başarıyla vuruldu.`
      });
    }

    // 5. Claim Reward (Hediye Bonfile Teslimi)
    if (action === "claimReward") {
      const norm = normalizePhone(body.phone || "");
      if (!norm || !db.loyaltyMembers[norm]) {
        return NextResponse.json({ success: false, error: "Üye bulunamadı." }, { status: 404 });
      }

      const member = db.loyaltyMembers[norm];
      if (!member.isRewardUnlocked && member.currentStamps < (db.loyaltySettings.maxStamps || 6)) {
        return NextResponse.json({ success: false, error: "Hediye henüz kazanılmamış." }, { status: 400 });
      }

      member.cycleCount = (member.cycleCount || 0) + 1;
      member.currentStamps = 0;
      member.isRewardUnlocked = false;

      member.visits = member.visits || [];
      member.visits.push({
        visitIndex: 0,
        date: getNowDateTimeString(),
        approvedBy: (body.approvedBy || "Kasa") + " (Hediye Bonfile Teslimi)",
        isRewardClaim: true
      });

      saveDb(db);

      return NextResponse.json({
        success: true,
        loyaltySettings: db.loyaltySettings,
        member,
        message: "Hediye Bonfile teslim edildi! Kart yeni döngü için 0 damgaya sıfırlandı."
      });
    }

    return NextResponse.json({ success: false, error: "Geçersiz işlem." }, { status: 400 });
  } catch (error: any) {
    console.error("Loyalty API Error:", error);
    return NextResponse.json({ success: false, error: "Sunucu hatası: " + error.message }, { status: 500 });
  }
}
