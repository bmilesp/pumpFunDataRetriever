const fs = require("fs");
const { chromium } = require("playwright");
const fetch = require("node-fetch");
const { MongoClient } = require("mongodb");

const fetcherEndpoint = "http://fetch-replies:3000";
const searchEndpoint = "http://token-search:3001";
const mongoUri = process.env.MONGO_URI || "mongodb://mongodb:27017";
const databaseName = "pumpfun";

function bufferToString(buffer) {
  const decoder = new TextDecoder(); // Assuming UTF-8 encoding
  return decoder.decode(buffer); 
}

(async () => {
  // Connect to MongoDB
  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db(databaseName);
  const tokenCollection = db.collection("tokens");
  const transactionCollection = db.collection("transactions");
  const otherFile = "/usr/src/app/output/uncategorizedWebsocketData.txt";

  // Launch browser
  const browser = await chromium.launch({ headless: true }); // Set to true to hide the browser
  const context = await browser.newContext();
  const page = await context.newPage();

  // Intercept WebSocket connections
  page.on("websocket", (ws) => {
    console.log(`WebSocket opened: ${ws.url()}`);

    // Listen for WebSocket messages
    ws.on("framereceived", async (frame) => {
      try {
        const input = frame.payload;

        if (frame.payload.includes("tradeCreated")) {
          // Parse tradeCreated payload and insert into MongoDB
          const jsonSplit = input.split("[", 2);
          let payload = JSON.parse("[" + jsonSplit[1]);
          payload = payload[1]
          //console.log("Parsed tradeCreated payload:", payload[1]);
          try {
            await transactionCollection.insertOne(payload);
          } catch (error) {
            console.error("Failed to insert tradeCreated payload into MongoDB:", error);  
          }
          console.log('payload.mint: ' + payload.mint);
          if (payload.mint) {
            console.log(`Checking if token with mint '${payload.mint}' exists in MongoDB.`);
            const existingToken = await tokenCollection.findOne({ mint: payload.mint });
            if (!existingToken) {
              console.log(`Token with mint '${payload.mint}' not found. Sending mint to token-search.`);
              try {
                fetch(searchEndpoint, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ mint: payload.mint }),
                });
              } catch (error) {
                console.error("Failed to send mint to token-search:", error);
              }
            } else {
              console.log(`Token with mint '${payload.mint}' already exists. Skipping token-search fetch.`);
            }
          }

        } else if (frame.payload.includes("newCoinCreated")) {
          // Parse newCoinCreated payload and insert into MongoDB
          const jsonSplit = bufferToString(input).split("{", 2);
          const payload = JSON.parse("{" + jsonSplit[1]);
          //console.log("Parsed newCoinCreated payload:", payload);
          await tokenCollection.insertOne(payload);
          if (payload.mint) {
            console.log(`Sending mint to fetch-replies: ${payload.mint}`);
            try {
              fetch(fetcherEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mint: payload.mint }),
              });
            } catch (error) {
              console.error("Failed to send mint to fetch-replies:", error);
            }
          }
        } else {
          console.log("Unhandled WebSocket message:", input);
          fs.appendFileSync(otherFile, input + "\n");
        }
      } catch (error) {
        console.error("Failed to parse or process WebSocket message:", error);
      }
    });

    ws.on("framesent", (frame) => {
      console.log(`Sent: ${frame.payload}`);
    });
  });

  // Navigate to Pump.fun website
  await page.goto("https://pump.fun"); // Replace with the actual URL if different

  // Keep the browser open for 60 seconds to capture WebSocket data
  await page.waitForTimeout(60000);

  // Close the browser and MongoDB connection
  await browser.close();
  await client.close();
})();
