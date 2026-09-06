import fs from 'fs';
import path from 'path';

async function diagnose() {
  console.log("==================================================");
  console.log("🔬 1. AŞAMA: KÖK NEDEN TESPİTİ (FORENSIC DIAGNOSIS)");
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
    if (msg.method === 'Runtime.exceptionThrown') {
      consoleMessages.push({
        type: 'EXCEPTION',
        text: msg.params.exceptionDetails.text + ' ' + (msg.params.exceptionDetails.exception?.description || '')
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

  console.log('[CDP] Sayfa yükleniyor (2.5s)...');
  await new Promise(r => setTimeout(r, 2500));

  // Scroll to Act 2 (350vh container: 0.35 - 0.5 is Act 2)
  console.log('[CDP] Act 2 Menü Sahnesine kaydırılıyor...');
  await send('Runtime.evaluate', {
    expression: `
      window.scrollTo(0, window.innerHeight * 1.5);
      window.dispatchEvent(new Event('scroll'));
    `
  });
  await new Promise(r => setTimeout(r, 1500));

  // Diagnose Button Coordinates and elementFromPoint
  const diagResult = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.getElementById('btn-add-to-cart');
        if (!btn) {
          return { error: 'Buton (#btn-add-to-cart) DOM üzerinde bulunamadı!' };
        }

        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const hitElement = document.elementFromPoint(centerX, centerY);
        const computedBtn = window.getComputedStyle(btn);
        
        let hitInfo = null;
        if (hitElement) {
          const computedHit = window.getComputedStyle(hitElement);
          hitInfo = {
            tagName: hitElement.tagName,
            id: hitElement.id,
            className: hitElement.className,
            zIndex: computedHit.zIndex,
            pointerEvents: computedHit.pointerEvents,
            position: computedHit.position,
            isBtnOrChild: btn === hitElement || btn.contains(hitElement)
          };
        }

        // Get ancestors and 3D stage info
        const stageContainer = document.querySelector('[style*="perspective"]') || document.querySelector('.perspective-1000') || null;
        let stageInfo = null;
        if (stageContainer) {
          const compStage = window.getComputedStyle(stageContainer);
          stageInfo = {
            tagName: stageContainer.tagName,
            className: stageContainer.className,
            pointerEvents: compStage.pointerEvents,
            zIndex: compStage.zIndex
          };
        }

        return {
          buttonExists: true,
          buttonRect: {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
            centerX,
            centerY
          },
          buttonStyle: {
            zIndex: computedBtn.zIndex,
            pointerEvents: computedBtn.pointerEvents,
            display: computedBtn.display,
            visibility: computedBtn.visibility,
            opacity: computedBtn.opacity
          },
          hitElement: hitInfo,
          stageInfo
        };
      })()
    `,
    returnByValue: true
  });

  console.log("\n--- FORENSIC DIAGNOSIS RAPORU ---");
  console.log(JSON.stringify(diagResult.result.value, null, 2));

  // Now test physical mouse click via CDP Input.dispatchMouseEvent
  if (diagResult.result.value && diagResult.result.value.buttonRect) {
    const { centerX, centerY } = diagResult.result.value.buttonRect;
    console.log(`\n[CDP] Fiziksel Mouse Tıklaması gönderiliyor (${centerX}, ${centerY})...`);
    
    await send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: centerX,
      y: centerY
    });
    await send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: centerX,
      y: centerY,
      button: 'left',
      clickCount: 1
    });
    await send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: centerX,
      y: centerY,
      button: 'left',
      clickCount: 1
    });

    await new Promise(r => setTimeout(r, 1200));

    // Check cart drawer state
    const afterClick = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const drawer = document.getElementById('btn-submit-order');
          const trayCount = document.getElementById('btn-open-tray')?.innerText;
          const toast = document.querySelector('[class*="toast"], [class*="alert"]')?.innerText;
          return {
            isSubmitOrderBtnVisible: !!drawer,
            trayBadgeText: trayCount,
            toastText: toast
          };
        })()
      `,
      returnByValue: true
    });
    console.log('[CDP] Tıklama sonrası sepet/çekmece durumu:', afterClick.result.value);
  }

  console.log('\n--- KONSOL MESAJLARI / HATALAR ---');
  if (consoleMessages.length === 0) {
    console.log('Konsolda hata veya uyarı yok.');
  } else {
    consoleMessages.forEach(m => console.log(`[${m.type}] ${m.text}`));
  }

  // Close tab
  await fetch(`http://localhost:9222/json/close/${tab.id}`);
  console.log('Tab closed.');
}

diagnose().catch(console.error);
