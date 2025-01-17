const fs = require("fs");
const { chromium } = require("playwright");

(async () => {
  // Launch browser
  const browser = await chromium.launch({ headless: true }); // Set to true to hide the browser
  const context = await browser.newContext();
  const page = await context.newPage();

  // Output files for categorized messages
  const tradeCreatedFile = "/usr/src/app/output/tradeCreated.txt";
  const newCoinCreatedFile = "/usr/src/app/output/newCoinCreated.txt";

  // Ensure output directory exists
  const outputDirectory = "/usr/src/app/output";
  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true });
  }

  // Intercept WebSocket connections
  page.on("websocket", (ws) => {
    console.log(`WebSocket opened: ${ws.url()}`);

    // Listen for WebSocket messages
    ws.on("framereceived", (frame) => {
      try {
        // Check for "tradeCreated" and "newCoinCreated"
        var input = frame.payload;
        console.log("INPUT: ", input);
        if (frame.payload.includes("tradeCreated")) {
          //console.log(`tradeCreated message: ${frame.payload}`);
          var jsonSplit = input.split('[', 2);
          console.log('payload: ',jsonSplit);
          var payload = JSON.parse("["+jsonSplit[1]);
          console.log('payload: ',jsonSplit);
          fs.appendFileSync(tradeCreatedFile, JSON.stringify(payload, null, 2) + "\n");
        } else if (frame.payload.includes("newCoinCreated")) {
          //console.log(`newCoinCreated message: ${frame.payload}`);
          var jsonSplit = input.split('{', 2);
          var payload = JSON.parse("{"+jsonSplit[1]);
          console.log('payload: ',jsonSplit);
          fs.appendFileSync(newCoinCreatedFile, JSON.stringify(payload, null, 2) + "\n");
        }
      } catch (error) {
        console.log(error)  
        // Handle non-JSON payloads or errors gracefully
        //console.error("Failed to parse WebSocket message:", frame.payload);
      }
    });
  });

  // Navigate to Pump.fun website
  await page.goto("https://pump.fun"); // Replace with the actual URL if different

  // Keep the browser open for 60 seconds to capture WebSocket data
  await page.waitForTimeout(60000);

  // Close the browser
  await browser.close();
})();
