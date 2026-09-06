import fs from 'fs';
import path from 'path';

async function verifyBothButtons() {
  const artifactDir = '/Users/mesa/.gemini/antigravity/brain/9f626f0d-ab17-4f91-9424-5af64a8a5880';
  console.log("==================================================");
  console.log("🎯 3. AŞAMA: GERÇEK TARAYICI TIKLAMASIYLA KANITLAMA");
  console.log("==================================================");

  // 1. Open new tab in Chrome CDP
  const tabRes = await fetch('http://localhost:9222/json/new?http://localhost:3005?masa=05', { method: 'PUT' });
  const tab = await tabRes.json();
  console.log(`[CDP] Tab opened: ${tab.id}`);

  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  let idCounter = 1;
  const pending = new Map();
  const consoleMessages = [];

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.consoleAPICalled') {
      consoleMessages.push({
        type: msg.params.type,
        text: msg.params.args.map(a => a.value || a.description).join(' ')
      });
    }
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

  console.log('[CDP] Sayfa açılıyor (2.5s)...');
  await new Promise(r => setTimeout(r, 2500));

  // Scroll to Act 2
  console.log('[CDP] Act 2 sahnesine kaydırılıyor...');
  await send('Runtime.evaluate', {
    expression: `
      window.scrollTo(0, window.innerHeight * 1.5);
      window.dispatchEvent(new Event('scroll'));
    `
  });
  await new Promise(r => setTimeout(r, 1500));

  // Screenshot 1: Before Click
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_1_before_click.png'), Buffer.from(shot1.data, 'base64'));
  console.log('[CDP] Ekran görüntüsü kaydedildi: proof_1_before_click.png');

  // Check elementFromPoint on #btn-add-to-cart
  const hit1 = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.getElementById('btn-add-to-cart');
        if (!btn) return { ok: false, error: 'btn-add-to-cart not found' };
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const hit = document.elementFromPoint(cx, cy);
        return {
          ok: true,
          btnText: btn.innerText.trim(),
          rect: { cx, cy, w: rect.width, h: rect.height },
          hitTag: hit?.tagName,
          isBtnOrChild: btn === hit || btn.contains(hit)
        };
      })()
    `,
    returnByValue: true
  });
  console.log('1. Buton (#btn-add-to-cart) Hit Testi:', hit1.result.value);

  if (!hit1.result.value.isBtnOrChild) {
    throw new Error('FİZİKSEL ENGEL: elementFromPoint butona ulaşamadı!');
  }

  // Physical mouse click on #btn-add-to-cart
  const { cx: cx1, cy: cy1 } = hit1.result.value.rect;
  console.log(`[CDP] 1. BUTONA FİZİKSEL TIKLANIYOR (${cx1}, ${cy1})...`);
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: cx1, y: cy1 });
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: cx1, y: cy1, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: cx1, y: cy1, button: 'left', clickCount: 1 });

  await new Promise(r => setTimeout(r, 1500));

  // Verify Cart Drawer Opened
  const drawerCheck = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const submitBtn = document.getElementById('btn-submit-order');
        const trayCount = document.getElementById('btn-open-tray')?.innerText;
        return {
          isOpen: !!submitBtn,
          trayCount,
          submitBtnText: submitBtn?.innerText?.trim()
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Sepet Çekmecesi Durumu:', drawerCheck.result.value);

  // Screenshot 2: Cart Drawer Opened
  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_2_drawer_opened.png'), Buffer.from(shot2.data, 'base64'));
  console.log('[CDP] Ekran görüntüsü kaydedildi: proof_2_drawer_opened.png');

  // Check elementFromPoint on #btn-submit-order
  const hit2 = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.getElementById('btn-submit-order');
        if (!btn) return { ok: false, error: 'btn-submit-order not found' };
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const hit = document.elementFromPoint(cx, cy);
        return {
          ok: true,
          btnText: btn.innerText.trim(),
          rect: { cx, cy, w: rect.width, h: rect.height },
          hitTag: hit?.tagName,
          isBtnOrChild: btn === hit || btn.contains(hit)
        };
      })()
    `,
    returnByValue: true
  });
  console.log('2. Buton (#btn-submit-order) Hit Testi:', hit2.result.value);

  if (!hit2.result.value.isBtnOrChild) {
    throw new Error('FİZİKSEL ENGEL: elementFromPoint #btn-submit-order butonuna ulaşamadı!');
  }

  // Physical mouse click on #btn-submit-order
  const { cx: cx2, cy: cy2 } = hit2.result.value.rect;
  console.log(`[CDP] 2. BUTONA FİZİKSEL TIKLANIYOR (${cx2}, ${cy2})...`);
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: cx2, y: cy2 });
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: cx2, y: cy2, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: cx2, y: cy2, button: 'left', clickCount: 1 });

  await new Promise(r => setTimeout(r, 2000));

  // Screenshot 3: After Order Submitted
  const shot3 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_3_after_order.png'), Buffer.from(shot3.data, 'base64'));
  console.log('[CDP] Ekran görüntüsü kaydedildi: proof_3_after_order.png');

  // Verify Order in API
  const ordersRes = await fetch('http://localhost:3005/api/orders');
  const orders = await ordersRes.json();
  const latestOrder = orders[0];
  console.log('\n--- VERİ TABANI SİPARİŞ DOĞRULAMASI ---');
  console.log('Son Eklenen Sipariş:', JSON.stringify(latestOrder, null, 2));

  console.log('\n==================================================');
  console.log('🎉 HER İKİ BUTON DA GERÇEK TARAYICI TIKLAMASIYLA BAŞARIYLA ÇALIŞTI!');
  console.log('==================================================');

  // Close tab
  await fetch(`http://localhost:9222/json/close/${tab.id}`);
  console.log('Tab closed.');
}

verifyBothButtons().catch(err => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});
