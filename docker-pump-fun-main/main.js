const fs = require("fs");
const { chromium } = require("playwright");
const fetch = require("node-fetch");
const { MongoClient } = require("mongodb");

const fetcherEndpoint = "http://fetch-replies:3000";
const searchEndpoint = "http://token-search:3001";
const sentimentEndpoint = "http://sentiment-analyser:3002";
const dataCleaner = "http://data-cleaner:3003";
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
  const replyCollection = db.collection("replies");
  const lastQueriedCollection = db.collection("replies_last_queried_at");
  const otherFile = "/usr/src/app/output/uncategorizedWebsocketData.txt";

  // Launch browser
  const browser = await chromium.launch({ headless: true }); // Set to true to hide the browser
  const context = await browser.newContext();
  const page = await context.newPage();
  let payload = {};
  let replies = [];

  // Intercept WebSocket connections
  page.on("websocket", (ws) => {
    console.log(`WebSocket opened: ${ws.url()}`);

    // Listen for WebSocket messages
    ws.on("framereceived", async (frame) => {
      const input = frame.payload;

      if (frame.payload.includes("tradeCreated")) {
        // Parse tradeCreated payload and insert into MongoDB
        try {
          console.log("sending to data cleaner from tradeCreated");
          response = await fetch (dataCleaner, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: frame.payload })
          });
          payload = await response.json();
          console.log("payload received from data cleaner tradeCreated");
        } catch (error) {
          console.error("Failed to parse tradeCreated payload:", error);
        }

        try {
          await transactionCollection.insertOne({ _id: payload.signature, ...payload });
        } catch (error) {
          console.error("Failed to insert tradeCreated payload into MongoDB:", error);  
        }
        
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
        try {
          console.log(" sending to data cleaner from newCoinCreated");
          response = await fetch (dataCleaner, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: bufferToString(frame.payload) })
          });
          payload = await response.json();
          console.log("payload received from data cleaner newCoinCreated");
        } catch (error) {
          console.error("Failed to parse newCoinCreated payload:", error);
        }
        
        try {
          await tokenCollection.insertOne({ _id: payload.mint, ...payload });
        } catch (error) {
          console.error("Failed to insert newCoinCreated payload into MongoDB:", error);
        }
        if (payload.mint) {
          console.log(`Sending mint to fetch-replies: ${payload.mint}`);
          try {
            // Record the current timestamp
            const timestamp = new Date();
            console.log(`Updated last queried timestamp for mint: ${payload.mint}`);
            await lastQueriedCollection.updateOne(
              { _id: payload.mint },
              { $set: { timestamp } },
              { upsert: true }
            );
          } catch (error) {
            console.error("Failed to update last queried timestamp:", error);
          }
          try {
            response = await fetch(fetcherEndpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ mint: payload.mint }),
            });
            replies = await response.json();
          } catch (error) {
            console.error("Failed to send mint to fetch-replies:", error);
          }
          
          if (replies.length > 0) {
            try {
              
              response = await fetch(sentimentEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({data: replies}),
              });

              replies = await response.json();
              console.log("replies received from sentiment analyser", replies);

            } catch (error) {
              console.error("Failed to send replies to sentiment-analyser:", error);
            }
            //console.log("inserting replies into MongoDB", replies);
            try{
              await replyCollection.insertMany(replies);
              console.log(`Inserted ${replies.length} replies into MongoDB for mint: ${mint}`);
            } catch (error) {
              console.error("Failed to insert replies into MongoDB:", error);
            }
          }else{
            console.log(`No replies found for mint: ${payload.mint}`);
          }
        }
      } else {
        console.log("Unhandled WebSocket message:", input);
        fs.appendFileSync(otherFile, input + "\n");
      }
    });

    ws.on("framesent", (frame) => {
      console.log(`Sent: ${frame.payload}`);
    });
  });

  // Navigate to Pump.fun website
  await page.goto("https://pump.fun"); // Replace with the actual URL if different

  // Keep the browser open for x seconds to capture WebSocket data
  await page.waitForTimeout(600000);

  // Close the browser and MongoDB connection
  await browser.close();
  await client.close();
})();
