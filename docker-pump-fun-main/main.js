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

async function searchToken(payloadMint) {
  try {
    return await fetch(searchEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mint: payloadMint }),
    });
  } catch (error) {
    console.error("Failed to send mint to token-search:", error);
    return null;
  }
}

async function fetchReplies(payloadMint, replyCollection, lastQueriedCollection) {
  let response = null;
  let replies = [];
  try {
    response = await fetch(fetcherEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mint: payloadMint }),
    });
    replies = await response.json();
  } catch (error) {
    console.error("Failed to send mint to fetch-replies:", error);
  }
  
  if (replies.length > 0) {
    try {
      const batchSize = 25;
      const batches = [];
      
      // Split replies into batches of 50
      for (let i = 0; i < replies.length; i += batchSize) {
        batches.push(replies.slice(i, i + batchSize));
      }
    
      const allResults = [];
      let response; // To capture the last response in case of error
      
      // Process each batch sequentially
      for (const batch of batches) {
        response = await fetch(sentimentEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: batch }),
        });
    
        const results = await response.json();
        allResults.push(...results); // Assuming the endpoint returns an array
      }
    
      // Combine all results
      replies = allResults;
    
    } catch (error) {
      console.error("Failed to send replies to sentiment-analyser:", error);
      console.log("Last response:", response);
      console.log("Total replies attempted:", replies.length);
      return null;
    }

    try {
      // Record the current timestamp
      const timestamp = new Date();
      await lastQueriedCollection.updateOne(
        { _id: payloadMint },
        { $set: { timestamp } },
        { upsert: true }
      );
    } catch (error) {
      console.error("Failed to update last queried timestamp:", error);
    }

    //console.log("inserting replies into MongoDB", replies);
    try{
      await replyCollection.insertMany(replies,{"ordered": false});
    } catch (error) {
      if (error.toString().includes("E11000 duplicate key error collection")){
        console.log("Duplicate key errors found , skipping some inserts");
      }else{
        console.error("Failed to insert replies into MongoDB:", error);
      }
    }
  }else{
    //console.log(`No replies found for mint: ${payload.mint}`);
  }
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
      let payload = {};
      let response = null;
      const input = frame.payload;

      if (frame.payload.includes("tradeCreated")) {
        // Parse tradeCreated payload and insert into MongoDB
        try {
          response = await fetch (dataCleaner, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: frame.payload })
          });
          payload = await response.json();
        } catch (error) {
          console.error("Failed to parse tradeCreated payload:", error);
        }

        let existingSignature = null;
        try{
          //console.log("signature: ", payload.signature);
          existingSignature = await transactionCollection.findOne({ "signature": payload.signature });
        } catch (error) {
          console.error("Failed to check if transaction exists in MongoDB:", error);
        }
        //console.log("existingSignature: ", existingSignature);

        if (!existingSignature) {
          if(!payload.signature){
            console.log("NEWTXN WITHOUT SIGNATURE!!: ", payload);
            console.log(frame.payload);
          }
          try {
            payload.is_buy === true? payload.signed_sol_amount = payload.sol_amount : payload.signed_sol_amount = -payload.sol_amount;
              
            await transactionCollection.insertOne({ _id: payload.signature, ...payload });
          } catch (error) {
            console.error(payload);
            console.error("Failed to insert tradeCreated payload into MongoDB:", error);
          }
        } else {
          //console.log(`Transaction with signature '${payload.signature}' already exists. Skipping insertion.`);
        }
       
        if (payload.mint) {
          //too many requests if we upsert every time, leave this check in for now, but should check every 5 min using replies_last_queried_at data
          const lastTokenDataSearch = await lastQueriedCollection.findOne({ _id: payload.mint });
          const existingToken = await tokenCollection.findOne({ mint: payload.mint });
          if ( 
            (!existingToken) 
            || (!lastTokenDataSearch) 
            || (lastTokenDataSearch && (new Date() - new Date(lastTokenDataSearch.timestamp)) > 30000) //wait 1 (30 sec) min before checking again
          ){
            console.log("fetching token data and replies for mint: ", payload.mint);
             ///searchToken
             const tokenPayload = await searchToken(payload.mint);
            if (!tokenPayload) {
              console.error("ERROR: Can't Find token data for mint, skipping upsert:", payload.mint);
              return; 
            } else{
              try {
                await tokenCollection.updateOne(
                  { _id: tokenPayload.mint }, // Filter: Match document with the same _id
                  { $set: { ...payload } }, // Update: Set the fields from payload
                  { upsert: true } // Option: Insert if no matching document is found
                );
              } catch (error) {
                console.error("Failed to upsert tradeCreated updated token data:", error);
              }
            }

             await fetchReplies(payload.mint, replyCollection, lastQueriedCollection)
          }else{
            console.log("existing token and last data search found: ", new Date(), " ", new Date(lastTokenDataSearch.timestamp));
            console.log(`Token with mint '${payload.mint}' data retrieved before alotted time. Skipping token data fetch.`);
          }
        } else {
          //console.log(`Token with mint '${payload.mint}' already exists. Skipping token-search fetch.`);
        }

      } else if (frame.payload.includes("newCoinCreated")) {
        // Parse newCoinCreated payload and insert into MongoDB
        try {
          response = await fetch (dataCleaner, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: bufferToString(frame.payload) })
          });
          payload = await response.json();
        } catch (error) {
          console.error("Failed to parse newCoinCreated payload:", error);
        }
        
        try {
          await tokenCollection.insertOne({ _id: payload.mint, ...payload });
        } catch (error) {
          console.error("Failed to insert newCoinCreated payload into MongoDB:", error);
        }
        if (payload.mint) {

          //fetch replies

          await fetchReplies(payload.mint, replyCollection, lastQueriedCollection);
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
