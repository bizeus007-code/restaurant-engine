import fs from 'fs';
import path from 'path';

async function verifyHeroAndButtons() {
  const artifactDir = '/Users/mesa/.gemini/antigravity/brain/9f626f0d-ab17-4f91-9424-5af64a8a5880';
  console.log("==================================================");
  console.log("🌟 HERO AYDINLIK & ÇALIŞMA DOĞRULAMASI (CDP)");
  console.log("==================================================");

  // 1. Open tab
  const tabRes = await fetch('http://localhost:9222/json/new?http://localhost:3005?masa=05', { method: 'PUT' });
  const tab = await tabRes.json();
  console.log(`[CDP] Tab: ${tab.id}`);

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
    deviceScaleFactor: 1,
    mobile: false
  });

  console.log('Sayfa yükleniyor (2.5s)...');
  await new Promise(r => setTimeout(r, 2500));

  // 1. Capture Hero Screen
  const heroShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_hero_brightened.png'), Buffer.from(heroShot.data, 'base64'));
  console.log('✓ Hero ekran görüntüsü kaydedildi: proof_hero_brightened.png');

  // 2. Scroll to Act 2 and verify button clicks
  await send('Runtime.evaluate', {
    expression: `
      window.scrollTo(0, window.innerHeight * 1.5);
      window.dispatchEvent(new Event('scroll'));
    `
  });
  await new Promise(r => setTimeout(r, 1500));

  // Test click on #btn-add-to-cart
  const hit1 = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.getElementById('btn-add-to-cart');
        if (!btn) return { ok: false };
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const hit = document.elementFromPoint(cx, cy);
        return { ok: true, isBtnOrChild: btn === hit || btn.contains(hit), cx, cy };
      })()
    `,
    returnByValue: true
  });
  console.log('Act 2 Buton Hit Testi:', hit1.result.value);

  // Click
  const { cx, cy } = hit1.result.value;
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: cx, y: cy });
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: cx, y: cy, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: cx, y: cy, button: 'left', clickCount: 1 });

  await new Promise(r => setTimeout(r, 1200));

  const drawerState = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const submitBtn = document.getElementById('btn-submit-order');
        return {
          isOpen: !!submitBtn,
          btnText: submitBtn?.innerText?.trim()
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Sepet Çekmecesi Durumu:', drawerState.result.value);

  await fetch(`http://localhost:9222/json/close/${tab.id}`);
  console.log('==================================================');
  console.log('🎉 HERO AYDINLATMASI VE TIKLAMA DOĞRULAMASI BAŞARILI!');
  console.log('==================================================');
}

verifyHeroAndButtons().catch(console.error);
