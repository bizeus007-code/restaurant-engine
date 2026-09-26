import fs from "fs";
import path from "path";

const uploads = [
  { target: "mumbar.png", candidates: ["unnamed (2).webp", "unnamed (2).jpg", "unnamed (2).png", "unnamed.webp"] },
  { target: "asci-tabagi.png", candidates: ["unnamed (1).webp", "unnamed.webp", "unnamed.jpg", "unnamed (1).jpg"] }
];

const targetDir = path.join(process.cwd(), "public", "dishes");
const rootDir = process.cwd();

let matched = 0;
for (const item of uploads) {
  for (const cand of item.candidates) {
    const src = path.join(rootDir, cand);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(targetDir, item.target));
      console.log(`✓ Orijinal Beroş fotoğrafı bağlandı: ${item.target} <- ${cand}`);
      matched++;
      break;
    }
  }
}
if (matched === 0) {
  console.log("No new candidate files found; existing verified photos retained in public/dishes/");
}
