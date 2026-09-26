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
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });

  await new Promise(r => setTimeout(r, 2000));

  // Scroll to menu-section
  await send('Runtime.evaluate', {
    expression: `document.getElementById('menu-section')?.scrollIntoView({ behavior: 'instant' });`
  });
  await new Promise(r => setTimeout(r, 1000));

  console.log("Capturing proof_restored_mobile_grid.png...");
  const snap = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_restored_mobile_grid.png'), Buffer.from(snap.data, 'base64'));
  console.log("✓ proof_restored_mobile_grid.png saved.");

  await fetch(`http://localhost:9222/json/close/${tab.id}`);
}

main().catch(console.error);
