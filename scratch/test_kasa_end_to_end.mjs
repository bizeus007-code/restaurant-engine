import fs from "fs";

async function main() {
  const tabs = await (await fetch("http://localhost:9222/json")).json();
  let pageTab = tabs.find(t => t.url.includes("localhost:3005") || t.title.includes("Beroş"));
  if (!pageTab) {
    const newTab = await (await fetch("http://localhost:9222/json/new?http://localhost:3005?masa=03")).json();
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

  // Step 1: Customer View (1920x1080) at http://localhost:3005?masa=03
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    mobile: false
  });
  await send("Page.navigate", { url: "http://localhost:3005?masa=03" });
  await new Promise(r => setTimeout(r, 2000));

  // Trigger Garson Call
  console.log("Triggering waiter call...");
  await send("Runtime.evaluate", {
    expression: `
      const waiterBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Garson"));
      if (waiterBtn) waiterBtn.click();
    `
  });
  await new Promise(r => setTimeout(r, 700));

  // Capture screenshot with service toast
  let shot = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`${outDir}/customer_waiter_call_toast.png`, Buffer.from(shot.data, "base64"));
  console.log("Captured customer_waiter_call_toast.png");

  // Scroll to Act 2 Menu
  await send("Runtime.evaluate", {
    expression: "window.scrollTo(0, (document.documentElement.scrollHeight - window.innerHeight) * 0.28);"
  });
  await new Promise(r => setTimeout(r, 1200));

  // Add dish to cart
  console.log("Adding dish to cart...");
  await send("Runtime.evaluate", {
    expression: `
      const addBtns = Array.from(document.querySelectorAll("button")).filter(b => b.textContent.includes("SİPARİŞE EKLE"));
      if (addBtns.length > 0) addBtns[0].click();
    `
  });
  await new Promise(r => setTimeout(r, 1000));

  // Submit order in system
  console.log("Submitting order in system...");
  await send("Runtime.evaluate", {
    expression: `
      const submitBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Mutfağa İlet"));
      if (submitBtn) submitBtn.click();
    `
  });
  await new Promise(r => setTimeout(r, 800));

  // Capture screenshot of order submitted confirmation in drawer
  shot = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`${outDir}/customer_order_submitted.png`, Buffer.from(shot.data, "base64"));
  console.log("Captured customer_order_submitted.png");

  // Wait 3s for drawer to auto close and state to settle
  await new Promise(r => setTimeout(r, 3000));

  // Step 2: Open /kasa terminal
  console.log("Navigating to /kasa terminal...");
  await send("Page.navigate", { url: "http://localhost:3005/kasa" });
  await new Promise(r => setTimeout(r, 2000));

  // Capture live Kasa terminal with incoming call and order
  shot = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`${outDir}/kasa_terminal_live.png`, Buffer.from(shot.data, "base64"));
  console.log("Captured kasa_terminal_live.png");

  // Step 3: Handle call (click "Gidildi") and update order (click "Teslim Et")
  console.log("Handling call and order status...");
  await send("Runtime.evaluate", {
    expression: `
      const gidildiBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Gidildi"));
      if (gidildiBtn) gidildiBtn.click();

      const teslimBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Teslim Et"));
      if (teslimBtn) teslimBtn.click();
    `
  });
  await new Promise(r => setTimeout(r, 1500));

  // Capture Kasa terminal after handling
  shot = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`${outDir}/kasa_terminal_handled.png`, Buffer.from(shot.data, "base64"));
  console.log("Captured kasa_terminal_handled.png");

  console.log("End-to-end Kasa terminal test completed successfully!");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

