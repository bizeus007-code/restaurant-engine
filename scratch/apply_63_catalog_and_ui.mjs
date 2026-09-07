import fs from "fs";

let content = fs.readFileSync("app/page.tsx", "utf8");
const catalog = JSON.parse(fs.readFileSync("scratch/prepared_63_dishes.json", "utf8"));

// 1. Add Clock, ShieldAlert to imports if not already present
if (!content.includes("Clock,") && !content.includes("Clock }")) {
  content = content.replace(
    `  Layers,\n  MapPin,`,
    `  Layers,\n  MapPin,\n  Clock,\n  ShieldAlert,`
  );
}

// 2. Add allergens to MenuItem interface
if (!content.includes("allergens?:")) {
  content = content.replace(
    `  garnishIngredient?: string;\n}`,
    `  garnishIngredient?: string;\n  allergens?: string | string[];\n}`
  );
}

// 3. Replace DISHES
const startDishesIdx = content.indexOf("const DISHES: MenuItem[] = [");
const endDishesIdx = content.indexOf("const FACADE_CENTER = ");

if (startDishesIdx === -1 || endDishesIdx === -1) {
  console.error("Could not find DISHES start or end index!");
  process.exit(1);
}

const dishesString = `const DISHES: MenuItem[] = ${JSON.stringify(catalog, null, 2)};\n\n`;
content = content.slice(0, startDishesIdx) + dishesString + content.slice(endDishesIdx);

// 4. Replace left panel metrics with professional luxury badges
const oldMetrics = `              {/* Minimalist Teknik Metrikler */}
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono tracking-widest text-[#d4af37] py-1.5 border-y border-white/10">
                <span>[ {activeDish.calories} ]</span>
                <span className="text-white/20">•</span>
                <span>[ {activeDish.prepTime} ]</span>
                <span className="text-white/20">•</span>
                <span>[ {activeDish.temperature} ]</span>
              </div>`;

const newBadges = `              {/* Profesyonel Lüks Rozetler: Kalori, Hazırlık Süresi, Alerjen */}
              <div className="flex flex-wrap items-center gap-2 py-2 border-y border-[#d4af37]/20 my-3">
                {activeDish.calories && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/35 text-[#d4af37] text-[11px] font-mono tracking-wider shadow-sm">
                    <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{activeDish.calories}</span>
                  </div>
                )}
                {activeDish.prepTime && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-white/85 text-[11px] font-mono tracking-wider shadow-sm">
                    <Clock className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                    <span>{activeDish.prepTime}</span>
                  </div>
                )}
                {activeDish.allergens && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/50 border border-amber-600/35 text-amber-200/90 text-[10px] font-sans tracking-wide shadow-sm">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate max-w-[210px]">Alerjen: {Array.isArray(activeDish.allergens) ? activeDish.allergens.join(", ") : activeDish.allergens}</span>
                  </div>
                )}
                {activeDish.temperature && (
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-[10px] font-mono tracking-wider">
                    <span>{activeDish.temperature}</span>
                  </div>
                )}
              </div>`;

if (content.includes(oldMetrics)) {
  content = content.replace(oldMetrics, newBadges);
} else {
  console.log("oldMetrics not exact match, searching for calories span...");
  const oldSimpleMetrics = `<div className="flex flex-wrap items-center gap-2 text-[10px] font-mono tracking-widest text-[#d4af37] py-1.5 border-y border-white/10">`;
  const endSimple = `</div>`;
  const pos = content.indexOf(oldSimpleMetrics);
  if (pos !== -1) {
    const endPos = content.indexOf(endSimple, pos) + endSimple.length;
    content = content.slice(0, pos) + newBadges + content.slice(endPos);
    console.log("Replaced via fallback slice!");
  }
}

// 5. Enhance wooden tabletop stage
const oldStage = `              {/* MASİF CEVİZ MASAÜSTÜ ZEMİNİ & SICAK ORTAM IŞIĞI */}
              <div className="absolute inset-0 pointer-events-none -z-20 flex items-center justify-center">
                {/* Tavandan Vuran Yumuşak Sıcak Avize Işığı */}
                <div className="w-[580px] h-[340px] rounded-full bg-gradient-to-b from-amber-500/12 via-amber-950/5 to-transparent blur-3xl" />
                
                {/* Doğal Ahşap Masa Yüzeyi Dokusu */}
                <div 
                  className="absolute bottom-0 w-[95%] h-[240px] rounded-t-[50px] opacity-40 bg-cover bg-center border-t border-amber-900/30"
                  style={{
                    backgroundImage: "radial-gradient(ellipse at 50% 10%, rgba(212,175,55,0.15), transparent 70%), url('/textures/wood-grain.jpg')",
                    boxShadow: "inset 0 4px 30px rgba(0,0,0,0.8)"
                  }}
                />
              </div>`;

const newStage = `              {/* MASİF CEVİZ MASAÜSTÜ ZEMİNİ & SICAK ORTAM IŞIĞI */}
              <div className="absolute inset-0 pointer-events-none -z-20 flex items-center justify-center overflow-hidden">
                {/* Tavandan Vuran Yumuşak Sıcak Avize Işığı */}
                <div className="absolute top-2 w-[650px] h-[360px] rounded-full bg-gradient-to-b from-amber-500/20 via-amber-700/10 to-transparent blur-3xl pointer-events-none" />
                
                {/* Doğal Masif Ahşap Masa Yüzeyi Dokusu */}
                <div 
                  className="absolute bottom-2 w-[98%] max-w-[640px] h-[260px] sm:h-[300px] rounded-t-[60px] opacity-85 bg-cover bg-center border-t border-amber-500/30"
                  style={{
                    backgroundImage: "radial-gradient(ellipse at 50% 15%, rgba(212,175,55,0.22), rgba(18,12,8,0.85) 75%), url('/textures/wood-grain.jpg')",
                    boxShadow: "0 -20px 50px rgba(0,0,0,0.9), inset 0 2px 25px rgba(212,175,55,0.2)"
                  }}
                />
              </div>`;

if (content.includes(oldStage)) {
  content = content.replace(oldStage, newStage);
  console.log("Replaced stage successfully!");
}

fs.writeFileSync("app/page.tsx", content);
console.log("Successfully updated app/page.tsx with all 63+ dishes and luxury badges!");
