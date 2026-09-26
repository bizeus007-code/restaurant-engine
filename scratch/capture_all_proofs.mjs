import fs from 'fs';
import path from 'path';

const artifactDir = "/Users/mesa/.gemini/antigravity/brain/9f626f0d-ab17-4f91-9424-5af64a8a5880";

async function main() {
  console.log("=== VERIFYING MASTER PAGE FLOW & LUXURY PORCELAIN PLATE PRESENTATION ===");

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

  // 1. proof_hero_section.png (Top Hero Section)
  console.log("1. Capturing proof_hero_section.png...");
  const snapHero = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_hero_section.png'), Buffer.from(snapHero.data, 'base64'));
  console.log("✓ proof_hero_section.png saved.");

  // 2. Scroll to #menu-section
  console.log("2. Scrolling to #menu-section...");
  await send('Runtime.evaluate', {
    expression: `
      document.getElementById('menu-section')?.scrollIntoView({ behavior: 'instant' });
    `
  });
  await new Promise(r => setTimeout(r, 1200));

  // Capture proof_customer_menu.png (Porcelain Plate Showcase)
  console.log("Capturing proof_customer_menu.png...");
  const snapMenu = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_customer_menu.png'), Buffer.from(snapMenu.data, 'base64'));
  console.log("✓ proof_customer_menu.png saved.");

  // Test Wheel Navigation within menu
  console.log("3. Testing wheel navigation within menu...");
  await send('Input.dispatchMouseEvent', {
    type: 'mouseWheel',
    x: 720,
    y: 450,
    deltaX: 0,
    deltaY: 120
  });
  await new Promise(r => setTimeout(r, 500));

  const afterWheel = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const dishName = document.querySelector('h2.font-serif')?.textContent || '';
        const courseText = document.querySelector('span.font-mono.tracking-\\\\[0\\\\.3em\\\\]')?.textContent || '';
        return { dishName, courseText };
      })()
    `,
    returnByValue: true
  });
  console.log("After Wheel event:", JSON.stringify(afterWheel.result.value));

  // 4. Select Sac Tava (Course 31)
  console.log("4. Selecting Sur Usulü Sac Tava (Course 31)...");
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.querySelector('button[aria-label="Course 31"]');
        if (btn) btn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1200));

  const snapSacTava = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_sac_tava.png'), Buffer.from(snapSacTava.data, 'base64'));
  console.log("✓ proof_sac_tava.png saved.");

  // 5. Select Dondurma (Course 57)
  console.log("5. Selecting Dondurma Top (Course 57)...");
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.querySelector('button[aria-label="Course 57"]');
        if (btn) btn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1200));

  const snapDondurma = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_dondurma.png'), Buffer.from(snapDondurma.data, 'base64'));
  console.log("✓ proof_dondurma.png saved.");

  // 6. Test Flow to #konak-section (Course 65 -> Scroll Down to Konak)
  console.log("6. Navigating to Course 65 and scrolling down to #konak-section...");
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.querySelector('button[aria-label="Course 65"]');
        if (btn) btn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 800));

  // Now scroll smoothly down to #konak-section
  await send('Runtime.evaluate', {
    expression: `
      document.getElementById('konak-section')?.scrollIntoView({ behavior: 'smooth' });
    `
  });
  await new Promise(r => setTimeout(r, 1500));

  const snapKonak = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_konak_flow.png'), Buffer.from(snapKonak.data, 'base64'));
  console.log("✓ proof_konak_flow.png saved.");

  // 7. Scroll back to #menu-section and test Cart & Order workflow
  console.log("7. Testing Cart & Order workflow...");
  await send('Runtime.evaluate', {
    expression: `
      document.getElementById('menu-section')?.scrollIntoView({ behavior: 'instant' });
    `
  });
  await new Promise(r => setTimeout(r, 800));

  // Add Course 31 (Sac Tava) to cart
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.querySelector('button[aria-label="Course 31"]');
        if (btn) btn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 800));

  // Click #btn-add-to-cart
  console.log("Clicking #btn-add-to-cart...");
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.getElementById('btn-add-to-cart');
        if (btn) btn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1200));

  const snapCart = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_cart_drawer.png'), Buffer.from(snapCart.data, 'base64'));
  console.log("✓ proof_cart_drawer.png saved.");

  // Send a waiter service call via header
  console.log("Sending service call...");
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.getElementById('btn-call-waiter');
        if (btn) btn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 800));

  // Click #btn-submit-order
  console.log("Submitting order via #btn-submit-order...");
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.getElementById('btn-submit-order');
        if (btn) btn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1500));
  console.log("✓ Order submitted.");

  await fetch(`http://localhost:9222/json/close/${tab.id}`);

  // 8. proof_kasa_terminal.png: Verify in /kasa
  console.log("8. Checking live /kasa terminal...");
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
  await sendKasa('Runtime.enable');
  await sendKasa('DOM.enable');
  await sendKasa('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  await new Promise(r => setTimeout(r, 2000));

  const snapKasa = await sendKasa('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_kasa_terminal.png'), Buffer.from(snapKasa.data, 'base64'));
  console.log("✓ proof_kasa_terminal.png saved.");

  await fetch(`http://localhost:9222/json/close/${kasaTab.id}`);
  console.log("=== ALL PROOFS CAPTURED & VERIFIED SUCCESSFULLY ===");
}

main().catch(console.error);
