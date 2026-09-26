import fs from "fs";
import path from "path";
import https from "https";

const downloads = [
  {
    dest: "public/hero/real-facade.jpg",
    url: "https://berosrestaurant.com/wp-content/uploads/2026/02/IMG_6766-scaled.jpg"
  },
  {
    dest: "public/dishes/asci-tabagi.png",
    url: "https://berosrestaurant.com/wp-content/uploads/2026/02/3.png"
  },
  {
    dest: "public/dishes/beros-usulu-loqum-bonfile.png",
    url: "https://berosrestaurant.com/wp-content/uploads/2026/02/DSC00018-1.png"
  },
  {
    dest: "public/dishes/kuzu-pirzola.png",
    url: "https://berosrestaurant.com/wp-content/uploads/2026/02/22.png"
  }
];

function download(item) {
  return new Promise((resolve) => {
    const dest = path.join(process.cwd(), item.dest);
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const f = fs.createWriteStream(dest);
    https.get(item.url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode === 200) {
        res.pipe(f);
        f.on("finish", () => {
          f.close();
          console.log(`✓ Downloaded ${item.dest} (${fs.statSync(dest).size} bytes)`);
          resolve();
        });
      } else {
        f.close();
        console.error(`✗ Error ${res.statusCode} for ${item.url}`);
        resolve();
      }
    }).on("error", (e) => {
      console.error(`✗ Request error: ${e.message}`);
      resolve();
    });
  });
}

for (const d of downloads) {
  await download(d);
}

// Check mumbar
const mumbarCandidates = ["unnamed (2).webp", "unnamed (2).jpg", "unnamed.webp", "public/dishes/mumbar.png"];
for (const cand of mumbarCandidates) {
  const p = path.join(process.cwd(), cand);
  if (fs.existsSync(p) && cand !== "public/dishes/mumbar.png") {
    fs.copyFileSync(p, path.join(process.cwd(), "public/dishes/mumbar.png"));
    console.log(`✓ Bound authentic Mumbar from ${cand}`);
    break;
  }
}

console.log("Assets successfully updated!");
