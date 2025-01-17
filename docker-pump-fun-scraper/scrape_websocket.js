const fs = require("fs");
const { chromium } = require("playwright");

(async () => {
  // Launch browser
  const browser = await chromium.launch({ headless: true }); // Set to true to hide the browser
  const context = await browser.newContext();
  const page = await context.newPage();

  // File to store WebSocket data
  const outputFile = "/usr/src/app/output/pump_fun_websocket_data.txt";

  // Intercept WebSocket connections
  page.on("websocket", (ws) => {
    console.log(`WebSocket opened: ${ws.url()}`);

    // Listen for WebSocket messages
    ws.on("framereceived", (frame) => {
      console.log(`Received: ${frame.payload}`);
      // Save message to file
      fs.appendFileSync(outputFile, `Received: ${frame.payload}\n`);
    });

    ws.on("framesent", (frame) => {
      console.log(`Sent: ${frame.payload}`);
      // Save message to file
      fs.appendFileSync(outputFile, `Sent: ${frame.payload}\n`);
    });
  });

  // Navigate to Pump.fun website
  await page.goto("https://pump.fun"); // Replace with the actual URL if different

  // Keep the browser open for 60 seconds to capture WebSocket data
  await page.waitForTimeout(60000);

  // Close the browser
  await browser.close();
})();