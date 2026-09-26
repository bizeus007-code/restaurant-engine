import fs from "fs";
import path from "path";
import https from "https";

const targetDir = path.join(process.cwd(), "public", "dishes");

function download(url, filename) {
  return new Promise((resolve, reject) => {
    const dest = path.join(targetDir, filename);
    const file = fs.createWriteStream(dest);
    function get(u, count = 0) {
      if (count > 5) {
        file.close();
        return reject(new Error("Too many redirects"));
      }
      https.get(u, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          get(res.headers.location, count + 1);
        } else if (res.statusCode === 200) {
          res.pipe(file);
          file.on("finish", () => {
            file.close();
            console.log(`Downloaded ${filename} (${fs.statSync(dest).size} bytes)`);
            resolve();
          });
        } else {
          file.close();
          reject(new Error(`HTTP ${res.statusCode} for ${u}`));
        }
      }).on("error", (err) => {
        file.close();
        reject(err);
      });
    }
    get(url);
  });
}

async function main() {
  console.log("Downloading accurate photos...");
  // Dondurma: authentic scoops of artisan ice cream
  const dondurmaUrl = "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=900&auto=format&fit=crop&q=80";
  // Sac Tava: sizzling skillet / sautéed meat
  // Let's also check if there's an even better skillet meat photo:
  // photo-1544025162-d76694265947 or photo-1534422298391-e4f8c172dddb
  const sacTavaUrl = "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80";

  await download(dondurmaUrl, "dondurma-top.png");
  await download(sacTavaUrl, "sac-tava.png");
  console.log("Done downloading accurate photos.");
}

main().catch(console.error);

