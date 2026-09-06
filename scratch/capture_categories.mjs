import fs from "fs";

async function main() {
  const tabs = await (await fetch("http://localhost:9222/json")).json();
  let pageTab = tabs.find(t => t.url.includes("localhost:3005") || t.title.includes("Beroş"));
  if (!pageTab) {
    const newTab = await (await fetch("http://localhost:9222/json/new?http://localhost:3005")).json();
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

  // 1. Desktop (1920x1080)
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    mobile: false
  });
  await send("Page.navigate", { url: "http://localhost:3005" });
  await new Promise(r => setTimeout(r, 2500));

  // Act 2 Desktop: Yöresel Lezzetler (Special Kuzu Sırt with wood tray)
  await send("Runtime.evaluate", {
    expression: "window.scrollTo(0, (document.documentElement.scrollHeight - window.innerHeight) * 0.28);"
  });
  await new Promise(r => setTimeout(r, 1500));
  let shot = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(
    "/Users/mesa/.gemini/antigravity/brain/9f626f0d-ab17-4f91-9424-5af64a8a5880/wood_tray_yoresel.png",
    Buffer.from(shot.data, "base64")
  );
  console.log("Captured wood_tray_yoresel.png");

  // Switch Category: Click "TAŞ FIRIN & PİDE"
  await send("Runtime.evaluate", {
    expression: `
      const btns = Array.from(document.querySelectorAll("button"));
      const pideBtn = btns.find(b => b.textContent.includes("TAŞ FIRIN"));
      if (pideBtn) pideBtn.click();
    `
  });
  await new Promise(r => setTimeout(r, 1500));
  shot = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(
    "/Users/mesa/.gemini/antigravity/brain/9f626f0d-ab17-4f91-9424-5af64a8a5880/category_tas_firin.png",
    Buffer.from(shot.data, "base64")
  );
  console.log("Captured category_tas_firin.png");

  // Switch Category: Click "TATLILAR"
  await send("Runtime.evaluate", {
    expression: `
      const btns = Array.from(document.querySelectorAll("button"));
      const tatliBtn = btns.find(b => b.textContent.includes("TATLILAR"));
      if (tatliBtn) tatliBtn.click();
    `
  });
  await new Promise(r => setTimeout(r, 1500));
  shot = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(
    "/Users/mesa/.gemini/antigravity/brain/9f626f0d-ab17-4f91-9424-5af64a8a5880/category_tatli.png",
    Buffer.from(shot.data, "base64")
  );
  console.log("Captured category_tatli.png");

  // 2. Mobile (390x844)
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await send("Page.navigate", { url: "http://localhost:3005" });
  await new Promise(r => setTimeout(r, 2500));

  // Mobile Act 2 Coverflow with Wood Tray & Category Selector
  await send("Runtime.evaluate", {
    expression: "window.scrollTo(0, (document.documentElement.scrollHeight - window.innerHeight) * 0.28);"
  });
  await new Promise(r => setTimeout(r, 1500));
  shot = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(
    "/Users/mesa/.gemini/antigravity/brain/9f626f0d-ab17-4f91-9424-5af64a8a5880/mobile_wood_tray.png",
    Buffer.from(shot.data, "base64")
  );
  console.log("Captured mobile_wood_tray.png");

  console.log("All category & wood tray screenshots captured successfully!");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
