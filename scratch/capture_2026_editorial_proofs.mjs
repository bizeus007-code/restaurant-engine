import puppeteer from "puppeteer";
import path from "path";

const artifactDir = "/Users/mesa/.gemini/antigravity/brain/9f626f0d-ab17-4f91-9424-5af64a8a5880";

async function captureProofs() {
  console.log("📸 BEROŞ 2026 RESTORAN SİSTEMİ EKRAN GÖRÜNTÜLERİ ALINIYOR...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  try {
    const page = await browser.newPage();

    // 1. Desktop - Hero & Header
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto("http://localhost:3005?masa=08", { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(artifactDir, "proof_2026_hero_and_header.png") });
    console.log("✓ 1. Hero & Header screenshot alındı.");

    // 2. Desktop - Editoryal Menü Vitrini (3 Kolonlu Grid)
    await page.evaluate(() => {
      document.getElementById("menu-section")?.scrollIntoView({ behavior: "instant" });
    });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(artifactDir, "proof_2026_editorial_grid_desktop.png") });
    console.log("✓ 2. Editoryal Menü Grid screenshot alındı.");

    // 3. Sepete Ekleme ve Sepet Çekmecesini Açma
    // İlk ürünün ekle butonuna bas
    const firstAddBtn = await page.$("button[id^='btn-add-to-cart-']");
    if (firstAddBtn) {
      await firstAddBtn.click();
      await new Promise((r) => setTimeout(r, 400));
    }
    // İkinci ürünün de ekle butonuna bas
    const allAddBtns = await page.$$("button[id^='btn-add-to-cart-']");
    if (allAddBtns.length > 1) {
      await allAddBtns[1].click();
      await new Promise((r) => setTimeout(r, 400));
    }

    // Sepet çekmecesini aç
    const openCartBtn = await page.$("#btn-open-cart-floating") || await page.$("#btn-open-cart-header");
    if (openCartBtn) {
      await openCartBtn.click();
      await new Promise((r) => setTimeout(r, 800));
      await page.screenshot({ path: path.join(artifactDir, "proof_2026_cart_drawer.png") });
      console.log("✓ 3. Sepet Çekmecesi screenshot alındı.");
    }

    // Sepeti kapat
    await page.keyboard.press("Escape");
    await new Promise((r) => setTimeout(r, 500));

    // 4. Garson Çağır / Servis Modalı
    const waiterBtn = await page.$("#btn-call-waiter");
    if (waiterBtn) {
      await waiterBtn.click();
      await new Promise((r) => setTimeout(r, 800));
      await page.screenshot({ path: path.join(artifactDir, "proof_2026_waiter_call_modal.png") });
      console.log("✓ 4. Garson Çağrı & Cooldown Modalı screenshot alındı.");
    }

    // Modalı kapat
    await page.keyboard.press("Escape");
    await new Promise((r) => setTimeout(r, 500));

    // 5. Tarihi Konak & Google Review Bölümü
    await page.evaluate(() => {
      document.getElementById("konak-section")?.scrollIntoView({ behavior: "instant" });
    });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(artifactDir, "proof_2026_konak_and_google_review.png") });
    console.log("✓ 5. Tarihi Konak & Google Review screenshot alındı.");

    // 6. Mobil Görünüm (iPhone 14 / Pro Boyutu)
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto("http://localhost:3005?masa=08", { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1000));
    // Menüye kaydır
    await page.evaluate(() => {
      document.getElementById("menu-section")?.scrollIntoView({ behavior: "instant" });
    });
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(artifactDir, "proof_2026_mobile_view.png") });
    console.log("✓ 6. Mobil Editoryal Menü screenshot alındı.");

    // 7. Kasa Terminali (/kasa)
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto("http://localhost:3005/kasa", { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(artifactDir, "proof_2026_kasa_terminal.png") });
    console.log("✓ 7. Kasa Yönetim Terminali screenshot alındı.");

    console.log("🎉 TÜM EKRAN GÖRÜNTÜLERİ BAŞARIYLA OLUŞTURULDU!");
  } catch (err) {
    console.error("Screenshot hatası:", err);
  } finally {
    await browser.close();
  }
}

captureProofs();

