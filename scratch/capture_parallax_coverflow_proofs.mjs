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

async function captureNewComponents() {
  console.log("📸 PARALLAX & 3D COVERFLOW CDP TESTİ...");

  const tabRes = await fetch("http://localhost:9222/json/new?http://localhost:3005?masa=07", { method: "PUT" });
  const tab = await tabRes.json();
  const cdp = new CdpSession(tab);
  await cdp.init();

  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  await new Promise((r) => setTimeout(r, 2000));

  // 1. Parallax Giriş - Katman 1 (Dış Kapı) ve Katman 2 (Tipografi)
  await cdp.screenshot("proof_parallax_layer1_exterior.png");

  // 2. Parallax Aşağı Kaydırma - Katman 3 (İç Mekan) ve Katman 4 (Masa 07 & Keşfet Butonu)
  await cdp.send("Runtime.evaluate", {
    expression: `
      window.scrollTo(0, window.innerHeight * 1.2);
      window.dispatchEvent(new Event('scroll'));
    `
  });
  await new Promise((r) => setTimeout(r, 1500));
  await cdp.screenshot("proof_parallax_layer3_interior.png");

  // 3. 3D Coverflow Bölümüne Kaydır
  await cdp.send("Runtime.evaluate", {
    expression: `
      document.getElementById('coverflow-section')?.scrollIntoView({ behavior: 'instant' });
      window.dispatchEvent(new Event('scroll'));
    `
  });
  await new Promise((r) => setTimeout(r, 1200));
  await cdp.screenshot("proof_3d_coverflow_carousel.png");

  // 4. Coverflow'da Next butonuna tıkla ve bir yemeği sepete ekle
  await cdp.send("Runtime.evaluate", {
    expression: `
      (() => {
        const nextBtn = document.querySelector("#coverflow-section button[aria-label='Sonraki Lezzet']");
        if (nextBtn) nextBtn.click();
      })()
    `
  });
  await new Promise((r) => setTimeout(r, 800));

  // Sepete ekle butonuna tıkla
  await cdp.send("Runtime.evaluate", {
    expression: `
      (() => {
        const addBtn = document.querySelector("button[id^='btn-coverflow-add-']");
        if (addBtn) addBtn.click();
      })()
    `
  });
  await new Promise((r) => setTimeout(r, 800));
  await cdp.screenshot("proof_3d_coverflow_active_added.png");

  await cdp.close();
  console.log("🎉 TÜM PARALLAX VE COVERFLOW ÇEKİMLERİ TAMAMLANDI!");
}

captureNewComponents().catch(console.error);

