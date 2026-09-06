import fs from "fs";

async function main() {
  const tabs = await (await fetch("http://localhost:9222/json")).json();
  let pageTab = tabs.find(t => t.url.includes("localhost:3005") || t.title.includes("Beroş"));
  if (!pageTab) {
    const newTab = await (await fetch("http://localhost:9222/json/new?http://localhost:3005?masa=09")).json();
    pageTab = newTab;
    await new Promise(r => setTimeout(r, 2000));
  }
  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener("open", r));
  let id = 1;

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const curId = id++;
      const handler = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id === curId) {
          ws.removeEventListener("message", handler);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
      ws.addEventListener("message", handler);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });
  }

  const outDir = "/Users/mesa/.gemini/antigravity/brain/9f626f0d-ab17-4f91-9424-5af64a8a5880";

  // 1. Desktop Customer View (1920x1080) at http://localhost:3005?masa=09
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    mobile: false
  });
  await send("Page.navigate", { url: "http://localhost:3005?masa=09" });
  await new Promise(r => setTimeout(r, 2000));

  // Click [ 💳 Hesap ] in header
  console.log("Triggering Hesap call...");
  await send("Runtime.evaluate", {
    expression: `
      const hesapBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Hesap"));
      if (hesapBtn) hesapBtn.click();
    `
  });
  await new Promise(r => setTimeout(r, 600));

  // Capture header with bottom toast
  let shot = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`${outDir}/test_header_and_toast.png`, Buffer.from(shot.data, "base64"));
  console.log("Captured test_header_and_toast.png");

  // Scroll to Act 2 Menu
  await send("Runtime.evaluate", {
    expression: "window.scrollTo(0, (document.documentElement.scrollHeight - window.innerHeight) * 0.28);"
  });
  await new Promise(r => setTimeout(r, 1200));

  // Add to cart
  console.log("Adding dish to cart...");
  await send("Runtime.evaluate", {
    expression: `
      const addBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("SİPARİŞE EKLE"));
      if (addBtn) addBtn.click();
    `
  });
  await new Promise(r => setTimeout(r, 1000));

  // Submit order in system
  console.log("Submitting order...");
  await send("Runtime.evaluate", {
    expression: `
      const submitBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Siparişi Mutfağa İlet"));
      if (submitBtn) submitBtn.click();
    `
  });
  await new Promise(r => setTimeout(r, 800));

  // Capture order submit toast
  shot = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`${outDir}/test_order_submit_toast.png`, Buffer.from(shot.data, "base64"));
  console.log("Captured test_order_submit_toast.png");

  // Lock special-kuzu-sirt via POST /api/stock
  console.log("Locking special-kuzu-sirt to test TÜKENDİ...");
  await fetch("http://localhost:3005/api/stock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dishId: "special-kuzu-sirt", count: 0, isUnlimited: false, isLocked: true })
  });
  await new Promise(r => setTimeout(r, 1000));

  // Reload page to see TÜKENDİ state immediately
  await send("Page.navigate", { url: "http://localhost:3005?masa=09" });
  await new Promise(r => setTimeout(r, 2000));
  await send("Runtime.evaluate", {
    expression: "window.scrollTo(0, (document.documentElement.scrollHeight - window.innerHeight) * 0.28);"
  });
  await new Promise(r => setTimeout(r, 1500));

  // Capture out of stock dish
  shot = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`${outDir}/test_out_of_stock_dish.png`, Buffer.from(shot.data, "base64"));
  console.log("Captured test_out_of_stock_dish.png");

  // Open /kasa terminal
  console.log("Navigating to /kasa...");
  await send("Page.navigate", { url: "http://localhost:3005/kasa" });
  await new Promise(r => setTimeout(r, 2000));

  // Click on "MUTFAK STOK KONTROLÜ" tab
  await send("Runtime.evaluate", {
    expression: `
      const stokTab = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("MUTFAK STOK"));
      if (stokTab) stokTab.click();
    `
  });
  await new Promise(r => setTimeout(r, 1000));

  // Capture Kasa stock tab
  shot = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`${outDir}/test_kasa_stock_tab.png`, Buffer.from(shot.data, "base64"));
  console.log("Captured test_kasa_stock_tab.png");

  // Restore stock for special-kuzu-sirt
  await fetch("http://localhost:3005/api/stock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dishId: "special-kuzu-sirt", count: 39, isUnlimited: false, isLocked: false })
  });

  console.log("All stock & buttons tests completed successfully!");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

