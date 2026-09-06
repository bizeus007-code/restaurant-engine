import fs from "fs";

const current = fs.readFileSync("app/page.tsx", "utf8");

// 1. Ensure Lucide icons: Bell, Star, Wifi are imported
let updated = current;
if (!updated.includes("Bell,") && !updated.includes("Bell }")) {
  updated = updated.replace(
    "import {\n  Plus,",
    "import {\n  Plus,\n  Bell,\n  Star,\n  Wifi,"
  );
}

// 2. Add RESTAURANT_CONFIG right before MenuItem
const configCode = `const RESTAURANT_CONFIG = {
  name: "Beroş Restaurant",
  phone: "05386976353",
  whatsappNumber: "905386976353",
  googleMapsReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJW2u_01vAakARv5w4_xKxGqM",
  instagramUrl: "https://instagram.com/berosrestoran",
  mapsDirectionUrl: "https://maps.google.com/?q=Bero%C5%9F+Restaurant+Sur+Diyarbak%C4%B1r",
  wifiName: "Beros_Misafir",
  wifiPass: "beros1982",
  address: "Camii Nebi Mah. İnönü Cad. No: 12 Sur / Diyarbakır"
};

`;

if (!updated.includes("RESTAURANT_CONFIG")) {
  updated = updated.replace("interface MenuItem {", configCode + "interface MenuItem {");
}

fs.writeFileSync("app/page.tsx", updated, "utf8");
console.log("Config added!");
