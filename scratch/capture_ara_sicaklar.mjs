import fs from 'fs';
import path from 'path';

const artifactDir = "/Users/mesa/.gemini/antigravity/brain/9f626f0d-ab17-4f91-9424-5af64a8a5880";

async function main() {
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

  // Scroll to menu-section
  await send('Runtime.evaluate', {
    expression: `document.getElementById('menu-section')?.scrollIntoView({ behavior: 'instant' });`
  });
  await new Promise(r => setTimeout(r, 800));

  // Click on "ARA SICAKLAR" category button
  console.log("Clicking Ara Sıcaklar category...");
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.getElementById('cat-btn-ara-sicak');
        if (btn) btn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1200));

  console.log("Capturing proof_mumbar_grid.png...");
  const snap = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_mumbar_grid.png'), Buffer.from(snap.data, 'base64'));
  console.log("✓ proof_mumbar_grid.png saved.");

  await fetch(`http://localhost:9222/json/close/${tab.id}`);
}

main().catch(console.error);
