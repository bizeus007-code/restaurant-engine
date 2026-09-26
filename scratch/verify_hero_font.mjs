import fs from 'fs';
import path from 'path';

async function verifyFont() {
  const artifactDir = '/Users/mesa/.gemini/antigravity/brain/d30812b2-0151-48db-b862-43bf318e2411';
  
  // 1. Open tab
  const tabRes = await fetch('http://localhost:9222/json/new?http://localhost:3006', { method: 'PUT' });
  const tab = await tabRes.json();
  console.log(`[CDP] Tab created: ${tab.id}`);

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

  await new Promise(r => { ws.onopen = r; });
  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 2,
    mobile: false
  });

  console.log('Sayfa yükleniyor (3.5s)...');
  await new Promise(r => setTimeout(r, 3500));

  // Check computed font of the LOQUM ET span
  const fontEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const h1 = document.querySelector('h1');
      const span = h1 ? h1.querySelector('span') : null;
      if (!span) return { error: 'span not found' };
      const computed = window.getComputedStyle(span);
      return {
        text: span.textContent.trim(),
        fontFamily: computed.fontFamily,
        fontStyle: computed.fontStyle,
        fontWeight: computed.fontWeight,
        className: span.className
      };
    })()`,
    returnByValue: true
  });
  console.log('Font Evaluation:', fontEval.result.value);

  // Take screenshot
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const shotPath = path.join(artifactDir, 'proof_hero_title_font.png');
  fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
  console.log('✓ Screenshot saved to:', shotPath);

  ws.close();
  await fetch(`http://localhost:9222/json/close/${tab.id}`);
}

verifyFont().catch(console.error);

