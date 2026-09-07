import fs from 'fs';
import path from 'path';

const artifactDir = "/Users/mesa/.gemini/antigravity/brain/9f626f0d-ab17-4f91-9424-5af64a8a5880";

async function cdpTest() {
  console.log("Starting CDP visual verification...");

  // 1. Müşteri Menüsü Testi
  const tabRes = await fetch('http://localhost:9222/json/new?http://localhost:3005?masa=08', { method: 'PUT' });
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

  // Scroll to Act 2
  await send('Runtime.evaluate', {
    expression: `
      window.scrollTo(0, window.innerHeight * 1.5);
      window.dispatchEvent(new Event('scroll'));
    `
  });
  await new Promise(r => setTimeout(r, 1500));

  // Screenshot 1: Desktop Menu Stage
  const snap1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_customer_menu.png'), Buffer.from(snap1.data, 'base64'));
  console.log("Saved proof_customer_menu.png");

  // Click #btn-add-to-cart
  const btnPos = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.getElementById('btn-add-to-cart');
        if (!btn) return null;
        const rect = btn.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      })()
    `,
    returnByValue: true
  });

  if (btnPos.result.value) {
    const { x, y } = btnPos.result.value;
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
    await new Promise(r => setTimeout(r, 1200));

    // Screenshot 2: Cart Drawer Opened
    const snap2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'proof_cart_drawer.png'), Buffer.from(snap2.data, 'base64'));
    console.log("Saved proof_cart_drawer.png");
  }

  // Close tab
  await fetch(`http://localhost:9222/json/close/${tab.id}`);

  // 2. Kasa Terminali Testi
  const kasaTabRes = await fetch('http://localhost:9222/json/new?http://localhost:3005/kasa', { method: 'PUT' });
  const kasaTab = await kasaTabRes.json();
  const kasaWs = new WebSocket(kasaTab.webSocketDebuggerUrl);

  let kasaId = 1;
  const kasaPending = new Map();
  function sendKasa(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = kasaId++;
      kasaPending.set(id, { resolve, reject });
      kasaWs.send(JSON.stringify({ id, method, params }));
    });
  }

  kasaWs.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && kasaPending.has(msg.id)) {
      const { resolve, reject } = kasaPending.get(msg.id);
      kasaPending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  await new Promise(res => { kasaWs.onopen = res; });
  await sendKasa('Page.enable');
  await sendKasa('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  await new Promise(r => setTimeout(r, 2000));
  const snap3 = await sendKasa('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_kasa_terminal.png'), Buffer.from(snap3.data, 'base64'));
  console.log("Saved proof_kasa_terminal.png");

  await fetch(`http://localhost:9222/json/close/${kasaTab.id}`);
  console.log("All screenshots successfully captured!");
}

cdpTest().catch(console.error);

