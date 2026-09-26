import https from "https";

https.get("https://berosrestaurant.com", { 
  headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" } 
}, (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => {
    const matches = data.match(/https?:\/\/[^\s"'()]+?\.(?:jpg|jpeg|png|webp)/gi) || [];
    const unique = [...new Set(matches)];
    console.log("Found images on berosrestaurant.com:", unique);
  });
}).on("error", (err) => console.error(err));
