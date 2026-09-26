import fs from "fs";
import https from "https";

const url = "https://upload.wikimedia.org/wikipedia/commons/6/63/Mumbar.jpg";
const dest = "scratch/cand_mumbar.jpg";
const f = fs.createWriteStream(dest);

https.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } }, (res) => {
  if (res.statusCode === 200) {
    res.pipe(f);
    f.on("finish", () => {
      f.close();
      console.log("Downloaded cand_mumbar.jpg:", fs.statSync(dest).size);
    });
  } else {
    console.log("Status:", res.statusCode);
  }
}).on("error", (e) => console.error(e));
