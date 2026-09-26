import fs from "fs";
import path from "path";

const artifactDir = "/Users/mesa/.gemini/antigravity/brain/9f626f0d-ab17-4f91-9424-5af64a8a5880";

class CdpSession {
  constructor(tab) {
    this.tab = tab;
    this.ws = new WebSocket(tab.webSocketDebuggerUrl);
    this.idCounter = 1;
    this.pending = new Map();

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
  }

  async init() {
    await new Promise((res) => {
      this.ws.onopen = res;
    });
    await this.send("Page.enable");
    await this.send("Runtime.enable");
    await this.send("DOM.enable");
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.idCounter++;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async screenshot(fileName) {
    const snap = await this.send("Page.captureScreenshot", { format: "png" });
    const fullPath = path.join(artifactDir, fileName);
    fs.writeFileSync(fullPath, Buffer.from(snap.data, "base64"));
    console.log(`✓ Screenshot kaydedildi: ${fileName}`);
  }

  async close() {
    try {
      this.ws.close();
      await fetch(`http://localhost:9222/json/close/${this.tab.id}`);
    } catch {}
  }
}

async function captureModalAndKonak() {
  console.log("📸 BEROŞ 2026 - MODAL VE KONAK ÇEKİMLERİ...");

  // 1. Waiter Call Modal Tab
  const tabRes1 = await fetch("http://localhost:9222/json/new?http://localhost:3005?masa=08", { method: "PUT" });
  const tab1 = await tabRes1.json();
  const cdp1 = new CdpSession(tab1);
  await cdp1.init();

  await cdp1.send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });
  await new Promise((r) => setTimeout(r, 2000));

  // Garson butonuna tıkla
  await cdp1.send("Runtime.evaluate", {
    expression: `document.getElementById('btn-call-waiter')?.click()`
  });
  await new Promise((r) => setTimeout(r, 1000));
  await cdp1.screenshot("proof_2026_waiter_call_modal.png");
  await cdp1.close();

  // 2. Product Detail Modal Tab (Kart tıklandığında açılan detay)
  const tabRes2 = await fetch("http://localhost:9222/json/new?http://localhost:3005?masa=08", { method: "PUT" });
  const tab2 = await tabRes2.json();
  const cdp2 = new CdpSession(tab2);
  await cdp2.init();

  await cdp2.send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });
  await new Promise((r) => setTimeout(r, 2000));

  // Menüye kaydır ve fotoğraflı bir yemeğe tıkla
  await cdp2.send("Runtime.evaluate", {
    expression: `
      document.getElementById('menu-section')?.scrollIntoView({ behavior: 'instant' });
      window.dispatchEvent(new Event('scroll'));
    `
  });
  await new Promise((r) => setTimeout(r, 1000));

  // İlk karta tıkla (kart gövdesine)
  await cdp2.send("Runtime.evaluate", {
    expression: `
      const cards = document.querySelectorAll("#menu-section .group");
      if (cards.length > 3) {
        cards[3].click(); // Fotoğraflı lezzet (Fırın Kebabı)
      } else if (cards.length > 0) {
        cards[0].click();
      }
    `
  });
  await new Promise((r) => setTimeout(r, 1000));
  await cdp2.screenshot("proof_2026_product_detail_modal.png");
  await cdp2.close();

  // 3. Konak ve Google Review Tab
  const tabRes3 = await fetch("http://localhost:9222/json/new?http://localhost:3005?masa=08", { method: "PUT" });
  const tab3 = await tabRes3.json();
  const cdp3 = new CdpSession(tab3);
  await cdp3.init();

  await cdp3.send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });
  await new Promise((r) => setTimeout(r, 2000));

  // Konak bölümüne kaydır
  await cdp3.send("Runtime.evaluate", {
    expression: `
      document.getElementById('konak-section')?.scrollIntoView({ behavior: 'instant' });
      window.dispatchEvent(new Event('scroll'));
    `
  });
  await new Promise((r) => setTimeout(r, 1200));
  await cdp3.screenshot("proof_2026_konak_and_google_review.png");
  await cdp3.close();

  console.log("🎉 MODAL VE KONAK ÇEKİMLERİ TAMAMLANDI!");
}

captureModalAndKonak().catch(console.error);

