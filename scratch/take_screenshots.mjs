import puppeteer from "puppeteer";
import path from "path";

async function run() {
  const artifactDir = "/Users/mesa/.gemini/antigravity/brain/9f626f0d-ab17-4f91-9424-5af64a8a5880";
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // 1. Müşteri Menüsü Masaüstü
    await page.goto("http://localhost:3005?masa=08", { waitUntil: "networkidle2" });
    await page.waitForSelector("#btn-add-to-cart", { timeout: 10000 });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(artifactDir, "proof_menu_desktop.png") });
    console.log("Desktop menu screenshot taken.");

    // 2. Butona Tıklama ve Sepet Çekmecesini Açma
    await page.click("#btn-add-to-cart");
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(artifactDir, "proof_cart_drawer.png") });
    console.log("Cart drawer screenshot taken.");

    // 3. Mobil Görünüm
    await page.setViewport({ width: 390, height: 844 });
    await page.goto("http://localhost:3005?masa=08", { waitUntil: "networkidle2" });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(artifactDir, "proof_menu_mobile.png") });
    console.log("Mobile menu screenshot taken.");

    // 4. Kasa Terminali Görünümü
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto("http://localhost:3005/kasa", { waitUntil: "networkidle2" });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(artifactDir, "proof_kasa_terminal.png") });
    console.log("Kasa terminal screenshot taken.");

  } catch (err) {
    console.error("Screenshot error:", err);
  } finally {
    await browser.close();
  }
}

run();

