import fs from "fs";
import path from "path";
import https from "https";

const data = JSON.parse(fs.readFileSync("scratch/qrall-menu.json", "utf8"));
const targetDir = path.join(process.cwd(), "public", "dishes");

function sanitize(name) {
  return name.toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function download(url, filePath) {
  return new Promise((resolve) => {
    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 1000) return resolve(true);
    const file = fs.createWriteStream(filePath);
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(file);
        file.on("finish", () => { file.close(); resolve(true); });
      } else {
        file.close();
        fs.unlink(filePath, () => {});
        resolve(false);
      }
    }).on("error", () => {
      file.close();
      fs.unlink(filePath, () => {});
      resolve(false);
    });
  });
}

async function run() {
  console.log("Downloading adisyo photos...");
  for (const cat of data.categories) {
    for (const p of cat.products) {
      if (p.image) {
        const slug = sanitize(p.name);
        const filePath = path.join(targetDir, `${slug}.png`);
        const ok = await download(p.image, filePath);
        if (ok) {
          console.log(`Saved: ${slug}.png for "${p.name}"`);
        }
      }
    }
  }
  console.log("Done downloading adisyo images!");
}

run();
