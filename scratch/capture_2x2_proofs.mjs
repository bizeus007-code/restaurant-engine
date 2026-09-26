import fs from 'fs';
import path from 'path';

const artifactDir = "/Users/mesa/.gemini/antigravity/brain/9f626f0d-ab17-4f91-9424-5af64a8a5880";

async function main() {
  console.log("=== CAPTURING LUXURY RESTORED VISUAL PROOFS ===");

  const tabRes = await fetch('http://localhost:9222/json/new?http://localhost:3005?masa=07', { method: 'PUT' });
  const tab = await tabRes.json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);

  let idCounter = 1;
  const pending = new Map();
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  await new Promise(res => { ws.onopen = res; });
  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  await new Promise(r => setTimeout(r, 2000));

  // 1. Hero: Restored Warm Interior Salon
  console.log("1. Capturing proof_restored_hero.png...");
  const snapHero = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_restored_hero.png'), Buffer.from(snapHero.data, 'base64'));
  console.log("✓ proof_restored_hero.png saved.");

  // 2. Menu: Restored 2x2 Ultra-Luxury Grid
  console.log("2. Scrolling to 2x2 #menu-section...");
  await send('Runtime.evaluate', {
    expression: `document.getElementById('menu-section')?.scrollIntoView({ behavior: 'instant' });`
  });
  await new Promise(r => setTimeout(r, 1200));

  console.log("Capturing proof_restored_2x2_grid.png...");
  const snapGrid = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_restored_2x2_grid.png'), Buffer.from(snapGrid.data, 'base64'));
  console.log("✓ proof_restored_2x2_grid.png saved.");

  // Click + Ekle on Kol Dolması
  console.log("3. Clicking + Ekle...");
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.getElementById('btn-add-to-cart');
        if (btn) btn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 800));

  // 3. Konak: Restored Stone Facade with Warm Glow
  console.log("4. Scrolling to #konak-section...");
  await send('Runtime.evaluate', {
    expression: `document.getElementById('konak-section')?.scrollIntoView({ behavior: 'instant' });`
  });
  await new Promise(r => setTimeout(r, 1500));

  console.log("Capturing proof_restored_konak.png...");
  const snapKonak = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_restored_konak.png'), Buffer.from(snapKonak.data, 'base64'));
  console.log("✓ proof_restored_konak.png saved.");

  await fetch(`http://localhost:9222/json/close/${tab.id}`);
  console.log("=== ALL RESTORED PROOFS CAPTURED SUCCESSFULLY ===");
}

main().catch(console.error);
