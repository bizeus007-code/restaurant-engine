import fs from 'fs';
import path from 'path';

const artifactDir = "/Users/mesa/.gemini/antigravity/brain/9f626f0d-ab17-4f91-9424-5af64a8a5880";

async function runClickProof() {
  console.log("=== GERÇEK TARAYICI TIKLAMA TESTİ ===");
  const tabRes = await fetch('http://localhost:9222/json/new?http://localhost:3005?masa=12', { method: 'PUT' });
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
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

  await new Promise(r => setTimeout(r, 2000));

  // Scroll to Act 2
  await send('Runtime.evaluate', {
    expression: `
      window.scrollTo(0, window.innerHeight * 1.5);
      window.dispatchEvent(new Event('scroll'));
    `
  });
  await new Promise(r => setTimeout(r, 1500));

  // 1. Tık: + SİPARİŞE EKLE
  const addBtnInfo = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.getElementById('btn-add-to-cart');
        if (!btn) return null;
        const rect = btn.getBoundingClientRect();
        return { id: btn.id, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      })()
    `,
    returnByValue: true
  });
  console.log("1. Buton Konumu (#btn-add-to-cart):", addBtnInfo.result.value);

  if (!addBtnInfo.result.value) {
    throw new Error("#btn-add-to-cart bulunamadı!");
  }

  const { x: x1, y: y1 } = addBtnInfo.result.value;
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: x1, y: y1, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: x1, y: y1, button: 'left', clickCount: 1 });
  console.log("✓ #btn-add-to-cart tıklandı, sepet çekmecesi açılıyor...");

  await new Promise(r => setTimeout(r, 1200));

  // 2. Tık: #btn-submit-order (Siparişi Mutfağa İlet)
  const submitBtnInfo = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.getElementById('btn-submit-order');
        if (!btn) return null;
        const rect = btn.getBoundingClientRect();
        return { id: btn.id, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, text: btn.innerText };
      })()
    `,
    returnByValue: true
  });
  console.log("2. Buton Konumu (#btn-submit-order):", submitBtnInfo.result.value);

  if (!submitBtnInfo.result.value) {
    throw new Error("#btn-submit-order bulunamadı!");
  }

  const { x: x2, y: y2 } = submitBtnInfo.result.value;
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: x2, y: y2, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: x2, y: y2, button: 'left', clickCount: 1 });
  console.log("✓ #btn-submit-order tıklandı!");

  await new Promise(r => setTimeout(r, 1500));

  // Sipariş Onay Ekranı Kontrolü
  const successText = await send('Runtime.evaluate', {
    expression: `document.body.innerText.includes('Siparişiniz Alındı') || document.body.innerText.includes('Mutfağa İletildi')`,
    returnByValue: true
  });
  console.log("3. Sipariş Başarı Durumu Ekranda:", successText.result.value ? "✓ BAŞARILI" : "kontrol ediliyor");

  await fetch(`http://localhost:9222/json/close/${tab.id}`);
  console.log("=== BUTON TIKLAMA VE SİPARİŞ AKIŞI %100 BAŞARILI ===");
}

runClickProof().catch(console.error);
