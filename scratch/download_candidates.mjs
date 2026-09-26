import fs from "fs";
import path from "path";
import https from "https";

const candidates = [
  { name: "DSC00018", url: "https://berosrestaurant.com/wp-content/uploads/2026/02/DSC00018-1-600x480.png" },
  { name: "3", url: "https://berosrestaurant.com/wp-content/uploads/2026/02/3-600x464.png" },
  { name: "22", url: "https://berosrestaurant.com/wp-content/uploads/2026/02/22-600x348.png" },
  { name: "EDR00138", url: "https://berosrestaurant.com/wp-content/uploads/2026/02/EDR00138-600x750.jpg" },
  { name: "4", url: "https://berosrestaurant.com/wp-content/uploads/2026/02/4-600x480.jpg" },
  { name: "IMG_6766", url: "https://berosrestaurant.com/wp-content/uploads/2026/02/IMG_6766-600x1067.jpg" },
  { name: "IMG_6785", url: "https://berosrestaurant.com/wp-content/uploads/2026/02/IMG_6785-600x1067.jpg" },
  { name: "IMG_6795", url: "https://berosrestaurant.com/wp-content/uploads/2026/02/IMG_6795-600x1067.jpg" },
  { name: "IMG_6804", url: "https://berosrestaurant.com/wp-content/uploads/2026/02/IMG_6804-600x1067.jpg" },
  { name: "IMG_6811", url: "https://berosrestaurant.com/wp-content/uploads/2026/02/IMG_6811-600x800.jpg" }
];

async function download(item) {
  const dest = path.join(process.cwd(), `scratch/cand_${item.name}.jpg`);
  return new Promise((resolve) => {
    const f = fs.createWriteStream(dest);
    https.get(item.url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode === 200) {
        res.pipe(f);
        f.on("finish", () => { f.close(); console.log(`Saved: ${item.name} (${fs.statSync(dest).size} bytes)`); resolve(); });
      } else {
        f.close();
        console.log(`Failed ${item.name}: ${res.statusCode}`);
        resolve();
      }
    }).on("error", (e) => { console.log(e.message); resolve(); });
  });
}

for (const c of candidates) {
  await download(c);
}
