const fs = require("fs");
const { chromium } = require("playwright");
const fetcherEndpoint = "http://fetch-replies:3000";
const fetch = require("node-fetch");

function bufferToString(buffer) {
  const decoder = new TextDecoder(); // Assuming UTF-8 encoding
  return decoder.decode(buffer); 
}

(async () => {
  // Launch browser
  const browser = await chromium.launch({ headless: true }); // Set to true to hide the browser
  const context = await browser.newContext();
  const page = await context.newPage();

  // Output files for categorized messages
  const tradeCreatedFile = "/usr/src/app/output/tradeCreated.txt";
  const newCoinCreatedFile = "/usr/src/app/output/newCoinCreated.txt";
  const otherFile = "/usr/src/app/output/other.txt";
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
        //console.log("INPUT: ", input);
        if (frame.payload.includes("tradeCreated")) {
          //console.log(`tradeCreated message: ${frame.payload}`);
          var jsonSplit = input.split('[', 2);
          var payload = JSON.parse("["+jsonSplit[1]);
          //console.log(payload[1]);
          fs.appendFileSync(tradeCreatedFile, JSON.stringify(payload[1], null, 2) + "\n");
        } else if (frame.payload.includes("newCoinCreated")) {
          //console.log(`newCoinCreated message: ${frame.payload}`);
          var jsonSplit =  bufferToString(input).split('{', 2);
          var payload = JSON.parse("{"+jsonSplit[1]);
          //console.log('payload: ',jsonSplit);
          fs.appendFileSync(newCoinCreatedFile, JSON.stringify(payload, null, 2) + "\n");

          if (payload.mint) {
            console.log(`Sending mint to fetch-replies: ${payload.mint}`);

            fetch(fetcherEndpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ mint: payload.mint }),
            });
          }
       

        } else if (frame.payload.includes("Buffer")) {
          console.log(`Buffer message: ${frame.payload}`);
          var payload = JSON.parse(input);
          var inputString =  bufferToString(payload["data"]);
          console.log(inputString)
          fs.appendFileSync(otherFile, JSON.stringify(inputString, null, 2) + "\n");
        } else{
          console.log("INPUT: ",  input);
          //var stringInput = JSON.parse(input)
          //fs.appendFileSync(otherFile, input + "\n");
  
          if (input.includes("{")) {
            console.log("JSON: ",  input);
            var jsonSplit =  bufferToString(input).split('{', 2);
            var payload = JSON.parse("{"+jsonSplit[1]);
            console.log("PAYLOAD: ",  payload);
            fs.appendFileSync(otherFile, JSON.stringify( payload, null, 2) + "\n");
          }
        }
      } catch (error) {
        console.log(error)  
        // Handle non-JSON payloads or errors gracefully
        //console.error("Failed to parse WebSocket message:", frame.payload);
      }
    });

    ws.on("framesent", (frame) => {
      console.log(`Sent: ${frame.payload}`);
      // Save message to file
     //fs.appendFileSync(outputFile, `Sent: ${frame.payload}\n`);
    });
  });

  // Navigate to Pump.fun website
  await page.goto("https://pump.fun"); // Replace with the actual URL if different

  // Keep the browser open for 60 seconds to capture WebSocket data
  await page.waitForTimeout(60000);

  // Close the browser
  await browser.close();
})();
